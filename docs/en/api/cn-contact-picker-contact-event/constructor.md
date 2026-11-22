---
type: reference
native: CNContactPickerContactEvent()
---

# `CNContactPickerContactEvent()` constructor

The **`CNContactPickerContactEvent()`** constructor creates a `CNContactPickerContactEvent`.

## Syntax

```
new CNContactPickerContactEvent(type)
new CNContactPickerContactEvent(type, { contact, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.contact`**

Optional. Corresponds to the [`contact`](contact.md) property. Must be a `CNContact` or `null`; it is not converted. Anything else throws `TypeError`. When omitted, it is `null`.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `CNContactPickerContactEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'CNContactPickerContactEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new CNContactPickerContactEvent('contactselect');
console.log(event.type, event.contact);
```

**Result**: the console prints `contactselect null`.

## Corresponding iOS API

There is no corresponding system API. When the system notification arrives, the runtime puts the values it carries into the event object.

## See also

- [`CNContactPickerContactEvent`](../cn-contact-picker-contact-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
