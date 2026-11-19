---
type: reference
native: "-[UIImagePickerController init]"
---

# `UIImagePickerController()` constructor

The **`UIImagePickerController()`** constructor creates a system camera interface. A new one is not yet a camera interface: its [`sourceType`](sourcetype.md) is the system default `'photoLibrary'`, and must first be written as `'camera'`.

## Syntax

```
new UIImagePickerController()
```

### Parameters

None.

### Return value

The new `UIImagePickerController`. Each `new` gives a new object.

- Creation does not depend on hardware; it can be created on any device, including the simulator.
- [`sourceType`](sourcetype.md) is `'photoLibrary'`, and [`allowsEditing`](allowsediting.md) is `false`.

### Exceptions

**`TypeError`**

- Subclassing it: `class MyPicker extends UIImagePickerController {}` throws on `new MyPicker()`. Native classes cannot be subclassed.

## Description

Create a new one for each photo. After it is dismissed you do not need to keep it; it is collected when no variable refers to it.

## Examples

```js
const picker = new UIImagePickerController();
console.log(picker.sourceType);
console.log(picker instanceof UIViewController, picker instanceof UINavigationController);
```

**Result**

- The first line prints `photoLibrary`.
- The second line prints `true false`: it is a view controller, but not a navigation controller.

## Corresponding iOS API

`[[UIImagePickerController alloc] init]`. In ObjC it inherits from `UINavigationController`; here it inherits from `UIViewController`.

## See also

- [`sourceType`](sourcetype.md): write it as `'camera'` first after creating
- [Installing `@nacrejs/camera`](../ui-image-picker-controller.md#installation)
