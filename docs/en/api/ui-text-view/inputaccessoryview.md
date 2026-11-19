---
type: reference
native: UITextView.inputAccessoryView
---

# `UITextView`: `inputAccessoryView` property

The **`inputAccessoryView`** property is the view attached above the keyboard when it appears. In a text view, Return inserts a line break, so a Done button for dismissing the keyboard usually goes here.

## Value

A [`UIView`](../ui-view.md), or `null`.

- Readable and writable.
- The default value is `null`.
- Reading returns the same object that was written.
- Writing `null` or `undefined` removes it.
- Writing it while input is in progress takes effect immediately. **Not verified in the simulator.**
- It can be any view, and the same view can be shared by several inputs. The other rules are the same as for [the property of the same name on `UITextField`](../ui-text-field/inputaccessoryview.md).
- There is no change event: only the app's own code changes it.

### Invalid values

- Writing a native object that isn't a view throws `TypeError: inputAccessoryView needs a UIView or null`.
- Writing a plain value such as a number or string throws `TypeError: inputAccessoryView needs a native object or null, got 5`.

In both cases the previous value is kept.

## Examples

```js
const input = new UITextView();
const bar = new UIToolbar();
const done = UIBarButtonItem.systemItem('done');
done.addEventListener('click', () => input.resignFirstResponder());
bar.items = [UIBarButtonItem.flexibleSpace(), done];
bar.sizeToFit();
input.inputAccessoryView = bar;
```

**Effect**: tapping the text view brings up the keyboard with an extra toolbar above it, with Done at the right end. Tapping it dismisses the keyboard. **Not verified in the simulator**; the acceptance tests include assertions that this view appears on screen after focus, but they haven't been run since they were written.

## Corresponding iOS API

`UITextView.inputAccessoryView`. There's no need to call `reloadInputViews` after changing it.

## See also

- [`UIToolbar`](../ui-toolbar.md)
- [`inputView`](inputview.md)
