---
type: reference
native: CNPhoneNumber.stringValue
---

# `CNPhoneNumber`: `stringValue` property

The **`stringValue`** property is the text of the phone number.

## Value

A string.

- Read-only; assigning to it throws `TypeError`.
- It is exactly what the user entered in Contacts, not normalized: it may contain spaces, hyphens, parentheses, or a country code. Before dialing it or sending it to a server, the app normalizes it itself.
- This value never changes, so there is no change event.

## Examples

```js
const picker = new CNContactPickerViewController();
picker.addEventListener('contactselect', (event) => {
  for (const item of event.contact.phoneNumbers) {
    const digits = item.value.stringValue.replace(/[^\d+]/g, '');
    console.log(item.value.stringValue, '→', digits);
  }
});
```

**Effect**: Each line prints a number's original text and the result with spaces, hyphens, and parentheses removed, such as `(555) 010-0100 → 5550100100`.

## Corresponding iOS API

`CNPhoneNumber.stringValue`.

## See also

- [`CNLabeledValue`](../cn-labeled-value.md)
- [Installing `@nacrejs/contacts`](../contacts.md#installation)
