---
type: reference
native: "-[UIBezierPath removeAllPoints]"
---

# `UIBezierPath`: `removeAllPoints()` method

The **`removeAllPoints()`** method clears the path, removing all subpaths.

## Syntax

```
removeAllPoints()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

None.

## Description

After clearing, [`isEmpty`](isempty.md) is `true`. For a path already assigned to a shape layer, the layer stores the shape as of the moment of assignment, so clearing doesn't affect the layer.

## Examples

```js
const box = UIBezierPath.bezierPathWithRect(new CGRect(0, 0, 10, 10));
box.removeAllPoints();
console.log(box.isEmpty);
```

**Result**: The console prints `true`.

## Corresponding iOS API

`-[UIBezierPath removeAllPoints]`.

## See also

- [`isEmpty`](isempty.md)
