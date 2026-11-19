---
type: reference
native: UIAlertController.severity
---

# `UIAlertController`: `severity` property

The **`severity`** property is the alert's severity.

## Value

A string:

| Value | Meaning |
| --- | --- |
| `'default'` | Normal |
| `'critical'` | Needs the user's immediate attention. The system may display it more prominently |

- Readable and writable.
- Defaults to `'default'`.
- Whether the two values look different on iPhone is **not verified in the simulator**.
- No event fires when it changes: only the App itself can change it.

### Invalid values

Writing an unrecognized value: no exception is thrown, the property keeps its previous value, and a warning is logged to the console: `[Nacre] severity has no value "high"; expected one of: default / critical, ignored`.

## Examples

```js
const alert = UIAlertController.alertControllerWithTitle('Storage full', {
  preferredStyle: 'alert',
});
alert.severity = 'critical';
console.log(alert.severity);
```

**Result**: logs `critical` to the console.

## Corresponding iOS API

`UIAlertController.severity`. `UIAlertControllerSeverityCritical` is written `'critical'`.

## See also

- [Enums](../enums.md): why an invalid property value gives a warning instead of throwing
