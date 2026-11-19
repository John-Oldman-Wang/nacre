---
type: reference
native: UITapGestureRecognizer
status: partial
---

# `UITapGestureRecognizer`

**`UITapGestureRecognizer`** represents a tap recognizer: it recognizes the gesture when a finger goes down and lifts quickly. How many taps and how many fingers can both be set; the default is a single tap with one finger.

A tap is a discrete gesture: once recognized it is over, and [`ended`](ui-gesture-recognizer/ended-event.md) fires only once.

**Inheritance**: `EventTarget` → `NSObject` → [`UIGestureRecognizer`](ui-gesture-recognizer.md) → `UITapGestureRecognizer`

For how to use it, see the guide [Responding to gestures](../guides/gestures.md).

## Constructor

[`UITapGestureRecognizer()`](ui-tap-gesture-recognizer/constructor.md)

Creates a recognizer for a single tap with one finger.

## Instance properties

Also inherits the properties of [`UIGestureRecognizer`](ui-gesture-recognizer.md); the commonly used ones are [`isEnabled`](ui-gesture-recognizer/isenabled.md), [`view`](ui-gesture-recognizer/view.md), and [`cancelsTouchesInView`](ui-gesture-recognizer/cancelstouchesinview.md). Its methods are all inherited from it too: [`addEventListener()`](ui-gesture-recognizer/addeventlistener.md), [`removeEventListener()`](ui-gesture-recognizer/removeeventlistener.md), and [`requireGestureRecognizerToFail()`](ui-gesture-recognizer/requiregesturerecognizertofail.md).

| Property | Description |
| --- | --- |
| [`numberOfTapsRequired`](ui-tap-gesture-recognizer/numberoftapsrequired.md) | How many taps are needed. `2` is a double tap |
| [`numberOfTouchesRequired`](ui-tap-gesture-recognizer/numberoftouchesrequired.md) | How many fingers must tap together |

## Events

Events come from [`UIGestureRecognizer`](ui-gesture-recognizer.md#events); listen with `addEventListener()`. It fires:

| Event | When it fires |
| --- | --- |
| [`ended`](ui-gesture-recognizer/ended-event.md) | When the tap is recognized. A tap fires only this event |

## Examples

```js
const card = new UIView();
const tap = new UITapGestureRecognizer();
tap.addEventListener('ended', (e) => {
  const { location } = /** @type {UIGestureRecognizerEvent} */ (e);
  if (location !== null) {
    console.log('Tapped at', location.x, location.y);
  }
});
card.addGestureRecognizer(tap);
```

**Effect**: Tapping `card` prints the coordinates of the tap within `card` to the console.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(onTap:)]` | `new UITapGestureRecognizer()`, then `addEventListener('ended', onTap)` |
| `tap.numberOfTapsRequired = 2` | `tap.numberOfTapsRequired = 2` |
| `tap.numberOfTouchesRequired = 2` | `tap.numberOfTouchesRequired = 2` |

## See also

- [Responding to gestures](../guides/gestures.md): getting the tap location, responding to double taps, making a single tap wait for a double tap to fail
- [`UIGestureRecognizer`](ui-gesture-recognizer.md): the superclass, its events and shared properties
