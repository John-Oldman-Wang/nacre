---
type: reference
native: UILongPressGestureRecognizer
status: partial
---

# `UILongPressGestureRecognizer`

**`UILongPressGestureRecognizer`** represents a long-press recognizer: it recognizes the gesture when a finger stays down without moving for a period of time, 0.5 seconds by default.

A long press is a continuous gesture: [`began`](ui-gesture-recognizer/began-event.md) fires once the finger has been held long enough, [`changed`](ui-gesture-recognizer/changed-event.md) fires on every move after that, [`ended`](ui-gesture-recognizer/ended-event.md) fires when the finger lifts, and [`cancelled`](ui-gesture-recognizer/cancelled-event.md) fires when the gesture is interrupted. If the finger moves farther than [`allowableMovement`](ui-long-press-gesture-recognizer/allowablemovement.md) before the time is up, it doesn't count as a long press and no events fire.

**Inheritance**: `EventTarget` → `NSObject` → [`UIGestureRecognizer`](ui-gesture-recognizer.md) → `UILongPressGestureRecognizer`

For how to use it, see the guide [Responding to gestures](../guides/gestures.md).

## Constructor

[`UILongPressGestureRecognizer()`](ui-long-press-gesture-recognizer/constructor.md)

Creates a recognizer for a single finger held down for 0.5 seconds.

## Instance properties

It also inherits the properties of [`UIGestureRecognizer`](ui-gesture-recognizer.md); the commonly used ones are [`isEnabled`](ui-gesture-recognizer/isenabled.md), [`view`](ui-gesture-recognizer/view.md), and [`cancelsTouchesInView`](ui-gesture-recognizer/cancelstouchesinview.md). All of its methods are inherited from it too: [`addEventListener()`](ui-gesture-recognizer/addeventlistener.md), [`removeEventListener()`](ui-gesture-recognizer/removeeventlistener.md), and [`requireGestureRecognizerToFail()`](ui-gesture-recognizer/requiregesturerecognizertofail.md).

| Property | Description |
| --- | --- |
| [`minimumPressDuration`](ui-long-press-gesture-recognizer/minimumpressduration.md) | How long the finger must be held, in seconds |
| [`allowableMovement`](ui-long-press-gesture-recognizer/allowablemovement.md) | How far the finger can move before the gesture is recognized, in pt |
| [`numberOfTapsRequired`](ui-long-press-gesture-recognizer/numberoftapsrequired.md) | How many full taps must come before the press |
| [`numberOfTouchesRequired`](ui-long-press-gesture-recognizer/numberoftouchesrequired.md) | How many fingers must be held down together |

## Events

The events come from [`UIGestureRecognizer`](ui-gesture-recognizer.md#events); listen with `addEventListener()`. This recognizer fires:

| Event | When it fires |
| --- | --- |
| [`began`](ui-gesture-recognizer/began-event.md) | When the finger has been held long enough |
| [`changed`](ui-gesture-recognizer/changed-event.md) | When the finger moves after the gesture is recognized |
| [`ended`](ui-gesture-recognizer/ended-event.md) | When the finger lifts after the gesture is recognized |
| [`cancelled`](ui-gesture-recognizer/cancelled-event.md) | When the gesture is interrupted, for example when the app moves to the background |

## Examples

```js
const card = new UIView();
const press = new UILongPressGestureRecognizer();
press.addEventListener('began', () => {
  console.log('Pressed');
});
press.addEventListener('ended', () => {
  console.log('Released');
});
card.addGestureRecognizer(press);
```

**Effect**: Hold `card` for 0.5 seconds and the console prints `Pressed`; when the finger lifts, it prints `Released`.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[UILongPressGestureRecognizer alloc] initWithTarget:self action:@selector(onPress:)]` | `new UILongPressGestureRecognizer()`, then `addEventListener('began', onPress)` |
| `press.minimumPressDuration = 1.0` | `press.minimumPressDuration = 1` |
| `press.allowableMovement = 20` | `press.allowableMovement = 20` |

## See also

- [Responding to gestures](../guides/gestures.md): changing how long a long press takes, and following the finger after a long press
- [`UIGestureRecognizer`](ui-gesture-recognizer.md): superclass, with the events and shared properties
