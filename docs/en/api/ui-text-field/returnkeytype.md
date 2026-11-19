---
type: reference
native: UITextField.returnKeyType
---

# `UITextField`: `returnKeyType` property

The **`returnKeyType`** property decides the label on the Return key at the bottom right of the keyboard.

## Value

A string, one of these 12. The label on the key follows the system language; the table gives the meaning of each value:

| Value | What the Return key says |
| --- | --- |
| `'default'` | New line (the key reads "return" or its localized equivalent) |
| `'go'` | Go |
| `'google'` | Search (an old value, displayed as Search) |
| `'join'` | Join |
| `'next'` | Next |
| `'route'` | Route |
| `'search'` | Search |
| `'send'` | Send |
| `'yahoo'` | Search (an old value, displayed as Search) |
| `'done'` | Done |
| `'emergencyCall'` | Emergency Call |
| `'continue'` | Continue |

- Readable and writable.
- The default is `'default'`.
- The label each value shows is **not verified in the simulator**.
- It only changes the label on the key, not its behavior. Whatever the label, pressing it fires `return`. Pressing Return in a single-line text field does not insert a line break.
- There is no change event: only the app's own code changes it.

### Invalid values

Writing a value not in the table does not throw: the console prints a warning listing all available values, and the property keeps its previous value.

```
[Nacre] returnKeyType has no value "x"; expected one of: …, ignored
```

## Examples

```js
const field = new UITextField();
field.returnKeyType = 'search';
```

**Effect**: The Return key at the bottom right of the keyboard reads "Search". **Not verified in the simulator.**

## Corresponding iOS API

`UITextField.returnKeyType`. `UIReturnKeyDone` is written `'done'`, and likewise for the rest.

## See also

- [`enablesReturnKeyAutomatically`](enablesreturnkeyautomatically.md)
- The [`beforereturn`](beforereturn-event.md) event
