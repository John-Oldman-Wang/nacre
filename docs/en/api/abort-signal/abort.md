---
type: reference
web: AbortSignal.abort()
---

# `AbortSignal.abort()` static method

The **`AbortSignal.abort()`** static method returns an `AbortSignal` that is already in the aborted state.

## Syntax

```
AbortSignal.abort()
AbortSignal.abort(reason)
```

### Parameters

**`reason`**

The reason for aborting, any value, optional. If not given, it is a [`DOMException`](../dom-exception.md) whose `name` is `'AbortError'`, whose `code` is 20, and whose `message` is `The operation was aborted`.

### Return value

A new `AbortSignal` whose [`aborted`](aborted.md) is `true` and whose [`reason`](reason.md) is the given reason.

### Exceptions

None.

## Description

Pass it to `fetch()` and the request is canceled immediately; the `Promise` is rejected with `reason`.

## Examples

```js
async function main() {
  try {
    await fetch('https://httpbin.org/get', { signal: AbortSignal.abort('not sending') });
  } catch (err) {
    console.log(err);
  }
}
main();
```

**Result**: Prints `not sending`.

## Differences from the web

Same as the web.

## See also

- [`AbortSignal.timeout()`](timeout.md)
