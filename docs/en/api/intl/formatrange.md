---
type: reference
---

# `Intl.NumberFormat`: `formatRange()` method

In the standard, the **`formatRange()`** method writes a range, such as "3–5". Here, calling it throws `TypeError`.

## Syntax

```
formatRange(start, end)
```

### Parameters

The parameters defined by the standard. Here the parameters aren't read; it throws immediately.

### Return value

None. It always throws.

### Exceptions

**`TypeError`**

`Intl.NumberFormat.prototype.formatRange is not supported by this runtime`.

## Examples

```js
try {
  new Intl.NumberFormat('en-US').formatRange(1234.5, 2000);
} catch (err) {
  console.log(String(err));
}
```

**Result**: prints `TypeError: Intl.NumberFormat.prototype.formatRange is not supported by this runtime`.

## Differences from the web

Browsers have this method; here, calling it throws `TypeError`. The method itself exists, so `typeof` can't tell whether it's usable.

## See also

- [`format()`](format.md)
