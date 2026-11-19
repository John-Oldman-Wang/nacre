---
type: reference
native: UIControlEventPrimaryActionTriggered
---

# `UIControl`: `click` event

The **`click`** event fires when the user completes the control's primary action. For a button, that is a tap.

## Syntax

```
addEventListener('click', (event) => { })
```

## Event object

A plain `Event` with no fields other than `type` and `target`. It has no touch location: reading `location` gives `undefined`. `click` does not necessarily come from a touch; code calling `sendActionsForControlEvents()` also fires it. When you need the touch location, listen for [`touchupinside`](touchupinside-event.md).

It cannot be canceled: `cancelable` is `false`, and `preventDefault()` has no effect.

## When it fires

- [`UIButton`](../ui-button.md) fires it when tapped (measured). Pressing, sliding outside, and then lifting is not a tap and does not fire it. **Not verified in the simulator.**
- A [`UIControl`](../ui-control.md) created directly does not fire it (measured). Listening for `click` on one never runs the callback and does not throw. Use [`touchupinside`](touchupinside-event.md) for it.
- Calling `sendActionsForControlEvents(['touchupinside'])` on a button also fires the button's `click` (measured).
- When a button is tapped, both `click` and `touchupinside` fire; **their order is not verified in the simulator**. Listen for only one of them.
- Tapping twice is two taps and fires twice. **Not verified in the simulator.**

## Examples

```js
const button = UIButton.buttonWithType('system');
button.setTitle('Submit', { forState: ['normal'] });
button.addEventListener('click', () => {
  console.log('Submit');
});
```

**Effect**: Each time the user taps the button, the console prints `Submit` once.

## Corresponding iOS API

`UIControlEventPrimaryActionTriggered`. Natively it is registered with `addTarget:action:forControlEvents:`; here, use [`addEventListener()`](addeventlistener.md).

## See also

- [Building a button](../../guides/buttons.md)
- [`touchupinside`](touchupinside-event.md): use it when you need the touch location
- [When callbacks run](../ui-control.md#when-callbacks-run)
