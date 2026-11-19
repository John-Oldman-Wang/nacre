---
type: reference
native: CNPhoneNumber
status: partial
---

# `CNPhoneNumber`

**`CNPhoneNumber`** represents a phone number.

It appears in two places: as the `value` of each item in the `phoneNumbers` of a [`CNContact`](cn-contact.md), and as the `value` of a [`CNContactProperty`](cn-contact-property.md) when the user taps a phone number in the contact details.

You must install `@nacrejs/contacts` first; for how, see [`CNContactPickerViewController`](contacts.md#installation).

**Inheritance**: `EventTarget` → `NSObject` → `CNPhoneNumber`

## Constructor

Cannot be created with `new`; it can only be obtained from a contact.

`new CNPhoneNumber()` throws `TypeError: Illegal constructor: CNPhoneNumber is a read-only value handed over by CNContactPickerViewController, not created by new`.

## Instance properties

Also inherits the properties of `NSObject`.

| Property | Description |
| --- | --- |
| [`stringValue`](cn-phone-number/stringvalue.md) <small>read-only</small> | The text exactly as the user entered it in Contacts |

## Examples

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/contacts" />

const picker = new CNContactPickerViewController();
picker.addEventListener('contactpropertyselect', (event) => {
  const value = event.contactProperty.value;
  if (value instanceof CNPhoneNumber) {
    console.log(value.stringValue);
  }
});
```

**Effect**: When the user taps a phone number in the contact details, prints that number.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `phoneNumber.stringValue` | `phoneNumber.stringValue` |

## See also

- [`CNLabeledValue`](cn-labeled-value.md): a phone number together with its label
- [`CNContact`](cn-contact.md): `phoneNumbers`
