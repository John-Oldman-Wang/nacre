---
type: reference
native: NSLocale.usesMetricSystem
---

# `NSLocale`: `usesMetricSystem` property

The **`usesMetricSystem`** property indicates whether this locale uses the metric system.

## Value

A boolean.

- Read-only. Assigning to it throws `TypeError`, and the value stays unchanged.
- `true`: uses the metric system (meters, kilograms, degrees Celsius). `de_DE` reads `true`.
- `false`: does not use the metric system. `en_US` reads `false`.

## Examples

```js
console.log(new NSLocale('en_US').usesMetricSystem);
```

**Result**: prints `false`.

## Corresponding iOS API

`NSLocale.usesMetricSystem`.

## See also

- [`NSLocale`](../ns-locale.md)
