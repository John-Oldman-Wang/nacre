---
type: reference
native: CNContactPickerContactEvent.contact
---

# `CNContactPickerContactEvent`: `contact` property

The **`contact`** property is the contact the user chose.

## Value

A [`CNContact`](../cn-contact.md).

- Read-only. Assigning to it throws `TypeError`.
- When the event is created with [`new`](constructor.md) without it, it is `null`.

## Examples

```js
const page = new UIViewController();
const picker = new CNContactPickerViewController();
picker.addEventListener('contactselect', (e) => {
  const name = CNContactFormatter.stringFromContact(e.contact, { style: 'fullName' });
  console.log(name ?? '（没有名字）');
});
page.presentViewController(picker, { animated: true });
```

**Effect**: when the user taps a contact, prints the full name. **Not verified in the simulator.**

## Corresponding iOS API

The `contact` parameter of `contactPicker:didSelectContact:`.

## See also

- [`CNContactPickerContactEvent`](../cn-contact-picker-contact-event.md)
