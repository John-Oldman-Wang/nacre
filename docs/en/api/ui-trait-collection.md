---
type: reference
native: UITraitCollection
status: partial
---

# `UITraitCollection`

**`UITraitCollection`** represents a set of values describing the environment the UI is currently in: whether it's dark or light, how many pixels 1 [pt](units.md) covers on the screen, which level the user set the system text size to, and so on. iOS calls each of these a trait.

There isn't just one set of these values for the whole app. [Scenes](ui-window-scene.md), windows, view controllers, and every view each have their own, read from their `traitCollection` property. Values pass from the outside in:

```
scene  →  window  →  view controller  →  view  →  subview
```

Each level defaults to the same values as the level outside it. The scene's values come from the system settings. So unless something has been forced, every level reads the same light or dark appearance as the system setting.

Reading `traitCollection` gives the set of values at the moment of reading. If the environment changes afterwards, the object you already have doesn't follow; read `traitCollection` again for new values. Two reads aren't guaranteed to return the same object, so don't compare two `UITraitCollection` objects with `===`; compare their properties instead.

There are three things you can do with it:

| What you want to do | What to use |
| --- | --- |
| Read the current values | The seven properties on `traitCollection` |
| Make a level always use dark or light | Write that level's `overrideUserInterfaceStyle` |
| Get notified when values change | Listen for that level's `traitchange` event |

The last two are members of views, view controllers, and scenes, described in the sections [Forcing dark or light](#forcing-dark-or-light-overrideuserinterfacestyle) and [The `traitchange` event](#the-traitchange-event) on this page.

To make colors follow light and dark mode, you don't need to read traits or listen for `traitchange`: write colors as semantic colors or `light-dark()` and they switch automatically. See [`UIColor`](ui-color.md).

**Inheritance**: `EventTarget` → `NSObject` → `UITraitCollection`

For when you need it and how to build a theme switch, see the guide [Supporting Dark Mode](../guides/dark-mode.md).

## Constructor

It can't be created with `new`; get it from the `traitCollection` of a view, view controller, or scene. `new UITraitCollection()` throws:

```
TypeError: Illegal constructor: UITraitCollection is created by the runtime, not by new
```

## Instance properties

Also inherits properties from `NSObject`. All are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`userInterfaceStyle`](ui-trait-collection/userinterfacestyle.md) <small>read-only</small> | Dark or light |
| [`displayScale`](ui-trait-collection/displayscale.md) <small>read-only</small> | How many pixels 1 pt covers |
| [`preferredContentSizeCategory`](ui-trait-collection/preferredcontentsizecategory.md) <small>read-only</small> | The text size the user chose in Settings |
| [`horizontalSizeClass`](ui-trait-collection/horizontalsizeclass.md) <small>read-only</small> | Whether there's ample space horizontally |
| [`verticalSizeClass`](ui-trait-collection/verticalsizeclass.md) <small>read-only</small> | Whether there's ample space vertically |
| [`accessibilityContrast`](ui-trait-collection/accessibilitycontrast.md) <small>read-only</small> | Whether the user turned on Increase Contrast |
| [`layoutDirection`](ui-trait-collection/layoutdirection.md) <small>read-only</small> | The writing direction of text |

Light/dark, `displayScale`, and text size have been checked in the simulator (text size was switched to `extraExtraLarge`). The other four have only been read at their default values (`compact`, `regular`, `normal`, `leftToRight`); other values are **not verified in the simulator**.

## Instance methods

`UITraitCollection` has no instance methods of its own.

## Events

`UITraitCollection` itself doesn't fire events. When traits change, views, view controllers, and scenes fire the event; see [The `traitchange` event](#the-traitchange-event).

## Where to read it: `traitCollection`

Available on [`UIView`](ui-view.md), [`UIViewController`](ui-view-controller.md), and [`UIWindowScene`](ui-window-scene.md).

| Property | Type | Readable | Writable | Meaning |
| --- | --- | --- | --- | --- |
| `traitCollection` | `UITraitCollection` | Yes | No | The traits of the environment this object is in |

