---
type: reference
native: UISearchBar.inputAccessoryView
---

# `UISearchBar`: `inputAccessoryView` property

The **`inputAccessoryView`** property is the view attached above the keyboard when it appears. A common choice is a [`UIToolbar`](../ui-toolbar.md) with a Done button.

## Value

A [`UIView`](../ui-view.md), or `null`.

- Readable and writable.
- The default is `null`.
- Reading it returns the same object that was written.
- There is no change event: only the app's own code changes it.

### Invalid values

- Writing a native object that isn't a view throws `TypeError: inputAccessoryView needs a UIView or null`.
- Writing a plain value such as a number or string throws `TypeError: inputAccessoryView needs a native object or null, got 5`.

In both cases the value stays unchanged.

## Examples

```js
const search = new UISearchBar();
const bar = new UIToolbar();
const done = UIBarButtonItem.systemItem('done');
done.addEventListener('click', () => search.resignFirstResponder());
bar.items = [UIBarButtonItem.flexibleSpace(), done];
bar.sizeToFit();
search.inputAccessoryView = bar;
```

**Effect**: When the keyboard appears, a toolbar sits above it with Done at the right end. Tapping it hides the keyboard. **Not verified in the simulator.**

## Corresponding iOS API

`UISearchBar.inputAccessoryView`.

## See also

- [`UIToolbar`](../ui-toolbar.md)
