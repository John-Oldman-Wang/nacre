---
type: reference
native: NSLocale.collationIdentifier
---

# `NSLocale`: `collationIdentifier` property

The **`collationIdentifier`** property is the rule set this locale uses for sorting text.

## Value

A string or `null`, such as `'phonebook'`.

- Read-only. Assigning to it throws `TypeError`, and the value stays unchanged.
- A collation specified in the identifier with `@collation=` takes precedence: `new NSLocale('de_DE@collation=phonebook')` reads `'phonebook'`.
- Without one, it reads `'standard'` (measured), not `null`. When it is `null` is **not verified in the simulator**.

## Examples

```js
console.log(new NSLocale('de_DE@collation=phonebook').collationIdentifier);
```

**Result**: prints `phonebook`.

## Corresponding iOS API

`NSLocale.collationIdentifier`.

## See also

- [`NSLocale`](../ns-locale.md)
- [`localizedStringForCollationIdentifier()`](localizedstringforcollationidentifier.md)
