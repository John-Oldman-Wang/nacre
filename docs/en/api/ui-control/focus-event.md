---
type: reference
native: UIControlEventEditingDidBegin
---

# `UIControl`: `focus` event

The **`focus`** event fires when a text field begins editing: the text field gains focus and the keyboard appears.

## Syntax

```
addEventListener('focus', (event) => { })
```

## Event object

A plain `Event` with no fields other than `type` and `target`. It has no touch location: reading `location` gives `undefined`. It is a text input event and has nothing to do with touch points.

It cannot be canceled: `cancelable` is `false`, and `preventDefault()` has no effect.

## When it fires

- Fired by [`UITextField`](../ui-text-field.md).
- When the user taps a text field, `focus` fires as the finger presses down, without waiting for release (measured).
- It also fires when code makes the text field begin editing; see [`UITextField`](../ui-text-field.md). **Not verified in the simulator.**
- When editing ends, [`blur`](blur-event.md) fires.

## Examples

```js
const field = new UITextField();
field.addEventListener('focus', () => {
  console.log('Started typing');
});
field.addEventListener('blur', () => {
  console.log('Stopped typing');
});
```

**Effect**: When the user taps into the text field, it prints `Started typing`; when the user leaves the text field, it prints `Stopped typing`.

## Corresponding iOS API

`UIControlEventEditingDidBegin`. Natively it is registered with `addTarget:action:forControlEvents:`; here, use [`addEventListener()`](addeventlistener.md).

## See also

- [`blur`](blur-event.md)
- [`UITextField`](../ui-text-field.md): text field
- [`UITextView`](../ui-text-view.md): multi-line text input
- [`UISearchBar`](../ui-search-bar.md): search bar
