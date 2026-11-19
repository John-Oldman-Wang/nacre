---
type: reference
native: UIControlEventEditingChanged
---

# `UIControl`: `input` event

The **`input`** event fires after the user changes a text field's text.

## Syntax

```
addEventListener('input', (event) => { })
```

## Event object

A plain `Event` with no fields other than `type` and `target`. It has no touch location: reading `location` gives `undefined`. It is a text input event and has nothing to do with touch points.

It cannot be canceled: `cancelable` is `false`, and `preventDefault()` has no effect.

## When it fires

- Fired by [`UITextField`](../ui-text-field.md). It fires once for each character the user types or deletes. **Not verified in the simulator.**
- Reading `text` in the callback gives the text after the change.
- To intercept a change before the text changes, use the text field's cancelable [`beforeinput`](../ui-text-field/beforeinput-event.md).

## Examples

```js
const field = new UITextField();
field.addEventListener('input', () => {
  console.log('Current text:', field.text);
});
```

**Effect**: Each time the user types or deletes a character, the console prints the current text once. **Not verified in the simulator.**

## Corresponding iOS API

`UIControlEventEditingChanged`. Natively it is registered with `addTarget:action:forControlEvents:`; here, use [`addEventListener()`](addeventlistener.md).

## See also

- [`UITextField`](../ui-text-field.md): text field
- [`UITextView`](../ui-text-view.md): multi-line text input
- [`UISearchBar`](../ui-search-bar.md): search bar
