# Measuring how long code takes

This guide shows how to use [`performance.now()`](../api/performance/now.md) to measure how long a piece of code, a request, or a timer actually takes, and when to use `Date.now()` instead. The details are on the [`Performance`](../api/performance.md) reference page.

## Recommended approach

**Use `performance.now()` to measure durations and `Date.now()` for dates.** Both return milliseconds, but they serve different purposes:

| Task | Use | Why |
| --- | --- | --- |
| Measure how long code, a request, or an animation takes | `performance.now()` | Its readings never decrease and have fractional parts. `Date.now()` is only precise to the millisecond, and when the system time is changed or corrected, the difference between two readings can be wrong, even negative |
| Know the current time, timestamp data, compare with server time | `Date.now()` | It is a date. `performance.now()` starts from 0 on every launch, so readings from different launches cannot be compared |
| Know how long the app stayed in the background | `Date.now()` | Whether `performance.now()` keeps increasing while the app is suspended has not been verified |

## First example

The code below measures how long a loop takes. It needs no UI and runs as-is at the top level of `main.js`.

```js
const started = performance.now();

let sum = 0;
for (let i = 0; i < 100000; i++) {
  sum += i;
}

const elapsed = performance.now() - started;
console.log('Loop took ' + elapsed.toFixed(3) + ' ms');
```

**Result**: the console logs one line, such as `Loop took 1.234 ms`. The exact number depends on the device.

The technique is to read `now()` once at the start and once at the end, and subtract.

When the code being measured is so short that it takes about as long as one call to `now()` (about 1 microsecond), run it many times, measure the total, and divide by the count.

## Measuring an asynchronous operation

```js
const requestStarted = performance.now();
fetch('https://example.com/').then(() => {
  const took = performance.now() - requestStarted;
  console.log('Request took ' + Math.round(took) + ' ms');
});
```

**Result**: when the request completes, logs one line, such as `Request took 320 ms`. **This example is not verified in the simulator.**

## Measuring how long a timer actually waited

A [timer](../api/timers.md)'s delay is a minimum; the actual wait can be longer. Measure the actual value with `now()`:

```js
const queuedAt = performance.now();
setTimeout(() => {
  const waited = performance.now() - queuedAt;
  console.log('Actually waited ' + waited.toFixed(1) + ' ms');
}, 50);
```

**Result**: logs one line, such as `Actually waited 51.8 ms`. The number is never less than 50 (verified by testing).

## Knowing how long the app has been running

The zero point of `now()` is the moment the runtime started, before any JS runs. So reading it directly tells you how long the app's JS environment has been running.

```js
console.log('Running for ' + Math.round(performance.now()) + ' ms');
```

**Result**: logs one line, such as `Running for 85 ms`.

## Converting a reading to a date

A `now()` reading is not a date. To get a date, add [`timeOrigin`](../api/performance/timeorigin.md):

```js
const date = new Date(performance.timeOrigin + performance.now());
console.log(date.toISOString());
```

**Result**: logs the current moment, such as `2026-11-12T01:23:45.678Z`. It differs from `new Date()` by less than 50 ms (verified by testing).

If you just need the current date, use `new Date()` directly. This conversion is for when you already have a set of `now()` readings and later need to know what time each one corresponds to.

## See also

- [`Performance`](../api/performance.md): details of `now()` and `timeOrigin`
- [Timers](../api/timers.md): the delay is a minimum
