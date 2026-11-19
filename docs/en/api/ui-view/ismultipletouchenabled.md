---
type: reference
native: UIView.multipleTouchEnabled
---

# `UIView`: `isMultipleTouchEnabled` property

The **`isMultipleTouchEnabled`** property determines whether the view receives multiple fingers touching down at the same time.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Receives multiple fingers |
| `false` | Receives only the first finger |

- Readable and writable.
- The default is `false` (according to Apple's documentation; **not verified in the simulator**).
- Converted with `Boolean()` on write: `1`, non-empty strings, and objects are `true`; `0`, `''`, `null`, `undefined`, and `NaN` are `false`. So writing `'false'` gives `true`.
- The type it reads back as, and that writing back the original value reads back unchanged, are checked in the acceptance tests. The effect is **not verified in the simulator**.

## Examples

```js
const canvas = new UIView();
canvas.isMultipleTouchEnabled = true;
```

**Effect**: Gesture recognizers on `canvas` can receive multiple fingers. **Not verified in the simulator.**

## Corresponding iOS API

`UIView.multipleTouchEnabled`; the ObjC getter name is `isMultipleTouchEnabled`.

## See also

- [Gesture recognizers](../ui-gesture-recognizer.md)
