---
type: reference
native: CNContactPickerContactPropertyEvent()
---

# `CNContactPickerContactPropertyEvent()` constructor

The **`CNContactPickerContactPropertyEvent()`** constructor creates a `CNContactPickerContactPropertyEvent`.

## Syntax

```
new CNContactPickerContactPropertyEvent(type)
new CNContactPickerContactPropertyEvent(type, { contactProperty, cancelable })
```

### Parameters

**`type`**

The event name, a string.

**`options.contactProperty`**

Optional. Corresponds to the [`contactProperty`](contactproperty.md) property. Must be a `CNContactProperty` or `null`; it is not converted. Anything else throws `TypeError`. When omitted, it is `null`.

**`options.cancelable`**

A boolean. Optional; defaults to `false`.

### Return value

The new `CNContactPickerContactPropertyEvent`.

### Exceptions

**`TypeError`**

- A field's value cannot be converted; see each parameter above.
- No event name is passed: `Failed to construct 'CNContactPickerContactPropertyEvent': 1 argument required, but only 0 present.`
- It is called as a function, without `new`.

## Examples

```js
const event = new CNContactPickerContactPropertyEvent('contactpropertyselect');
console.log(event.type, event.contactProperty);
```

**Result**: the console prints `contactpropertyselect null`.

## Corresponding iOS API

There is no corresponding system API. When the system notification arrives, the runtime puts the values it carries into the event object.

## See also

- [`CNContactPickerContactPropertyEvent`](../cn-contact-picker-contact-property-event.md)
- [`dispatchEvent()`](../event-target/dispatchevent.md): fires an event you built
