---
type: reference
native: UITextView.enablesReturnKeyAutomatically
---

# `UITextView`: `enablesReturnKeyAutomatically` property

The **`enablesReturnKeyAutomatically`** property indicates whether the Return key is dimmed and can't be pressed when there is no content.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | With no content, the Return key is dimmed and can't be pressed |
| `false` | The Return key can always be pressed |

- Readable and writable.
- The default value is `false`.
- Values of other types are converted to a boolean by truthiness: `0` is `false`, `'false'` is `true`.
- The effect of each value is **not verified in the simulator**. The acceptance tests verify that values can be written and read back, and that an invalid value leaves the property unchanged and logs a warning.
- There is no change event: only the app's own code changes it.

## Examples

```js
const input = new UITextView();
input.enablesReturnKeyAutomatically = true;
```

**Effect**: with no content, the Return key is dimmed. **Not verified in the simulator.**

## Corresponding iOS API

`UITextView.enablesReturnKeyAutomatically`.

## See also

- [`enablesReturnKeyAutomatically` on `UITextField`](../ui-text-field/enablesreturnkeyautomatically.md): the property of the same name on text fields
