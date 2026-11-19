---
type: reference
native: UIToolbar.barStyle
---

# `UIToolbar`: `barStyle` property

The **`barStyle`** property is the toolbar's light/dark style.

## Value

A string, one of the following two:

| Value | Effect |
| --- | --- |
| `'default'` | Follows the system's light or dark appearance |
| `'black'` | A dark bar |

- Readable and writable.
- Defaults to `'default'`.
- The visual difference between the two values is **not verified in the simulator**.
- No change event: only the app's own code changes it.

### Invalid values

Writing a value not in the table doesn't throw: the console prints a warning, and `barStyle` keeps its previous value.

```
[Nacre] barStyle has no value "dark"; expected one of: default / black, ignored
```

## Examples

```js
const toolbar = new UIToolbar();
toolbar.barStyle = 'black';
console.log(toolbar.barStyle);
```

**Result**: prints `black`.

## Corresponding iOS API

`UIToolbar.barStyle`. `UIBarStyleBlack` is written as `'black'`. `UIBarStyleBlackOpaque` and `UIBarStyleBlackTranslucent` have been deprecated since iOS 13 and have no corresponding values.

## See also

- [Enums](../enums.md): why an invalid property value produces a warning
