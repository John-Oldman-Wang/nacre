---
type: reference
native: UIScrollView.directionalLockEnabled
---

# `UIScrollView`: `isDirectionalLockEnabled` property

The **`isDirectionalLockEnabled`** property indicates whether a single drag scrolls only in the direction it started in.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | A single drag scrolls only in the direction it started in |
| `false` | It can scroll diagonally |

- Readable and writable.
- Defaults to `false`.
- The effects of both values are **not verified in the simulator**.
- Values of other types are converted by JS truthiness.
- No change event: only the app's own code changes it.

## Examples

```js
const scroller = new UIScrollView();
scroller.isDirectionalLockEnabled = true;
```

**Effect**: if a drag starts horizontally, that drag scrolls only horizontally. **Not verified in the simulator.**

## Corresponding iOS API

`UIScrollView.directionalLockEnabled` (the getter is `isDirectionalLockEnabled`).
