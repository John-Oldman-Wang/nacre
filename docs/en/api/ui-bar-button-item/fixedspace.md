---
type: reference
native: "+[UIBarButtonItem fixedSpaceItemOfWidth:]"
---

# `UIBarButtonItem.fixedSpace()` static method

The **`UIBarButtonItem.fixedSpace()`** static method creates a fixed-width blank space that displays nothing, used to put distance between two buttons.

## Syntax

```
UIBarButtonItem.fixedSpace(width)
```

### Parameters

**`width`**

The width, in [pt](../units.md). Converted with `Number(v)`.

### Return value

A new `UIBarButtonItem` whose [`width`](width.md) is the given width.

### Exceptions

**`TypeError`**

`width` can't be converted to a finite number.

## Examples

```js
const fixed = UIBarButtonItem.fixedSpace(20);
console.log(fixed.width);
```

**Result**: the console prints `20`.

```js
const page = new UIViewController();
const edit = new UIBarButtonItem({ title: 'Edit' });
const more = UIBarButtonItem.systemItem('action');
page.navigationItem.rightBarButtonItems = [edit, UIBarButtonItem.fixedSpace(20), more];
```

**Effect**: 20 pt of extra space appears between the two buttons. **Not verified in the simulator.**

## Corresponding iOS API

`+[UIBarButtonItem fixedSpaceItemOfWidth:]`.

## See also

- [`UIBarButtonItem.flexibleSpace()`](flexiblespace.md): a space that stretches automatically
- [`width`](width.md)
