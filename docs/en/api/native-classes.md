---
type: concept
status: partial
---

# Native classes

**Native classes** represent the classes iOS provides: views (`UIView`), text labels (`UILabel`), view controllers (`UIViewController`), layers (`CALayer`), and so on. They are global classes that need no import, and their names are the same as the iOS class names. Each JS object of a native class corresponds to one object in the system: writing its properties and calling its methods changes that system object, and the UI changes with it.

All native classes follow the same set of rules: how to get an object, no subclassing, adding your own properties to an object, when an object is collected, and what happens when an argument is wrong. These rules are written on this page and not repeated in the documentation of each class.

The classes the runtime defines itself (`URL`, `Request`, `WebSocket`, `Blob`, and so on) and structs (`CGRect` and so on; see [Structs](structs.md)) are not native classes, and the rules on this page don't all apply to them.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const label = new UILabel();                 // Constructed with new
  label.frame = { x: 20, y: 100, width: 300, height: 30 };
  label.text = 'Hello';
  label.font = UIFont.systemFontOfSize(20);    // Fonts can't be created with new; a static method provides them
  page.view.addSubview(label);

  console.log(label instanceof UIView);        // The inheritance matches iOS
  console.log(label.superview === page.view);  // The same system object is the same JS object
});
```

**Effect**

- A line of 20 pt text, `Hello`, appears on screen.
- The console prints `true` twice.

The examples in the sections below reuse `page` and `label` from here.

## Getting an object

Native classes fall into three groups by how you get an object. Which group a class belongs to is stated in its own documentation.

| Group | How to get one | Examples |
| --- | --- | --- |
| Constructible | `new X(…)` | `UIView`, `UILabel`, `UIButton`, `UIImageView`, `UIScrollView`, `UIStackView`, `UITextField`, `UIWindow`, `UIViewController`, `UINavigationController`, `UITabBarController`, `CALayer`, `CAShapeLayer`, `CAGradientLayer`, `CABasicAnimation`, `UIBezierPath`, `UILayoutGuide`, `UIBarButtonItem`, `UITapGestureRecognizer` |
| Created only by the runtime | Read a property, or call a static method | `UIColor`, `UIFont`, `UIImage`, `NSLayoutConstraint`, `UIWindowScene`, `UINavigationItem`, `UITraitCollection`, `UIDevice`, `UIPasteboard` |
| Base classes | You can't get one. They are only the superclasses of other classes | `NSObject`, `UIResponder`, `UIScene`, `UIBarItem`, `UIGestureRecognizer`, `CAAnimation` |

```js
const font = UIFont.systemFontOfSize(17);     // Static method
const layer = label.layer;                    // Reading a property
const device = UIDevice.currentDevice;        // Static property

console.log(font instanceof UIFont, layer instanceof CALayer, device instanceof UIDevice);
```

**Result**

- Prints `true true true`.

Using `new` on a class in the last two groups throws `TypeError`; for the error messages, see [Three kinds of "no native object"](#three-kinds-of-no-native-object-with-different-messages). The type checker also reports an error at the `new`.

Base classes can be used on the right side of `instanceof`: `label instanceof UIResponder` is `true`.

## No subclassing

Native classes can't be subclassed. The `class` declaration itself doesn't throw; the error happens at `new`:

```js
class MyPage extends UIViewController {}

try {
  new MyPage();
} catch (err) {
  console.log(String(err));
}
```

**Result**

- Prints `TypeError: Illegal constructor: MyPage extends UIViewController, but subclassing native classes is not supported yet`.
- No object is created.

What you probably want to know at this point:

- **Which classes can't be subclassed.** All native classes, including classes such as `UILabel` and `UIStackView` that have no subclasses.
- **Whether the editor reports it ahead of time.** Not for constructible classes: `class MyPage extends UIViewController {}` and `new MyPage()` both pass type checking, and the error only appears at runtime. For classes created only by the runtime (such as `UIColor`), yes: the type checker reports an error at `extends`.
- **Where the error points.** At the `new MyPage()` line, not at the `class` line. The error message names the subclass and the superclass, so you can find the `class` declaration by name.
- **Finding out when a view controller appears and disappears.** No subclassing is needed; these are events of the view controller. See [`UIViewController`](ui-view-controller.md#appearing-and-disappearing).

### Recommended approach: compose with functions

When you need "a view of your own" or "a view controller of your own," write a function: construct the native object in the function, configure it, and return it. When you need extra data and methods, return a plain object that contains the native object.

```js
/** @param {string} title */
function makeCard(title) {
  const view = new UIView();
  view.backgroundColor = 'secondarySystemBackground';
  view.layer.cornerRadius = 12;

  const heading = new UILabel();
  heading.frame = { x: 16, y: 12, width: 200, height: 24 };
  heading.text = title;
  view.addSubview(heading);

  let taps = 0;
  return {
    view,
    /** @param {string} text */
    setTitle(text) {
      heading.text = text;
    },
    countTap() {
      taps += 1;
      return taps;
    },
  };
}

