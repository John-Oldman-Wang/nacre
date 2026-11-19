---
type: reference
native: "-[UIStackView insertArrangedSubview:atIndex:]"
---

# `UIStackView`: `insertArrangedSubview()` method

The **`insertArrangedSubview()`** method inserts a view at a given position in the arrangement.

## Syntax

```
insertArrangedSubview(view, { atIndex })
```

### Parameters

**`view`**

The `UIView` to insert.

**`options.atIndex`**

An integer, required. The view's position in the arrangement after insertion, starting at 0. The range is 0 to the current number of items; equal to the number of items appends at the end, with the same effect as [`addArrangedSubview()`](addarrangedsubview.md). Fractions are truncated toward zero.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- `atIndex` is missing, or written as `{ atIndex: undefined }`: `insertArrangedSubview needs { atIndex }`.
- `atIndex` cannot be converted to a finite number (`NaN`, `'abc'`): `atIndex must be a finite number, got NaN`.
- `view` is not a view: `insertArrangedSubview needs a UIView`.
- `atIndex` is out of range: `insertArrangedSubview: atIndex 99 is out of range (0...3)`. The parentheses show the allowed range; the second number is the current number of items.

When it throws, nothing is inserted and the arrangement is unchanged.

## Description

- The view also becomes a subview of the stack view, and its `translatesAutoresizingMaskIntoConstraints` is set to `false`, the same as with `addArrangedSubview()`.
- If the view is already an arranged subview, it is moved to the new position. **Not verified in the simulator.**

## Examples

```js
const [red, orange, teal] = ['systemRed', 'systemOrange', 'systemTeal'].map((color) => {
  const block = new UIView();
  block.backgroundColor = color;
  return block;
});
const row = new UIStackView([red, orange, teal]);
row.distribution = 'fillEqually';

const purple = new UIView();
purple.backgroundColor = 'systemPurple';
row.insertArrangedSubview(purple, { atIndex: 1 });
```

**Effect**: The purple block is second, making the order red, purple, orange, teal, with all four items the same width.

## Corresponding iOS API

`-[UIStackView insertArrangedSubview:atIndex:]`, with `atIndex:` written as an options key.

## See also

- [`addArrangedSubview()`](addarrangedsubview.md)
