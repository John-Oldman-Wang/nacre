---
type: reference
native: NSError
---

# `NSError`: `name` property

The **`name`** property is the error's category name.

## Value

A string.

- Read-only. Assigning to it throws `TypeError`, and the value doesn't change.
- When the meaning of the failure is specific to iOS and the runtime gives it a category, it's the category name, such as `'BiometryLockoutError'` from [`LAContext`](../la-context.md#reasons-authentication-failed) or `'LocationUnknownError'` from [`CLLocationManager`](../cl-location-error/name.md).
- When there's no category to give, it's `'NSError'`; tell errors apart by [`domain`](domain.md) and [`code`](code.md).
- On the `cause` of a [`DOMException`](../dom-exception.md), it's always `'NSError'`. The category is the outer `DOMException`'s `name`.

## Examples

```js
/// <reference types="@nacrejs/types" />

async function main() {
  const fs = application.fileSystem;
  try {
    await fs.readText(fs.documents + '/missing.txt');
  } catch (err) {
    const cause = err instanceof Error ? err.cause : undefined;
    if (cause instanceof NSError) {
      console.log(err.name, cause.name);
    }
  }
}
main();
```

**Result**: Prints `NotFoundError NSError` (measured).

## Corresponding iOS API

No direct equivalent. In ObjC you check `error.domain` and `error.code`; the runtime gives names to the common combinations.

## See also

- [`domain`](domain.md), [`code`](code.md)
- [APIs that give an NSError](../ns-error.md#apis-that-give-an-nserror)
