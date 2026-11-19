---
type: reference
native: "-[CNContactPickerDelegate contactPicker:didSelectContactProperty:]"
---

# `CNContactPickerViewController`: `contactpropertyselect` event

The **`contactpropertyselect`** event fires when the user opens a contact's details and taps one item in them (a phone number, an email address). Listening for it puts the picker in "pick an item" mode.

## Syntax

```
picker.addEventListener('contactpropertyselect', (event) => { })
```

## Event object

`Event`, with one extra field:

**`contactProperty`**

The item the user picked, a [`CNContactProperty`](../cn-contact-property.md): which contact, which field, and which value.

`target` is this picker. It can't be canceled; `preventDefault()` has no effect.

## When it fires

- The user taps a contact and the picker opens that contact's details; when the user then taps an item in the details, this event fires and the system then dismisses the picker.
- Which fields are shown in the details is determined by [`displayedPropertyKeys`](displayedpropertykeys.md).
- When [`contactsselect`](contactsselect-event.md) is also listened for, the picker uses multiple selection and this event doesn't arrive.
- Each time a picker is presented, it fires at most once.

These behaviors are **not verified in the simulator**.

## Examples

```js
const page = new UIViewController();
const picker = new CNContactPickerViewController();
picker.displayedPropertyKeys = ['phoneNumbers'];
picker.addEventListener('contactpropertyselect', (event) => {
  const property = event.contactProperty;
  if (property.value instanceof CNPhoneNumber) {
    console.log(property.value.stringValue);
  }
});
page.presentViewController(picker, { animated: true });
```

**Effect**: Tap a contact, and the details show only the phone number rows; tap one of the numbers, and the picker closes and the console prints that number, for example `555-0100`.

## Corresponding iOS API

`-[CNContactPickerDelegate contactPicker:didSelectContactProperty:]`. `contactPicker:didSelectContactProperties:`, for picking several items at once, is not provided yet.

## See also

- [`CNContactProperty`](../cn-contact-property.md)
- [Letting the user pick a phone number](../../guides/pick-contact.md#letting-the-user-pick-a-phone-number)
- [Installing `@nacrejs/contacts`](../contacts.md#installation)
