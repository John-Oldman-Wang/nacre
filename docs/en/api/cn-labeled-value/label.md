---
type: reference
native: CNLabeledValue.label
---

# `CNLabeledValue`: `label` property

The **`label`** property is the raw text of this item's label, such as "mobile" or "work".

## Value

A string, or `null`.

- Read-only; assigning to it throws `TypeError`.
- `null` if this item has no label.
- Built-in system labels store a token, for example `'_$!<Mobile>!$_'` for mobile, which can't be shown to the user directly. Run it through [`CNLabeledValue.localizedStringForLabel()`](localizedstringforlabel.md) before displaying it; see [The raw text of labels](../cn-labeled-value.md#the-raw-text-of-labels).
- This value never changes, so there is no change event.

## Examples

```js
const picker = new CNContactPickerViewController();
picker.addEventListener('contactselect', (event) => {
  for (const item of event.contact.phoneNumbers) {
    console.log(item.label === null ? '(no label)' : CNLabeledValue.localizedStringForLabel(item.label));
  }
});
```

**Effect**: Each line prints a phone number's label, for example `手机` on a Chinese-language system; items without a label print `(no label)`.

## Corresponding iOS API

`CNLabeledValue.label`.

## See also

- [`CNLabeledValue.localizedStringForLabel()`](localizedstringforlabel.md)
- [Installing `@nacrejs/contacts`](../contacts.md#installation)
