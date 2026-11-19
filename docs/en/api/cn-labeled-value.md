---
type: reference
native: CNLabeledValue
status: partial
---

# `CNLabeledValue`

**`CNLabeledValue`** represents one phone number or one email address of a contact, together with its label. A contact can have several phone numbers and several email addresses, and in the address book each one has a label: mobile, home, work, or a name the user made up.

The `phoneNumbers` and `emailAddresses` of [`CNContact`](cn-contact.md) are arrays of it.

You need to install `@nacrejs/contacts` first; for how, see [`CNContactPickerViewController`](contacts.md#installation).

**Inheritance**: `EventTarget` → `NSObject` → `CNLabeledValue`

## Constructor

Can't be created with `new`; you can only get it from the `phoneNumbers` and `emailAddresses` of a [`CNContact`](cn-contact.md).

`new CNLabeledValue()` throws `TypeError: Illegal constructor: CNLabeledValue is a read-only value handed over by CNContactPickerViewController, not created by new`.

## Static methods

[`CNLabeledValue.localizedStringForLabel()`](cn-labeled-value/localizedstringforlabel.md)

Converts a label's raw text into the human-readable form for the current language.

## Instance properties

All read-only. Also inherits the properties of `NSObject`.

| Property | Description |
| --- | --- |
| [`value`](cn-labeled-value/value.md) <small>read-only</small> | The value. A `CNPhoneNumber` for a phone number, a string for an email address |
| [`label`](cn-labeled-value/label.md) <small>read-only</small> | The raw text of the label. `null` if there is no label |
| [`identifier`](cn-labeled-value/identifier.md) <small>read-only</small> | This item's identifier on this device |

## The raw text of labels

There are two kinds of raw label text:

- **Built-in system labels** store a token, not text for people to read. Several measured on macOS (the same system framework; not verified on iOS): `_$!<Mobile>!$_` (mobile), `_$!<Home>!$_` (home), `_$!<Work>!$_` (work), `_$!<Main>!$_` (main), `_$!<Other>!$_` (other), and `iPhone`.
- **Labels the user made up** store exactly the text the user typed.

[`CNLabeledValue.localizedStringForLabel()`](cn-labeled-value/localizedstringforlabel.md) handles both: built-in labels are converted to the form for the current language, and user-made labels are returned unchanged. So run a label through it before displaying it.

## Examples

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/contacts" />

const picker = new CNContactPickerViewController();
picker.addEventListener('contactselect', (event) => {
  for (const item of event.contact.phoneNumbers) {
    const label = item.label === null ? '' : CNLabeledValue.localizedStringForLabel(item.label);
    console.log(label, item.value.stringValue);
  }
});
```

**Effect**: Each line prints a phone number's label and number, for example `手机 555-0100` on a Chinese-language system.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `labeledValue.value`, `label`, `identifier` | Same |
| `[CNLabeledValue localizedStringForLabel:label]` | `CNLabeledValue.localizedStringForLabel(label)` |

## See also

- [`CNContact`](cn-contact.md): `phoneNumbers` and `emailAddresses`
- [`CNPhoneNumber`](cn-phone-number.md): the `value` of a phone number item
