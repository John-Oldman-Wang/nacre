---
type: reference
native: "-[UIView removeGestureRecognizer:]"
---

# `UIView`: `removeGestureRecognizer()` method

The **`removeGestureRecognizer()`** method removes a gesture recognizer from the view.

## Syntax

```
removeGestureRecognizer(recognizer)
```

### Parameters

**`recognizer`**

A [`UIGestureRecognizer`](../ui-gesture-recognizer.md).

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

The argument isn't a recognizer: `removeGestureRecognizer needs a UIGestureRecognizer`. **The exact message is not verified in the simulator.**

## Examples

```js
const card = new UIView();
const tap = new UITapGestureRecognizer();
card.addGestureRecognizer(tap);
card.removeGestureRecognizer(tap);
console.log(card.gestureRecognizers.includes(tap));
```

**Result**: Logs `false`.

## Corresponding iOS API

`-[UIView removeGestureRecognizer:]`.

## See also

- [`addGestureRecognizer()`](addgesturerecognizer.md)
