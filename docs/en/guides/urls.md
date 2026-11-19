# Building and parsing URLs

This guide covers how to use [`URL`](../api/url.md) to build and take apart URLs, [`URLSearchParams`](../api/url-search-params.md) to change query parameters, and [`Headers`](../api/headers.md) to prepare request headers. None of these three classes touches the network; the URLs and headers you build are sent with [`fetch()`](../api/fetch.md).

## Recommended approach

- **Define the server's base URL as a constant, and use it as the second argument for every relative URL.** The app's JS is loaded locally, so there is no "current page URL", and both `new URL('/x')` and `fetch('/api')` fail. Write `new URL('/x', api)` and `fetch(new URL('/api', api))` instead. For the reason, see [URLs must be complete](../api/url.md#addresses-must-be-absolute).
- **Change query parameters with [`url.searchParams`](../api/url/searchparams.md), not by building strings yourself.** `searchParams` handles encoding, so spaces, `&`, `=`, and non-ASCII characters in values don't break the URL's structure. When you assign to [`url.search`](../api/url/search.md) directly, the content is written as is, without encoding.
- **When a URL comes from user input or a server response and may not be valid, use [`URL.canParse()`](../api/url/canparse.md) or [`URL.parse()`](../api/url/parse.md).** They don't throw.
- **Request headers can be a `Headers` or a plain object.** Use `Headers` when you need to read by name, check whether one exists, or append values with the same name; it is case-insensitive. When you only pass them to `fetch()` once, a plain object is shorter.

## First example

The code below builds an API URL with query parameters, then prepares a set of request headers. It needs no interface and runs directly at the top level of `main.js`.

```js
// 1. Parse a full URL
const url = new URL('https://api.example.com/v1/items?page=2');

// 2. Change one query parameter and add another
url.searchParams.set('page', '3');
url.searchParams.append('q', '中 文');
console.log(url.href);

// 3. Read individual parts
console.log(url.hostname, url.pathname);

// 4. Prepare request headers. Names are case-insensitive
const headers = new Headers({ 'Content-Type': 'application/json' });
headers.set('Authorization', 'Bearer abc');
console.log(headers.get('content-type'));
```

**Result**: The console prints three lines.

- `https://api.example.com/v1/items?page=3&q=%E4%B8%AD+%E6%96%87`
- `api.example.com /v1/items`
- `application/json`

This code hasn't been run as a whole in the simulator. Every API it uses has been run in the acceptance tests.

The code in each section below creates its own variables and doesn't reuse these.

## Taking a URL apart

```js
const parts = new URL('https://u:p@EXAMPLE.com:443/a/b/../c?x=1&y=2#f');
console.log(parts.protocol);   // https:
console.log(parts.username);   // u
console.log(parts.host);       // example.com
console.log(parts.port);       // Empty string
console.log(parts.pathname);   // /a/c
console.log(parts.search);     // ?x=1&y=2
console.log(parts.hash);       // #f
console.log(parts.origin);     // https://example.com
console.log(parts.href);       // https://u:p@example.com/a/c?x=1&y=2#f
```

**Result**: Each line prints what its comment shows. `protocol` includes the trailing colon, `search` the leading question mark, and `hash` the leading hash sign. The host is lowercased, the default port 443 is omitted, and `..` in the path is resolved; see [URLs are normalized](../api/url.md#addresses-are-normalized).

## Resolving a relative URL against a base

```js
const api = 'https://api.example.com/v1/';
console.log(new URL('items', api).href);
console.log(new URL('/x', 'https://a.com').href);
console.log(new URL('../y', 'https://a.com/a/b/c').pathname);
```

**Result**: It prints `https://api.example.com/v1/items`, `https://a.com/x`, and `/a/y`.

## Checking whether text is a valid URL

```js
console.log(URL.canParse('/x'));
console.log(URL.canParse('https://a.com/x'));

const parsed = URL.parse('https://a.com/x');
if (parsed) {
  console.log(parsed.pathname);
}
```

**Result**: It prints `false`, `true`, then `/x`. `URL.parse()` returns `null` when it can't parse, so check for `null` before using the result.

## Changing one part of a URL

```js
const page = new URL('https://a.com/p');
page.pathname = 'q';
page.hash = 'top';
console.log(page.href);
```

**Result**: It prints `https://a.com/q#top`. The leading `/` can be omitted when assigning `pathname`, `#` when assigning `hash`, and `?` when assigning `search`; they are added automatically.

After assigning `protocol`, `username`, `password`, `host`, `hostname`, `port`, or `pathname`, the whole URL is parsed again. When the new value would make the URL invalid, the assignment has no effect and the URL stays as it was, without throwing.

## Encoding query parameter values

```js
const search = new URL('https://api.example.com/search');
search.searchParams.set('q', '中 文');
console.log(search.href);
```

**Result**: It prints `https://api.example.com/search?q=%E4%B8%AD+%E6%96%87`. The space is encoded as `+`, and the non-ASCII characters are encoded as UTF-8; see [Encoding rules](../api/url-search-params.md#encoding-rules).

## Reading multiple query parameters with the same name

```js
const repeated = new URLSearchParams('a=1&b=2&a=3');
console.log(repeated.get('a'));
console.log(repeated.getAll('a'));
console.log(repeated.size);
```

**Result**: It prints `1`, `['1', '3']`, then `3`. `get()` returns only the first; use `getAll()` to get them all.

## Replacing, appending, and deleting query parameters

```js
const edits = new URLSearchParams('a=1&b=2&a=3');
edits.set('a', '9');
console.log(edits.toString());

edits.append('c', '中 文');
console.log(edits.toString());

edits.delete('a');
console.log(edits.toString());
```

**Result**: It prints `a=9&b=2`, `a=9&b=2&c=%E4%B8%AD+%E6%96%87`, then `b=2&c=%E4%B8%AD+%E6%96%87`.

`set()` replaces the first parameter with that name with the new value and deletes the rest with the same name, keeping the position. When there is no parameter with that name, it is added at the end.

## A URL and its query parameters stay in sync

```js
const synced = new URL('https://a.com/?k=1');
synced.searchParams.append('k2', 'v2');
console.log(synced.search);

synced.search = '?z=9';
console.log(synced.searchParams.get('z'));
```

**Result**: It prints `?k=1&k2=v2` and `9`. Changing `searchParams` updates `search` and `href`; changing `search` or `href` updates `searchParams`.

## Appending headers with the same name

```js
const accept = new Headers();
accept.append('Accept', 'a');
accept.append('accept', 'b');
console.log(accept.get('ACCEPT'));
```

**Result**: It prints `a, b`. Multiple values with the same name are read as one string joined with `, `. To overwrite instead of append, use [`set()`](../api/headers/set.md).

## Reading multiple `Set-Cookie` headers

```js
const cookies = new Headers();
cookies.append('Set-Cookie', 'x=1');
cookies.append('Set-Cookie', 'y=2');
console.log(cookies.getSetCookie());
```

**Result**: It prints `['x=1', 'y=2']`. `Set-Cookie` values may themselves contain commas and can't be joined into one string, so use [`getSetCookie()`](../api/headers/getsetcookie.md) to get an array.

## Iterating over all headers

```js
const all = new Headers({ 'Content-Type': 'application/json', Accept: 'a' });
for (const [name, value] of all) {
  console.log(name, value);
}
```

**Result**: It prints `accept a` and `content-type application/json`. Names are all lowercase and sorted alphabetically by name, regardless of the order they were added. `Set-Cookie` appears as many times as there are entries.

## See also

- [`URL`](../api/url.md): the parts of a URL
- [`URLSearchParams`](../api/url-search-params.md): reading and writing query parameters
- [`Headers`](../api/headers.md): request and response headers
- [`fetch()`](../api/fetch.md): sending the URLs and headers you build
