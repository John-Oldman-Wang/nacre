---
type: reference
native: UIPanGestureRecognizer
status: partial
---

# `UIPanGestureRecognizer`

**`UIPanGestureRecognizer`** represents a pan (drag) recognizer: it recognizes the gesture when a finger touches down and moves. Use it to make a view follow the finger, or to run a momentum animation based on the velocity when the finger lifts.

Pan is a continuous gesture: [`began`](ui-gesture-recognizer/began-event.md) fires once the finger has moved a short distance, [`changed`](ui-gesture-recognizer/changed-event.md) fires on every move after that, and [`ended`](ui-gesture-recognizer/ended-event.md) fires when all fingers lift. The event object carries the translation accumulated since the gesture began, `translation`, and the velocity, `velocity`.

**Panning hasn't been checked with real touches yet.** Both the gesture itself and the data on its events are **not verified in the simulator**.

[`UIScrollView`](ui-scroll-view.md) scrolls using a pan recognizer of its own: its `gestureRecognizers` contains a `UIPanGestureRecognizer` (checked in the acceptance tests). The subclass [`UIScreenEdgePanGestureRecognizer`](ui-screen-edge-pan-gesture-recognizer.md) recognizes only pans that start at the edge of the screen.

**Inheritance**: `EventTarget` → `NSObject` → [`UIGestureRecognizer`](ui-gesture-recognizer.md) → `UIPanGestureRecognizer`

For how to use it, see the guide [Responding to gestures](../guides/gestures.md).

## Constructor

[`UIPanGestureRecognizer()`](ui-pan-gesture-recognizer/constructor.md)

Creates a recognizer for pans with one or more fingers.

## Instance properties

It also inherits the properties of [`UIGestureRecognizer`](ui-gesture-recognizer.md); the commonly used ones are [`isEnabled`](ui-gesture-recognizer/isenabled.md), [`view`](ui-gesture-recognizer/view.md), and [`cancelsTouchesInView`](ui-gesture-recognizer/cancelstouchesinview.md).

| Property | Description |
| --- | --- |
| [`minimumNumberOfTouches`](ui-pan-gesture-recognizer/minimumnumberoftouches.md) | The minimum number of fingers that must be down for a pan |
| [`maximumNumberOfTouches`](ui-pan-gesture-recognizer/maximumnumberoftouches.md) | The maximum number of fingers that can be down |
| [`allowedScrollTypesMask`](ui-pan-gesture-recognizer/allowedscrolltypesmask.md) | Which kinds of scroll input (mouse wheel, trackpad) also count as a pan |

## Instance methods

It also inherits the methods of [`UIGestureRecognizer`](ui-gesture-recognizer.md).

| Method | Description |
| --- | --- |
| [`translationInView()`](ui-pan-gesture-recognizer/translationinview.md) | How far the finger has moved since the gesture began, converted to the coordinate system of a given view |
| [`setTranslation()`](ui-pan-gesture-recognizer/settranslation.md) | Sets the accumulated translation to a given value |
| [`velocityInView()`](ui-pan-gesture-recognizer/velocityinview.md) | The finger's current velocity, converted to the coordinate system of a given view |

When you call these three methods in an event callback, they read and change the values as of the moment the callback runs. The translation and velocity at the moment the event occurred are on the event object.

## Events

The events come from [`UIGestureRecognizer`](ui-gesture-recognizer.md#events); listen with `addEventListener()`. This recognizer fires:

| Event | When it fires |
| --- | --- |
| [`began`](ui-gesture-recognizer/began-event.md) | When the finger has moved a short distance and the pan is recognized |
| [`changed`](ui-gesture-recognizer/changed-event.md) | Every time the finger moves after that |
| [`ended`](ui-gesture-recognizer/ended-event.md) | When all fingers lift. `velocity` is the velocity at the moment of release |
| [`cancelled`](ui-gesture-recognizer/cancelled-event.md) | When the gesture is interrupted |

## Examples

```js
const card = new UIView();
const drag = new UIPanGestureRecognizer();
let start = card.center;
drag.addEventListener('began', () => {
  start = card.center;
});
drag.addEventListener('changed', (e) => {
  const { translation } = /** @type {UIPanGestureRecognizerEvent} */ (e);
  card.center = new CGPoint(start.x + translation.x, start.y + translation.y);
});
card.addGestureRecognizer(drag);
```

**Effect**: When you press on `card` and move your finger, `card` follows the finger. When you lift your finger, it stays where you released it. **Not verified in the simulator.**

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[pan translationInView:view]` | The event object's `translation`, or `pan.translationInView(view)` |
| `[pan velocityInView:view]` | The event object's `velocity`, or `pan.velocityInView(view)` |
| `[pan setTranslation:CGPointZero inView:view]` | `pan.setTranslation(new CGPoint(0, 0), { inView: view })` |
| `pan.maximumNumberOfTouches = 2` | `pan.maximumNumberOfTouches = 2` |
| `pan.allowedScrollTypesMask = UIScrollTypeMaskAll` | `pan.allowedScrollTypesMask = ['discrete', 'continuous']` |

## See also

- [Responding to gestures](../guides/gestures.md): dragging a view and reading the velocity on release
- [`UIScreenEdgePanGestureRecognizer`](ui-screen-edge-pan-gesture-recognizer.md): subclass
- [`UIGestureRecognizer`](ui-gesture-recognizer.md): superclass, with the events and shared properties
