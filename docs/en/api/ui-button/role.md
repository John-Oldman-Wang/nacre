---
type: reference
native: UIButton.role
---

# `UIButton`: `role` property

The **`role`** property represents the button's purpose. The system adjusts the button's appearance based on it. How each value looks on screen is **not verified in the simulator**.

## Value

A string, one of these four:

| Value | Meaning |
| --- | --- |
| `'normal'` | An ordinary button |
| `'primary'` | The most important action in the current interface |
| `'cancel'` | A cancel action |
| `'destructive'` | An irreversible action such as deleting. The title is shown in red (**not verified in the simulator**) |

- Readable and writable.
- Defaults to `'normal'`.
- The on-screen effect of each value is **not verified in the simulator**.

### Invalid values

Writing a value not in the table doesn't throw: a warning listing all valid values is printed to the console, and `role` keeps its previous value.

## Examples

```js
const remove = UIButton.buttonWithType('system');
remove.setTitle('Delete', { forState: ['normal'] });
remove.role = 'destructive';
```

**Effect**: The word "Delete" is shown in red. **Not verified in the simulator.**

## Corresponding iOS API

`UIButton.role`. `UIButtonRoleDestructive` is written as `'destructive'`, and likewise for the rest.

## See also

- [Enums](../enums.md): why an invalid property write warns instead of throwing
