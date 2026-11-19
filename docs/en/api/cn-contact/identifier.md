---
type: reference
native: CNContact.identifier
---

# `CNContact`: `identifier` property

The **`identifier`** property is this contact's identifier on this device.

## Value

A non-empty string.

- Read-only. Assigning to it throws `TypeError`.
- The contact is a copy from the moment it was picked, so this value doesn't change and there is no change event.
- You can save it to recognize whether the contact picked next time is the same one.
- It is only meaningful on this device.

## Examples

```js
const picker = new CNContactPickerViewController();
let lastId = '';
picker.addEventListener('contactselect', (event) => {
  console.log(event.contact.identifier === lastId ? 'Same person as last time' : 'A different person');
  lastId = event.contact.identifier;
});
```

**Effect**: Prints `Same person as last time` when the picked contact is the same as last time; otherwise prints `A different person`.

## Corresponding iOS API

`CNContact.identifier`.

## See also

- [`CNContact`](../cn-contact.md)
- [Installing `@nacrejs/contacts`](../contacts.md#installation)
