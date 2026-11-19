---
type: reference
web: URLSearchParams.toString()
---

# `URLSearchParams`: `toString()` method

The **`toString()`** method returns the encoded query text, without the leading `?`.

## Syntax

```
toString()
```

### Parameters

None.

### Return value

A string. Each parameter is written as `name=value`, joined with `&`. Spaces are encoded as `+`, and Chinese and other non-ASCII characters are encoded as `%XX` using UTF-8. An empty list gives an empty string.

### Exceptions

None.

## Description

Spaces are encoded as `+`, unlike in the URL's path, where a space is `%20`.

## Examples

```js
const q = new URLSearchParams();
q.append('q', '中 文');
q.append('x', 'a&b');
console.log(q.toString());
```

**Result**: logs `q=%E4%B8%AD+%E6%96%87&x=a%26b`. **Not verified in the simulator.**

## Differences from the web

Same as the web.

## See also

- [`URL.search`](../url/search.md): the text of the query part
