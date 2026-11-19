---
type: reference
native: CNContactProperty.key
---

# `CNContactProperty`: `key` property

The **`key`** property is the field that the selected item belongs to.

## Value

A string, one of the [field names](../cn-contact.md#field-names): `'phoneNumbers'` if the user tapped a phone number, `'emailAddresses'` if they tapped an email address.

- Read-only. Assigning to it throws `TypeError`.
- When a field whose values aren't exposed yet is selected, such as an address or birthday, [`value`](value.md) is `null`, but `key` still says which kind of field was selected.
- The value never changes, so there is no change event.

## Examples

```js
const picker = new CNContactPickerViewController();
picker.addEventListener('contactpropertyselect', (event) => {
  console.log(event.contactProperty.key);
});
```

**Effect**: when the user taps a phone number, logs `phoneNumbers`.

## Corresponding iOS API

`CNContactProperty.key`. The native value is a constant such as `CNContactPhoneNumbersKey`; here it is the field name with the prefix and the `Key` suffix removed.

## See also

- [Field names](../cn-contact.md#field-names)
- [Installing `@nacrejs/contacts`](../contacts.md#installation)
