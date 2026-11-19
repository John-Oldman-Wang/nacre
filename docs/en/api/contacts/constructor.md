---
type: reference
native: "-[CNContactPickerViewController init]"
---

# `CNContactPickerViewController()` constructor

The **`CNContactPickerViewController()`** constructor creates a contact picker.

## Syntax

```
new CNContactPickerViewController()
```

### Parameters

None.

### Return value

A new `CNContactPickerViewController`. Each call returns a new object. It hasn't been presented yet (`presentingViewController` is `null`), and [`displayedPropertyKeys`](displayedpropertykeys.md) is `null`.

Each picker is used once. What happens if you present it a second time after using it is not verified; create a new one every time.

### Exceptions

**`TypeError`**

Subclassing it and calling `new`: native classes can't be subclassed; see [Native classes](../native-classes.md).

## Examples

```js
const picker = new CNContactPickerViewController();
console.log(picker instanceof UIViewController, picker.displayedPropertyKeys);
```

**Result**: Prints `true null`.

## Corresponding iOS API

`[[CNContactPickerViewController alloc] init]`.

## See also

- [Selection modes](../contacts.md#selection-modes): listen for an event before presenting
- [Installing `@nacrejs/contacts`](../contacts.md#installation)
