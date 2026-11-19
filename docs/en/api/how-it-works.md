---
type: concept
---

# How the runtime works

Nacre is a JavaScript runtime on iOS. All of an app's logic and interface are determined by one piece of JS code; the runtime executes it and provides iOS's native views and system capabilities to it as global classes and objects.

What follows applies to every API and isn't repeated on each page.

## How your code is run

**The whole app's JS is one file.** It is bundled into the app at build time and runs from the top once each time the app launches. The runtime doesn't load other files while running, so `import` statements in your source must first be combined into one file with a bundler (such as esbuild).

**The app doesn't end when the file finishes running.** After the top-level code finishes, the app keeps running, waiting for events, timers, and `Promise` results. Listeners and variables registered at the top level stay valid while the app runs.

**Always strict mode.** Assigning to a read-only property or using an undeclared variable throws, rather than failing silently. You don't need to write `'use strict'` in your source.

**The interface can only be built once the system is ready.** When the top level of the file runs, the system hasn't yet given the app a place to display its interface (called a scene). Code that builds the interface goes in the callback of the `sceneconnect` event. The runtime guarantees this event fires only after the whole file has run, so a listener registered at the top level always receives it.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();
});
```

**Effect**: After the app launches it shows a blank view controller whose background follows the system's light or dark mode. Every app starts with these lines.

The top level is the place for things that don't involve the interface: reading app information, reading local storage, sending network requests, registering listeners. For what each line in the callback means, see [`application`](application.md), [`UIWindowScene`](ui-window-scene.md), and [`UIWindow`](ui-window.md).

## What's available

- The complete JS standard library: `Promise`, `Map`, `JSON`, typed arrays, iterators, and so on
- `console`, timers (`setTimeout` and others), `performance`, `crypto.getRandomValues()`, [`Intl.NumberFormat`](intl.md), [`Intl.DateTimeFormat`](intl-date.md)
- Networking: `fetch`, `URL`, `WebSocket`
- [Text, bytes, and deep copies](web-globals.md): `TextEncoder`, `TextDecoder`, `btoa`, `atob`, `structuredClone`
- Events: `EventTarget`, `addEventListener()`
- iOS native classes: `UIView`, `UIButton`, `UILabel`, and so on, using their original names

The only native classes available are those listed in the [API overview](README.md). iOS classes not listed don't exist in JS; reading their names throws `ReferenceError`.

## JS and the interface share one thread

JS code, interface layout and drawing, and touch handling run one after another on the same thread. A piece of JS isn't interrupted by other code from start to finish.

This arrangement has three direct consequences.

**Reading layout is synchronous.** Right after changing a view, you can read its computed position and size without waiting for a callback.

```js
const label = new UILabel();
label.text = 'Hello';
const size = label.sizeThatFits(new CGSize(300, 100));
console.log(size.width > 0);
```

**Result**: The console prints `true`. When `sizeThatFits()` returns, the size of the text has already been computed.

**Interface changes take effect immediately.** Reading a property right after assigning it gives the new value. All interface changes made in the same piece of code are shown together in the same frame after that code ends; the screen never shows a half-applied change.

**No need to deal with concurrency.** Callbacks run one after another; two callbacks never read and write the same data at the same time.

### How long interface operations take

These values were measured on the runtime:

| Operation | Time |
| --- | --- |
| One call into a native capability (reading or writing a property, calling a method) | 1.3–2.4 microseconds |
| Creating a view (`new UIView()`) | About 4 microseconds |
| Writing a property | 2–7 microseconds |
| Creating a constraint | About 10 microseconds |
| Adding a subview (`addSubview()`) | About 12 microseconds |

At a 120 Hz screen refresh rate, one frame is 8.3 milliseconds, enough time for over three thousand property writes.

The runtime also does three things to keep the interface smooth:

- **Scrolling doesn't wait for JS.** A scroll view following the finger is handled directly by the system. The `scroll` event is only a notification; the system doesn't wait for listeners to finish before scrolling.
- **The `scroll` event fires at most once per turn.** Multiple scrolls within one turn are merged into one event. Listeners always read the latest position from the scroll view, so merging loses no information. See [`UIScrollView`](ui-scroll-view.md).
- **Timers run in batches.** When many timers are due at once, the runtime runs them for at most 8 milliseconds in a row, then lets the screen refresh and touches be handled, and continues with the rest on the next turn. See [Timers](timers.md).

### Heavy computation unrelated to the interface

A piece of JS runs continuously from start to finish; during that time the screen doesn't refresh, and touches are handled only after it ends. The interface operations above take microseconds and aren't affected by this. What is affected is long-running computation unrelated to the interface, such as parsing a very large piece of data or sorting tens of thousands of records.

Split such computation into small chunks and do it over several turns with a timer; the screen refreshes normally between chunks:

```js
/** @type {number[]} */
const items = [];
for (let i = 0; i < 100000; i++) items.push(i);

