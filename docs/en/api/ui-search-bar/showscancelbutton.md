---
type: reference
native: UISearchBar.showsCancelButton
---

# `UISearchBar`: `showsCancelButton` property

The **`showsCancelButton`** property indicates whether a cancel button is shown to the right of the search bar.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | A cancel button is shown to the right of the search bar |
| `false` | Not shown |

- Readable and writable.
- The default is `false`.
- Writing it directly shows or hides the button immediately. For an animation, use [`setShowsCancelButton()`](setshowscancelbutton.md).
- When the user taps the cancel button, the search bar fires [`cancel`](cancel-event.md). The cancel button only fires the event; it doesn't change `text` and doesn't hide the keyboard.
- Values of other types are converted to a boolean by truthiness.
- There is no change event: only the app's own code changes it.

## Examples

```js
const search = new UISearchBar();
search.showsCancelButton = true;
```

**Effect**: A cancel button appears to the right of the search bar. **Not verified in the simulator.**

## Corresponding iOS API

`UISearchBar.showsCancelButton`.

## See also

- [`setShowsCancelButton()`](setshowscancelbutton.md)
- [`cancel`](cancel-event.md) event
