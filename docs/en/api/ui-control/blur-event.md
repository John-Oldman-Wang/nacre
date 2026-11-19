---
type: reference
native: UIControlEventEditingDidEnd
---

# `UIControl`: `blur` event

The **`blur`** event fires when a text field ends editing: the text field loses focus.

## Syntax

```
addEventListener('blur', (event) => { })
```

## Event object

A plain `Event` with no fields other than `type` and `target`. It has no touch location: reading `location` gives `undefined`. It is a text input event and has nothing to do with touch points.

It cannot be canceled: `cancelable` is `false`, and `preventDefault()` has no effect.

## When it fires

- Fired by [`UITextField`](../ui-text-field.md).
- Fires when the user taps another text field or when code makes the text field end editing. **The various ways of ending editing are not individually verified in the simulator.**
- When editing begins, [`focus`](focus-event.md) fires instead.

## Examples

```js
const field = new UITextField();
field.addEventListener('blur', () => {
  console.log('Done typing:', field.text);
});
```

**Effect**: When the text field loses focus, the console prints its text.

## Corresponding iOS API

`UIControlEventEditingDidEnd`. Natively it is registered with `addTarget:action:forControlEvents:`; here, use [`addEventListener()`](addeventlistener.md).

## See also

- [`focus`](focus-event.md)
- [`UITextField`](../ui-text-field.md): text field
- [`UITextView`](../ui-text-view.md): multi-line text input
- [`UISearchBar`](../ui-search-bar.md): search bar