const card = makeCard('Balance');
card.view.frame = { x: 20, y: 160, width: 240, height: 80 };
page.view.addSubview(card.view);
card.setTitle('Available balance');
```

**Effect**

- A card with rounded corners appears on screen, with the text "Available balance" inside.

This approach does the three things subclassing is meant to do:

| Goal | How |
| --- | --- |
| Add your own data to the object | Local variables in the function (`taps` above), or fields on the returned object |
| Add your own methods to the object | Methods on the returned object (`setTitle` above) |
| Reuse the same configuration | Call the function multiple times |

When `card` needs to be passed to an API that takes a view, pass `card.view`.

When you only need configuration and no extra data or methods, the function returns the native object directly:

```js
/** @param {string} title */
function makeSettingsPage(title) {
  const settings = new UIViewController();
  settings.title = title;
  settings.view.backgroundColor = 'systemBackground';
  return settings;
}
```

**Effect**

- Calling `makeSettingsPage('Settings')` gives a view controller titled "Settings" that can be handed to a navigation controller to display.

## Custom properties are allowed

You can add your own properties to an object of a native class to associate a piece of data with a UI object. When you get the same object again from elsewhere, the property is still there:

```js
const row = new UIView();
/** @type {any} */ (row).orderId = 42;
page.view.addSubview(row);

const again = page.view.subviews[page.view.subviews.length - 1];
console.log(again === row, /** @type {any} */ (again).orderId);
```

**Result**

- Prints `true 42`.

`/** @type {any} */ (row)` is there for the type checker. The type definition of `UIView` has no `orderId` property; writing `row.orderId = 42` directly runs, but the type checker reports an error. This is intentional: the same check is what catches misspelled property names. See [Misspelled property names don't throw](#misspelled-property-names-dont-throw).

Don't give a custom property the same name as an existing property of the class.

### Recommended approach

When there are many custom properties, or they are read in many places, declare the type once so you don't need a cast every time:

```js
/** @typedef {UIView & { orderId?: number }} OrderRow */

