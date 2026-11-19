---
type: reference
native: CNContactProperty
status: partial
---

# `CNContactProperty`

**`CNContactProperty`** represents the item the user selected in a contact's details: which value of which field of which contact. For example, if the user taps Alex Chen's mobile number, it says the contact is Alex Chen, the field is phone numbers, and the value is that number.

The picker hands it to the App through its [`contactpropertyselect`](contacts/contactpropertyselect-event.md) event.

Install `@nacrejs/contacts` first; see [`CNContactPickerViewController`](contacts.md#installation) for how.

**Inheritance**: `EventTarget` → `NSObject` → `CNContactProperty`

## Constructor

Can't be created with `new`; it only comes from `contactProperty` on the [`contactpropertyselect`](contacts/contactpropertyselect-event.md) event.

`new CNContactProperty()` throws `TypeError: Illegal constructor: CNContactProperty is a read-only value handed over by CNContactPickerViewController, not created by new`.

## Instance properties

All are read-only. Also inherits the properties of `NSObject`.

| Property | Description |
| --- | --- |
| [`contact`](cn-contact-property/contact.md) <small>read-only</small> | The contact this item belongs to |
| [`key`](cn-contact-property/key.md) <small>read-only</small> | The field name, such as `'phoneNumbers'` |
| [`value`](cn-contact-property/value.md) <small>read-only</small> | The selected value |
| [`identifier`](cn-contact-property/identifier.md) <small>read-only</small> | When the selection is one entry of a labeled value, that entry's identifier |
| [`label`](cn-contact-property/label.md) <small>read-only</small> | When the selection is one entry of a labeled value, that entry's raw label |

## Examples

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/contacts" />

const picker = new CNContactPickerViewController();
picker.addEventListener('contactpropertyselect', (event) => {
  const property = event.contactProperty;
  const value = property.value;
  const text = value instanceof CNPhoneNumber ? value.stringValue : value;
  console.log(property.key, text);
});
```

**Effect**: when the user taps a phone number in the details, logs `phoneNumbers 555-0100`; when they tap an email address, logs `emailAddresses alex@example.com`; when they tap a field such as an address or birthday, logs the field name and `null`.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `property.contact`, `key`, `value`, `identifier`, `label` | Same |

## See also

- [`contactpropertyselect`](contacts/contactpropertyselect-event.md): where it comes from
- [`CNContact`](cn-contact.md): the type of `contact`
- [`CNLabeledValue`](cn-labeled-value.md): the entry that `identifier` and `label` refer to