let sum = 0;
let index = 0;

function step() {
  // Process only 2000 items at a time
  const end = Math.min(index + 2000, items.length);
  for (; index < end; index++) sum += items[index];

  if (index < items.length) {
    setTimeout(step, 0);
  } else {
    console.log('done', sum);
  }
}
step();
```

**Result**: The hundred thousand items are processed in 50 chunks, and the console prints `done 4999950000`. **This code is not verified in the simulator.**

You can decide how big each chunk should be by measuring with [`performance.now()`](performance.md). When a single timer callback runs for more than 50 milliseconds, the runtime prints a warning to the console with the actual number of milliseconds:

```
Timer callback blocked the main thread for 83 ms; this frame will drop
```

When you see this warning, split the work in that callback into smaller pieces.

## Time-consuming operations run in the background

Operations such as network requests, reading and writing files, and decoding images are run by the runtime in the background, and the results are handed back to JS when done. While waiting, JS can keep doing other things, and the interface stays responsive.

These APIs all return a `Promise`:

```js
const res = await fetch('https://httpbin.org/get');
const data = await res.json();
console.log(typeof data);
```

**Result**: When the request completes, the console prints `object`. Between sending the request and getting the result, the interface can be used normally.

## Two kinds of asynchrony: Promises and events

| Situation | Form | Examples |
| --- | --- | --- |
| Initiated once, gets one result | `Promise` | `fetch()`, reading a file, presenting a view controller modally |
| A notification that happens repeatedly | Event | Taps, scrolling, the app going to the background |

There are no callback parameters, and no properties like `onSuccess` or `onError`.

## Events

Every object that fires events uses the same pattern: `addEventListener(type, callback)` registers a listener and `removeEventListener(type, callback)` removes it. Registering the same function more than once for the same event name counts only once.

```js
const button = new UIButton();
button.addEventListener('click', (e) => {
  console.log(e.type, e.target === button);
});
```

**Effect**: When the button is shown in the interface and the user taps it, the console prints `click true`.

Events behave as follows:

- **An event is fired only to the object the listener was registered on.** Events don't propagate to parent views, and there is no capture phase. To know a button was tapped, register on that button.
- **Callbacks for system events run after the thing has happened.** For system-caused events such as taps, scrolling, and switching between foreground and background, the runtime waits for the system operation in progress to finish before running the callback. The state you read in the callback is the state at the moment the callback runs. For example, reading `contentOffset` in a `scroll` callback gives the current scroll position, not the position that caused this event.
- **Most system events can't be canceled.** When the callback runs, the thing has already happened; `preventDefault()` has no effect on them and doesn't throw. The event object's `cancelable` is `false`. Exceptions are noted on the relevant pages; for example, [`WebView`](web-view.md)'s `will-navigate` can be canceled.
- **The event object usually has only `type` and `target`.** Read the data you need from `target`; for example, read the scroll position from `scroller.contentOffset`. A few events carry their own data; for example, touch-related control events carry the touch location; see [`UIControl`](ui-control.md).
- **An exception thrown in a listener doesn't affect other listeners and doesn't make the app exit.** The other listeners for the same event run as usual. The exception fires `error` on [`application`](application.md#unhandled-exceptions-dont-terminate-the-app); if no listener cancels it, the console prints a log starting with `Uncaught`.
- **Event names are open.** You can listen for any name on any object. The names the system fires are listed in each class's documentation; other names are custom events and fire only when you dispatch them yourself with `dispatchEvent()`. A misspelled event name gives no warning; the listener just isn't called.

Events you dispatch yourself with `dispatchEvent()` are synchronous: all listeners have run before `dispatchEvent()` returns. For a full description of the members, see [`application`](application.md).

## Native objects

Instances of classes such as `UIView` and `UIButton` represent iOS native objects. Reading and writing their properties and calling their methods operate on that native object.

- **No manual release needed.** Once nothing references an object, it is collected automatically.
- **Objects added to the interface aren't collected.** After adding a view to a parent view or handing a view controller to a window, you don't need to keep a separate reference.
- **Adding a listener doesn't keep an object alive.** An object removed from the interface and not referenced elsewhere is collected, and its listeners go with it. So when leaving a view controller, you don't need to call `removeEventListener()` one by one.
- **Objects that are working aren't collected, even without a saved reference.** There are two kinds: a [`WebSocket`](websocket.md) that hasn't been closed, and a [`CADisplayLink`](ca-animation.md) on which `addToRunLoop()` has been called but `invalidate()` hasn't. After closing or invalidating, they are collected like ordinary objects.
- **The same native object always corresponds to the same JS object.** So you can compare with `===`, for example `view.superview === parent`.
- **Native classes can't be subclassed.** `class MyView extends UIView` throws on construction. To extend behavior, use composition: write a function that creates and configures the view. See [native classes](native-classes.md).

## What happens when you get it wrong

Incorrect code gets a clear error rather than silently doing nothing.

- An unknown enum value in a method parameter, a missing required parameter, or assigning to a read-only property all throw `TypeError`. Enum error messages list all valid values.
- When a value can't be converted to the expected type, it throws `TypeError`; see [How passed-in values are converted](#how-passed-in-values-are-converted).
- Calls the system doesn't accept also throw `TypeError` rather than making the app exit. For example, adding a view as its own subview gives `addSubview: raised NSInvalidArgumentException: Can't add self as subview`; what follows the colon is the reason given by the system. When this kind of error occurs, the system side's state may already be inconsistent; fix the code that caused it rather than relying on `try` / `catch` to keep running.
- Uncaught exceptions and unhandled `Promise` rejections don't make the app exit. The runtime prints them to the console and the app keeps running. To handle them in one place, listen for `error` and `unhandledrejection` on [`application`](application.md).