const orderRow = /** @type {OrderRow} */ (new UIView());
orderRow.orderId = 42;
console.log(orderRow.orderId);
```

**Result**

- Prints `42`.

When the data is only used in the code that created it, prefer local variables as in [composing with functions](#recommended-approach-compose-with-functions); there is no need to attach it to the object. Attaching properties fits the case where code elsewhere gets hold of the UI object (for example, an event's `target`, or a superview's `subviews`) and needs to find the corresponding data from it.

### Can attached properties be lost?

The properties are attached to the JS object. As long as the JS object exists, the properties exist. The JS object is kept in any of these cases:

- A variable, closure, or other object in your code still references it.
- It is part of the UI: added to a superview, in a navigation stack, presented modally, or assigned to a property of another object that is kept (for example, a view controller's `view`, or a window's `rootViewController`).

So properties attached to views and view controllers that are in the UI are not lost, and you don't need to keep a separate reference.

They are lost in only one case: the object is neither in the UI nor referenced anywhere in your code. The JS object is then collected. If you later get the same system object through some API, you get a new JS object, without the properties you attached:

```js
/** @type {any} */ (UIColor.systemBrownColor).note = 'brand';
// UIColor.systemBrownColor isn't stored here, and isn't handed to any UI object.
// Reading it again some time later:
console.log(/** @type {any} */ (UIColor.systemBrownColor).note);
```

**Result**

- It may print `brand`, or it may print `undefined`, depending on whether the JS object was collected in the meantime.

To keep properties on such an object, store the object in a variable you keep.

## Misspelled property names don't throw

Because any property can be added to an object, a misspelled property name doesn't throw at runtime. It is treated as a new custom property:

```js
// @ts-expect-error There is no backgroundColour property; the type checker reports an error
label.backgroundColour = 'systemRed';
console.log(label.backgroundColor);
```

**Result**

- The label's background color doesn't change, and the original value is printed.
- There is no error or warning at runtime.

**This kind of mistake is caught by type checking.** With type checking turned on, the editor reports this for the line above:

```
Property 'backgroundColour' does not exist on type 'UILabel'. Did you mean 'backgroundColor'?
```

A comparison of which problems the type checker catches and which also throw at runtime:

| Code | Type checking | Runtime |
| --- | --- | --- |
| Misspelled property name: `view.backgroundColour = 'red'` | Error, with the correct name suggested | **No error, and no effect** |
| Wrong value for an [enum](enums.md) property: `view.contentMode = 'scaleAspectFitt'` | Error, with the correct value suggested | No exception; a warning is printed and the property keeps its value |
| Wrong enum value in a method argument: `UIFont.systemFontOfSize(17, { weight: 'bolt' })` | Error, with the correct value suggested | Throws `TypeError` |
| Writing a read-only property: `view.superview = other` | Error | Throws `TypeError` |
| Custom property: `view.orderId = 42` | Error; cast as described in the previous section | Works |

The first row is a mistake only the type checker can catch, so **turning on type checking is recommended for every project**. For how to set it up, see [Building your own app](../guides/your-own-app.md): install `@nacrejs/types` and turn on `checkJs` in `tsconfig.json`.

## When objects are collected

Objects of native classes don't need to be released manually. An object that is no longer used anywhere is collected automatically, together with its corresponding system object.

"Used" means either of two things: your code references it, or it is part of the UI. So objects in the UI don't need to be stored in variables to keep them alive:

| Object | Kept until |
| --- | --- |
| A window connected to a scene | The scene goes away |
| A window's root view controller, a view controller in a navigation stack, a modally presented view controller | It is replaced, popped, or dismissed |
| A view added to a superview, a gesture recognizer added to a view | It is removed from its superview, or the superview is no longer kept |
| A font, image, or color object assigned to a property | The property is changed to another value, or the owning object is no longer kept |
| A `CADisplayLink` that `addToRunLoop()` was called on | `invalidate()` is called, or it is removed with `removeFromRunLoop()` from every mode it was added to |
| An open `WebSocket` | The connection closes |
| An object not added anywhere | The last reference in your code goes away |

Three things that are easy to get wrong:

- **Adding an event listener doesn't keep an object alive.** A button that isn't in the UI and isn't referenced by your code is collected even if it has listeners, and the listeners go with it. Conversely, a button in the UI keeps its listeners working even if your code doesn't store it, and taps deliver events as usual.
- **A listener callback that references the object itself doesn't prevent collection.** There is no need to call `removeEventListener` one by one when leaving a view controller.
- **After the user pops a view controller with the back gesture, or swipes a modal view controller down, it is no longer kept by the navigation stack or by the view controller that presented it.** If your code has no other reference, it is collected along with its views and the listeners on them.

If an object's JS object has already been collected but the system object is still producing events, the runtime prints a warning to the console, and the event is not delivered to any listener:

```
[Nacre] CADisplayLink fired "tick" after its JS wrapper was collected; its listeners are gone and this event was dropped. Keep a reference to the object, or report this if it is still on screen.
```

When you see this warning, store the object in a variable you keep. If the object is clearly on screen, this is a runtime bug.

For how UI objects are collected after the system destroys a scene, see [`UIWindowScene`](ui-window-scene.md).

## Is the same system object the same JS object?

Yes. As long as the JS object is kept, getting the same system object by any route gives the same JS object, which can be compared with `===`:

```js
const child = new UIView();
page.view.addSubview(child);

console.log(child.superview === page.view);
console.log(page.view.subviews.includes(child));
console.log(UIColor.systemRedColor === UIColor.systemRedColor);
```

**Result**

- Prints `true` three times.

An event object's `target` is the same object too, so in an event callback you can read custom properties attached to it earlier.

Two kinds of values are not like this:

- [Structs](structs.md) are new instances every time they are read and can't be compared with `===`.
- [Color](ui-color.md) properties read back as strings.

## What happens when an argument is wrong

Property values and method arguments are handled according to their declared types. Numbers, booleans, and strings are converted automatically; native objects and enums are not. A native object of the wrong class, or an enum value in a method argument that isn't in the value table, throws `TypeError`. When an error is thrown, the write or call has no effect at all, and the property keeps its value. Writing a value that isn't in the value table to an enum property doesn't throw: a warning is printed and the property keeps its value.

| Expected type | How it is handled | Throws `TypeError` when |
| --- | --- | --- |
| Number | Converted with `Number()`. `'0.5'` is 0.5, `true` is 1, `null` is 0 | The result isn't a finite number: `undefined`, `'abc'`, `NaN`, `Infinity`, objects |
| Integer (indexes, counts) | Converted as a number, then the fractional part is dropped. `3.9` is 3, `-3.9` is -3 | Same as above |
| Boolean | JS truthiness. `1`, `'false'`, and `{}` are `true`; `0`, `''`, `null`, `undefined`, and `NaN` are `false` | Never |
| String | Converted with `String()`; `5` is `'5'`. `null` and `undefined`: `null` when the property is nullable, the empty string when it isn't | Never |
| Native object | Not converted | It isn't the required class. Properties and optional arguments accept `null` |
| [Enum](enums.md) | Not converted | A method argument, options member, or constructor argument isn't in the value table. Properties don't throw: an invalid value prints a warning and the property keeps its value |
| [Struct](structs.md) | An instance, or a plain object with fields of the same names | A field is missing, or a field isn't a finite number |
| [Color](ui-color.md) | A string or a `UIColor` object | Never. An invalid value prints a warning and the property keeps its value |
| Members of an options object | A member whose value is `undefined` counts as not given. Passing `null` or `undefined` for the whole options object counts as an empty object | A required member isn't given |

```js
const view = /** @type {any} */ (new UIView());

