---
type: reference
native: UITextField.enablesReturnKeyAutomatically
---

# `UITextField`: `enablesReturnKeyAutomatically` property

The **`enablesReturnKeyAutomatically`** property indicates whether the Return key is grayed out and cannot be pressed when the field is empty.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | When the field is empty, the Return key is grayed out and cannot be pressed. It becomes pressable automatically once the user types |
| `false` | The Return key can always be pressed |

- Readable and writable.
- The default is `false`.
- The effect of both values is **not verified in the simulator**.
- Values of other types are converted to a boolean by truthiness: `0` becomes `false` and `'false'` becomes `true`.
- There is no change event: only the app's own code changes it.

## Examples

```js
const field = new UITextField();
field.enablesReturnKeyAutomatically = true;
```

**Effect**: When the field is empty, the Return key is gray and cannot be pressed. **Not verified in the simulator.**

## Corresponding iOS API

`UITextField.enablesReturnKeyAutomatically`.

## See also

- [`returnKeyType`](returnkeytype.md)
