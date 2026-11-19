---
type: reference
native: "-[UIScene openURL:options:completionHandler:]"
---

# `UIWindowScene`: `openURL()` method

The **`openURL()`** method asks the system to open a URL: go to Safari, dial a number, go to another App.

## Syntax

```
openURL(url)
```

### Parameters

**`url`**

A string. The value passed is converted to a string first.

### Return value

A `Promise<boolean>`. It fulfills with `true` when the system opens the URL successfully. It fulfills with `false` in these cases:

- `url` is not a valid URL.
- No App can handle the URL, or the system refuses to open it. **The fulfillment value in this case is not verified in the simulator.**

### Exceptions

None. It doesn't throw, and the Promise is never rejected.

## Description

[`application.openURL()`](../application/openurl.md) is the App-level method of the same name; either can be used.

The acceptance tests ran it with an address no App can handle (`nacre-nonexistent-scheme://test`): the Promise fulfilled normally, nothing was thrown, and the App stayed in the foreground.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  e.scene.openURL('https://example.com').then((ok) => {
    console.log('Open result:', ok);
  });
});
```

**Effect**: the system opens the URL in Safari, the App goes to the background, and the console logs `Open result: true`. **Not verified in the simulator.**

## Corresponding iOS API

`-[UIScene openURL:options:completionHandler:]`. `options` isn't provided yet; `completionHandler` is replaced by the returned Promise.

## See also

- [`application.openURL()`](../application/openurl.md)
