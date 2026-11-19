---
type: reference
native: "UISearchBarDelegate searchBarTextDidEndEditing:"
---

# `UISearchBar`: `blur` event

The **`blur`** event fires when editing ends: the search bar gives up focus and the keyboard goes away.

## Syntax

```
search.addEventListener('blur', (event) => { })
```

## Event object

`Event`. It has only `type` (`'blur'`) and `target` (the search bar), and carries no other data. Not cancelable.

## When it fires

- Fires when `resignFirstResponder()` is called.
- Reading [`text`](text.md) in the callback gives the text the user finished typing.
- Verified by making the inner text field lose focus from code, not through a real keyboard.
- The event fires a little after the action, not at the moment it happens.

## Examples

```js
const search = new UISearchBar();
search.addEventListener('blur', () => {
  console.log('done typing', search.text);
});
```

**Effect**: When the keyboard goes away, the console prints `done typing` and the text at that moment.

## Corresponding iOS API

`searchBarTextDidEndEditing:` on `UISearchBarDelegate`. JS has no delegate object; listen for the event on the search bar.

## See also

- [`focus`](focus-event.md)
- [Events](../ui-search-bar.md#events): the rules shared by the eight events
