---
type: reference
status: partial
---

# `URL`

**`URL`** represents a parsed address. It splits address text into the protocol, host, port, path, query, and fragment, and each part can be read and changed individually.

`URL` is global, is created with `new`, and involves no networking. Two other classes are used with it: [`URLSearchParams`](url-search-params.md) represents the query parameters after the `?` in an address, and [`Headers`](headers.md) represents a set of HTTP request or response headers. [`fetch()`](fetch.md) accepts a `URL` as the address and `Headers` as the request headers.

**Inheritance**: `URL` does not inherit from any class.

For how to build and parse addresses, see the guide [Building and parsing URLs](../guides/urls.md).

## Constructor

[`URL()`](url/constructor.md)

Parses address text and creates a `URL`. The address must be absolute, or you must provide a base separately.

## Static methods

[`URL.canParse()`](url/canparse.md)

Determines whether text can be parsed as an address, without throwing.

[`URL.parse()`](url/parse.md)

Parses address text and returns `null` when it can't be parsed, without throwing.

## Instance properties

All are strings except `searchParams`.

| Property | Description |
| --- | --- |
| [`href`](url/href.md) | The full address |
| [`origin`](url/origin.md) <small>read-only</small> | Protocol plus host plus port |
| [`protocol`](url/protocol.md) | The protocol, with the trailing colon |
| [`username`](url/username.md) | The username |
| [`password`](url/password.md) | The password |
| [`host`](url/host.md) | Host plus port |
| [`hostname`](url/hostname.md) | The host, without the port |
| [`port`](url/port.md) | The port |
| [`pathname`](url/pathname.md) | The path |
| [`search`](url/search.md) | The query, with the leading `?` |
| [`searchParams`](url/searchparams.md) <small>read-only</small> | The query parameters, a `URLSearchParams` |
| [`hash`](url/hash.md) | The fragment, with the leading `#` |

There are no events when these values change: only the app's own code can change them.

## Instance methods

| Method | Description |
| --- | --- |
| [`toString()`](url/tostring.md) | Returns the full address, equal to `href` |
| [`toJSON()`](url/tojson.md) | Returns the full address; used by `JSON.stringify()` |

## Addresses must be absolute

The `text` in `new URL(text)` must include a protocol, such as `https://a.com/x`. Relative addresses such as a bare path `/x` or `../y` can't be parsed on their own, and the constructor throws `TypeError`.

The reason is that the app's JS is bundled into the app and loaded locally: there is no "current page address", and there is no global `location`. A relative address has no base to resolve against. To parse a relative address, pass the base as the second argument; see [`URL()`](url/constructor.md).

Type checking can't catch this error: `new URL('/x')` is valid as far as types go and only throws at runtime.

## Addresses are normalized

When parsing, `URL` normalizes the address, so the parts you read back may differ from the text you passed in:

| Passed in | Read back | Description |
| --- | --- | --- |
| `HTTPS://EXAMPLE.com` | `protocol` is `https:`, `host` is `example.com` | The protocol and host are lowercased |
| `https://a.com:443/` | `port` is `''`, `host` is `a.com` | The protocol's default port is omitted. Protocols with default ports: `http` 80, `https` 443, `ws` 80, `wss` 443, `ftp` 21 |
| `https://a.com/a/b/../c` | `pathname` is `/a/c` | `.` and `..` in the path are resolved |
| `https://a.com` | `pathname` is `/` | An empty path becomes `/` |
| `https://a.com/a b` | `pathname` is `/a%20b` | Spaces in the path are encoded as `%20` |
| `https://a.com/%7Eu` | `pathname` is `/%7Eu` | Parts that are already encoded are kept as-is and not encoded twice |

How non-ASCII characters such as Chinese in the path are encoded is **not verified in the simulator**.

Query parameters are encoded differently from the path: values written through [`URLSearchParams`](url-search-params.md) have spaces encoded as `+` and Chinese characters encoded as UTF-8 `%XX`. Writing `'中 文'` gives `%E4%B8%AD+%E6%96%87`, and reading it back gives `'中 文'` again.

## Examples

The code below builds an API address with query parameters, then prepares a set of request headers. It needs no UI and runs as-is at the top level of `main.js`.

```js
// 1. Parse an absolute address
const url = new URL('https://api.example.com/v1/items?page=2');

// 2. Change one query parameter, then add another
url.searchParams.set('page', '3');
url.searchParams.append('q', '中 文');
console.log(url.href);

// 3. Read a single part
console.log(url.hostname, url.pathname);

// 4. Prepare request headers. Names are case-insensitive
const headers = new Headers({ 'Content-Type': 'application/json' });
headers.set('Authorization', 'Bearer abc');
console.log(headers.get('content-type'));
```

**Result**: The console logs three lines.

- `https://api.example.com/v1/items?page=3&q=%E4%B8%AD+%E6%96%87`
- `api.example.com /v1/items`
- `application/json`

This code has not been run as a whole in the simulator. Every API it uses has been run in the acceptance tests.

## Differences from the web

The name and members are the same as the browser's `URL`. Where the behavior differs:

| Case | Browser | Here |
| --- | --- | --- |
| Base for relative addresses | `location.href` or `document.baseURI` is commonly passed as the second argument | There is no `location`; you provide the base yourself |
| `https://a.com\evil.com` (a backslash in the address) | The backslash is treated as `/`, and parsing succeeds | Parsing fails and throws `TypeError`. This comes from comparison testing against Chrome; there is no assertion for it in the acceptance tests |
| `https://例え.jp` (a non-ASCII domain) | `hostname` is `xn--r8jz45g.jp` | `hostname` is `%E4%BE%8B%E3%81%88.jp`. This comes from comparison testing against Chrome; there is no assertion for it in the acceptance tests. Whether a request to such an address succeeds is **not verified in the simulator** |
| `origin` of `ws:`, `wss:`, and `ftp:` addresses | Protocol plus host plus port | `'null'` |
| Assigning to `search` or `hash` | Characters such as spaces are encoded | Written as-is, without encoding |

If you only handle ASCII `http` and `https` addresses, you won't run into the second through fourth items.

## See also

- [Building and parsing URLs](../guides/urls.md): complete code for splitting an address, changing query parameters, and preparing request headers
- [`URLSearchParams`](url-search-params.md): reading and writing the query parameters in an address
- [`Headers`](headers.md): request and response headers
- [`fetch()`](fetch.md): using a `URL` as the address and `Headers` as the request headers when making a request
- [`WebSocket`](websocket.md): the address and request headers when opening a long-lived connection
- [How the runtime works](how-it-works.md): where code is loaded from, and why there is no `location`
