---
type: reference
native: CNContact.familyName
---

# `CNContact`: `familyName` property

The **`familyName`** property is the contact's family name.

## Value

A string.

- Read-only. Assigning to it throws `TypeError`.
- An empty string when not filled in.
- The contact is a copy from the moment it was picked, so this value doesn't change and there is no change event.
- When the contact doesn't carry this field, reading it throws `TypeError: CNContact.familyName is not available on this contact; check contact.isKeyAvailable("familyName") first`; see [Which fields a contact carries](../cn-contact.md#which-fields-a-contact-carries).

To display the name as one line, use [`CNContactFormatter.stringFromContact()`](../cn-contact-formatter/stringfromcontact.md).

## Examples

```js
const picker = new CNContactPickerViewController();
picker.addEventListener('contactselect', (event) => {
  console.log(event.contact.familyName);
});
```

**Effect**: Prints `Chen` when the contact Alex Chen is picked.

## Corresponding iOS API

`CNContact.familyName`.

## See also

- [`givenName`](givenname.md): given name
- [Installing `@nacrejs/contacts`](../contacts.md#installation)
