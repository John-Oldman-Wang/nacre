---
type: reference
native: UITextView.secureTextEntry
---

# `UITextView`: `isSecureTextEntry` property

The **`isSecureTextEntry`** property indicates whether input is entered like a password.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Input is entered like a password |
| `false` | Normal input |

- Readable and writable.
- The default value is `false`.
- Values of other types are converted to a boolean by truthiness: `0` is `false`, `'false'` is `true`.
- The effect of each value is **not verified in the simulator**. The acceptance tests verify that values can be written and read back, and that an invalid value leaves the property unchanged and logs a warning.
- There is no change event: only the app's own code changes it.

## Examples

```js
const input = new UITextView();
input.isSecureTextEntry = true;
```

**Effect**: input is entered like a password. How it looks on screen is **not verified in the simulator**.

## Corresponding iOS API

`UITextView.secureTextEntry` (the getter is `isSecureTextEntry`).

## See also

- [`isSecureTextEntry` on `UITextField`](../ui-text-field/issecuretextentry.md): the property of the same name on text fields
