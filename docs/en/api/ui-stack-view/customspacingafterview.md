---
type: reference
native: "-[UIStackView customSpacingAfterView:]"
---

# `UIStackView`: `customSpacingAfterView()` method

The **`customSpacingAfterView()`** method returns the custom spacing set after a particular arranged subview.

## Syntax

```
customSpacingAfterView(view)
```

### Parameters

**`view`**

The arranged subview to look up, a `UIView`.

### Return value

A number (in [pt](../units.md)), `'system'`, or `'default'`. If none has been set, it is `'default'`, meaning the value of the [`spacing`](spacing.md) property is used after this item.

### Exceptions

**`TypeError`**

`view` is not a view, or is missing: `customSpacingAfterView needs a UIView`.

## Examples

```js
const red = new UIView();
const row = new UIStackView([red]);

const spacing = row.customSpacingAfterView(red);
if (spacing === 'default') {
  console.log('No custom spacing set');
}
```

**Result**: Prints `No custom spacing set`.

## Corresponding iOS API

`-[UIStackView customSpacingAfterView:]`. Where ObjC returns the constants `UIStackViewSpacingUseDefault` and `UIStackViewSpacingUseSystem`, this returns `'default'` and `'system'`.

## See also

- [`setCustomSpacing()`](setcustomspacing.md)
