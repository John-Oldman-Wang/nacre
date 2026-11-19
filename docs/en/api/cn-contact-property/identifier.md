---
type: reference
native: CNContactProperty.identifier
---

# `CNContactProperty`: `identifier` property

The **`identifier`** property is the identifier of the selected entry when the selection is one entry of a labeled value (one particular phone number or email address).

## Value

A string, or `null`.

- When the selection is one entry of a labeled value, it equals the `identifier` of that entry's [`CNLabeledValue`](../cn-labeled-value.md).
- Otherwise `null`.
- Read-only. Assigning to it throws `TypeError`.
- The value never changes, so there is no change event.

## Examples

```js
const picker = new CNContactPickerViewController();
picker.addEventListener('contactpropertyselect', (event) => {
  console.log(event.contactProperty.identifier);
});
```

**Effect**: when the user taps a phone number, logs that entry's identifier (a string).

## Corresponding iOS API

`CNContactProperty.identifier`.

## See also

- [`identifier` of `CNLabeledValue`](../cn-labeled-value/identifier.md)
- [Installing `@nacrejs/contacts`](../contacts.md#installation)
