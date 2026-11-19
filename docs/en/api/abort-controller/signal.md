---
type: reference
web: AbortController.signal
---

# `AbortController`: `signal` property

The **`signal`** property is the [`AbortSignal`](../abort-signal.md) corresponding to this controller. Hand it to `fetch()`, and calling [`abort()`](abort.md) cancels the request.

## Value

An [`AbortSignal`](../abort-signal.md).

- Read-only; assigning to it throws `TypeError`.
- Every read returns the same object.

## Examples

```js
async function main() {
  const controller = new AbortController();
  const promise = fetch('https://httpbin.org/delay/5', { signal: controller.signal });
  setTimeout(() => controller.abort(), 200);
  try {
    await promise;
  } catch (err) {
    console.log(err instanceof Error ? err.name : err);
  }
}
main();
```

**Result**: Prints `AbortError` after 200 milliseconds. The request is actually canceled and no longer uses the network.

## Differences from the web

The same as on the web.

## See also

- [`AbortSignal`](../abort-signal.md)
