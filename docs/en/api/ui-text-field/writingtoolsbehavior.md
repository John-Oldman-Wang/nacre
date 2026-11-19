---
type: reference
native: UITextField.writingToolsBehavior
---

# `UITextField`: `writingToolsBehavior` property

The **`writingToolsBehavior`** property decides how far the system's Writing Tools (rewrite, proofread, summarize) can go in this text field.

## Value

A string, one of these four:

| Value | Effect |
| --- | --- |
| `'none'` | Writing Tools are not offered |
| `'default'` | The system decides |
| `'complete'` | The full Writing Tools are offered, and results can be written straight back into the field |
| `'limited'` | Only limited Writing Tools are offered, and results are shown in a separate panel |

- Readable and writable.
- This property was added from the iOS headers. The acceptance tests verify that it can be read, has the right type, and reads back unchanged after its value is written back; the default value and the effect of each value are **not verified in the simulator**. For usage, follow Apple's documentation.
- There is no change event: only the app's own code changes it.

### Invalid values

Writing a value not in the table does not throw: the console prints a warning listing all available values, and the property keeps its previous value.

```
[Nacre] writingToolsBehavior has no value "x"; expected one of: …, ignored
```

## Examples

```js
const field = new UITextField();
field.writingToolsBehavior = 'none';
```

**Effect**: After selecting text, the edit menu has no Writing Tools. **Not verified in the simulator.**

## Corresponding iOS API

`UITextField.writingToolsBehavior`. `UIWritingToolsBehaviorNone` is written `'none'`, and likewise for the rest.

## See also

- [`allowedWritingToolsResultOptions`](allowedwritingtoolsresultoptions.md)
