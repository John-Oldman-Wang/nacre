---
type: reference
native: UITextView.usesStandardTextScaling
---

# `UITextView`: `usesStandardTextScaling` property

The **`usesStandardTextScaling`** property indicates whether text is scaled by the system's standard ratio.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Text is scaled by the standard ratio |
| `false` | Not scaled |

- Readable and writable.
- This property was added from the iOS headers. The acceptance tests verify that it can be read, has the right type, and reads back unchanged after its original value is written back; the default value and the effect of each value are **not verified in the simulator**, and usage follows Apple's documentation.
- Values of other types are converted to a boolean by truthiness: `0` is `false`, `'false'` is `true`.
- There is no change event: only the app's own code changes it.

## Examples

```js
const input = new UITextView();
input.usesStandardTextScaling = true;
console.log(input.usesStandardTextScaling);
```

**Effect**: the console logs `true`. Text is scaled by the standard ratio (**not verified in the simulator**).

## Corresponding iOS API

`UITextView.usesStandardTextScaling`.
