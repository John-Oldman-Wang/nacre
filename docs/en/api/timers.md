---
type: reference
status: partial
---

# Timers

**Timers** are a set of global functions for running a callback after a period of time, or repeatedly at an interval. [`setTimeout()`](timers/settimeout.md) runs a callback once after the given delay; [`setInterval()`](timers/setinterval.md) runs a callback at regular intervals until canceled; [`clearTimeout()`](timers/cleartimeout.md) and [`clearInterval()`](timers/clearinterval.md) cancel callbacks that haven't run yet; [`queueMicrotask()`](timers/queuemicrotask.md) schedules a callback to run right after the current piece of code ends, without any timing.

These five functions are available at any time, including at the top level of a script. Delays are in milliseconds.

For delaying execution, polling, and waiting for a period with `await`, see the guide [Delaying and repeating code](../guides/timers.md).

## Functions

| Function | Description |
| --- | --- |
| [`setTimeout()`](timers/settimeout.md) | Runs a callback once after a delay; returns the timer's ID |
| [`setInterval()`](timers/setinterval.md) | Runs a callback at regular intervals; returns the timer's ID |
| [`clearTimeout()`](timers/cleartimeout.md) | Cancels a timer |
| [`clearInterval()`](timers/clearinterval.md) | Cancels a timer. Interchangeable with `clearTimeout()` |
| [`queueMicrotask()`](timers/queuemicrotask.md) | Runs a callback right after the current piece of code ends |

## The delay is a minimum, not an exact time

A callback never runs earlier than the given delay, but it may run later. JS and the interface share one thread (see [How the runtime works](how-it-works.md)); once the delay is up, the callback has to wait for the JS currently running and the interface's layout and drawing to finish before its turn.

- **There is no minimum delay.** `setTimeout(fn, 0)` means "run as soon as possible after the current code ends", and isn't lengthened to some fixed number of milliseconds.
- **How long it actually waits depends on how busy things are.** Measured during app launch, `setTimeout(fn, 0)` waited 253 milliseconds before running: during that time the system was doing the first layout, loading fonts, and drawing the first frame. `setTimeout(fn, 50)` was measured at no less than 50 milliseconds.
- **A delay that isn't a number is treated as 0.** Negative numbers, `NaN`, omitting it, and values that can't be converted to a number (such as `'abc'`) all equal 0. A string such as `'100'` is converted to 100.

So don't use a fixed delay to wait for something else to finish. To wait for something, listen for its event, or check at intervals; see [Waiting for a condition](../guides/timers.md#waiting-for-a-condition).

To know how much time actually passed, measure with [`performance.now()`](performance/now.md).

## The order callbacks run in

- **Timers with the same delay run in the order they were registered.** The one whose `setTimeout()` was called first runs first.
- **`queueMicrotask()` and `Promise` callbacks run before any timer.** They run right after the current piece of code ends; `setTimeout(fn, 0)` comes after them.
- **Timers registered inside a callback wait for the next turn.** Calling `setTimeout(fn, 0)` again inside a timer callback doesn't run the new callback immediately afterward; it goes to the next turn, and in between the interface gets a chance to refresh and respond to touches. So a callback that repeatedly registers a 0 ms timer for itself doesn't make the interface stop responding.
- **There is no fixed order between timers and system events.** Between `setTimeout(fn, 0)` and a system event happening at the same moment (such as a window's `becomekey`), both orders have been observed in testing. To guarantee an order, do the later step in the event's callback; don't rely on timers to sequence them.

## Callbacks that run too long

A callback runs continuously from start to finish; the runtime doesn't interrupt it midway. During that time the screen doesn't refresh and touches aren't handled.

When a single callback runs for more than 50 milliseconds, the runtime prints a warning to the console with the actual number of milliseconds:

```
Timer callback blocked the main thread for 83 ms; this frame will drop
```

The callback still runs to completion; the warning only makes the problem visible. When you see it, split the work in that callback into several chunks, each in its own `setTimeout(fn, 0)`; see [How the runtime works](how-it-works.md) for how.

When many timers are due at the same moment, the runtime stops after running callbacks for a total of about 8 milliseconds and pushes the remaining due callbacks to the next turn, so the interface can refresh in between. This limit is checked only between two callbacks; it can't control how long a single callback runs.

## Exceptions thrown in callbacks

When a timer callback throws, the app doesn't exit and other timers run as usual. After a `setInterval()` callback throws, the next run still happens on time.

The exception is reported by the `error` event on [`application`](application.md). If no listener cancels it, the console prints an error log starting with `Uncaught`. `queueMicrotask()` callbacks are the exception; see [`queueMicrotask()`](timers/queuemicrotask.md).

## After the app goes into the background

Shortly after the app goes to the background, the system suspends it; while suspended, JS doesn't run and timer callbacks don't run either. After returning to the foreground, how timers whose time has passed run (immediately making up one run, or restarting the count) is **not verified in the simulator**. "It is suspended in the background" comes from iOS's definition and is also **not verified in the simulator**.

When you need to know how long the app stayed in the background, don't count with `setInterval()`. In `application`'s `background` event, record the time with `Date.now()`, read it again when returning to the foreground, and subtract.

## Examples

The code below implements a countdown: it prints the remaining seconds once per second and stops at 0. It needs no interface and runs when written directly at the top level of `main.js`.

```js
// 1. Compute the remaining time from the clock, not from the number of callbacks
const total = 5000;                       // milliseconds
const startedAt = performance.now();

// 2. Check once per second
const timer = setInterval(() => {
  const left = total - (performance.now() - startedAt);

  if (left <= 0) {
    // 3. Time's up; stop the timer
    clearInterval(timer);
    console.log('time is up');
    return;
  }
  console.log(Math.ceil(left / 1000) + ' seconds left');
}, 1000);
```

**Result**: The console prints a line about every second, counting down from `4 seconds left`, and finally prints `time is up`, after which nothing more is printed. The interval between lines isn't guaranteed to be exactly 1000 milliseconds.

This code has not been run as a whole in the simulator. Every API it uses has been run in the acceptance tests.

## Differences from the web

These five functions have the same names and parameters as in the browser. The differences in behavior are listed below.

| Situation | Browser | Here |
| --- | --- | --- |
| Return value | A number | A number. Not Node's `Timeout` object; there are no methods like `unref()` |
| Deeply nested `setTimeout(fn, 0)` | The delay is lengthened to at least 4 milliseconds | Not lengthened |
| `setInterval(fn, 0)` | Repeats, with the interval lengthened to at least 4 milliseconds (1 millisecond in Node) | Repeats, with the interval not lengthened: it goes back to the queue after each callback |
| `setTimeout('code string', 0)` | Runs the string as code | Throws `TypeError` |
| When the page is in the background | Timers are throttled | The app is suspended by the system and timers don't run. **Not verified in the simulator** |
| A single callback running too long | No indication | Over 50 milliseconds prints a warning to the console |
| An exception thrown in a `queueMicrotask()` callback | Reported by the `error` event | Reported by the `unhandledrejection` event |
| `requestAnimationFrame` | Available | Not available. Use [`CADisplayLink`](ca-animation.md) |

## See also

- [Delaying and repeating code](../guides/timers.md): delaying execution, polling, waiting a period with `await`, waiting for a condition
- [`performance`](performance.md): measure how much time actually passed
- [`CADisplayLink`](ca-animation.md): a per-frame callback synchronized with the screen refresh
- [`application`](application.md): the `error` event reports exceptions in callbacks; the `background` and `foreground` events
- [How the runtime works](how-it-works.md): JS and the interface on the same thread, and how to split up heavy computation
