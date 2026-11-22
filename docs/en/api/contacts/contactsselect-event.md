---
type: reference
native: "-[CNContactPickerDelegate contactPicker:didSelectContacts:]"
---

# `CNContactPickerViewController`: `contactsselect` event

The **`contactsselect`** event fires on a multiple-selection picker when the user finishes checking contacts and taps "Done". Listening for it makes the picker multiple-selection.

## Syntax

```
picker.addEventListener('contactsselect', (event) => { })
```

## Event object

[`CNContactPickerContactsEvent`](../cn-contact-picker-contacts-event.md), with one extra read-only field:

**[`contacts`](../cn-contact-picker-contacts-event/contacts.md)**

The contacts the user checked, an array of [`CNContact`](../cn-contact.md). Whether it is an empty array when the user taps "Done" without checking any is not verified.

`target` is this picker. It can't be canceled; `preventDefault()` has no effect.

## When it fires

- The user tapped "Done". The system then dismisses the picker.
- Listening for it makes the picker multiple-selection: each contact has a checkbox in front of it. [`contactselect`](contactselect-event.md) and [`contactpropertyselect`](contactpropertyselect-event.md), if also listened for, don't arrive.
- Each time a picker is presented, it fires at most once.

These behaviors are **not verified in the simulator**.

## Examples

```js
const page = new UIViewController();
const picker = new CNContactPickerViewController();
picker.addEventListener('contactsselect', (event) => {
  const names = event.contacts.map((contact) =>
    CNContactFormatter.stringFromContact(contact, { style: 'fullName' }));
  console.log('Picked ' + names.length + ': ' + names.join(', '));
});
page.presentViewController(picker, { animated: true });
```

**Effect**: Each contact in the list has a checkbox in front of it, and "Done" is at the top right. Check two and tap "Done", and the picker closes and the console prints `Picked 2: Alex Chen, Sam Rivera`.

## Corresponding iOS API

`-[CNContactPickerDelegate contactPicker:didSelectContacts:]`.

## See also

- [Selection modes](../contacts.md#selection-modes)
- [Picking several contacts at once](../../guides/pick-contact.md#picking-several-contacts-at-once)
- [Installing `@nacrejs/contacts`](../contacts.md#installation)
