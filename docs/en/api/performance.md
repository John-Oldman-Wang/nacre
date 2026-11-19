---
type: reference
status: partial
---

# `Performance`

**`Performance`** represents a clock used only to measure durations. Its only instance is the global object `performance`. [`performance.now()`](performance/now.md) returns the number of milliseconds elapsed from runtime startup to now; read it at two moments and subtract to get the time in between.

`performance` exists from app launch and can be used at any time, including at the top level of a script.

For how to measure how long a piece of code or a request takes, and how to choose between it and `Date.now()`, see the guide [Measuring how long code takes](../guides/measure-time.md).

**Inheritance**: `Performance`

## Constructor

It can't be created with `new`: `new Performance()` throws `TypeError: Illegal constructor`. The `Performance` class exists so that `performance instanceof Performance` holds. The only instance is the global `performance`.

## Instance properties

| Property | Description |
| --- | --- |
| [`timeOrigin`](performance/timeorigin.md) <small>read-only</small> | The moment corresponding to zero for `now()`, as a Unix timestamp in milliseconds |

## Instance methods

| Method | Description |
| --- | --- |
| [`now()`](performance/now.md) | Milliseconds elapsed from runtime startup to now, with a fractional part |
| [`toJSON()`](performance/tojson.md) | Returns `{ timeOrigin }` |

## What the reading is

A reading from `now()` is a number of milliseconds with a fractional part, such as `85.3271`.

- **Zero is the moment the runtime starts.** That's before the first line of `main.js`, so the first value read at the top level of `main.js` is already greater than 0. It starts again from 0 every time the app launches.
- **Readings only increase.** Changing the system time, or the system adjusting its clock automatically, doesn't affect it. Across 1000 consecutive reads, none was smaller than the previous one (measured).
- **A reading isn't a date.** A single reading only tells you how long it's been since startup. To convert it to a date, add `performance.timeOrigin`.
- **Precision is finer than 1 millisecond.** Readings have a fractional part and aren't rounded to milliseconds (measured). One read takes about 1 microsecond (measured), so the shortest measurable time is on the order of microseconds; smaller differences are meaningless.

Whether readings keep increasing while the device sleeps or the app is suspended by the system is **not verified in the simulator**.

## Examples

The following code measures how long a loop takes. It needs no UI and runs when written at the top level of `main.js`.

```js
const started = performance.now();

let sum = 0;
for (let i = 0; i < 100000; i++) {
  sum += i;
}

const elapsed = performance.now() - started;
console.log('Loop took ' + elapsed.toFixed(3) + ' ms');
```

**Result**: The console prints one line like `Loop took 1.234 ms`. The exact number depends on the device.

## Differences from the web

The names and units of `performance.now()` and `performance.timeOrigin` are the same as in browsers. The differences are listed below.

| Case | Browser | Here |
| --- | --- | --- |
| Reading precision | Rounded, usually to 0.1 ms or coarser | Not rounded |
| Zero | The moment the page starts loading | The moment the runtime starts |
| `mark()`, `measure()`, `getEntries()`, `PerformanceObserver` | Available | Not available |

## See also

- [Measuring how long code takes](../guides/measure-time.md): measuring sync code, async operations, and the actual delay of timers; choosing between it and `Date.now()`
- [Timers](timers.md): the delay of `setTimeout()` is a lower bound; measure the actual elapsed time with `performance.now()`
- [How the runtime works](how-it-works.md): which global objects exist
