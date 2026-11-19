---
type: reference
native: CNLabeledValue.value
---

# `CNLabeledValue`: `value` property

The **`value`** property is this item's value: a phone number, or an email address.

## Value

- Phone numbers (from `phoneNumbers`): a [`CNPhoneNumber`](../cn-phone-number.md). Reading it twice on the same item gives the same object.
- Email addresses (from `emailAddresses`): a string.

Read-only; assigning to it throws `TypeError`. This value never changes, so there is no change event.

## Examples

```js
const picker = new CNContactPickerViewController();
picker.addEventListener('contactselect', (event) => {
  const contact = event.contact;
  const firstPhone = contact.phoneNumbers[0];
  if (firstPhone !== undefined) {
    console.log(firstPhone.value.stringValue);
  }
  const firstEmail = contact.emailAddresses[0];
  if (firstEmail !== undefined) {
    console.log(firstEmail.value);
  }
});
```

**Effect**: Prints the contact's first phone number and first email address, for example `555-0100` and `alex@example.com`. Whichever is missing isn't printed.

## Corresponding iOS API

`CNLabeledValue.value`.

## See also

- [`CNPhoneNumber`](../cn-phone-number.md)
- [Installing `@nacrejs/contacts`](../contacts.md#installation)
