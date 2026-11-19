---
type: reference
native: UIPinchGestureRecognizer
status: partial
---

# `UIPinchGestureRecognizer`

**`UIPinchGestureRecognizer`** represents a pinch gesture recognizer: it recognizes two fingers spreading apart or pinching together. Use it for two-finger zoom.

Pinch is a continuous gesture and fires [`began`](ui-gesture-recognizer/began-event.md), [`changed`](ui-gesture-recognizer/changed-event.md), [`ended`](ui-gesture-recognizer/ended-event.md), and [`cancelled`](ui-gesture-recognizer/cancelled-event.md). The event object carries `scale`, the distance between the two fingers as a multiple of the distance when the gesture began, and `velocity`, how fast it changes. `scale` starts at 1 for every gesture.

**Pinching has not yet been checked with real touches**; both the gesture itself and the data its events carry are **not verified in the simulator**.

**Inheritance**: `EventTarget` → `NSObject` → [`UIGestureRecognizer`](ui-gesture-recognizer.md) → `UIPinchGestureRecognizer`

For how to use it, see the guide [Responding to gestures](../guides/gestures.md).

## Constructor

[`UIPinchGestureRecognizer()`](ui-pinch-gesture-recognizer/constructor.md)

Creates a recognizer for two-finger pinches.

## Instance properties

Also inherits the properties of [`UIGestureRecognizer`](ui-gesture-recognizer.md); commonly used ones are [`isEnabled`](ui-gesture-recognizer/isenabled.md), [`view`](ui-gesture-recognizer/view.md), and [`cancelsTouchesInView`](ui-gesture-recognizer/cancelstouchesinview.md). Its methods are all inherited as well: [`addEventListener()`](ui-gesture-recognizer/addeventlistener.md), [`removeEventListener()`](ui-gesture-recognizer/removeeventlistener.md), [`requireGestureRecognizerToFail()`](ui-gesture-recognizer/requiregesturerecognizertofail.md).

| Property | Description |
| --- | --- |
| [`scale`](ui-pinch-gesture-recognizer/scale.md) | The distance between the two fingers as a multiple of the distance when the gesture began |
| [`velocity`](ui-pinch-gesture-recognizer/velocity.md) <small>read-only</small> | How much `scale` changes per second |

## Events

The events come from [`UIGestureRecognizer`](ui-gesture-recognizer.md#events); listen with `addEventListener()`. It fires:

| Event | When it fires |
| --- | --- |
| [`began`](ui-gesture-recognizer/began-event.md) | When a pinch is recognized |
| [`changed`](ui-gesture-recognizer/changed-event.md) | Each time the distance between the fingers changes after that |
| [`ended`](ui-gesture-recognizer/ended-event.md) | When the fingers lift |
| [`cancelled`](ui-gesture-recognizer/cancelled-event.md) | When the gesture is interrupted |

## Examples

```js
const card = new UIView();
const pinch = new UIPinchGestureRecognizer();
let baseScale = 1;
pinch.addEventListener('changed', (e) => {
  const { scale } = /** @type {UIPinchGestureRecognizerEvent} */ (e);
  card.transform = CGAffineTransform.scale(baseScale * scale);
});
pinch.addEventListener('ended', (e) => {
  const { scale } = /** @type {UIPinchGestureRecognizerEvent} */ (e);
  baseScale = baseScale * scale;
});
card.addGestureRecognizer(pinch);
```

**Effect**: spreading two fingers on `card` makes it larger; pinching makes it smaller. It keeps its size after the fingers lift, and the next pinch continues from the current size. **Not verified in the simulator.**

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `pinch.scale` | `scale` on the event object, or `pinch.scale` |
| `pinch.velocity` | `velocity` on the event object, or `pinch.velocity` |

## See also

- [Responding to gestures](../guides/gestures.md#pinching-to-zoom)
- [`CGAffineTransform`](cg-affine-transform.md): the `CGAffineTransform` that applies the multiple to a view
- [`UIGestureRecognizer`](ui-gesture-recognizer.md): the parent class, with the events and shared properties
