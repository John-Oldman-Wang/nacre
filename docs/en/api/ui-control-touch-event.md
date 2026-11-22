---
type: reference
native: UIControlTouchEvent
---

# `UIControlTouchEvent`

**`UIControlTouchEvent`** represents a touch event on a control: a finger going down, moving, lifting, or being interrupted.

The nine events whose names start with `touch` on [`UIControl`](ui-control.md) and its subclasses (buttons, switches, sliders, and so on) are this class. It carries the finger position and the tap count.

**Inheritance**: [`Event`](event.md) → `UIControlTouchEvent`

## Constructor

[`UIControlTouchEvent()`](ui-control-touch-event/constructor.md)

Creates a `UIControlTouchEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`location`](ui-control-touch-event/location.md) <small>read-only</small> | The finger position, in the control's own coordinate system |
| [`tapCount`](ui-control-touch-event/tapcount.md) <small>read-only</small> | The tap count |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`UIControl`](ui-control.md) and its subclasses | [`touchdown`](ui-control/touchdown-event.md), [`touchdownrepeat`](ui-control/touchdownrepeat-event.md), [`touchdraginside`](ui-control/touchdraginside-event.md), [`touchdragoutside`](ui-control/touchdragoutside-event.md), [`touchdragenter`](ui-control/touchdragenter-event.md), [`touchdragexit`](ui-control/touchdragexit-event.md), [`touchupinside`](ui-control/touchupinside-event.md), [`touchupoutside`](ui-control/touchupoutside-event.md), [`touchcancel`](ui-control/touchcancel-event.md) |

It can't be canceled: `cancelable` is `false`, and `preventDefault()` has no effect.

## Examples

```js
const card = new UIControl();
card.addEventListener('touchupinside', (e) => {
  console.log(e instanceof UIControlTouchEvent, e.location?.x, e.tapCount);
});
card.sendActionsForControlEvents(['touchupinside']);
```

**Effect**: prints `true undefined 0`: an event fired from code has no real touch, so `location` is `null`. When a finger lifts on `card`, it prints `true`, the finger's x, and the tap count.

## Corresponding iOS API

A native action method receives a `UIEvent` and reads the position and tap count from its `UITouch`. Here both are directly on the event object.

| ObjC | JS |
| --- | --- |
| `[touch locationInView:control]` | `event.location` |
| `touch.tapCount` | `event.tapCount` |

## See also

- [`UIControl`](ui-control.md): the object that fires these events
- [Handling touches on controls](../guides/control-touches.md): the order of the nine events
