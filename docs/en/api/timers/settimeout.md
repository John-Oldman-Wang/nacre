---
type: reference
---

# `setTimeout()` global function

The **`setTimeout()`** global function runs a callback once after the given delay.

## Syntax

```
setTimeout(handler)
setTimeout(handler, delay)
setTimeout(handler, delay, ...args)
```

### Parameters

**`handler`**

The function to run once the delay is up. A string of code isn't accepted.

**`delay`** <small>optional</small>

The delay, in milliseconds; fractions are allowed. Defaults to 0.

- The delay is a minimum: the callback never runs earlier than it, but may run later; see [The delay is a minimum, not an exact time](../timers.md#the-delay-is-a-minimum-not-an-exact-time).
- There is no minimum value. `0` means "run as soon as possible after the current code ends", and isn't lengthened to some fixed number of milliseconds, even when deeply nested.
- Negative numbers, `NaN`, omitting it, and values that can't be converted to a number (such as `'abc'`) all equal 0. A string such as `'100'` is converted to 100.

**`...args`** <small>optional</small>

Arguments passed unchanged to `handler`.

### Return value

A number, this timer's ID: an increasing integer starting from 1. Pass it to [`clearTimeout()`](cleartimeout.md).

### Exceptions

**`TypeError`**

`handler` isn't a function: `setTimeout: the first argument must be a function`. Passing a string of code also throws this.

## Description

- Timers with the same delay run in the order they were registered.
- `queueMicrotask()` and `Promise` callbacks run before `setTimeout(fn, 0)`.
- Calling `setTimeout(fn, 0)` again inside a timer callback puts the new callback in the next turn, and in between the interface gets a chance to refresh and respond to touches.
- When a callback runs for more than 50 milliseconds, the console prints a warning; see [Callbacks that run too long](../timers.md#callbacks-that-run-too-long).
- Exceptions thrown in the callback are reported by the `error` event on [`application`](../application.md), and other timers run as usual.

## Examples

### Running once after a delay

```js
setTimeout(() => {
  console.log('1 second has passed');
}, 1000);
```

**Result**: After at least 1000 milliseconds, the console prints a line.

### Passing arguments to the callback

```js
setTimeout((a, b) => {
  console.log(a + b);
}, 0, 'passed ', 'through');
```

**Result**: Prints `passed through`.

### Order with the same delay

```js
setTimeout(() => console.log('A'), 10);
setTimeout(() => console.log('B'), 10);
```

**Result**: Prints `A` first, then `B`.

## Differences from the web

- Deeply nested `setTimeout(fn, 0)`: browsers lengthen the delay to at least 4 milliseconds; here it isn't lengthened.
- A string of code as the first argument: browsers run the string as code; here it throws `TypeError`.
- The return value is a number, not Node's `Timeout` object; there are no methods like `unref()`.
- When a single callback runs for more than 50 milliseconds, a warning is printed to the console here; browsers give no indication.
- After the app goes to the background, the system suspends it and callbacks don't run; browsers throttle them instead. **Not verified in the simulator.**

## See also

- [`clearTimeout()`](cleartimeout.md): cancel it
- [`setInterval()`](setinterval.md): run repeatedly
- [Waiting a period with `await`](../../guides/timers.md#waiting-with-await)
