---
type: reference
native: CNContact.organizationName
---

# `CNContact`: `organizationName` property

The **`organizationName`** property is the contact's company or organization.

## Value

A string.

- Read-only. Assigning to it throws `TypeError`.
- An empty string when not filled in.
- The contact is a copy from the moment it was picked, so this value doesn't change and there is no change event.
- When the contact doesn't carry this field, reading it throws `TypeError: CNContact.organizationName is not available on this contact; check contact.isKeyAvailable("organizationName") first`; see [Which fields a contact carries](../cn-contact.md#which-fields-a-contact-carries).

For a contact with only a company and no name filled in, `fullName` from [`CNContactFormatter.stringFromContact()`](../cn-contact-formatter/stringfromcontact.md) gives the company name.

## Examples

```js
const picker = new CNContactPickerViewController();
picker.addEventListener('contactselect', (event) => {
  const org = event.contact.organizationName;
  console.log(org === '' ? 'No company' : org);
});
```

**Effect**: Prints the contact's company name; prints `No company` when it isn't filled in.

## Corresponding iOS API

`CNContact.organizationName`.

## See also

- [Installing `@nacrejs/contacts`](../contacts.md#installation)
