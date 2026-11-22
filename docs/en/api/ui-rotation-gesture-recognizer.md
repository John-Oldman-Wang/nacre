---
type: reference
native: UIRotationGestureRecognizer
status: partial
---

# `UIRotationGestureRecognizer`

**`UIRotationGestureRecognizer`** represents a rotation recognizer: it recognizes the gesture when two fingers turn around each other. Use it for two-finger rotation.

Rotation is a continuous gesture and fires [`began`](ui-gesture-recognizer/began-event.md), [`changed`](ui-gesture-recognizer/changed-event.md), [`ended`](ui-gesture-recognizer/ended-event.md), and [`cancelled`](ui-gesture-recognizer/cancelled-event.md). The event object carries the angle turned since the start of the gesture, `rotation` (radians), and the rotation velocity `velocity`. Each gesture's `rotation` starts from 0.

**Rotation has not yet been checked with real touches**; the gesture itself and the data carried by its events are **not verified in the simulator**.

**Inheritance**: `EventTarget` → `NSObject` → [`UIGestureRecognizer`](ui-gesture-recognizer.md) → `UIRotationGestureRecognizer`

For how to use it, see the guide [Responding to gestures](../guides/gestures.md).

## Constructor

[`UIRotationGestureRecognizer()`](ui-rotation-gesture-recognizer/constructor.md)

Creates a recognizer that recognizes two-finger rotation.

## Instance properties

Also inherits properties from [`UIGestureRecognizer`](ui-gesture-recognizer.md); commonly used ones are [`isEnabled`](ui-gesture-recognizer/isenabled.md), [`view`](ui-gesture-recognizer/view.md), and [`cancelsTouchesInView`](ui-gesture-recognizer/cancelstouchesinview.md). Its methods are all inherited from it too: [`addEventListener()`](ui-gesture-recognizer/addeventlistener.md), [`removeEventListener()`](ui-gesture-recognizer/removeeventlistener.md), [`requireGestureRecognizerToFail()`](ui-gesture-recognizer/requiregesturerecognizertofail.md).

| Property | Description |
| --- | --- |
| [`rotation`](ui-rotation-gesture-recognizer/rotation.md) | The angle turned since the start of the gesture, in radians |
| [`velocity`](ui-rotation-gesture-recognizer/velocity.md) <small>read-only</small> | The rotation velocity, in radians per second |

## Events

Events come from [`UIGestureRecognizer`](ui-gesture-recognizer.md#events); listen with `addEventListener()`. It fires:

| Event | When it fires |
| --- | --- |
| [`began`](ui-gesture-recognizer/began-event.md) | When the rotation is recognized |
| [`changed`](ui-gesture-recognizer/changed-event.md) | Each time the angle changes after that |
| [`ended`](ui-gesture-recognizer/ended-event.md) | When the fingers lift |
| [`cancelled`](ui-gesture-recognizer/cancelled-event.md) | When interrupted |

## Examples

```js
const card = new UIView();
const twist = new UIRotationGestureRecognizer();
let baseAngle = 0;
twist.addEventListener('changed', (e) => {
  const { rotation } = e;
  card.transform = CGAffineTransform.rotation(baseAngle + rotation);
});
twist.addEventListener('ended', (e) => {
  const { rotation } = e;
  baseAngle = baseAngle + rotation;
});
card.addGestureRecognizer(twist);
```

**Effect**: When two fingers turn on `card`, `card` rotates along with them and keeps its angle after release. **Not verified in the simulator.**

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `rotation.rotation` | The event object's `rotation`, or `twist.rotation` |
| `rotation.velocity` | The event object's `velocity`, or `twist.velocity` |

## See also

- [Responding to gestures](../guides/gestures.md#rotating-with-two-fingers)
- [`CGAffineTransform`](cg-affine-transform.md)
- [`UIGestureRecognizer`](ui-gesture-recognizer.md): the parent class, with the events and shared properties
