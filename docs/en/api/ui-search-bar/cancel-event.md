---
type: reference
native: "UISearchBarDelegate searchBarCancelButtonClicked:"
---

# `UISearchBar`: `cancel` event

The **`cancel`** event fires when the user taps the cancel button.

## Syntax

```
search.addEventListener('cancel', (event) => { })
```

## Event object

`Event`. It has only `type` (`'cancel'`) and `target` (the search bar), and carries no other data. Not cancelable.

## When it fires

- The cancel button exists only when [`showsCancelButton`](showscancelbutton.md) is `true`.
- The cancel button only fires the event; it doesn't change `text`. To clear the text, write `text = ''` yourself in the callback. `input` doesn't fire in that case (the text was changed by code), so restore any filtered results yourself.
- Whether the system hides the keyboard on its own is **not verified in the simulator**. Call `resignFirstResponder()` once in the callback.
- It needs a real tap to fire and is **not verified in the simulator**.
- The event fires a little after the action, not at the moment it happens.

## Examples

```js
const search = new UISearchBar();
search.showsCancelButton = true;
search.addEventListener('cancel', () => {
  search.text = '';
  search.resignFirstResponder();
});
```

**Effect**: Tapping the cancel button clears the text and hides the keyboard. **Not verified in the simulator.**

## Corresponding iOS API

`searchBarCancelButtonClicked:` on `UISearchBarDelegate`. JS has no delegate object; listen for the event on the search bar.

## See also

- [`showsCancelButton`](showscancelbutton.md)
- [Events](../ui-search-bar.md#events): the rules shared by the eight events
