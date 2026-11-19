---
type: reference
native: CNContact.phoneNumbers
---

# `CNContact`: `phoneNumbers` property

The **`phoneNumbers`** property is all of the contact's phone numbers. Each item is a [`CNLabeledValue`](../cn-labeled-value.md) whose `value` is a [`CNPhoneNumber`](../cn-phone-number.md) and whose `label` is the number's label (mobile, home, work, …).

## Value

An array of `CNLabeledValue<CNPhoneNumber>`.

- Read-only. Assigning to it throws `TypeError`.
- In the order they appear in Contacts. An empty array when there are no phone numbers.
- The contact is a copy from the moment it was picked, so this value doesn't change and there is no change event.
- Reading it twice on the same contact gives arrays containing the same objects, which can be compared with `===`.
- When the contact doesn't carry this field, reading it throws `TypeError: CNContact.phoneNumbers is not available on this contact; check contact.isKeyAvailable("phoneNumbers") first`.

## Examples

```js
const picker = new CNContactPickerViewController();
picker.addEventListener('contactselect', (event) => {
  const lines = event.contact.phoneNumbers.map((item) => {
    const label = item.label === null
      ? ''
      : CNLabeledValue.localizedStringForLabel(item.label) + ' ';
    return label + item.value.stringValue;
  });
  console.log(lines.join('\n'));
});
```

**Effect**: One phone number per line, preceded by the label as written in the current language; for example, on a Chinese-language system: `手机 555-0100`, `工作 555-0199`.

## Corresponding iOS API

`CNContact.phoneNumbers`.

## See also

- [`CNLabeledValue`](../cn-labeled-value.md): the type of each item
- [`CNPhoneNumber`](../cn-phone-number.md): the number itself
- [Installing `@nacrejs/contacts`](../contacts.md#installation)
