---
type: reference
native: UISwipeGestureRecognizer
status: partial
---

# `UISwipeGestureRecognizer`

**`UISwipeGestureRecognizer`** represents a swipe recognizer: it recognizes the gesture when a finger moves quickly across the screen in a given direction. By default it recognizes a one-finger swipe to the right. Moving slowly doesn't count as a swipe.

A swipe is a discrete gesture: once recognized, it's over, and [`ended`](ui-gesture-recognizer/ended-event.md) fires exactly once. The event doesn't say which direction was recognized; to tell directions apart, create one recognizer per direction.

**Swiping hasn't been checked with real touches yet.** The gesture itself is **not verified in the simulator**.

**Inheritance**: `EventTarget` → `NSObject` → [`UIGestureRecognizer`](ui-gesture-recognizer.md) → `UISwipeGestureRecognizer`

For how to use it, see the guide [Responding to gestures](../guides/gestures.md).

## Constructor

[`UISwipeGestureRecognizer()`](ui-swipe-gesture-recognizer/constructor.md)

Creates a recognizer for one-finger swipes to the right.

## Instance properties

It also inherits the properties of [`UIGestureRecognizer`](ui-gesture-recognizer.md); the commonly used ones are [`isEnabled`](ui-gesture-recognizer/isenabled.md), [`view`](ui-gesture-recognizer/view.md), and [`cancelsTouchesInView`](ui-gesture-recognizer/cancelstouchesinview.md). All of its methods are inherited from it too: [`addEventListener()`](ui-gesture-recognizer/addeventlistener.md), [`removeEventListener()`](ui-gesture-recognizer/removeeventlistener.md), and [`requireGestureRecognizerToFail()`](ui-gesture-recognizer/requiregesturerecognizertofail.md).

| Property | Description |
| --- | --- |
| [`numberOfTouchesRequired`](ui-swipe-gesture-recognizer/numberoftouchesrequired.md) | How many fingers must swipe together |
| [`direction`](ui-swipe-gesture-recognizer/direction.md) | Which directions of swipe to recognize |

## Events

The events come from [`UIGestureRecognizer`](ui-gesture-recognizer.md#events); listen with `addEventListener()`. This recognizer fires:

| Event | When it fires |
| --- | --- |
| [`ended`](ui-gesture-recognizer/ended-event.md) | When the swipe is recognized. A swipe fires only this one event |

## Examples

```js
const card = new UIView();
const swipeLeft = new UISwipeGestureRecognizer();
swipeLeft.direction = ['left'];
swipeLeft.addEventListener('ended', () => {
  console.log('Swiped left');
});
card.addGestureRecognizer(swipeLeft);
```

**Effect**: When a finger moves quickly to the left across `card`, it prints `Swiped left`. **Not verified in the simulator.**

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `swipe.direction = UISwipeGestureRecognizerDirectionLeft` | `swipe.direction = ['left']` |
| `swipe.direction = UISwipeGestureRecognizerDirectionLeft \| UISwipeGestureRecognizerDirectionRight` | `swipe.direction = ['left', 'right']` |
| `swipe.numberOfTouchesRequired = 2` | `swipe.numberOfTouchesRequired = 2` |

## See also

- [Responding to gestures](../guides/gestures.md#responding-to-swipes)
- [`UIGestureRecognizer`](ui-gesture-recognizer.md): superclass, with the events and shared properties
