---
type: reference
web: AbortSignal.timeout()
---

# `AbortSignal.timeout()` static method

The **`AbortSignal.timeout()`** static method returns an `AbortSignal` that aborts automatically after the given time. Use it to set a timeout on a request.

## Syntax

```
AbortSignal.timeout(ms)
```

### Parameters

**`ms`**

How many milliseconds before aborting, a number. Converted with `Number()`; if the result isn't a number, it is treated as 0.

### Return value

A new `AbortSignal`. When the time is up it aborts, and [`reason`](reason.md) is an `Error` whose `name` is `'TimeoutError'` and whose `message` is `The operation timed out`.

### Exceptions

None.

## Description

- Timing starts from the moment `AbortSignal.timeout()` is called, not from when the request is sent.
- The time includes the time to download the content: if the time runs out after `fetch()` has returned but before the content has been read, the step that reads the content is rejected.
- When it cancels a request, the `name` of the exception thrown by `fetch()` is `'AbortError'`, not `'TimeoutError'`, the same exception you get from canceling manually.

## Examples

```js
async function main() {
  try {
    await fetch('https://httpbin.org/delay/5', { signal: AbortSignal.timeout(300) });
  } catch (err) {
    console.log(err instanceof Error ? err.name : err);
  }
}
main();
```

**Result**: After 300 milliseconds the request is canceled, and it prints `AbortError`.

## Differences from the web

- When the time is up, `fetch()` throws `AbortError`. On the web it throws `TimeoutError`.
- `reason` is an `Error` whose `name` is `'TimeoutError'`. On the web it is a `DOMException`.
- When `ms` doesn't convert to a number, it is treated as 0. On the web it throws `TypeError`. **From the code; not verified in the simulator.**

## See also

- [`AbortSignal.abort()`](abort.md)
- [Timers](../timers.md)
