---
type: reference
---

# `Intl.DateTimeFormat`: `formatRangeToParts()` method

In the standard, the **`formatRangeToParts()`** method splits the result for a time range into pieces and says whether each piece belongs to the start or the end. It is not available here yet: calling it throws `TypeError`.

## Syntax

```
formatRangeToParts(startDate, endDate)
```

### Parameters

The parameters defined by the standard. They are not read here; the method throws immediately.

### Return value

None. It always throws.

### Exceptions

**`TypeError`**

`Intl.DateTimeFormat.prototype.formatRangeToParts is not supported by this runtime`.

## Examples

```js
try {
  new Intl.DateTimeFormat('en-US').formatRangeToParts(0, 86400000);
} catch (err) {
  console.log(String(err));
}
```

**Result**: prints `TypeError: Intl.DateTimeFormat.prototype.formatRangeToParts is not supported by this runtime`.

## Differences from the web

Browsers have this method; here, calling it throws `TypeError`. The method itself exists, so `typeof` can't tell whether it is usable.

## See also

- [`formatRange()`](formatrange.md)
