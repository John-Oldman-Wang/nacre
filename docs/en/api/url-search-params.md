---
type: reference
---

# `URLSearchParams`

**`URLSearchParams`** represents the query parameters after the `?` in a URL. It is an ordered list of "name = value" pairs, and the same name can appear more than once. It handles encoding and decoding: what you write in is the raw text, what you read out is the raw text, and encoding happens only when it becomes URL text.

A `URLSearchParams` comes from one of two places: one you create yourself with `new` is an independent list; one read from the [`searchParams`](url/searchparams.md) of a [`URL`](url.md) stays in sync with that URL, so changing it changes the URL. [`fetch()`](fetch.md) also accepts it as a request body and sends the result of [`toString()`](url-search-params/tostring.md).

**Inheritance**: `URLSearchParams` does not inherit from any class.

For how to change the query parameters of a URL, see the guide [Building and parsing URLs](../guides/urls.md).

## Constructor

[`URLSearchParams()`](url-search-params/constructor.md)

Creates a list from query text, an object, an array, or another `URLSearchParams`.

## Instance properties

| Property | Description |
| --- | --- |
| [`size`](url-search-params/size.md) <small>read-only</small> | The number of parameters; parameters with the same name are counted separately |

## Instance methods

Reading:

| Method | Description |
| --- | --- |
| [`get()`](url-search-params/get.md) | The value of the first parameter with the name |
| [`getAll()`](url-search-params/getall.md) | The values of all parameters with the name |
| [`has()`](url-search-params/has.md) | Whether the parameter exists |
| [`toString()`](url-search-params/tostring.md) | The encoded query text, without `?` |

Changing:

| Method | Description |
| --- | --- |
| [`append()`](url-search-params/append.md) | Adds a parameter at the end |
| [`set()`](url-search-params/set.md) | Sets a name to one value, keeping only one parameter with that name |
| [`delete()`](url-search-params/delete.md) | Deletes the parameters with a name |
| [`sort()`](url-search-params/sort.md) | Sorts by name |

Iterating:

| Method | Description |
| --- | --- |
| [`keys()`](url-search-params/keys.md) | Yields the names in order |
| [`values()`](url-search-params/values.md) | Yields the values in order |
| [`entries()`](url-search-params/entries.md) | Yields `[name, value]` in order. Iterating directly with `for...of` is the same as this |
| [`forEach()`](url-search-params/foreach.md) | Calls a callback once for each parameter |

## Encoding rules

Query parameters use the form encoding rules, which differ from those of the URL's path:

- A space is encoded as `+`. In the path, a space is `%20`.
- Chinese and other non-ASCII characters are encoded as `%XX` using UTF-8.
- Characters with meaning in a query, such as `&`, `=`, and `+`, are encoded so they don't break the structure of the URL.

Writing `'中 文'` in gives `%E4%B8%AD+%E6%96%87`, and reading it back still gives `'中 文'`.

## Examples

The code below changes the query parameters of a URL. It needs no UI and runs when written directly at the top level of `main.js`.

```js
const url = new URL('https://api.example.com/search?page=1');
url.searchParams.set('page', '2');
url.searchParams.append('q', '中 文');
console.log(url.href);

const params = new URLSearchParams('a=1&b=2&a=3');
console.log(params.getAll('a'), params.size);
```

**Result**

- Logs `https://api.example.com/search?page=2&q=%E4%B8%AD+%E6%96%87`.
- Logs `['1', '3'] 3`.

This code has not been run as a whole in the simulator. Every API it uses has been run in the acceptance tests.

## Differences from the web

Same as the web.

## See also

- [Building and parsing URLs](../guides/urls.md): several ways to change query parameters
- [`URL`](url.md): the `searchParams` property stays in sync with the URL
- [`fetch()`](fetch.md): sending a `URLSearchParams` as the request body
