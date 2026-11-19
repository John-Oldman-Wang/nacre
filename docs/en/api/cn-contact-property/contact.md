---
type: reference
native: CNContactProperty.contact
---

# `CNContactProperty`: `contact` property

The **`contact`** property is the contact that the selected item belongs to.

## Value

A [`CNContact`](../cn-contact.md).

- Read-only. Assigning to it throws `TypeError`.
- The value never changes, so there is no change event.

## Examples

```js
const picker = new CNContactPickerViewController();
picker.addEventListener('contactpropertyselect', (event) => {
  const property = event.contactProperty;
  const name = CNContactFormatter.stringFromContact(property.contact, { style: 'fullName' });
  console.log(name ?? '(no name)');
});
```

**Effect**: logs the name of the contact the selected item belongs to, such as `Alex Chen`.

## Corresponding iOS API

`CNContactProperty.contact`.

## See also

- [`CNContact`](../cn-contact.md)
- [Installing `@nacrejs/contacts`](../contacts.md#installation)