view.alpha = '0.5';
console.log(view.alpha);

view.isHidden = 'false';
console.log(view.isHidden);
view.isHidden = false;

try {
  view.alpha = undefined;
} catch (err) {
  console.log(String(err));
}
console.log(view.alpha);

try {
  view.addSubview(UIFont.systemFontOfSize(12));
} catch (err) {
  console.log(String(err));
}

try {
  label.font = /** @type {any} */ ('Helvetica');
} catch (err) {
  console.log(String(err));
}
```

**Result**

- The first part prints `0.5`.
- The second part prints `true`: the string `'false'` isn't an empty string, so it is truthy.
- The third part prints `TypeError: alpha must be a finite number, got undefined`, then `0.5`; the value stays unchanged.
- The fourth part prints `TypeError: addSubview needs a UIView`, and no subview is added.
- The fifth part prints `TypeError: font needs a native object or null, got "Helvetica"`, and the label's font doesn't change.

**Pass values of the declared types rather than relying on automatic conversion.** The type definitions are not loosened along with the runtime: `view.alpha = '0.5'` runs, but the type checker reports an error. The example above has to cast to `any` before it can be written. Automatic conversion exists so that values of uncertain origin (such as strings read from JSON) don't cause errors, but results like `'false'` becoming `true` are usually not what you want.

Values outside the allowed range (such as a negative number of taps) are a different kind of error, checked by each API itself; see the documentation of each class.

Calls the system itself rejects also throw `TypeError`, with the reason the system gives in the error message:

```js
const loner = new UIView();
try {
  loner.addSubview(loner);
} catch (err) {
  console.log(String(err));
}
```

**Result**

- Prints a line starting with `TypeError: addSubview: raised NS` that contains the system's explanation, `Can't add self as subview`.
- No subview is added. `loner` can be used normally afterward, and the app doesn't exit.

## Three kinds of "no native object," with different messages

When there is no corresponding system object behind a JS object, the error depends on the cause. The first three happen at `new`:

| Code | Error | Cause |
| --- | --- | --- |
| `new X()` after `class X extends UIView {}` | `Illegal constructor: X extends UIView, but subclassing native classes is not supported yet` | Native classes can't be subclassed; see [No subclassing](#no-subclassing) |
| `new UIColor()` | `Illegal constructor: UIColor is created by the runtime, not by new` | This class is created only by the runtime; see [Getting an object](#getting-an-object) |
| `new NSObject()` | `Illegal constructor: NSObject cannot be constructed` | A base class. `UIResponder` and `UIScene` give the same error; `UIBarItem` and `UIGestureRecognizer` give `… is abstract; construct … instead`, naming the class to construct |

The last two happen when the object is used:

| Code | Error | Cause |
| --- | --- | --- |
| `Object.create(UIView.prototype).frame` | `frame: Illegal invocation` | The object wasn't created by the constructor or the runtime; it only has the same prototype. When it is passed as an argument to another method, the error is `… has no native object yet, so it cannot be passed as an argument` |
| Reading `rootViewController` after `new UIWindow()` | `rootViewController: this object is not connected to a scene yet, so no native object exists` | **This isn't a mistake in your code.** A window constructed without arguments can't be used until `windowScene` is assigned; see [`UIWindow`](ui-window.md) |

All five are `TypeError`.

## Comparison with native iOS code

| ObjC | JS |
| --- | --- |
| `[[UILabel alloc] init]` | `new UILabel()` |
| `[UIColor redColor]` | `UIColor.redColor`, or simply the string `'red'` |
| `[UIFont systemFontOfSize:17]` | `UIFont.systemFontOfSize(17)` |
| `[view insertSubview:box atIndex:0]` | `view.insertSubview(box, { atIndex: 0 })` |
| `[view isKindOfClass:UIView.class]` | `view instanceof UIView` |
| `@interface MyPage : UIViewController` | Not supported; see [No subclassing](#no-subclassing) |

The method name mapping: the first part of the ObjC method name is the JS method name, and the remaining parts are the keys of an options object.

## See also

- [Enums](enums.md): how enum values are written, and the warnings and errors for invalid values.
- [Structs](structs.md): how values such as `CGRect` are written; fields are read-only.
- [Colors](ui-color.md): colors are written as strings, and invalid values only warn.
- [`UIWindowScene`](ui-window-scene.md): how UI objects are collected when a scene is destroyed, and why not to store UI objects outside the callback.
- [Building your own app](../guides/your-own-app.md): how to set up type checking.
