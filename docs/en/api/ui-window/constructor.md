---
type: reference
native: "-[UIWindow initWithWindowScene:]"
---

# `UIWindow()` constructor

The **`UIWindow()`** constructor creates a window.

## Syntax

```
new UIWindow(scene)
new UIWindow()
```

### Parameters

**`scene`**

A [`UIWindowScene`](../ui-window-scene.md), optional.

- If passed, the system window is created right away and placed in this scene.
- If omitted, or `null` or `undefined` is passed, only the JS object is created at first; there is no corresponding system window. It is created when [`windowScene`](windowscene.md) is assigned later.

### Return value

A new `UIWindow`. It starts hidden, with `isHidden` set to `true`; call [`makeKeyAndVisible()`](makekeyandvisible.md) to show it.

### Exceptions

**`TypeError`**

- `scene` isn't a scene object (a number, a string, another native object): `cannot construct UIWindow with these arguments`.
- Subclassing `UIWindow` and constructing it: `Illegal constructor: MyWindow extends UIWindow, but subclassing native classes is not supported yet` (`MyWindow` is the subclass's name). For the reason, see [native classes](../native-classes.md).

Passing a scene the system has already destroyed doesn't throw, but the window won't be shown. **Not verified in the simulator.**

## Description

The difference between the two forms:

| Form | When the system window is created | When to use |
| --- | --- | --- |
| `new UIWindow(scene)` | Right away | You already have the scene. Use this in almost all cases |
| `new UIWindow()`, then `win.windowScene = scene` | When `windowScene` is assigned | The code creating the window can't get the scene; the scene is provided elsewhere later |

With the second form, before the assignment, reading `windowScene` gives `null`; no other property or method can be used, and accessing one throws `TypeError` whose message starts with the name of the member accessed:

```
makeKeyAndVisible(): this object is not connected to a scene yet, so no native object exists
rootViewController: this object is not connected to a scene yet, so no native object exists
```

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  console.log(win.isHidden, win.windowScene === e.scene);
});
```

**Result**: When the scene connects, prints `true true`.

```js
const lazy = new UIWindow();
console.log(lazy.windowScene);
try {
  lazy.makeKeyAndVisible();
} catch (err) {
  console.log(String(err));
}
```

**Result**: First prints `null`, then `TypeError: makeKeyAndVisible(): this object is not connected to a scene yet, so no native object exists`.

## Corresponding iOS API

`-[UIWindow initWithWindowScene:]`. `init` and `initWithFrame:` are deprecated in iOS 26 and have no counterpart.

## See also

- [`windowScene`](windowscene.md)
- [`makeKeyAndVisible()`](makekeyandvisible.md)
