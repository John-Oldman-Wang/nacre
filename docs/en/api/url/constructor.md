---
type: reference
web: URL()
---

# `URL()` constructor

The **`URL()`** constructor parses address text and creates a `URL`.

## Syntax

```
new URL(url[, base])
```

### Parameters

**`url`**

Address text, or another `URL`. Values that aren't strings are converted to strings first. Without `base`, it must be an absolute address with a protocol, such as `https://a.com/x`.

**`base`**

Optional. The base for resolving a relative address: text or a `URL`, which must itself be absolute. When it is given, `url` can be a relative address such as `/x`, `items`, or `../y`.

### Return value

A new `URL`. Its parts have already been [normalized](../url.md#addresses-are-normalized).

### Exceptions

**`TypeError`**

Thrown when the address can't be parsed.

- No `base` was given, and `url` is not absolute: `Invalid URL: "/x". Without a base it must be absolute: this runtime does not load over HTTP, so there is no location`
- A `base` was given: `Invalid URL: "/x"（base "nope"）`

## Description

Type checking can't catch errors with relative addresses: `new URL('/x')` is valid as far as types go and only throws at runtime. When the address comes from user input or a server response and might not be valid, use [`URL.canParse()`](canparse.md) or [`URL.parse()`](parse.md).

## Examples

```js
const api = 'https://api.example.com/v1/';
console.log(new URL('items', api).href);
console.log(new URL('/x', 'https://a.com').href);
console.log(new URL('../y', 'https://a.com/a/b/c').pathname);
```

**Result**: Logs `https://api.example.com/v1/items`, `https://a.com/x`, `/a/y` in order.

## Differences from the web

- There is no `location`; you provide the base for relative addresses yourself. In browsers, `location.href` or `document.baseURI` is commonly used.
- When the address contains a backslash (`https://a.com\evil.com`), parsing fails and throws `TypeError`; browsers treat the backslash as `/`, and parsing succeeds. This comes from comparison testing against Chrome; there is no assertion for it in the acceptance tests.
- Non-ASCII domains are not converted to the form starting with `xn--`; see [`hostname`](hostname.md).

## See also

- [Addresses must be absolute](../url.md#addresses-must-be-absolute)
- [`URL.parse()`](parse.md): the variant that returns `null` when the address can't be parsed