Three cases don't throw:

- An invalid color string only prints a warning and keeps the previous color. See [colors](ui-color.md).
- Writing an unknown value to an enum property (`label.textAlignment = 'centre'`) only prints a warning, and the property keeps its old value. The warning lists all valid values. See [enums](enums.md).
- A misspelled property name doesn't throw. `view.backgroundColour = 'red'` just adds an ordinary property to this JS object, and the interface doesn't change. Type checking catches this kind of error: with `@nacrejs/types` installed, the editor flags that line and suggests the correct name.

## How passed-in values are converted

When assigning a property or passing a method argument, the value's type doesn't have to be exactly right. The runtime converts it to the expected type, and the result is the same as `Number()`, `Boolean()`, or `String()`:

| Expected type | How it's converted | Examples |
| --- | --- | --- |
| Number | `Number(v)` | `view.alpha = '0.5'` gives 0.5; `view.alpha = null` gives 0 |
| Integer (index, count) | `Number(v)`, then the fractional part is dropped | `view.tag = 3.9` gives 3 |
| Boolean | By truthiness, the same test as `if (v)` | `view.isHidden = 1` gives `true`; `view.isHidden = 'false'` also gives `true`, because a non-empty string is truthy |
| String | `String(v)` | `label.text = 5` gives `'5'` |
| Member of an options object | A value of `undefined` is the same as not writing the member | `{ scale: undefined }` is the same as `{}` |

When no valid value can be produced, it throws `TypeError`:

```js
const view = new UIView();
try {
  // @ts-expect-error type checking doesn't allow undefined
  view.alpha = undefined;
} catch (err) {
  console.log(String(err));
}
console.log(view.alpha);
```

**Result**: The console prints `TypeError: alpha must be a finite number, got undefined`, then `1`. `alpha` keeps its old value. The same goes for `'abc'`, `NaN`, `Infinity`, and objects.

Four things to note:

- **`null` assigned to a number property gives 0 without an error,** because `Number(null)` is 0. Don't use `null` to mean "no value".
- **`null` and `undefined` assigned to a string property mean clearing it.** If the property is nullable, it reads back as `null` (for example `label.text`); if not, it reads back as the empty string (for example a text field's `text`).
- **Enums aren't converted.** Writing an unknown value to a property keeps the old value and prints a warning to the console; an unknown value in a method parameter throws `TypeError`. See [enums](enums.md).
- **Native objects aren't converted.** Passing something else where a view is required throws `TypeError`. Parameters and properties that are nullable can take `null`.

The type definitions (`@nacrejs/types`) are stricter than the runtime: `view.alpha = '0.5'` runs, but type checking reports an error. Write according to the type definitions and pass values of the correct type; the conversion rules exist so that strings and numbers read from text fields or storage can be used directly without processing.

## Units of length

All lengths and coordinates are in points (pt), not pixels. How many pixels 1 pt takes on screen depends on the device. See [Units](units.md).

## See also

- [`application`](application.md): represents the running app; the entry event for interface code is on it
- [`UIWindowScene`](ui-window-scene.md): when a scene exists and when it doesn't, and how to organize startup code
- [Native classes](native-classes.md): construction, subclassing, attaching your own data to objects
- [Timers](timers.md): used when splitting computation into small chunks
- [Units](units.md)
