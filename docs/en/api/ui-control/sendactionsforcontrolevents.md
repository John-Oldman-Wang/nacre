---
type: reference
native: "-[UIControl sendActionsForControlEvents:]"
---

# `UIControl`: `sendActionsForControlEvents()` method

The **`sendActionsForControlEvents()`** method makes the control fire the given control events, through the same path as a real touch. Use it to simulate a user action from code.

## Syntax

```
sendActionsForControlEvents(types)
```

### Parameters

**`types`**

An array of event names; several can be given at once. The valid names are the 16 [control events](../ui-control.md#events). An empty array fires no events.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- `types` is not an array: `sendActionsForControlEvents needs an array of names; expected any of: touchdown / touchdownrepeat / …`
- The array contains an unrecognized name: `sendActionsForControlEvents has no value "tap"; expected one of: touchdown / touchdownrepeat / …`. In this case no event fires.

## Description

- **Callbacks run in the next task.** When the method returns, the callbacks have not run yet (measured).
- **When several events are given at once, the order in which they arrive is not verified in the simulator.**
- **The system's own handling receives them too.** Sending `touchupinside` to a button also makes the button fire [`click`](click-event.md) (measured).
- **The event object carries no touch point.** For events starting with `touch`, `location` is `null` and `tapCount` is 0; see [Touch location](../ui-control.md#touch-location).
- **It does not change the control's state.** It does not change `isHighlighted`, and there is no pressed effect on screen.

### Differences from `dispatchEvent()`

Both methods make listener callbacks run, through different paths. To simulate a user action, use `sendActionsForControlEvents()`.

| | `sendActionsForControlEvents()` | `dispatchEvent()` |
| --- | --- | --- |
| Path | The control fires the event itself, the same as a real touch | Calls the registered callbacks directly |
| Who receives it | Every receiver of that event on this control, including registered callbacks and the system's own handling | Only callbacks registered with `addEventListener()` |
| Event names | Only the 16 control events | Any name |
| When callbacks run | In the next task. When the method returns, the callbacks have not run yet (measured) | Immediately. When the method returns, the callbacks have already finished |
| Argument | An array of event names | An `Event` object |
| Return value | None | A boolean. `false` when a callback called `preventDefault()` and the event is cancelable |

Neither method changes the control's state. When the argument to `dispatchEvent()` is not an `Event` object, it throws `TypeError: Failed to execute 'dispatchEvent': parameter 1 is not of type 'Event'.`

## Examples

### Simulating a tap

```js
const card = new UIControl();
card.addEventListener('touchdown', () => {
  console.log('touchdown');
});
card.addEventListener('touchupinside', () => {
  console.log('touchupinside');
});

card.sendActionsForControlEvents(['touchdown', 'touchupinside']);
console.log('Sent');
```

**Result**: The console prints `Sent` first, then `touchdown` and `touchupinside`. **The order between `touchdown` and `touchupinside` is not verified in the simulator.**

### Comparing with `dispatchEvent()`

```js
const card = new UIControl();
card.addEventListener('touchupinside', () => {
  console.log('Callback');
});

card.dispatchEvent(new Event('touchupinside'));
console.log('After dispatchEvent');

card.sendActionsForControlEvents(['touchupinside']);
console.log('After sendActions');
```

**Result**: Prints `Callback`, `After dispatchEvent`, `After sendActions`, `Callback`, in that order. **This example as a whole is not verified in the simulator.**

## Corresponding iOS API

`-[UIControl sendActionsForControlEvents:]`. The native bitmask `UIControlEventTouchDown | UIControlEventTouchUpInside` is written as the array `['touchdown', 'touchupinside']`.

## See also

- [`addEventListener()`](addeventlistener.md)
- [When callbacks run](../ui-control.md#when-callbacks-run)
