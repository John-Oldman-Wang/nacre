---
type: reference
native: CNContactPickerContactsEvent.contacts
---

# `CNContactPickerContactsEvent`: `contacts` property

The **`contacts`** property is the contacts the user checked.

## Value

An array of [`CNContact`](../cn-contact.md).

- Read-only. Assigning to it throws `TypeError`.
- Whether it is an empty array when the user taps Done without checking any is **not verified in the simulator**.
- When the event is created with [`new`](constructor.md) without it, it is an empty array.

## Examples

```js
const page = new UIViewController();
const picker = new CNContactPickerViewController();
picker.addEventListener('contactsselect', (e) => {
  console.log('选了 ' + e.contacts.length + ' 个');
});
page.presentViewController(picker, { animated: true });
```

**Effect**: when the user checks some contacts and taps Done, prints how many were chosen. **Not verified in the simulator.**

## Corresponding iOS API

The `contacts` parameter of `contactPicker:didSelectContacts:`.

## See also

- [`CNContactPickerContactsEvent`](../cn-contact-picker-contacts-event.md)
