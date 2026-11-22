---
type: reference
native: CNContactPickerContactPropertyEvent
---

# `CNContactPickerContactPropertyEvent`

**`CNContactPickerContactPropertyEvent`** represents the user tapping one item, such as a phone number, in a contact's details in the system contact picker.

The [`contactpropertyselect`](contacts/contactpropertyselect-event.md) event of [`CNContactPickerViewController`](contacts.md) is this class, and [`contactProperty`](cn-contact-picker-contact-property-event/contactproperty.md) is the item chosen.

It belongs to the `@nacrejs/contacts` package; for installation, see [`CNContactPickerViewController`](contacts.md#installation).

**Inheritance**: [`Event`](event.md) → `CNContactPickerContactPropertyEvent`

## Constructor

[`CNContactPickerContactPropertyEvent()`](cn-contact-picker-contact-property-event/constructor.md)

Creates a `CNContactPickerContactPropertyEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`contactProperty`](cn-contact-picker-contact-property-event/contactproperty.md) <small>read-only</small> | The item the user chose in the contact's details |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`CNContactPickerViewController`](contacts.md) | [`contactpropertyselect`](contacts/contactpropertyselect-event.md) |

It can't be canceled: `cancelable` is `false`, and `preventDefault()` has no effect. After it is fired, the system closes the picker.

## Examples

```js
const page = new UIViewController();
const picker = new CNContactPickerViewController();
picker.addEventListener('contactpropertyselect', (e) => {
  console.log(e instanceof CNContactPickerContactPropertyEvent);
});
page.presentViewController(picker, { animated: true });
```

**Effect**: after the user makes a choice in the picker, prints `true`. **Not verified in the simulator.**

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `contactPicker:didSelectContactProperty:` | The `contactpropertyselect` event |
| The `contactProperty` parameter | `event.contactProperty` |

## See also

- [`CNContactPickerViewController`](contacts.md): the object that fires this event
- [`contactpropertyselect`](contacts/contactpropertyselect-event.md): when it is fired
