---
type: reference
native: +[UIBarButtonItem flexibleSpaceItem]
---

# `UIBarButtonItem.flexibleSpace()` static method

The **`UIBarButtonItem.flexibleSpace()`** static method creates a blank space that displays nothing and whose width stretches automatically, filling the remaining room between the buttons on either side.

## Syntax

```
UIBarButtonItem.flexibleSpace()
```

### Parameters

None.

### Return value

A new `UIBarButtonItem`.

### Exceptions

None.

## Examples

```js
const page = new UIViewController();
const edit = new UIBarButtonItem({ title: 'Edit' });
const more = UIBarButtonItem.systemItem('action');
page.navigationItem.rightBarButtonItems = [edit, UIBarButtonItem.flexibleSpace(), more];
console.log(page.navigationItem.rightBarButtonItems.length);
```

**Result**: the console prints `3`. The effect of the space on the navigation bar is **not verified in the simulator**.

## Corresponding iOS API

`+[UIBarButtonItem flexibleSpaceItem]`, equivalent to `initWithBarButtonSystemItem:UIBarButtonSystemItemFlexibleSpace`.

## See also

- [`UIBarButtonItem.fixedSpace()`](fixedspace.md): a fixed-width space
