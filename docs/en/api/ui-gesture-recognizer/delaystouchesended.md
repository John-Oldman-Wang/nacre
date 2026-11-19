---
type: reference
native: UIGestureRecognizer.delaysTouchesEnded
---

# `UIGestureRecognizer`: `delaysTouchesEnded` property

The **`delaysTouchesEnded`** property decides whether the view receives the end of a touch before the recognizer is certain it will not recognize the gesture.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | The view receives the end of the touch only after the recognizer is certain it will not recognize |
| `false` | The view receives the end of the touch immediately |

- Readable and writable.
- The default is `true`.
- Written values are converted by JS truthiness.
- The effect of setting it to `false` is **not verified in the simulator**.

### Observing changes

No event fires when it changes. Only the app's code changes it, so no notification is needed.

## Examples

```js
const tap = new UITapGestureRecognizer();
console.log(tap.delaysTouchesEnded);
```

**Result**: Prints `true`.

## Corresponding iOS API

`UIGestureRecognizer.delaysTouchesEnded`.

## See also

- [`delaysTouchesBegan`](delaystouchesbegan.md)
- [`cancelsTouchesInView`](cancelstouchesinview.md)
