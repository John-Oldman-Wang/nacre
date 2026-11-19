---
type: reference
native: "+[CNContactFormatter stringFromContact:style:]"
---

# `CNContactFormatter.stringFromContact()` static method

The **`CNContactFormatter.stringFromContact()`** static method joins a contact's name into one line.

## Syntax

```
CNContactFormatter.stringFromContact(contact, { style })
```

### Parameters

**`contact`**

A [`CNContact`](../cn-contact.md).

**`options.style`**

Which set of fields to join, required:

| Value | Effect |
| --- | --- |
| `'fullName'` | The name. A contact with given name Alex and family name Chen gives `Alex Chen`; a contact with given name `小明` and family name `陈` gives `陈小明`. A contact with only a company filled in gives the company name |
| `'phoneticFullName'` | The phonetic spelling of the name (the pinyin or reading entered for the family and given names in Contacts). `null` when no phonetic spelling is filled in |

The three `fullName` results were measured on macOS with the same system framework; on iOS they are **not verified**.

### Return value

A string, or `null`. `null` when the contact has nothing to join: for example, for a contact with neither a name nor a company, `fullName` gives `null`.

### Exceptions

**`TypeError`**

- `style` is missing or invalid: `style has no value "short"; expected one of: fullName / phoneticFullName`
- The first argument is not a contact: `stringFromContact needs a CNContact`
- The contact does not carry the fields needed to build the name: `stringFromContact: this contact does not carry the name fields this style needs`

## Examples

```js
const picker = new CNContactPickerViewController();
picker.addEventListener('contactselect', (event) => {
  const contact = event.contact;
  const name = CNContactFormatter.stringFromContact(contact, { style: 'fullName' });
  const phonetic = CNContactFormatter.stringFromContact(contact, { style: 'phoneticFullName' });
  console.log(name ?? '(no name)', phonetic ?? '(no phonetic name)');
});
```

**Effect**: Selecting the contact `陈小明` with the phonetic name Chen Xiaoming filled in prints `陈小明 Chen Xiaoming`. For a contact with only a company filled in, the first item is the company name. **The phonetic item is not verified in the simulator.**

## Corresponding iOS API

`+[CNContactFormatter stringFromContact:style:]`. `CNContactFormatterStyleFullName` is written `'fullName'`, and `CNContactFormatterStylePhoneticFullName` is written `'phoneticFullName'`.

## See also

- [`CNContact`](../cn-contact.md)
- [Installing `@nacrejs/contacts`](../contacts.md#installation)
