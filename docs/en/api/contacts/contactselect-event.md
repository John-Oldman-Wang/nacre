---
type: reference
native: "-[CNContactPickerDelegate contactPicker:didSelectContact:]"
---

# `CNContactPickerViewController`: `contactselect` event

The **`contactselect`** event fires on a single-selection picker when the user taps a contact. Listening for it makes the picker single-selection.

## Syntax

```
picker.addEventListener('contactselect', (event) => { })
```

## Event object

[`CNContactPickerContactEvent`](../cn-contact-picker-contact-event.md), with one extra read-only field:

**[`contact`](../cn-contact-picker-contact-event/contact.md)**

The contact the user picked, a [`CNContact`](../cn-contact.md).

`target` is this picker. It can't be canceled; `preventDefault()` has no effect.

## When it fires

- The user tapped a contact. The system then dismisses the picker; the app doesn't need to call `dismissViewController()`.
- When [`contactsselect`](contactsselect-event.md) is also listened for, the picker uses multiple selection and this event doesn't arrive.
- Apple's documentation doesn't say how the system selects when [`contactpropertyselect`](contactpropertyselect-event.md) is also listened for.
- Each time a picker is presented, it fires at most once.

These behaviors are **not verified in the simulator**.

## Examples

```js
const page = new UIViewController();
const picker = new CNContactPickerViewController();
picker.addEventListener('contactselect', (event) => {
  const name = CNContactFormatter.stringFromContact(event.contact, { style: 'fullName' });
  console.log(name ?? '(no name)');
});
page.presentViewController(picker, { animated: true });
```

**Effect**: When the user taps the contact Alex Chen, the picker closes and the console prints `Alex Chen`.

## Corresponding iOS API

`-[CNContactPickerDelegate contactPicker:didSelectContact:]`. In ObjC, implementing this delegate method makes the picker single-selection; here, listening for this event does.

## See also

- [Selection modes](../contacts.md#selection-modes)
- [`CNContact`](../cn-contact.md)
- [Installing `@nacrejs/contacts`](../contacts.md#installation)