- It can be read even on a view not yet added to the UI: light/dark is the current system setting, and `displayScale` is the screen's scale (measured as 3, not 0).
- Assigning to `traitCollection` throws `TypeError`.
- [`traitchange`](#the-traitchange-event) fires when it changes.

## Forcing dark or light: `overrideUserInterfaceStyle`

Writing `overrideUserInterfaceStyle` on a level switches that level and every level inside it to the written value; levels outside aren't affected. Writing `'unspecified'` cancels the override and restores the same value as the level outside.

Which level you write it on determines the scope:

| Where | Affects |
| --- | --- |
| Window | All UI in that window. For an in-app theme switch, write it here |
| View controller | That view controller and the views inside it |
| View | That view and its subviews |

Scenes have no `overrideUserInterfaceStyle`; a scene's value is always the system setting. So after forcing, be clear about which level you're reading:

| What you want to know | What to read |
| --- | --- |
| Whether the system setting is dark or light | `scene.traitCollection` |
| Whether this view actually displays dark or light | `view.traitCollection` |

Two things after writing are counterintuitive, both verified by testing:

- **Reading `traitCollection` right after writing still gives the old value.** The system updates everything a bit later and fires `traitchange` when done. Code that depends on the new value belongs in the `traitchange` callback. `overrideUserInterfaceStyle` itself reads back the written value immediately. See [Forcing doesn't take effect immediately](#forcing-doesnt-take-effect-immediately).
- **For a view not in a window, the override doesn't show in `traitCollection`.** If a view not yet added to the UI is forced and read again 2 seconds later, its `traitCollection` and those of its subviews still have the original values.

### `overrideUserInterfaceStyle` property

Available on `UIView` (including [`UIWindow`](ui-window.md)) and `UIViewController`. Not on scenes.

| Property | Type | Readable | Writable | Default | Meaning |
| --- | --- | --- | --- | --- | --- |
| `overrideUserInterfaceStyle` | string | Yes | Yes | `'unspecified'` | Which appearance this object and everything inside it are forced to use |

| Value | Effect |
| --- | --- |
| `'unspecified'` | Not forced; same as the level outside |
| `'light'` | Always light |
| `'dark'` | Always dark |

- After writing, `overrideUserInterfaceStyle` reads back the new value immediately; `traitCollection` updates a bit later. See [Forcing doesn't take effect immediately](#forcing-doesnt-take-effect-immediately).
- It isn't saved; after the app restarts it's back to `'unspecified'`.
- Writing a value not in the table doesn't throw: the property keeps its previous value, and the console prints a warning: `[Nacre] overrideUserInterfaceStyle has no value "night"; expected one of: unspecified / light / dark, ignored`

## Forcing doesn't take effect immediately

After you write `overrideUserInterfaceStyle`, the system doesn't update the view's `traitCollection` right away; it updates everything a bit later and then fires `traitchange`:

```js
const page = new UIViewController();
const before = page.view.traitCollection.userInterfaceStyle;
page.view.overrideUserInterfaceStyle = before === 'dark' ? 'light' : 'dark';
console.log(page.view.traitCollection.userInterfaceStyle === before);

page.view.addEventListener('traitchange', () => {
  console.log(page.view.traitCollection.userInterfaceStyle === before);
});
```

**Effect**: first prints `true`: reading right after writing still gives the original value. A bit later the event arrives and prints `false`: by then the new value is read.

So code that depends on the new value belongs in the `traitchange` callback, not on the line after the assignment. In the acceptance tests the event had arrived 500 milliseconds after the write; when the app was busy it was measured taking longer than 500 milliseconds. So don't wait a fixed time with a timer.

Between the moment of writing and the event's arrival, the view's `traitCollection` has the old value. Colors written to its layers during this time are also computed with the old appearance. So write layer colors in the `traitchange` callback too.

The change propagates to every level inside: after a view is forced, its subviews also read the new value when the event arrives.

**For a view not in a window, the override doesn't show in `traitCollection`.** For a view not yet added to the UI, after writing `overrideUserInterfaceStyle`, `overrideUserInterfaceStyle` reads back the written value, but its `traitCollection` doesn't change (still the original value after waiting 2 seconds, verified by testing), and the same goes for its subviews. `traitCollection` updates only after it's added to the UI; this step is **not verified in the simulator**.

View controllers are the exception: if you write `overrideUserInterfaceStyle` on a view controller that isn't displayed yet and then read `page.view.traitCollection`, you get the new value.

## The `traitchange` event

You can listen for it with `addEventListener()` on `UIView`, `UIViewController`, and `UIWindowScene`. Their subclasses can too, for example a [`UIButton`](ui-button.md) or a [`UIScrollView`](ui-scroll-view.md).

| Event | When it fires | Event object |
| --- | --- | --- |
| `traitchange` | Any of the seven traits above changed for this object | One extra field, `previousTraitCollection`: the set of values before the change |

```js
const page = new UIViewController();
page.view.addEventListener('traitchange', (e) => {
  const event = /** @type {UITraitChangeEvent} */ (e);
  console.log(event.previousTraitCollection.userInterfaceStyle);   // before the change
  console.log(page.view.traitCollection.userInterfaceStyle);       // now
});
```

**Effect**: when switching from light to dark, prints `light` and `dark`.

- The current value isn't on the event object; read it from the `traitCollection` of the object being listened to.
- It fires when the system switches between light and dark; when writing `overrideUserInterfaceStyle` changes this object's appearance; and when the user changes the system text size. All three have been checked in the simulator.
- Whether it fires when the other four traits change (the two size classes, contrast, writing direction) is **not verified in the simulator**.
- The event can't be canceled.
- The callback doesn't run synchronously at the moment of the change; it runs later. See [How the runtime works](how-it-works.md). When the callback runs, `traitCollection` already has the new value.
- It fires once per change: forcing a view to another appearance was measured to deliver one event to that view.
- It fires only when traits actually change. Whether it fires when `overrideUserInterfaceStyle` is written with the same value as the current actual appearance is **not verified in the simulator**.
- The event is dispatched on the object being listened to and doesn't propagate along the view hierarchy. When a view's appearance changes, the values its subviews read change with it (verified); whether listening on a subview receives its own event is **not verified in the simulator**.
- Listening for this event name on objects that aren't views, view controllers, or scenes (such as [gesture recognizers](ui-gesture-recognizer.md)) doesn't throw, but the system never fires it there; it's just a custom event.

## Examples

### Show the current appearance and switch to dark

Starting from a blank app, show whether it's currently dark or light, and add a button that switches the whole app to dark.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const label = new UILabel();
  label.frame = new CGRect(40, 120, 300, 30);
  label.textColor = 'label';
  page.view.addSubview(label);

  function show() {
    label.text = 'Now ' + page.view.traitCollection.userInterfaceStyle;
  }
  show();
  page.view.addEventListener('traitchange', show);

  const button = UIButton.buttonWithType('system');
  button.setTitle('Switch to dark', { forState: ['normal'] });
  button.frame = new CGRect(40, 170, 120, 44);
  page.view.addSubview(button);
  button.addEventListener('touchupinside', () => {
    win.overrideUserInterfaceStyle = 'dark';
  });
});
```

**Effect**

- When the system is light, the screen has a white background with a line of black text "Now light" on top and a text button "Switch to dark" below.
- Tapping the button turns the whole screen black, the text turns white, and the line changes to "Now dark".

This code hasn't been run as a whole in the simulator. Reading, forcing on a view, and the event have each been checked in the acceptance tests. That the whole screen follows after forcing on the window is **not verified in the simulator**: the acceptance app has such a button, but no assertion.

For more patterns, see the guide [Supporting Dark Mode](../guides/dark-mode.md).

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `view.traitCollection.userInterfaceStyle == UIUserInterfaceStyleDark` | `view.traitCollection.userInterfaceStyle === 'dark'` |
| `view.traitCollection.displayScale` | `view.traitCollection.displayScale` |
| `view.traitCollection.preferredContentSizeCategory` | `view.traitCollection.preferredContentSizeCategory` |
| `window.overrideUserInterfaceStyle = UIUserInterfaceStyleDark` | `win.overrideUserInterfaceStyle = 'dark'` |
| `[view registerForTraitChanges:traits withTarget:self action:@selector(changed:previous:)]` | `view.addEventListener('traitchange', …)` |
| Overriding `- traitCollectionDidChange:` (deprecated) | Same as above |
| `UIScreen.mainScreen.scale` | `view.traitCollection.displayScale` |

One difference from native: natively you list which traits you care about when registering; here it's always the seven above, and the event fires when any of them changes.

### Comparison with the browser

| Browser | Nacre |
| --- | --- |
| `matchMedia('(prefers-color-scheme: dark)').matches` | `scene.traitCollection.userInterfaceStyle === 'dark'` |
| `matchMedia(…).addEventListener('change', …)` | `scene.addEventListener('traitchange', …)` |
| `window.devicePixelRatio` | `view.traitCollection.displayScale` |
| CSS `color-scheme: dark` on an element | `view.overrideUserInterfaceStyle = 'dark'` |

## See also

- [Supporting Dark Mode](../guides/dark-mode.md): detecting light/dark, theme switches, adjusting to text size, layer colors that follow the appearance
- [`UIColor`](ui-color.md): semantic colors and `light-dark()`, colors that follow light/dark automatically
- [`UIView`](ui-view.md), [`UIViewController`](ui-view-controller.md), [`UIWindowScene`](ui-window-scene.md): the three classes that have `traitCollection` and the event
- [`UIWindow`](ui-window.md): write its `overrideUserInterfaceStyle` for an in-app theme switch
- [`UIFont`](ui-font.md): `preferredFontForTextStyle()`, font sizes that follow the system text size
- [`application`](application.md): the `contentsizecategorychange` event, another notification of text size changes
- [Units](units.md): pt and pixels
- [How the runtime works](how-it-works.md): when events run
