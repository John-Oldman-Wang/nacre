---
type: reference
native: WKWebsiteDataStore.defaultDataStore
---

# `session.defaultSession` static property

The **`session.defaultSession`** property is the [`Session`](../session.md) of the default partition. All web pages created without `partition` share this partition.

## Value

A [`Session`](../session.md).

- Read-only. The `session` object is frozen, so assigning to it has no effect: in strict mode it throws `TypeError`.
- Every read returns the same object; `session.defaultSession === session.defaultSession` holds.
- It is the same object as `session.fromPartition('')` and `session.fromPartition('persist:')`.
- The default partition's data survives an app restart; [`isPersistent()`](ispersistent.md) returns `true`.

It works without creating a web page first.

## Examples

```js
const ses = session.defaultSession;
console.log(ses === session.fromPartition(''));
console.log(ses.isPersistent());
```

**Result**: It prints `true`, then `true`.

## Differences from Electron

`session` is a global object; no `require('electron')` is needed. Everything else is the same.

The corresponding iOS API is `WKWebsiteDataStore.defaultDataStore`.

## See also

- [`session.fromPartition()`](frompartition.md): other partitions
- [Partitions](../session.md#partitions): how the kinds of partitions differ
