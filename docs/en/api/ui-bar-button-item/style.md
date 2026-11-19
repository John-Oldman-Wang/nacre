---
type: reference
native: UIBarButtonItem.style
---

# `UIBarButtonItem`: `style` property

The **`style`** property is the navigation bar button's style.

## Value

A string:

| Value | Effect |
| --- | --- |
| `'plain'` | Plain style |
| `'prominent'` | Emphasized style, for the view controller's primary action, such as "Save" or "Done" |
| `'done'` | Can be written; it's the same value as `'prominent'`. Reads back as `'prominent'` |

- Readable and writable.
- Defaults to `'plain'`.
- After writing `'done'` you read `'prominent'`, so compare against `'prominent'` when checking the style.
- How the two styles look is **not verified in the simulator**.
- No event fires when it changes: it only changes through code.

### Invalid values

Writing a value not in the table doesn't throw: the property keeps its previous value, and the console prints a warning `[Nacre] style has no value "bordered"; expected one of: plain / prominent / done, ignored`.

## Examples

```js
const item = new UIBarButtonItem({ title: 'Done' });
item.style = 'done';
console.log(item.style);
```

**Result**: the console prints `prominent`.

## Corresponding iOS API

`UIBarButtonItem.style`. `UIBarButtonItemStyleProminent` is written as `'prominent'`; `UIBarButtonItemStyleDone` is the same value. `UIBarButtonItemStyleBordered` is deprecated by Apple and not provided.

## See also

- [Enums](../enums.md): why the primary name is read back when one value has two names
