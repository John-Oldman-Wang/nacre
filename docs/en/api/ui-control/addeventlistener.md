---
type: reference
native: "-[UIControl addTarget:action:forControlEvents:]"
---

# `UIControl`: `addEventListener()` method

The **`addEventListener()`** method registers a callback for an event on the control. When the control fires that event, the callback runs.

## Syntax

```
addEventListener(type, callback)
addEventListener(type, callback, { once })
```

### Parameters

**`type`**

The event name, a string, case-sensitive. The events the system fires are the 16 [control events](../ui-control.md#events) and [`traitchange`](../ui-trait-collection.md), which every view has.

Other names do not throw; they are treated as custom events and fire only when you dispatch them yourself with `dispatchEvent()`. So a misspelled event name gives no warning at all; the listener is simply never called. Listening for an event the control does not fire, such as `change` on a text field, does not throw either; the callback never runs.

**`callback`**

The callback function. Its argument is the event object; see [Event object](#event-object). Passing `null` does nothing.

**`options.once`**

Optional, a boolean. `true` means the callback is removed automatically after it runs once; the removal happens before the callback runs. Defaults to `false`.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- The event name starts with `@`: `addEventListener has no value "@x"; names starting with @ are reserved for the runtime`
- `callback` is neither a function nor `null`: `Failed to execute 'addEventListener': parameter 2 is not of type 'Function'.`

## Description

- Registering the same function for the same event name more than once counts as one registration.
- Each call listens for one event name. To listen for several, call it once for each.
- Callbacks are queued to run after the current round of code; see [When callbacks run](../ui-control.md#when-callbacks-run).
- An exception thrown in a callback does not affect other callbacks for the same event. The exception fires `error` on [`application`](../application.md#unhandled-exceptions-dont-terminate-the-app); if no listener cancels it, the console prints a log starting with `Uncaught`.

### Event object

| Member | Type | Description |
| --- | --- | --- |
| `type` | string | The event name |
| `target` | control | The control that fired the event. `currentTarget` is the same |
| `location` | [`CGPoint`](../structs.md) or `null` | Present only on the nine events starting with `touch`; see [Touch location](../ui-control.md#touch-location) |
| `tapCount` | number | Present only on the nine events starting with `touch`; see [Touch location](../ui-control.md#touch-location) |
| `cancelable` | boolean | Always `false` |
| `defaultPrevented` | boolean | Always `false` |
| `preventDefault()` | method | Can be called; has no effect |
| `stopPropagation()` | method | Can be called; has no effect. The event is only ever fired on this control |
| `stopImmediatePropagation()` | method | Callbacks later in line for the same event do not run |

## Examples

### Listening for a tap

```js
const card = new UIControl();
card.addEventListener('touchupinside', (e) => {
  console.log(e.type);
  console.log(e.target === card);
});
```

**Effect**: When a finger is lifted on `card`, it prints `touchupinside` and then `true`.

### Responding only once

```js
const card = new UIControl();
card.addEventListener('touchupinside', () => {
  console.log('Printed only once');
}, { once: true });
```

**Effect**: The first tap prints `Printed only once`. Later taps print nothing.

## Corresponding iOS API

`-[UIControl addTarget:action:forControlEvents:]`. Natively you register an object and one of its methods with the control, and the control calls that method when the event happens; here you pass a function directly. Natively one call can register a bitmask of several events; here it is one event name per call.

## See also

- [`removeEventListener()`](removeeventlistener.md)
- [`sendActionsForControlEvents()`](sendactionsforcontrolevents.md): make the control fire events from code
