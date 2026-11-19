---
type: reference
native: "+[CNLabeledValue localizedStringForLabel:]"
---

# `CNLabeledValue.localizedStringForLabel()` static method

The **`CNLabeledValue.localizedStringForLabel()`** static method converts a label's raw text into the human-readable form for the current language.

## Syntax

```
CNLabeledValue.localizedStringForLabel(label)
```

### Parameters

**`label`**

The raw text of the label, a string, usually the value read from [`label`](label.md). Other types are converted to strings with `String()`: writing `5` gives `'5'`; `null` is treated as the empty string, giving `''`.

### Return value

A string.

- Built-in system labels are converted to the human-readable form for the current language; for example, on a Chinese-language system `'_$!<Mobile>!$_'` gives `'手机'`.
- Other strings are returned unchanged; for example, the user-made label `'Warehouse'` gives `'Warehouse'`.

It can be called without a contact.

### Exceptions

None.

## Examples

```js
console.log(CNLabeledValue.localizedStringForLabel('_$!<Mobile>!$_'));
console.log(CNLabeledValue.localizedStringForLabel('Warehouse'));
```

**Result**: On a Chinese-language system, the first line prints `手机` and the second prints `Warehouse`.

## Corresponding iOS API

`+[CNLabeledValue localizedStringForLabel:]`.

## See also

- [The raw text of labels](../cn-labeled-value.md#the-raw-text-of-labels)
- [Installing `@nacrejs/contacts`](../contacts.md#installation)
