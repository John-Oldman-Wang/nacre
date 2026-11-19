---
type: reference
web: Headers.getSetCookie()
---

# `Headers`: `getSetCookie()` method

The **`getSetCookie()`** method returns the values of all `Set-Cookie` headers, one item each.

## Syntax

```
getSetCookie()
```

### Parameters

None.

### Return value

An array of strings, in the order they were added. Returns an empty array when there's no `Set-Cookie`. The returned array is a copy; changing it doesn't affect the headers.

### Exceptions

None.

## Description

A `Set-Cookie` value can itself contain commas (for example the expiry date `Expires=Wed, 21 Oct 2026 …`), so once [`get()`](get.md) joins them into one string they can't be separated. That's why this separate method returns an array.

## Examples

```js
const h = new Headers();
h.append('Set-Cookie', 'x=1');
h.append('Set-Cookie', 'y=2');
console.log(h.getSetCookie());
```

**Result**: Prints `['x=1', 'y=2']`.

## Differences from the web

Same as on the web.

## See also

- [`get()`](get.md)
