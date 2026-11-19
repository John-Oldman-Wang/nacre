---
type: reference
native: LAContext.localizedCancelTitle
---

# `LAContext`: `localizedCancelTitle` property

The **`localizedCancelTitle`** property is the title of the cancel button in the authentication UI.

## Value

A string, or `null`.

- Readable and writable.
- The default is `null`.
- Both `null` and the empty string use the system's default title.
- Only the app itself can change it, so there is no change notification.
- The on-screen effect is **not verified in the simulator**.

### Invalid values

Does not throw. `null` and `undefined` give `null`; other values are converted with `String()`, so writing `5` reads back `'5'`.

## Examples

```js
const context = new LAContext();
context.localizedCancelTitle = 'Not now';
console.log(context.localizedCancelTitle);
```

**Effect**: Prints `Not now`. When authenticating with this object, the cancel button's title is "Not now" (**not verified in the simulator**).

## Corresponding iOS API

`LAContext.localizedCancelTitle`.

## See also

- [`localizedFallbackTitle`](localizedfallbacktitle.md): the title of the fallback button
- [Installing `@nacrejs/local-authentication`](../la-context.md#installation)
