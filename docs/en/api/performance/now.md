---
type: reference
---

# `Performance`: `now()` method

The **`now()`** method returns the number of milliseconds elapsed from runtime startup to now.

## Syntax

```
performance.now()
```

### Parameters

None.

### Return value

A number in milliseconds, with a fractional part, such as `85.3271`.

- Zero is the moment the runtime starts, before the first line of `main.js`. It starts again from 0 every time the app launches.
- Readings only increase. Across 1000 consecutive reads, none was smaller than the previous one (measured).
- Readings aren't affected by changes to the system time.
- Readings aren't rounded to milliseconds (measured). One read takes about 1 microsecond (measured).
- Use it only to compute the difference between two readings. A single reading has no meaning as a date; to convert it to a date, add [`timeOrigin`](timeorigin.md).
- Whether readings keep increasing while the device sleeps or the app is suspended by the system is **not verified in the simulator**.

### Exceptions

None.

## Examples

### Measuring a piece of code

```js
const started = performance.now();
let sum = 0;
for (let i = 0; i < 100000; i++) {
  sum += i;
}
console.log('Loop took ' + (performance.now() - started).toFixed(3) + ' ms');
```

**Result**: Prints one line like `Loop took 1.234 ms`. The exact number depends on the device.

### Finding out how long the app has been running

```js
console.log('Running for ' + Math.round(performance.now()) + ' ms');
```

**Result**: Prints one line like `Running for 85 ms`.

## Differences from the web

- Readings aren't rounded. Browsers usually round to 0.1 ms or coarser.
- Zero is the moment the runtime starts. In browsers it's the moment the page starts loading.

## See also

- [`timeOrigin`](timeorigin.md): the moment corresponding to zero
- [Measuring how long code takes](../../guides/measure-time.md)
