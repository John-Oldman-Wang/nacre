---
type: reference
native: "-[UIBezierPath appendPath:]"
---

# `UIBezierPath`: `appendPath()` method

The **`appendPath()`** method adds all subpaths of another path to this one.

## Syntax

```
appendPath(path)
```

### Parameters

**`path`**

The path to add, a `UIBezierPath`. What is added is its shape at that moment; changing that path afterward doesn't change this one. **The latter is not verified in the simulator.**

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

`path` isn't a `UIBezierPath`: `appendPath: expects a UIBezierPath`.

## Description

A batch of shapes with the same color and line width can go into one path and be drawn with a single shape layer.

## Examples

```js
const bars = new UIBezierPath();
bars.appendPath(UIBezierPath.bezierPathWithRect(new CGRect(0, 40, 10, 20)));
bars.appendPath(UIBezierPath.bezierPathWithRect(new CGRect(20, 10, 10, 50)));
bars.appendPath(UIBezierPath.bezierPathWithRect(new CGRect(40, 0, 10, 60)));
console.log(String(bars.bounds));
```

**Result**: `bars` contains three rectangles, 10 pt wide, with aligned bottom edges. The console prints `CGRect(0, 0, 50, 60)`.

## Corresponding iOS API

`-[UIBezierPath appendPath:]`.

## See also

- [`bounds`](bounds.md)
