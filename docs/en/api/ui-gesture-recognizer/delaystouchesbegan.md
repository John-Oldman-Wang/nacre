---
type: reference
native: UIGestureRecognizer.delaysTouchesBegan
---

# `UIGestureRecognizer`: `delaysTouchesBegan` property

The **`delaysTouchesBegan`** property decides whether the view receives the start of a touch before the recognizer is certain it will not recognize the gesture.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Until the recognizer is certain it will not recognize, the view does not receive the start of the touch. A control's [`touchdown`](../ui-control/touchdown-event.md) is postponed until after the recognizer fails |
| `false` | The view and the recognizer receive the start of the touch at the same time |

- Readable and writable.
- The default is `false`. For [`UIScreenEdgePanGestureRecognizer`](../ui-screen-edge-pan-gesture-recognizer.md) the default is `true`.
- Written values are converted by JS truthiness.
- The effect of setting it to `true` is **not verified in the simulator**.

### Observing changes

No event fires when it changes. Only the app's code changes it, so no notification is needed.

## Examples

```js
const tap = new UITapGestureRecognizer();
console.log(tap.delaysTouchesBegan);
tap.delaysTouchesBegan = true;
console.log(tap.delaysTouchesBegan);
```

**Result**: Prints `false`, then `true`.

## Corresponding iOS API

`UIGestureRecognizer.delaysTouchesBegan`.

## See also

- [`delaysTouchesEnded`](delaystouchesended.md)
- [`cancelsTouchesInView`](cancelstouchesinview.md)
