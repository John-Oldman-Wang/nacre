---
type: reference
native: UIScreenEdgePanGestureRecognizer
status: partial
---

# `UIScreenEdgePanGestureRecognizer`

**`UIScreenEdgePanGestureRecognizer`** represents a screen-edge pan gesture recognizer: it only recognizes drags that start at the edge of the screen and move inward. Otherwise it is the same as [`UIPanGestureRecognizer`](ui-pan-gesture-recognizer.md), and its event object also carries `translation` and `velocity`.

[`edges`](ui-screen-edge-pan-gesture-recognizer/edges.md) defaults to an empty array; until it is set, no gesture is recognized. Add the recognizer to a view that contains the screen edge, usually a view controller's full-screen view.

Three defaults differ from the parent class:

| Property | `UIPanGestureRecognizer` | `UIScreenEdgePanGestureRecognizer` |
| --- | --- | --- |
| [`maximumNumberOfTouches`](ui-pan-gesture-recognizer/maximumnumberoftouches.md) | `4294967295` | `1` |
| [`delaysTouchesBegan`](ui-gesture-recognizer/delaystouchesbegan.md) | `false` | `true` |
| [`edges`](ui-screen-edge-pan-gesture-recognizer/edges.md) | No such property | `[]` |

**Screen-edge dragging has not been checked with real touches**, and the gesture itself is **not verified in the simulator**.

**Inheritance**: `EventTarget` → `NSObject` → [`UIGestureRecognizer`](ui-gesture-recognizer.md) → [`UIPanGestureRecognizer`](ui-pan-gesture-recognizer.md) → `UIScreenEdgePanGestureRecognizer`

For how to use it, see the guide [Responding to gestures](../guides/gestures.md).

## Constructor

[`UIScreenEdgePanGestureRecognizer()`](ui-screen-edge-pan-gesture-recognizer/constructor.md)

Creates a screen-edge pan gesture recognizer. Set `edges` before it can recognize a gesture.

## Instance properties

Also inherits the properties and methods of [`UIPanGestureRecognizer`](ui-pan-gesture-recognizer.md) and [`UIGestureRecognizer`](ui-gesture-recognizer.md), including `translationInView()`, `velocityInView()`, and `setTranslation()`.

| Property | Description |
| --- | --- |
| [`edges`](ui-screen-edge-pan-gesture-recognizer/edges.md) | Which screen edges a recognized drag can start from |

## Events

The events come from [`UIGestureRecognizer`](ui-gesture-recognizer.md#events); listen with `addEventListener()`. It fires:

| Event | When it fires |
| --- | --- |
| [`began`](ui-gesture-recognizer/began-event.md) | When a drag from the edge is recognized |
| [`changed`](ui-gesture-recognizer/changed-event.md) | Each time the finger moves after that |
| [`ended`](ui-gesture-recognizer/ended-event.md) | When the finger lifts |
| [`cancelled`](ui-gesture-recognizer/cancelled-event.md) | When interrupted |

## Examples

```js
const page = new UIView();
const fromRight = new UIScreenEdgePanGestureRecognizer();
fromRight.edges = ['right'];
fromRight.addEventListener('began', () => {
  console.log('Dragged in from the right edge');
});
page.addGestureRecognizer(fromRight);
```

**Effect**: when `page` fills the screen, dragging a finger left from the right edge of the screen logs `Dragged in from the right edge`. A drag that starts in the middle of the screen logs nothing. **Not verified in the simulator.**

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `edgePan.edges = UIRectEdgeRight` | `edgePan.edges = ['right']` |
| `edgePan.edges = UIRectEdgeAll` | `edgePan.edges = ['top', 'left', 'bottom', 'right']` |

## See also

- [Responding to gestures](../guides/gestures.md#dragging-in-from-the-screen-edge)
- [`UIPanGestureRecognizer`](ui-pan-gesture-recognizer.md): the parent class
- [`UINavigationController`](ui-navigation-controller.md): it uses drags from the left edge of the screen to go back to the previous view controller
