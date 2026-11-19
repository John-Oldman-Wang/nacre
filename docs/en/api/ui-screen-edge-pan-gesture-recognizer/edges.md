---
type: reference
native: UIScreenEdgePanGestureRecognizer.edges
---

# `UIScreenEdgePanGestureRecognizer`: `edges` property

The **`edges`** property determines which screen edges a recognized drag can start from.

## Value

An array of strings. The values that can appear in the array:

| Value | Meaning |
| --- | --- |
| `'top'` | The top edge of the screen |
| `'left'` | The left edge of the screen |
| `'bottom'` | The bottom edge of the screen |
| `'right'` | The right edge of the screen |

- Readable and writable.
- Defaults to `[]`: no gesture is recognized.
- Edges are relative to the current interface orientation.
- Reads always return the order `top`, `left`, `bottom`, `right`, regardless of the order written.
- There is no value meaning "all"; to use all four edges, write all four.
- When the view controller is in a [navigation controller](../ui-navigation-controller.md), the left edge of the screen is already taken by "swipe right to go back to the previous view controller".

### Observing changes

No event fires when it changes. Only the App's own code changes it, so no notification is needed.

### Invalid values

- Not an array: throws `TypeError`, and the message lists all valid values.
- The array contains an unrecognized name: no exception is thrown; the whole assignment has no effect, the property keeps its previous value, and a warning listing all valid values is logged to the console. The correctly spelled names in the array are not applied on their own either.

## Examples

```js
const edgePan = new UIScreenEdgePanGestureRecognizer();
edgePan.edges = ['right', 'left'];
console.log(edgePan.edges.join(', '));
```

**Result**: logs `left, right`.

## Corresponding iOS API

`UIScreenEdgePanGestureRecognizer.edges`. `UIRectEdgeRight` is written `['right']`, and `UIRectEdgeAll` is written `['top', 'left', 'bottom', 'right']`.

## See also

- [Responding to gestures](../../guides/gestures.md#dragging-in-from-the-screen-edge)
