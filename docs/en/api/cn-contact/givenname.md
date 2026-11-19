---
type: reference
native: CNContact.givenName
---

# `CNContact`: `givenName` property

The **`givenName`** property is the contact's given name.

## Value

A string.

- Read-only. Assigning to it throws `TypeError`.
- An empty string when not filled in.
- The contact is a copy from the moment it was picked, so this value doesn't change and there is no change event.
- When the contact doesn't carry this field, reading it throws `TypeError: CNContact.givenName is not available on this contact; check contact.isKeyAvailable("givenName") first`; see [Which fields a contact carries](../cn-contact.md#which-fields-a-contact-carries).

To display the name as one line, use [`CNContactFormatter.stringFromContact()`](../cn-contact-formatter/stringfromcontact.md) rather than joining `familyName` and `givenName` yourself: whether the given name or family name comes first varies by language.

## Examples

```js
const picker = new CNContactPickerViewController();
picker.addEventListener('contactselect', (event) => {
  console.log(event.contact.givenName);
});
```

**Effect**: Prints `Alex` when the contact Alex Chen is picked.

## Corresponding iOS API

`CNContact.givenName`.

## See also

- [`familyName`](familyname.md): family name
- [`CNContactFormatter.stringFromContact()`](../cn-contact-formatter/stringfromcontact.md)
- [Installing `@nacrejs/contacts`](../contacts.md#installation)
