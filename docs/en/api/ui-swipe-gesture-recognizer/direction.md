---
type: reference
native: UISwipeGestureRecognizer.direction
---

# `UISwipeGestureRecognizer`: `direction` property

The **`direction`** property determines which directions of swipe are recognized.

## Value

An array of strings. The values that can appear in it:

| Value | Meaning |
| --- | --- |
| `'right'` | Rightward |
| `'left'` | Leftward |
| `'up'` | Upward |
| `'down'` | Downward |

- Readable and writable.
- The default is `['right']`.
- When read, the order is always `right`, `left`, `up`, `down`, regardless of the order written.
- You can write an empty array; how the recognizer behaves with an empty array is **not verified in the simulator**.
- When several directions are written, they all fire the same [`ended`](../ui-gesture-recognizer/ended-event.md), and the event doesn't say which one was recognized. To tell directions apart, create one recognizer per direction.

### Observing changes

No event fires when it changes. Only the app's own code changes it, so no notification is needed.

### Invalid values

- Not an array: throws `TypeError: direction needs an array of names; expected any of: right / left / up / down`.
- An unrecognized name in the array: nothing is thrown, the whole assignment has no effect, the property keeps its previous value, and the console prints a warning: `[Nacre] direction has no value "diagonal"; expected one of: right / left / up / down, ignored`. The valid names in the array aren't applied on their own either.

## Examples

```js
const swipe = new UISwipeGestureRecognizer();
swipe.direction = ['up', 'left'];
console.log(swipe.direction.join(', '));
```

**Result**: Prints `left, up`.

## Corresponding iOS API

`UISwipeGestureRecognizer.direction`. The bitmask `UISwipeGestureRecognizerDirectionLeft | UISwipeGestureRecognizerDirectionRight` is written as `['left', 'right']`.

## See also

- [Responding to gestures](../../guides/gestures.md#responding-to-swipes)
