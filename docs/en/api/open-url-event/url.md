---
type: reference
native: UIOpenURLContext.URL
---

# `OpenURLEvent`: `url` property

The **`url`** property is the full URL from the system, as is, for example `'myapp://orders/42?ref=mail'`.

## Value

A string.

- Read-only; assigning to it throws `TypeError`.
- The runtime does not parse it; to take it apart, use [`new URL(e.url)`](../url.md).
- Custom schemes start with the scheme name; universal links start with `https://`.
- The URL is external input that any app or web page can construct, so it cannot be trusted as is.

## Examples

```js
application.addEventListener('openurl', (e) => {
  const url = new URL(e.url);
  console.log(url.hostname, url.pathname);
});
```

**Effect** (**not verified in the simulator**): When opened by `myapp://orders/42`, prints `orders /42`.

## Corresponding iOS API

`UIOpenURLContext.URL`, `NSUserActivity.webpageURL`.

## See also

- [`URL`](../url.md)
