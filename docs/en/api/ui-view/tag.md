---
type: reference
native: UIView.tag
---

# `UIView`: `tag` property

The **`tag`** property is an integer of your choosing. Use it with [`viewWithTag()`](viewwithtag.md) to find views.

## Value

An integer, unitless.

- Readable and writable.
- The default is `0`.

### Invalid values

Converted to an integer: `'7'` gives 7, `3.9` gives 3, `-3.9` gives -3. When it can't be converted to a finite number, `TypeError` is thrown and the value stays unchanged.

## Examples

```js
const dot = new UIView();
// @ts-expect-error The type accepts only numbers; this demonstrates the runtime's integer conversion
dot.tag = '7';
console.log(dot.tag);
```

**Result**: Logs `7`.

## Corresponding iOS API

`UIView.tag`.

## See also

- [`viewWithTag()`](viewwithtag.md)
