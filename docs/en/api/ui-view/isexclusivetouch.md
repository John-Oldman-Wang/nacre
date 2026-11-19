---
type: reference
native: UIView.exclusiveTouch
---

# `UIView`: `isExclusiveTouch` property

The **`isExclusiveTouch`** property determines whether the view takes touches exclusively while it is touched: while a finger is on it, other views in the same window don't receive touches.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Takes touches exclusively |
| `false` | Doesn't take touches exclusively |

- Readable and writable.
- The default is `false` (according to Apple's documentation; **not verified in the simulator**).
- Converted with `Boolean()` on write: `1`, non-empty strings, and objects are `true`; `0`, `''`, `null`, `undefined`, and `NaN` are `false`. So writing `'false'` gives `true`.
- The type it reads back as, and that writing back the original value reads back unchanged, are checked in the acceptance tests. The effect is **not verified in the simulator**.

## Examples

```js
const button = UIButton.buttonWithType('system');
button.isExclusiveTouch = true;
```

**Effect**: While a finger is on this button, tapping another button with a second finger does nothing. **Not verified in the simulator.**

## Corresponding iOS API

`UIView.exclusiveTouch`; the ObjC getter name is `isExclusiveTouch`.

## See also

- [`isUserInteractionEnabled`](isuserinteractionenabled.md)
