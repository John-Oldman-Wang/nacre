---
type: reference
native: UITextField.inputAccessoryView
---

# `UITextField`: `inputAccessoryView` property

The **`inputAccessoryView`** property is a view attached above the keyboard while the keyboard is shown. It appears and disappears together with the keyboard. The most common use is a [`UIToolbar`](../ui-toolbar.md) with a Done button on it.

## Value

A [`UIView`](../ui-view.md), or `null`.

- Readable and writable.
- The default is `null`.
- Reading it returns the same object that was written.
- Writing `null` or `undefined` removes it.
- The system stretches its width to match the keyboard; its height is its own. Call `sizeToFit()` on a toolbar first so it measures its own height; a new toolbar has a height of 0 and takes up no space unless you call it. **Not verified in the simulator.**
- The same view can be assigned to several text fields, and also to a [search bar](../ui-search-bar/inputaccessoryview.md) and a [text view](../ui-text-view/inputaccessoryview.md) at the same time.
- Writing it while the text field is being edited takes effect immediately; writing `null` removes it immediately. The text field does not lose focus as a result. **Not verified in the simulator.**
- Do not also put the assigned view into a view controller with `addSubview()`: when the keyboard appears, the system moves it above the keyboard, and it is gone from its original place in the view controller. **Not verified in the simulator.**
- There is no change event: only the app's own code changes it.

### Invalid values

- Writing a native object that is not a view throws `TypeError: inputAccessoryView needs a UIView or null`.
- Writing a plain value such as a number or a string throws `TypeError: inputAccessoryView needs a native object or null, got 5`.

In both cases the previous value is kept.

## Examples

```js
const field = new UITextField();
field.keyboardType = 'decimalPad';

const bar = new UIToolbar();
const done = UIBarButtonItem.systemItem('done');
done.addEventListener('click', () => field.resignFirstResponder());
bar.items = [UIBarButtonItem.flexibleSpace(), done];
bar.sizeToFit();
field.inputAccessoryView = bar;
```

**Effect**: Tapping the text field brings up the number keyboard, with a toolbar above it that has Done at its right end. Tapping Done dismisses the keyboard, and the toolbar disappears with it. **Not verified in the simulator**; the acceptance tests include assertions that "this view appears on screen after the text field gains focus", but they have not been run since they were written.

## Corresponding iOS API

`UITextField.inputAccessoryView`. There is no need to call `reloadInputViews` after changing it; writing it takes effect immediately.

## See also

- [`UIToolbar`](../ui-toolbar.md)
- [`inputView`](inputview.md): a view that replaces the whole keyboard
