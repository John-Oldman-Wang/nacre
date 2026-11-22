---
type: reference
native: CNContactPickerContactEvent
---

# `CNContactPickerContactEvent`

**`CNContactPickerContactEvent`** represents the user tapping a contact in the system contact picker.

The [`contactselect`](contacts/contactselect-event.md) event of [`CNContactPickerViewController`](contacts.md) is this class, and [`contact`](cn-contact-picker-contact-event/contact.md) is the contact chosen.

It belongs to the `@nacrejs/contacts` package; for installation, see [`CNContactPickerViewController`](contacts.md#installation).

**Inheritance**: [`Event`](event.md) → `CNContactPickerContactEvent`

## Constructor

[`CNContactPickerContactEvent()`](cn-contact-picker-contact-event/constructor.md)

Creates a `CNContactPickerContactEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`contact`](cn-contact-picker-contact-event/contact.md) <small>read-only</small> | The contact the user chose |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`CNContactPickerViewController`](contacts.md) | [`contactselect`](contacts/contactselect-event.md) |

It can't be canceled: `cancelable` is `false`, and `preventDefault()` has no effect. After it is fired, the system closes the picker.

## Examples

```js
const page = new UIViewController();
const picker = new CNContactPickerViewController();
picker.addEventListener('contactselect', (e) => {
  console.log(e instanceof CNContactPickerContactEvent);
});
page.presentViewController(picker, { animated: true });
```

**Effect**: after the user makes a choice in the picker, prints `true`. **Not verified in the simulator.**

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `contactPicker:didSelectContact:` | The `contactselect` event |
| The `contact` parameter | `event.contact` |

## See also

- [`CNContactPickerViewController`](contacts.md): the object that fires this event
- [`contactselect`](contacts/contactselect-event.md): when it is fired
