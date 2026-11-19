---
type: reference
---

# `Intl.DateTimeFormat`: `resolvedOptions()` method

The **`resolvedOptions()`** method returns the locale, calendar, numbering system, time zone, and fields this formatter actually uses.

## Syntax

```
resolvedOptions()
```

### Parameters

None.

### Return value

A new plain object. Changing it doesn't affect formatting.

- The members are, in order, `locale`, `calendar`, `numberingSystem`, and `timeZone`; when there is an hour, also `hourCycle` and `hour12`; then the individual fields, or `dateStyle` and `timeStyle`.
- **The fields report how the result is actually written, which isn't necessarily the option you wrote.** In `en-US`, with `hour: 'numeric', hour12: false`, the `hour` read back is `'2-digit'`, because this locale writes the 24-hour clock with two digits.
- When `timeZone` is not given, `timeZone` is the device's current time zone.

### Exceptions

**`TypeError`**

Called on a value that isn't an `Intl.DateTimeFormat`: `Intl.DateTimeFormat.prototype.resolvedOptions called on a value that is not an Intl.DateTimeFormat`.

## Examples

### Reading back the options

```js
const clock = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'utc' });
const resolved = clock.resolvedOptions();
console.log(resolved.timeZone, resolved.hourCycle, resolved.hour12);
```

**Result**: the console prints `UTC h12 true`.

### The device's current time zone

```js
console.log(new Intl.DateTimeFormat().resolvedOptions().timeZone);
```

**Result**: prints the name of the device's current time zone, such as `Asia/Shanghai`.

## Differences from the web

Same as on the web.

## See also

- [Constructor](constructor.md)
