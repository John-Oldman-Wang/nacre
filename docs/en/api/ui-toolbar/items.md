---
type: reference
native: UIToolbar.items
---

# `UIToolbar`: `items` property

The **`items`** property is the items on the toolbar, arranged from left to right. Each item is a [`UIBarButtonItem`](../ui-bar-button-item.md).

## Value

An array of `UIBarButtonItem`.

- Readable and writable.
- Defaults to `[]`.
- Each read returns a new array containing the toolbar's items at that moment. Calling `push` or `pop` on that array doesn't change the toolbar; to add or remove buttons, assign the whole array again.
- Each item in the array is still the original object: `items[0]` read back is `===` to the button that was written, and the button's listeners and custom properties are all still there.
- Writing `null` is the same as writing an empty array; it reads back as `[]`.
- Besides arrays, iterable objects such as `Set` are also accepted.
- The toolbar holds its items. Once buttons are in `items`, they and their listeners aren't lost even if the app keeps no variable for them.
- No change event: only the app's own code changes it.
- Writing `items` directly replaces them immediately, with no transition. For animation, use [`setItems()`](setitems.md).
- Putting the same button into a second toolbar doesn't throw, and it appears in the `items` of both toolbars. Which one it appears in on screen is **not verified in the simulator**.

The space between buttons is taken up by two kinds of items: `UIBarButtonItem.flexibleSpace()` (fills the remaining width; several share it equally) and `UIBarButtonItem.fixedSpace(width)` (`width` pt wide).

### Invalid values

- Writing a value that isn't an array (a number, a string) throws `TypeError: items needs an array of UIBarButtonItem or null`.
- The array contains an element that isn't a `UIBarButtonItem` (another object, `null`, a string): throws `TypeError: items needs an array of UIBarButtonItem`.

In both cases the existing items stay unchanged.

## Examples

```js
const toolbar = new UIToolbar();
const add = UIBarButtonItem.systemItem('add');
toolbar.items = [add, UIBarButtonItem.flexibleSpace(), UIBarButtonItem.systemItem('trash')];

toolbar.items = [...toolbar.items, UIBarButtonItem.systemItem('done')];
console.log(toolbar.items.length);
console.log(toolbar.items[0] === add);
```

**Result**: prints `4`, then `true`. On the toolbar, the plus is at the left end, and the trash can and "Done" are at the right end.

## Corresponding iOS API

`UIToolbar.items`. `nil` is written as `null` and reads back as `[]`.

## See also

- [`setItems()`](setitems.md): replacing the items with animation
- [`UIBarButtonItem`](../ui-bar-button-item.md): `UIBarButtonItem`, `flexibleSpace()`, `fixedSpace()`
