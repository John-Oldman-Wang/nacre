---
type: reference
native: CNContact
status: partial
---

# `CNContact`

**`CNContact`** represents a contact in the address book: name, company, phone numbers, email addresses. It is handed to the app by the [contact picker](contacts.md) after the user picks it.

It is a read-only copy from the moment it was picked. If the user later edits this contact in Contacts, the app's copy doesn't change, and the app isn't notified.

You need to install `@nacrejs/contacts` first; for how, see [`CNContactPickerViewController`](contacts.md#installation). For what a capability package is, see [Core and capability packages](capabilities.md).

**Inheritance**: `EventTarget` → `NSObject` → `CNContact`

## Constructor

It can't be created with `new`; you only get it from the picker's events: `contact` on [`contactselect`](contacts/contactselect-event.md), `contacts` on [`contactsselect`](contacts/contactsselect-event.md), and `contact` on [`CNContactProperty`](cn-contact-property.md).

`new CNContact()` throws `TypeError: Illegal constructor: CNContact is a read-only value handed over by CNContactPickerViewController, not created by new`.

## Instance properties

All read-only. Also inherits properties from `NSObject`.

| Property | Description |
| --- | --- |
| [`identifier`](cn-contact/identifier.md) <small>read-only</small> | This contact's identifier on this device |
| [`givenName`](cn-contact/givenname.md) <small>read-only</small> | Given name |
| [`familyName`](cn-contact/familyname.md) <small>read-only</small> | Family name |
| [`organizationName`](cn-contact/organizationname.md) <small>read-only</small> | Company or organization |
| [`phoneNumbers`](cn-contact/phonenumbers.md) <small>read-only</small> | Phone numbers, with labels |
| [`emailAddresses`](cn-contact/emailaddresses.md) <small>read-only</small> | Email addresses, with labels |

## Instance methods

| Method | Description |
| --- | --- |
| [`isKeyAvailable()`](cn-contact/iskeyavailable.md) | Whether this contact carries a given field |

## Which fields a contact carries

A contact handed to the app by the system isn't guaranteed to carry every field. Reading a field it doesn't carry throws `TypeError`, and the error tells you what to ask first:

```
CNContact.givenName is not available on this contact; check contact.isKeyAvailable("givenName") first
```

`givenName`, `familyName`, `organizationName`, `phoneNumbers`, and `emailAddresses` are all checked this way before being read. Whether contacts handed back by the picker always carry these fields is not verified yet; when in doubt, ask with [`isKeyAvailable()`](cn-contact/iskeyavailable.md) first.

## Field names

The names used by [`isKeyAvailable()`](cn-contact/iskeyavailable.md) and the picker's [`displayedPropertyKeys`](contacts/displayedpropertykeys.md). They are all of a contact's fields in the system, more than the members currently readable on `CNContact`: fields not exposed as members can still be shown on the details page.

| Field name | Meaning |
| --- | --- |
| `'identifier'` | Identifier |
| `'namePrefix'`, `'givenName'`, `'middleName'`, `'familyName'`, `'previousFamilyName'`, `'nameSuffix'`, `'nickname'` | Prefix, given name, middle name, family name, previous family name, suffix, nickname |
| `'phoneticGivenName'`, `'phoneticMiddleName'`, `'phoneticFamilyName'`, `'phoneticOrganizationName'` | Phonetic given name, middle name, family name, and company |
| `'organizationName'`, `'departmentName'`, `'jobTitle'` | Company, department, job title |
| `'phoneNumbers'`, `'emailAddresses'`, `'postalAddresses'`, `'urlAddresses'` | Phone numbers, email addresses, postal addresses, URLs |
| `'birthday'`, `'nonGregorianBirthday'`, `'dates'` | Birthday, birthday in another calendar such as the Chinese lunar calendar, and dates such as anniversaries |
| `'contactRelations'`, `'socialProfiles'`, `'instantMessageAddresses'` | Related people, social profiles, instant messaging accounts |
| `'note'` | Note |
| `'imageData'`, `'thumbnailImageData'`, `'imageDataAvailable'` | Photo, photo thumbnail, whether there is a photo |
| `'contactType'` | Whether it is a person or an organization |

## Examples

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/contacts" />

const picker = new CNContactPickerViewController();
picker.addEventListener('contactselect', (event) => {
  const contact = event.contact;
  console.log(contact.familyName, contact.givenName, contact.organizationName);
  for (const item of contact.phoneNumbers) {
    console.log(item.value.stringValue);
  }
});
```

**Effect**: After the picker is presented and the user picks a contact, the first line prints the family name, given name, and company (empty strings for fields not filled in), followed by one phone number per line.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `contact.givenName`, `contact.phoneNumbers` | Same |
| `contact.phoneNumbers[0].value.stringValue` | Same |
| `[contact isKeyAvailable:CNContactEmailAddressesKey]` | `contact.isKeyAvailable('emailAddresses')` |

## See also

- [`CNContactPickerViewController`](contacts.md): where contacts come from
- [`CNLabeledValue`](cn-labeled-value.md): the type of each item in `phoneNumbers` and `emailAddresses`
- [`CNContactFormatter`](cn-contact-formatter.md): joining a name into one line
