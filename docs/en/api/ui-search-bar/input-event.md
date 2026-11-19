---
type: reference
native: "UISearchBarDelegate searchBar:textDidChange:"
---

# `UISearchBar`: `input` event

The **`input`** event fires each time the user changes the text: typing, deleting, or tapping the clear button.

## Syntax

```
search.addEventListener('input', (event) => { })
```

## Event object

`Event`. It has only `type` (`'input'`) and `target` (the search bar), and carries no other data. Not cancelable.

## When it fires

- Fires once for every change the user makes to the text.
- Read the text from [`text`](text.md); you get the value at the time the callback runs.
- Writing `text` in code doesn't fire it, so changing `text` in the callback doesn't cause a loop.
- Suited to filtering as the user types: it fires on every character, which fits filtering data you already have. For network requests, use [`search`](search-event.md).
- Verified by making the inner text field send an input action from code, not through a real keyboard.
- The event fires a little after the action, not at the moment it happens.

## Examples

```js
const search = new UISearchBar();
search.addEventListener('input', (ev) => {
  console.log(ev.type, ev.target === search, search.text);
});
```

**Effect**: When the user types `a`, it prints `input true a`.

## Corresponding iOS API

`searchBar:textDidChange:` on `UISearchBarDelegate`. JS has no delegate object; listen for the event on the search bar.

## See also

- [`search`](search-event.md)
- [Events](../ui-search-bar.md#events): the rules shared by the eight events
