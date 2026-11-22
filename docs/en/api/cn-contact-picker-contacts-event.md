---
type: reference
native: CNContactPickerContactsEvent
---

# `CNContactPickerContactsEvent`

**`CNContactPickerContactsEvent`** represents the user checking several contacts in the system contact picker and tapping Done.

The [`contactsselect`](contacts/contactsselect-event.md) event of [`CNContactPickerViewController`](contacts.md) is this class, and [`contacts`](cn-contact-picker-contacts-event/contacts.md) is the contacts checked.

It belongs to the `@nacrejs/contacts` package; for installation, see [`CNContactPickerViewController`](contacts.md#installation).

**Inheritance**: [`Event`](event.md) → `CNContactPickerContactsEvent`

## Constructor

[`CNContactPickerContactsEvent()`](cn-contact-picker-contacts-event/constructor.md)

Creates a `CNContactPickerContactsEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`contacts`](cn-contact-picker-contacts-event/contacts.md) <small>read-only</small> | The contacts the user checked |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`CNContactPickerViewController`](contacts.md) | [`contactsselect`](contacts/contactsselect-event.md) |

It can't be canceled: `cancelable` is `false`, and `preventDefault()` has no effect. After it is fired, the system closes the picker.

## Examples

```js
const page = new UIViewController();
const picker = new CNContactPickerViewController();
picker.addEventListener('contactsselect', (e) => {
  console.log(e instanceof CNContactPickerContactsEvent);
});
page.presentViewController(picker, { animated: true });
```

**Effect**: after the user makes a choice in the picker, prints `true`. **Not verified in the simulator.**

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `contactPicker:didSelectContacts:` | The `contactsselect` event |
| The `contacts` parameter | `event.contacts` |

## See also

- [`CNContactPickerViewController`](contacts.md): the object that fires this event
- [`contactsselect`](contacts/contactsselect-event.md): when it is fired
