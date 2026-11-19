---
type: reference
native: CNContactProperty.value
---

# `CNContactProperty`: `value` property

The **`value`** property is the value the user selected.

## Value

Depends on which kind of field the user tapped:

| Field | Value |
| --- | --- |
| Phone number | [`CNPhoneNumber`](../cn-phone-number.md) |
| Email address, URL | A string |
| Address, birthday, dates, and the like | `null`: these types aren't exposed yet |

- Read-only. Assigning to it throws `TypeError`.
- The value never changes, so there is no change event.
- The type varies by field, so check it with `instanceof` or `typeof` before use. Limiting the details to one kind of field with [`displayedPropertyKeys`](../contacts/displayedpropertykeys.md) keeps the user from tapping other fields.

## Examples

```js
const picker = new CNContactPickerViewController();
picker.displayedPropertyKeys = ['phoneNumbers', 'emailAddresses'];
picker.addEventListener('contactpropertyselect', (event) => {
  const value = event.contactProperty.value;
  if (value instanceof CNPhoneNumber) {
    console.log('Phone: ' + value.stringValue);
  } else if (typeof value === 'string') {
    console.log('Email: ' + value);
  }
});
```

**Effect**: when the user taps a phone number, logs `Phone: 555-0100`; when they tap an email address, logs `Email: alex@example.com`.

## Corresponding iOS API

`CNContactProperty.value`. Where the native value is a `CNPostalAddress` or `NSDateComponents`, it is `null` here.

## See also

- [`key`](key.md): which kind of field
- [Installing `@nacrejs/contacts`](../contacts.md#installation)
