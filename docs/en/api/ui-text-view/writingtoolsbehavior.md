---
type: reference
native: UITextView.writingToolsBehavior
---

# `UITextView`: `writingToolsBehavior` property

The **`writingToolsBehavior`** property determines how much the system's Writing Tools (rewrite, proofread, summarize) can do in this text view.

## Value

A string, one of these four:

| Value | Effect |
| --- | --- |
| `'none'` | Writing Tools isn't offered |
| `'default'` | The system decides |
| `'complete'` | Full Writing Tools is offered, and results can be written back directly |
| `'limited'` | Only limited Writing Tools is offered, and results are shown in a separate panel |

- Readable and writable.
- This property was added from the iOS headers. The acceptance tests verify that it can be read, has the right type, and reads back unchanged after its original value is written back; the default value and the effect of each value are **not verified in the simulator**, and usage follows Apple's documentation.
- There is no change event: only the app's own code changes it.

### Invalid values

Writing a value that isn't in the table doesn't throw: the console logs a warning listing all valid values, and the property keeps its previous value.

```
[Nacre] writingToolsBehavior has no value "x"; expected one of: …, ignored
```

## Examples

```js
const input = new UITextView();
input.writingToolsBehavior = 'none';
```

**Effect**: after text is selected, the edit menu has no Writing Tools. **Not verified in the simulator.**

## Corresponding iOS API

`UITextView.writingToolsBehavior`. `UIWritingToolsBehaviorNone` is written `'none'`, and likewise for the others.

## See also

- [`allowedWritingToolsResultOptions`](allowedwritingtoolsresultoptions.md)
