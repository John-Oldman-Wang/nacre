---
type: reference
native: CNContactPickerContactPropertyEvent.contactProperty
---

# `CNContactPickerContactPropertyEvent`: `contactProperty` property

The **`contactProperty`** property is the item the user chose in the contact's details.

## Value

A [`CNContactProperty`](../cn-contact-property.md): which contact, which field, and which value.

- Read-only. Assigning to it throws `TypeError`.
- When the event is created with [`new`](constructor.md) without it, it is `null`.

## Examples

```js
const page = new UIViewController();
const picker = new CNContactPickerViewController();
picker.addEventListener('contactpropertyselect', (e) => {
  if (e.contactProperty.value instanceof CNPhoneNumber) {
    console.log(e.contactProperty.value.stringValue);
  }
});
page.presentViewController(picker, { animated: true });
```

**Effect**: when the user taps a phone number in a contact's details, prints the number; tapping other items prints nothing. **Not verified in the simulator.**

## Corresponding iOS API

The `contactProperty` parameter of `contactPicker:didSelectContactProperty:`.

## See also

- [`CNContactPickerContactPropertyEvent`](../cn-contact-picker-contact-property-event.md)
