---
type: reference
native: "-[CNContact isKeyAvailable:]"
---

# `CNContact`: `isKeyAvailable()` method

The **`isKeyAvailable()`** method tells you whether this contact carries a given field. Reading a field it doesn't carry throws `TypeError`; when in doubt, ask with this first.

## Syntax

```
isKeyAvailable(key)
```

### Parameters

**`key`**

A [field name](../cn-contact.md#field-names), a string, for example `'emailAddresses'`.

### Return value

A boolean.

- `true`: this contact carries the field, and you can read it.
- `false`: it doesn't.

### Exceptions

**`TypeError`**

An unrecognized field name: `isKeyAvailable has no value "phone"; expected one of: …`, followed by all field names.

## Examples

```js
const picker = new CNContactPickerViewController();
picker.addEventListener('contactselect', (event) => {
  const contact = event.contact;
  if (contact.isKeyAvailable('emailAddresses')) {
    console.log(contact.emailAddresses.length);
  }
});
```

**Effect**: When the contact carries the email field, prints the number of email addresses.

## Corresponding iOS API

`-[CNContact isKeyAvailable:]`. The key constant `CNContactEmailAddressesKey` is written as `'emailAddresses'`, and likewise for the rest.

## See also

- [Which fields a contact carries](../cn-contact.md#which-fields-a-contact-carries)
- [Installing `@nacrejs/contacts`](../contacts.md#installation)
