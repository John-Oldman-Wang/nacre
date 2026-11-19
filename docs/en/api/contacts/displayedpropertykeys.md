---
type: reference
native: CNContactPickerViewController.displayedPropertyKeys
---

# `CNContactPickerViewController`: `displayedPropertyKeys` property

The **`displayedPropertyKeys`** property determines which fields are shown in a contact's details.

## Value

An array of [field names](../cn-contact.md#field-names), or `null`.

| Value | Effect |
| --- | --- |
| `null` | All fields are shown in the details |
| An array of field names, for example `['phoneNumbers']` | Only these fields are shown in the details |

- Readable and writable.
- Defaults to `null`. Writing `undefined` also gives `null`.
- Only meaningful for "pick an item" mode (listening for [`contactpropertyselect`](contactpropertyselect-event.md)): single and multiple selection don't open the details.
- You can write field names that aren't exposed as members on `CNContact`, for example `'postalAddresses'`: the details still show it; the app just can't read its value.
- Only the app itself can change it, so there is no change event.

### Invalid values

- The array contains an unrecognized name or an item that isn't a string: nothing is thrown, the whole assignment has no effect, the property keeps its previous value, and a warning is printed to the console. Valid field names in the array are not applied separately. The warning is:

  ```
  [Nacre] displayedPropertyKeys has no value "phone"; expected one of: identifier / namePrefix / givenName / …, ignored
  ```

  The ellipsis stands for the full list of field names.
- The value is neither an array nor `null`: throws `TypeError`, and the previous value is unchanged. After `got` is the value actually given:

  ```
  displayedPropertyKeys must be an array of contact key names or null, got "phoneNumbers"
  ```

## Examples

```js
const picker = new CNContactPickerViewController();
picker.displayedPropertyKeys = ['phoneNumbers', 'emailAddresses'];
console.log(picker.displayedPropertyKeys);
```

**Effect**: Prints `["phoneNumbers", "emailAddresses"]`. After the picker is presented, a contact's details show only phone numbers and email addresses.

## Corresponding iOS API

`CNContactPickerViewController.displayedPropertyKeys`. The key constant `CNContactPhoneNumbersKey` is written as `'phoneNumbers'`, and likewise for the rest; see [Field names](../cn-contact.md#field-names).

## See also

- [`contactpropertyselect`](contactpropertyselect-event.md): tapping an item in the details
- [Letting the user pick a phone number](../../guides/pick-contact.md#letting-the-user-pick-a-phone-number)
- [Installing `@nacrejs/contacts`](../contacts.md#installation)
