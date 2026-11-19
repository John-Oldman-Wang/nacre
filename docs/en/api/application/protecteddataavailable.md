---
type: reference
native: UIApplication.protectedDataAvailable
---

# `Application`: `protectedDataAvailable` property

The **`protectedDataAvailable`** property indicates whether encrypted, protected files can be read right now.

## Value

A boolean.

| Value | Meaning |
| --- | --- |
| `true` | Encrypted, protected files can be read |
| `false` | The device is locked, and these files can't be read |

- Read-only. Assigning to it throws `TypeError`.
- Fires [`protecteddataavailable`](protecteddataavailable-event.md) and [`protecteddataunavailable`](protecteddataunavailable-event.md) when it changes.
- The specific values read are **not verified in the simulator**.

## Examples

```js
console.log(application.protectedDataAvailable);
```

**Result**: prints whether encrypted, protected files can currently be read.

## Corresponding iOS API

`UIApplication.protectedDataAvailable`.

## See also

- [`protecteddataunavailable`](protecteddataunavailable-event.md)
