---
type: reference
native: "-[UIBezierPath moveToPoint:]"
---

# `UIBezierPath`: `moveToPoint()` method

The **`moveToPoint()`** method starts a new subpath, placing its start at the given position. It draws no line; it only moves the [current point](currentpoint.md) there.

## Syntax

```
moveToPoint(point)
```

### Parameters

**`point`**

The new starting point, a `CGPoint`, in [pt](../units.md). Can also be a plain object `{ x, y }`.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- `point` isn't an object: `moveToPoint needs an object with all of: x, y`.
- `x` or `y` is missing or can't be converted to a finite number: `moveToPoint is missing y, or it is not a finite number`.

## Description

- After the call, [`isEmpty`](isempty.md) becomes `false` and [`currentPoint`](currentpoint.md) becomes `point`.
- Calling it again on a path that already has segments starts a second subpath. The two aren't connected.

## Examples

```js
const path = new UIBezierPath();
path.moveToPoint(new CGPoint(0, 60));
console.log(path.isEmpty, String(path.currentPoint));
```

**Result**: The console prints `false CGPoint(0, 60)`.

## Corresponding iOS API

`-[UIBezierPath moveToPoint:]`.

## See also

- [`addLineToPoint()`](addlinetopoint.md): draw a straight line from the current point
- [What a path is made of](../ui-bezier-path.md#what-a-path-is-made-of)
