---
type: reference
native: CNContact.emailAddresses
---

# `CNContact`: `emailAddresses` property

The **`emailAddresses`** property is all of the contact's email addresses. Each item is a [`CNLabeledValue`](../cn-labeled-value.md) whose `value` is the email address string.

## Value

An array of `CNLabeledValue<string>`.

- Read-only. Assigning to it throws `TypeError`.
- In the order they appear in Contacts. An empty array when there are no email addresses.
- The contact is a copy from the moment it was picked, so this value doesn't change and there is no change event.
- When the contact doesn't carry this field, reading it throws `TypeError: CNContact.emailAddresses is not available on this contact; check contact.isKeyAvailable("emailAddresses") first`.

## Examples

```js
const picker = new CNContactPickerViewController();
picker.addEventListener('contactselect', (event) => {
  const contact = event.contact;
  if (contact.isKeyAvailable('emailAddresses')) {
    console.log(contact.emailAddresses.map((item) => item.value).join(', '));
  }
});
```

**Effect**: Prints all of the contact's email addresses separated by commas, for example `alex@example.com, alex@work.example.com`. Prints an empty line when there are none.

## Corresponding iOS API

`CNContact.emailAddresses`.

## See also

- [`CNLabeledValue`](../cn-labeled-value.md): the type of each item
- [Installing `@nacrejs/contacts`](../contacts.md#installation)
