---
type: reference
native: +[CATransaction begin]
---

# `CATransaction.begin()` static method

The **`CATransaction.begin()`** static method starts a transaction. Transaction settings made afterward apply only to changes inside this transaction, until the matching [`commit()`](commit.md).

## Syntax

```
CATransaction.begin()
```

### Parameters

None.

### Return value

None (`undefined`).

### Exceptions

None.

## Description

- `begin()` and `commit()` come in pairs.
- Transactions can be nested. Settings not made in the inner one are inherited from the outer one. **Nesting is not verified in the simulator.**

## Examples

```js
const dot = new CALayer();

CATransaction.begin();
CATransaction.setDisableActions(true);
dot.position = new CGPoint(150, 80);
dot.opacity = 0.5;
CATransaction.commit();
```

**Effect**: the layer appears at the new position immediately and becomes semi-transparent, with no transition.

## Corresponding iOS API

`+[CATransaction begin]`.

## See also

- [`commit()`](commit.md)
