---
type: reference
native: "UISearchBarDelegate searchBarSearchButtonClicked:"
---

# `UISearchBar`: `search` event

The **`search`** event fires when the user taps the Search key on the keyboard.

## Syntax

```
search.addEventListener('search', (event) => { })
```

## Event object

`Event`. It has only `type` (`'search'`) and `target` (the search bar), and carries no other data. Not cancelable.

## When it fires

- Reading [`text`](text.md) in the callback gives the search term.
- Suited to submitting a search: it fires only once, when the user taps Search, which fits sending a network request.
- Whether the system hides the keyboard on its own is **not verified in the simulator**. Call `resignFirstResponder()` once in the callback.
- Whether pressing return still fires `search` after [`returnKeyType`](returnkeytype.md) is changed to another value is **not verified in the simulator**.
- Verified by making the inner text field send a return action from code, not through a real keyboard.
- The event fires a little after the action, not at the moment it happens.

## Examples

```js
const search = new UISearchBar();
search.addEventListener('search', () => {
  search.resignFirstResponder();
  console.log('search', search.text);
});
```

**Effect**: Type `bei` and tap Search on the keyboard. The keyboard goes away and the console prints `search bei`.

## Corresponding iOS API

`searchBarSearchButtonClicked:` on `UISearchBarDelegate`. JS has no delegate object; listen for the event on the search bar.

## See also

- [`input`](input-event.md)
- [Events](../ui-search-bar.md#events): the rules shared by the eight events
