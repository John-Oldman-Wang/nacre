---
type: reference
native: WKWebsiteDataStore.isPersistent
---

# `Session`: `isPersistent()` method

The **`isPersistent()`** method returns whether this partition's data survives an app restart.

## Syntax

```
isPersistent()
```

### Parameters

None.

### Return value

A boolean.

- `true`: the default partition, and partitions starting with `persist:`. Data is stored on disk and survives an app restart.
- `false`: partitions without `persist:`. Data is in memory only and is gone after the app restarts.

### Exceptions

None.

## Examples

```js
console.log(session.defaultSession.isPersistent());
console.log(session.fromPartition('persist:shop').isPersistent());
console.log(session.fromPartition('guest').isPersistent());
```

**Result**: It prints `true`, `true`, then `false`.

## Differences from Electron

Same.

The corresponding iOS API is `WKWebsiteDataStore.isPersistent`.

## See also

- [Partitions](../session.md#partitions)
