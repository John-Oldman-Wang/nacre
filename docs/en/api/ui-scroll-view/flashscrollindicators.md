---
type: reference
native: "-[UIScrollView flashScrollIndicators]"
---

# `UIScrollView`: `flashScrollIndicators()` method

The **`flashScrollIndicators()`** method shows the scroll indicators briefly and then hides them, hinting to the user that this area can scroll.

## Syntax

```
flashScrollIndicators()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

None.

## Examples

```js
const scroller = new UIScrollView();
scroller.flashScrollIndicators();
```

**Effect**: the indicators appear briefly and then disappear.

## Corresponding iOS API

`-[UIScrollView flashScrollIndicators]`.

## See also

- [`showsVerticalScrollIndicator`](showsverticalscrollindicator.md)
