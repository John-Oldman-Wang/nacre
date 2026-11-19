---
type: reference
native: "-[UIBarButtonItem initWithBarButtonSystemItem:target:action:]"
---

# `UIBarButtonItem.systemItem()` static method

The **`UIBarButtonItem.systemItem()`** static method creates a system-provided navigation bar button. Text buttons show text that follows the system language, and icons are the system's standard ones. The kind of system button can only be specified at creation and can't be changed afterwards.

## Syntax

```
UIBarButtonItem.systemItem(name)
```

### Parameters

**`name`**

One of the names in the table below. The effects in the table come from Apple's documentation and are **all not verified in the simulator**.

| Value | Effect |
| --- | --- |
| `'done'` | The text "Done" |
| `'cancel'` | The text "Cancel" |
| `'edit'` | The text "Edit" |
| `'save'` | The text "Save" |
| `'undo'` | The text "Undo" |
| `'redo'` | The text "Redo" |
| `'add'` | A plus icon |
| `'compose'` | A new-content icon: a square with a pen |
| `'reply'` | A reply icon: a curved arrow pointing left |
| `'action'` | A share icon: a square with an upward arrow |
| `'organize'` | A folder icon |
| `'bookmarks'` | A bookmarks icon: an open book |
| `'search'` | A magnifying glass icon |
| `'refresh'` | A refresh icon: a circular arrow |
| `'stop'` | A stop icon: an X |
| `'close'` | A close icon: an X |
| `'camera'` | A camera icon |
| `'trash'` | A trash can icon |
| `'play'` | A play icon |
| `'pause'` | A pause icon |
| `'rewind'` | A rewind icon |
| `'fastForward'` | A fast-forward icon |
| `'pageCurl'` | A page curl icon. Apple no longer recommends it |
| `'writingTools'` | The icon for the system's Writing Tools |
| `'flexibleSpace'` | A blank space that displays nothing, with a width that stretches automatically. Equivalent to [`UIBarButtonItem.flexibleSpace()`](flexiblespace.md) |
| `'fixedSpace'` | A blank space that displays nothing, with a width determined by [`width`](width.md) |

### Return value

A new `UIBarButtonItem`.

### Exceptions

**`TypeError`**

The name isn't in the table: `systemItem has no value "explode"; expected one of: …`, followed by all the available names.

## Examples

```js
const trash = UIBarButtonItem.systemItem('trash');
console.log(trash instanceof UIBarButtonItem);
```

**Result**: the console prints `true`.

## Corresponding iOS API

`-[UIBarButtonItem initWithBarButtonSystemItem:target:action:]`. `UIBarButtonSystemItemAdd` is written as `'add'`, and likewise for the rest. ObjC has no corresponding writable property, so here it's a static method.

## See also

- [`UIBarButtonItem()`](constructor.md): creating one with your own text or icon
