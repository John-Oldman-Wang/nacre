---
type: reference
---

# `Intl.NumberFormat`: `formatToParts()` method

In the standard, the **`formatToParts()`** method splits the formatted result into parts such as the integer, the fraction, and the currency symbol. Here, calling it throws `TypeError`.

## Syntax

```
formatToParts(value)
```

### Parameters

The parameters defined by the standard. Here the parameters aren't read; it throws immediately.

### Return value

None. It always throws.

### Exceptions

**`TypeError`**

`Intl.NumberFormat.prototype.formatToParts is not supported by this runtime`.

## Examples

```js
try {
  new Intl.NumberFormat('en-US').formatToParts(1234.5);
} catch (err) {
  console.log(String(err));
}
```

**Result**: prints `TypeError: Intl.NumberFormat.prototype.formatToParts is not supported by this runtime`.

## Differences from the web

Browsers have this method; here, calling it throws `TypeError`. The method itself exists, so `typeof` can't tell whether it's usable.

## See also

- [`format()`](format.md)
