---
type: reference
native: CNContactProperty.label
---

# `CNContactProperty`: `label` property

The **`label`** property is the raw label of the selected entry when the selection is one entry of a labeled value.

## Value

A string, or `null`.

- When the selection is one entry of a labeled value, it equals the `label` of that entry's [`CNLabeledValue`](../cn-labeled-value.md); `null` if that entry has no label.
- Otherwise `null`.
- A built-in system label is a token. Convert it with [`CNLabeledValue.localizedStringForLabel()`](../cn-labeled-value/localizedstringforlabel.md) before displaying it.
- Read-only. Assigning to it throws `TypeError`.
- The value never changes, so there is no change event.

## Examples

```js
const picker = new CNContactPickerViewController();
picker.addEventListener('contactpropertyselect', (event) => {
  const label = event.contactProperty.label;
  console.log(label === null ? '(no label)' : CNLabeledValue.localizedStringForLabel(label));
});
```

**Effect**: when the user taps a mobile number, logs `手机` on a system set to Chinese.

## Corresponding iOS API

`CNContactProperty.label`.

## See also

- [Raw labels](../cn-labeled-value.md#the-raw-text-of-labels)
- [Installing `@nacrejs/contacts`](../contacts.md#installation)
