# Delaying and repeating code

This guide covers how to use [timers](../api/timers.md) to run code after a delay, run code repeatedly, wait for a while in an `async` function, and wait for a condition to become true. The details of each function are on the [Timers](../api/timers.md) reference page.

## Recommended approach

- **For periodic tasks, use `setInterval()` when the callback does only synchronous work, and chained `setTimeout()` when the callback waits for an asynchronous result.** `setInterval()` runs when the time comes, regardless of whether the asynchronous operation started by the previous callback has finished. If the callback makes a network request and the request is slower than the interval, several requests end up in flight at once. The chained pattern waits until the previous run finishes before scheduling the next; see [Running an asynchronous task periodically](#running-an-asynchronous-task-periodically).
- **Don't use a fixed delay to wait for something else to finish.** A delay is a lower bound; how long it actually takes depends on how busy things are: measured during app launch, `setTimeout(fn, 0)` waited 253 milliseconds before running. To wait for something, listen for its event, or check periodically; see [Waiting for a condition](#waiting-for-a-condition).
- **Don't use timers for animation.** Timer callbacks aren't synchronized with screen refreshes. For content that updates every frame, use [`CADisplayLink`](../api/ca-animation.md), which calls back once per frame.
- **Don't measure time by counting timer firings.** `setInterval(fn, 1000)` running 60 times doesn't mean 60 seconds have passed. Read [`performance.now()`](../api/performance/now.md) twice and subtract.
- **Don't count with `setInterval()` to work out how long the app stayed in the background.** The system suspends the app in the background, and timers don't run. Record the time with `Date.now()` in the `background` event of [`application`](../api/application.md), read it again when returning to the foreground, and subtract.

## First example

The following code builds a countdown: it prints the remaining seconds once a second and stops when it reaches 0. It needs no UI and runs directly at the top level of `main.js`.

```js
// 1. Compute the remaining time from the clock, not from the number of callbacks
const total = 5000;                       // milliseconds
const startedAt = performance.now();

// 2. Check once a second
const timer = setInterval(() => {
  const left = total - (performance.now() - startedAt);

  if (left <= 0) {
    // 3. Time's up; stop the timer
    clearInterval(timer);
    console.log('Time is up');
    return;
  }
  console.log(Math.ceil(left / 1000) + ' seconds left');
}, 1000);
```

**Result**: the console prints a line roughly every second, counting down from `4 seconds left`, and finally prints `Time is up`, after which nothing more is printed. The interval between lines isn't guaranteed to be exactly 1000 milliseconds.

This code hasn't been run as a whole in the simulator. Every API it uses has been run in the acceptance tests.

## Running once after a delay

```js
setTimeout(() => {
  console.log('1 second has passed');
}, 1000);
```

**Result**: after at least 1000 milliseconds, the console prints one line.

## Canceling a callback that hasn't run yet

```js
const pending = setTimeout(() => {
  console.log('Never printed');
}, 1000);

clearTimeout(pending);
clearTimeout(pending);
```

**Result**: nothing is printed. Canceling more than once, or canceling a timer that has already run, doesn't throw.

## Repeating, and stopping from inside the callback

```js
let count = 0;
const repeating = setInterval(() => {
  count += 1;
  console.log('Run ' + count);
  if (count >= 3) clearInterval(repeating);
}, 100);
```

**Result**: prints `Run 1`, `Run 2`, `Run 3`, then stops.

## Passing arguments to the callback

```js
setTimeout((a, b) => {
  console.log(a + b);
}, 0, 'pass', 'through');
```

**Result**: prints `passthrough`. Arguments after the delay are passed to the callback unchanged.

## Waiting with `await`

Timers are callback-based. To wait in an `async` function, wrap one in a `Promise`:

```js
/** @param {number} ms */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log('Start');
  await sleep(500);
  console.log('500 milliseconds later');
}
run();
```

**Result**: prints `Start` first, then `500 milliseconds later` after at least 500 milliseconds.

## Running an asynchronous task periodically

Wait until the previous run finishes, then schedule the next:

```js
/** @type {number | undefined} */
let pollTimer;

async function poll() {
  try {
    const res = await fetch('https://example.com/status');
    console.log('Status', res.status);
  } catch (err) {
    console.log('Failed this time');
  }
  // After the previous run ends, wait 5 seconds before starting the next
  pollTimer = setTimeout(poll, 5000);
}
poll();

// When no longer needed
function stopPolling() {
  clearTimeout(pollTimer);
}
```

**Result**: each request is sent 5000 milliseconds after the previous one ends, so at most one request is in flight at any time. After `stopPolling()` is called, no more are sent. **This code is not verified in the simulator.**

## Waiting for a condition

When you don't know when something will finish and it has no event to listen for, check periodically and set a deadline for giving up:

```js
/**
 * @param {() => boolean} ready
 * @param {number} timeoutMs
 * @returns {Promise<boolean>}
 */
function waitUntil(ready, timeoutMs) {
  const deadline = performance.now() + timeoutMs;
  return new Promise((resolve) => {
    function check() {
      if (ready()) { resolve(true); return; }
      if (performance.now() >= deadline) { resolve(false); return; }
      setTimeout(check, 50);
    }
    check();
  });
}

let loaded = false;
setTimeout(() => { loaded = true; }, 300);

waitUntil(() => loaded, 5000).then((ok) => {
  console.log(ok ? 'Ready' : 'Timed out');
});
```

**Result**: prints `Ready` after about 300 milliseconds. If the condition stays false for 5000 milliseconds, prints `Timed out`. **This example is not verified in the simulator.**

Give the check interval a real value (50 milliseconds here). A `setInterval()` with an interval of 0 keeps the main thread busy all the time; see [`setInterval()`](../api/timers/setinterval.md#description).

## Seeing the order of different callbacks

```js
setTimeout(() => console.log('setTimeout'), 0);
Promise.resolve().then(() => console.log('Promise'));
queueMicrotask(() => console.log('queueMicrotask'));
console.log('sync');
```

**Result**: prints `sync`, `Promise`, `queueMicrotask`, and `setTimeout`, in that order.

Whether `setTimeout(fn, 0)` or a system event happening at the same moment arrives first has been observed both ways in testing. To guarantee order, do the later step in the event's callback rather than relying on a timer to sequence it.

## See also

- [Timers](../api/timers.md): the five functions and their execution rules
- [`performance`](../api/performance.md): measuring how much time actually passed
- [`CADisplayLink`](../api/ca-animation.md): per-frame callbacks synchronized with screen refreshes
- [How the runtime works](../api/how-it-works.md): how to split up heavy computation so the UI doesn't freeze
