---
type: reference
native: UIControlEventEditingDidEndOnExit
---

# `UIControl`: `return` event

The **`return`** event fires after the user presses the Return key on the keyboard.

## Syntax

```
addEventListener('return', (event) => { })
```

## Event object

A plain `Event` with no fields other than `type` and `target`. It has no touch location: reading `location` gives `undefined`. It is a text input event and has nothing to do with touch points.

It cannot be canceled: `cancelable` is `false`, and `preventDefault()` has no effect.

## When it fires

- Fired by [`UITextField`](../ui-text-field.md).
- It fires after the Return key has taken effect and cannot be canceled. To intercept it beforehand, use the text field's cancelable [`beforereturn`](../ui-text-field/beforereturn-event.md).
- For whether the text field ends editing after Return, see [`UITextField`](../ui-text-field.md).

## Examples

```js
const field = new UITextField();
field.addEventListener('return', () => {
  console.log('Submit:', field.text);
});
```

**Effect**: When the user presses Return in the text field, the console prints the text field's text.

## Corresponding iOS API

`UIControlEventEditingDidEndOnExit`. Natively it is registered with `addTarget:action:forControlEvents:`; here, use [`addEventListener()`](addeventlistener.md).

## See also

- [`UITextField`](../ui-text-field.md): text field
- [`UITextView`](../ui-text-view.md): multi-line text input
- [`UISearchBar`](../ui-search-bar.md): search bar
