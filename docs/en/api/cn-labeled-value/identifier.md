---
type: reference
native: CNLabeledValue.identifier
---

# `CNLabeledValue`: `identifier` property

The **`identifier`** property is this item's identifier on this device.

## Value

A string.

- Read-only; assigning to it throws `TypeError`.
- This value never changes, so there is no change event.
- When the user taps a phone number or email address in a contact's details, the `identifier` of the [`CNContactProperty`](../cn-contact-property.md) is this value of that item.

## Examples

```js
const picker = new CNContactPickerViewController();
picker.addEventListener('contactpropertyselect', (event) => {
  const property = event.contactProperty;
  const item = property.contact.phoneNumbers.find((p) => p.identifier === property.identifier);
  console.log(item === undefined ? 'not a phone number' : item.value.stringValue);
});
```

**Effect**: When the user taps a phone number in the details, it finds the same item in the contact's `phoneNumbers` and prints its number. **Not verified in the simulator.**

## Corresponding iOS API

`CNLabeledValue.identifier`.

## See also

- [`CNContactProperty`](../cn-contact-property.md)
- [Installing `@nacrejs/contacts`](../contacts.md#installation)
