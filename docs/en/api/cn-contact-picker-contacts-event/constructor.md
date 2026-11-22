---
type: reference
native: CNContactPickerContactsEvent()
---

# `CNContactPickerContactsEvent()` constructor

The **`CNContactPickerContactsEvent()`** constructor creates a `CNContactPickerContactsEvent`.

## Syntax

```
new CNContactPickerContactsEvent(type)
new CNContactPickerContactsEvent(type, { contacts, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.contacts`**

Optional. Corresponds to the [`contacts`](contacts.md) property. Must be iterable (an array, a `Set`, …); it is copied into a new array. Anything else throws `TypeError`. When omitted, it is an empty array.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `CNContactPickerContactsEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'CNContactPickerContactsEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new CNContactPickerContactsEvent('contactsselect');
console.log(event.type, event.contacts.length);
```

**Result**: the console prints `contactsselect 0`.

## Corresponding iOS API

There is no corresponding system API. When the system notification arrives, the runtime puts the values it carries into the event object.

## See also

- [`CNContactPickerContactsEvent`](../cn-contact-picker-contacts-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
