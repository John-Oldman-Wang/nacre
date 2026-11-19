---
type: reference
native: UIFont.familyName
---

# `UIFont`: `familyName` property

The **`familyName`** property is the font family name. A family contains several fonts of different weights and italics.

## Value

A string, determined by the font.

- Read-only. Assigning to it throws `TypeError`.
- Font objects are immutable, so this value never changes for the object's lifetime, and there is no change notification.
- The specific values are **not verified in the simulator**.

## Examples

```js
const font = UIFont.systemFontOfSize(17);
console.log(font.familyName);
```

**Result**: the console logs the system font's family name.

## Corresponding iOS API

`UIFont.familyName`.

## See also

- [Font metrics](../ui-font.md#font-metrics)
