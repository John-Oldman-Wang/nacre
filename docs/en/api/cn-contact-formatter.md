---
type: reference
native: CNContactFormatter
status: partial
---

# `CNContactFormatter`

**`CNContactFormatter`** joins a contact's name into one line. Whether the given name or family name comes first, and whether there is a space between them, is decided by the system based on the characters of the name itself and the user's settings: for Chinese and Japanese names the family name comes first; for English names the given name comes first.

You must install `@nacrejs/contacts` first; for how, see [`CNContactPickerViewController`](contacts.md#installation).

**Inheritance**: `EventTarget` → `NSObject` → `CNContactFormatter`

## Constructor

Cannot be created with `new`. It has only one static method.

`new CNContactFormatter()` throws `TypeError: Illegal constructor: CNContactFormatter has no instances here; use CNContactFormatter.stringFromContact(contact, { style })`.

## Static methods

[`CNContactFormatter.stringFromContact()`](cn-contact-formatter/stringfromcontact.md)

Joins a contact's name, or the phonetic spelling of the name, into one line.

## Examples

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/contacts" />

const picker = new CNContactPickerViewController();
picker.addEventListener('contactselect', (event) => {
  const name = CNContactFormatter.stringFromContact(event.contact, { style: 'fullName' });
  console.log(name === null ? '(no name)' : name);
});
```

**Effect**: Selecting a contact with given name Alex and family name Chen prints `Alex Chen`; selecting a contact with given name `小明` and family name `陈` prints `陈小明`.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[CNContactFormatter stringFromContact:contact style:CNContactFormatterStyleFullName]` | `CNContactFormatter.stringFromContact(contact, { style: 'fullName' })` |

## See also

- [`CNContact`](cn-contact.md): `givenName`, `familyName`
- [Letting the user pick a contact](../guides/pick-contact.md): use this to display names instead of joining them yourself
