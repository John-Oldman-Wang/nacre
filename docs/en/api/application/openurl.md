---
type: reference
native: "-[UIApplication openURL:options:completionHandler:]"
---

# `Application`: `openURL()` method

The **`openURL()`** method hands a URL to the system to open: web addresses open in the browser, `tel:` opens in Phone, and schemes registered by other apps open in those apps.

## Syntax

```
openURL(url)
```

### Parameters

**`url`**

A string. Non-string values are converted to strings first.

### Return value

`Promise<boolean>`.

- `true`: the system opened it. Fulfilling with `true` for a valid URL is verified.
- `false`: the URL is invalid, or no app can handle it. The app isn't switched away in this case.

### Exceptions

None. It doesn't throw, and the Promise is never rejected. Failure is indicated only by `false`.

## Description

- When this app calls `openURL()` itself to open another app, [`openurl`](openurl-event.md) doesn't fire.
- Asking the system whether a URL can be opened before opening it (`canOpenURL:`) isn't provided: call `openURL()` directly and check the fulfilled value.
- Scenes have a method with the same name: [`UIWindowScene.openURL()`](../ui-window-scene/openurl.md).

## Examples

```js
application.openURL('https://example.com').then((ok) => {
  console.log('Opened successfully', ok);
});
```

**Effect**: the system switches to the browser and opens the address, and the console prints `Opened successfully true`. **The switch to the browser is not verified in the simulator.**

```js
application.openURL('nacre-nonexistent-scheme://test').then((ok) => {
  console.log(ok);
});
application.openURL('这不是一个合法 URL::::').then((ok) => {
  console.log(ok);
});
```

**Result**: both print `false`. In the first, no app can handle the scheme; in the second, the URL itself is invalid. The app isn't switched away.

## Corresponding iOS API

`-[UIApplication openURL:options:completionHandler:]`. `options` isn't provided yet; `completionHandler` is replaced by the returned Promise.

## See also

- [`openurl`](openurl-event.md): another app opening this app
