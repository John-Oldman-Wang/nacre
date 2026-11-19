---
type: reference
---

# `setInterval()` global function

The **`setInterval()`** global function runs a callback at regular intervals until it is canceled.

## Syntax

```
setInterval(handler)
setInterval(handler, delay)
setInterval(handler, delay, ...args)
```

### Parameters

**`handler`**

The function to run each time. A string of code isn't accepted.

**`delay`** <small>optional</small>

The interval, in milliseconds; fractions are allowed. Defaults to 0. Negative numbers, `NaN`, omitting it, and values that can't be converted to a number all equal 0.

**`...args`** <small>optional</small>

Arguments passed unchanged to `handler` each time.

### Return value

A number, this timer's ID: an increasing integer starting from 1. Pass it to [`clearInterval()`](clearinterval.md).

### Exceptions

**`TypeError`**

`handler` isn't a function: `setInterval: the first argument must be a function`.

## Description

**Rhythm**: The time of the next run is computed as "the time the previous run should have happened plus the interval", so the time the callback itself takes doesn't make the rhythm drift later. When it falls behind by more than one interval (for example, because of a long stretch of JS before it), it doesn't run the missed runs back to back; instead it restarts the count from the current time.

**Callbacks that throw**: The next run still happens on time. The exception is reported by the `error` event on [`application`](../application.md).

**Doesn't wait for the previous asynchronous operation**: It runs when the time comes, whether or not an asynchronous operation started by the previous callback has finished. When the callback needs to wait for an asynchronous result, use chained `setTimeout()` calls; see [Running an asynchronous task periodically](../../guides/timers.md#running-an-asynchronous-task-periodically).

**An interval of 0**: Still repeats. When `delay` is 0, omitted, or a value treated as 0, after each run the callback goes back to the end of the queue and runs again after the events and interface refreshes ahead of it are handled. There is no minimum interval; it isn't lengthened to some fixed number of milliseconds.

> **Note:** A `setInterval()` with an interval of 0 keeps the main thread running until it is canceled with `clearInterval()`; in the simulator it runs about 190,000 to 290,000 callbacks per second. It doesn't freeze the interface: the interface refreshes as usual, buttons can be tapped, and system light/dark switch events still arrive. These conclusions are **not verified on a device**. To run once per frame, use [`CADisplayLink`](../ca-animation.md); to wait for a condition, give a real interval; see [Waiting for a condition](../../guides/timers.md#waiting-for-a-condition).

## Examples

```js
let count = 0;
const id = setInterval(() => {
  count += 1;
  console.log('run ' + count);
  if (count >= 3) clearInterval(id);
}, 100);
```

**Result**: Prints `run 1`, `run 2`, `run 3`, then stops.

## Differences from the web

- `setInterval(fn, 0)`: browsers lengthen the interval to at least 4 milliseconds (1 millisecond in Node); here it isn't lengthened, and the callback goes back to the queue after each run.
- The return value is a number, not Node's `Timeout` object.
- When a single callback runs for more than 50 milliseconds, a warning is printed to the console here.
- After the app goes to the background, the system suspends it and callbacks don't run. **Not verified in the simulator.**

## See also

- [`clearInterval()`](clearinterval.md): cancel it
- [`setTimeout()`](settimeout.md): run only once
