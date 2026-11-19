---
type: reference
native: UIScrollView.keyboardDismissMode
---

# `UIScrollView`: `keyboardDismissMode` property

The **`keyboardDismissMode`** property determines whether to dismiss the keyboard when the user drags the scroll view.

## Value

A string, one of these five:

| Value | Effect |
| --- | --- |
| `'none'` | Does not dismiss the keyboard when dragging |
| `'onDrag'` | Dismisses the keyboard as soon as dragging starts |
| `'interactive'` | Once the finger is dragged onto the keyboard, the keyboard follows the finger down, and on release it decides whether to dismiss or spring back |
| `'onDragWithAccessory'` | Like `'onDrag'`, dismissing the toolbar above the keyboard as well |
| `'interactiveWithAccessory'` | Like `'interactive'`, treating the toolbar above the keyboard as part of it |

- Readable and writable.
- Defaults to `'none'`.
- The effect of each value is **not verified in the simulator**. The acceptance tests verify that all five values can be written and read back.
- It dismisses the keyboard currently shown, regardless of whether the text field being edited is a subview of the scroll view. When the keyboard is dismissed, the text field being edited fires `blur`.
- All subclasses of scroll view have this property, including [`UITextView`](../ui-text-view.md) and [`UICollectionView`](../ui-collection-view.md).
- No change event: only the app's own code changes it.

### Invalid values

Writing a value not in the table does not throw; the property keeps its previous value, and the console logs a warning listing all valid values:

```
[Nacre] keyboardDismissMode has no value "x"; expected one of: none / onDrag / interactive / onDragWithAccessory / interactiveWithAccessory, ignored
```

## Examples

```js
const scroller = new UIScrollView();
scroller.keyboardDismissMode = 'onDrag';
// @ts-expect-error deliberately invalid
scroller.keyboardDismissMode = 'drag';
console.log(scroller.keyboardDismissMode);
```

**Effect**

- As soon as the user drags the content, the keyboard is dismissed. **Not verified in the simulator.**
- The console first logs a warning, then `onDrag`: the invalid assignment had no effect.

## Corresponding iOS API

`UIScrollView.keyboardDismissMode`. `UIScrollViewKeyboardDismissModeOnDrag` is written `'onDrag'`, and likewise for the others.

## See also

- [Dismissing the keyboard when dragging a list](../../guides/scrolling.md#dismissing-the-keyboard-when-the-list-is-dragged)
