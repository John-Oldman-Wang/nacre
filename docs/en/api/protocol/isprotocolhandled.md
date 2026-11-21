---
type: reference
native: WKWebViewConfiguration
---

# `Protocol`: `isProtocolHandled()` method

The **`isProtocolHandled()`** method returns whether this partition currently has a custom protocol registered.

## Syntax

```
isProtocolHandled(scheme)
```

### Parameters

**`scheme`**

The protocol name, a string, without `://`. Non-strings are converted to strings first.

### Return value

A boolean.

- `true`: this partition registered the protocol with [`serveDirectory()`](servedirectory.md) and hasn't called [`unhandle()`](unhandle.md). Pages in this partition created afterward recognize it.
- `false`: not registered, or already removed. Protocols WebKit handles itself, such as `https` and `file`, are also `false`.

Only this partition is checked. If another partition registered a protocol of the same name, this is still `false`.

The return value is about pages created afterward. Whether a page already created recognizes the protocol depends on the registration at the moment it was created.

### Exceptions

None.

## Examples

```js
const protocol = session.defaultSession.protocol;
console.log(protocol.isProtocolHandled('app'));
protocol.serveDirectory('app', 'JS/assets/web');
console.log(protocol.isProtocolHandled('app'));
console.log(session.fromPartition('guest').protocol.isProtocolHandled('app'));
protocol.unhandle('app');
console.log(protocol.isProtocolHandled('app'));
```

**Result**: When the app hasn't registered `app` before, it prints `false`, `true`, `false`, `false` in order.

## Differences from Electron

Same. Here only one partition is checked.

## Corresponding iOS API

There is no separate method. The counterpart is `-[WKWebViewConfiguration urlSchemeHandlerForURLScheme:]`, but that reads the configuration of a page already created; this reads the registration that pages created afterward will use.

## See also

- [`serveDirectory()`](servedirectory.md)
- [`unhandle()`](unhandle.md)
