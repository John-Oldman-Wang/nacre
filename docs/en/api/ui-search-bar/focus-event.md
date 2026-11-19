---
type: reference
native: "UISearchBarDelegate searchBarTextDidBeginEditing:"
---

# `UISearchBar`: `focus` event

The **`focus`** event fires when editing begins: the search bar gains focus and the keyboard appears.

## Syntax

```
search.addEventListener('focus', (event) => { })
```

## Event object

`Event`. It has only `type` (`'focus'`) and `target` (the search bar), and carries no other data. Not cancelable.

## When it fires

- Fires when the user taps the search bar.
- Also fires when code calls `becomeFirstResponder()` and it succeeds. **Not verified in the simulator.**
- Verified by focusing the inner text field from code, not through a real touch.
- The event fires a little after the action, not at the moment it happens.

## Examples

```js
const search = new UISearchBar();
search.addEventListener('focus', () => {
  search.setShowsCancelButton(true, { animated: true });
});
```

**Effect**: Tapping the search bar slides a cancel button in on the right. **Not verified in the simulator.**

## Corresponding iOS API

`searchBarTextDidBeginEditing:` on `UISearchBarDelegate`. JS has no delegate object; listen for the event on the search bar.

## See also

- [`blur`](blur-event.md)
- [Events](../ui-search-bar.md#events): the rules shared by the eight events
