---
type: reference
native: "+[WKWebsiteDataStore dataStoreForIdentifier:]"
---

# `session.fromPartition()` static method

The **`session.fromPartition()`** method returns the [`Session`](../session.md) of a partition by name. Partition names are written the same way as `webPreferences.partition` when creating a [`WebView`](../web-view.md); the same name means the same data.

## Syntax

```
session.fromPartition(partition)
```

### Parameters

**`partition`**

The partition name, a string. Non-strings are converted to strings first.

| Written as | Which data | After an app restart |
| --- | --- | --- |
| `'persist:name'` | The set for that name, stored on disk | Data is kept |
| `'name'` (without `persist:`) | The set for that name, in memory only | Data is gone |
| `''` or `'persist:'` | The default partition, same as [`session.defaultSession`](defaultsession.md) | Data is kept |

### Return value

A [`Session`](../session.md). The same partition name returns the same object every time.

### Exceptions

None.

## Examples

```js
const work = session.fromPartition('persist:work');
await work.cookies.set({ url: 'https://my.app/', name: 'token', value: 'work-token' });

const web = new WebView({ webPreferences: { partition: 'persist:work' } });
console.log(web.webContents.session === work);
console.log(work === session.fromPartition('persist:work'));
```

**Effect**

- It prints `true`, then `true`: the same partition is always the same `Session` object.
- This page's requests carry `work-token`. Pages in the default partition and in other partitions can't see this cookie.

## Differences from Electron

`session` is a global object; no `require('electron')` is needed. Everything else is the same.

Corresponding iOS API: partitions with `persist:` are `+[WKWebsiteDataStore dataStoreForIdentifier:]`; those without are `+[WKWebsiteDataStore nonPersistentDataStore]`.

## See also

- [Partitions](../session.md#partitions)
- [`isPersistent()`](ispersistent.md): whether a partition survives a restart
