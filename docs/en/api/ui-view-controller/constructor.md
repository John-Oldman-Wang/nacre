---
type: reference
native: "-[UIViewController init]"
---

# `UIViewController()` constructor

The **`UIViewController()`** constructor creates an empty view controller.

## Syntax

```
new UIViewController()
```

### Parameters

None.

### Return value

The new `UIViewController`.

- A new view controller does not display itself. Set it as a window's [`rootViewController`](../ui-window/rootviewcontroller.md), push it onto a navigation stack, put it in a tab bar, present it modally, or add it as a child view controller.
- Creating a view controller needs no scene or window.
- A new view controller is not kept by any object. Until it is shown, a variable must hold it.

### Exceptions

**`TypeError`**

Subclassing it and then constructing:

```
Illegal constructor: MyPage extends UIViewController, but subclassing native classes is not supported yet
```

For what to write instead, see [Native classes](../native-classes.md): write a function that calls `new UIViewController()`, puts content into its `view`, and returns it.

## Examples

```js
function makeSettingsPage() {
  const page = new UIViewController();
  page.title = 'Settings';
  page.view.backgroundColor = 'systemBackground';
  return page;
}

const settings = makeSettingsPage();
console.log(settings.title);
```

**Result**: The console prints `Settings`. The view controller is not on screen yet.

## Corresponding iOS API

`[[UIViewController alloc] init]`.

## See also

- [`view`](view.md): putting content on a view controller
- [Who keeps a view controller alive](../ui-view-controller.md#who-keeps-a-view-controller-alive)
