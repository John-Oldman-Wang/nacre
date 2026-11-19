---
type: reference
native: "-[UIView invalidateIntrinsicContentSize]"
---

# `UIView`: `invalidateIntrinsicContentSize()` method

The **`invalidateIntrinsicContentSize()`** method tells the system that this view's intrinsic size has changed, so it is read again on the next layout pass.

## Syntax

```
invalidateIntrinsicContentSize()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

None.

## Examples

```js
const label = new UILabel();
label.text = 'A longer piece of text';
label.invalidateIntrinsicContentSize();
```

**Effect**: On the next layout pass, the system reads the intrinsic size of `label` again. `UILabel` notifies the system itself when its text changes; the call here only demonstrates the syntax. **Not verified in the simulator.**

## Corresponding iOS API

`-[UIView invalidateIntrinsicContentSize]`.

## See also

- [`intrinsicContentSize`](intrinsiccontentsize.md)
