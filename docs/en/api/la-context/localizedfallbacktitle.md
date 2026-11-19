---
type: reference
native: LAContext.localizedFallbackTitle
---

# `LAContext`: `localizedFallbackTitle` property

The **`localizedFallbackTitle`** property is the title of the fallback button that appears in the authentication UI after biometric authentication fails once. When the user taps this button, authentication ends with `UserFallbackError`.

## Value

A string, or `null`.

| Value | Effect |
| --- | --- |
| `null` | The fallback button uses the system's default title |
| `''` (empty string) | No fallback button is shown; the UI has only the cancel button |
| Any other string | The title of the fallback button |

- Readable and writable.
- The default is `null`.
- Only the app itself can change it, so there is no change notification.
- The on-screen effect and what happens after the user taps the button are **not verified in the simulator**.

### Invalid values

Does not throw. `null` and `undefined` give `null`; other values are converted with `String()`, so writing `5` reads back `'5'`.

## Examples

```js
const context = new LAContext();
context.localizedFallbackTitle = 'Enter sign-in password';
console.log(context.localizedFallbackTitle);
```

**Effect**: Prints `Enter sign-in password`. When authenticating with this object, after biometric authentication fails once, a button titled "Enter sign-in password" appears in the UI (**not verified in the simulator**).

```js
const context = new LAContext();
context.localizedFallbackTitle = '';
```

**Effect**: After biometric authentication fails, the UI has only the cancel button. **Not verified in the simulator.**

## Corresponding iOS API

`LAContext.localizedFallbackTitle`.

## See also

- [`localizedCancelTitle`](localizedcanceltitle.md): the title of the cancel button
- [Falling back to the app's own password when biometrics fail](../../guides/face-id.md#falling-back-to-the-apps-own-password-when-biometrics-fail)
- [Installing `@nacrejs/local-authentication`](../la-context.md#installation)
