---
type: reference
native: "-[UIStackView initWithArrangedSubviews:]"
---

# `UIStackView()` constructor

The **`UIStackView()`** constructor creates a stack view, optionally with an initial set of arranged subviews.

## Syntax

```
new UIStackView([arrangedSubviews])
```

### Parameters

**`arrangedSubviews`**

The arranged subviews to start with, an array of `UIView`, arranged in array order. Optional; without it, the stack view is empty.

- Can be an array or any iterable. Passing `null` or `undefined` is the same as not passing it.
- The views in the array also become subviews of the stack view; you do not need to call `addSubview()` as well.
- Views in the array that already have a superview are removed from it.
- The `translatesAutoresizingMaskIntoConstraints` of the views in the array is set to `false`.

### Return value

The new `UIStackView`. Its position is `(0, 0)` and its width and height are 0; `axis` is `'horizontal'`, `distribution` and `alignment` are `'fill'`, and `spacing` is 0.

### Exceptions

**`TypeError`**

`UIStackView` cannot be subclassed: after `class X extends UIStackView {}`, `new X()` throws. See [Native classes](../native-classes.md).

Elements in the array that are not views (numbers, strings, `null`) **do not throw; they are skipped**. This is inconsistent with [`addArrangedSubview()`](addarrangedsubview.md) and other methods, and is a known issue. Type checking catches this mistake.

## Examples

```js
const red = new UIView();
red.backgroundColor = 'systemRed';
const teal = new UIView();
teal.backgroundColor = 'systemTeal';

const empty = new UIStackView();
const filled = new UIStackView([red, teal]);

console.log(empty.arrangedSubviews.length, filled.arrangedSubviews.length);
console.log(red.superview === filled);
```

**Result**: Prints `0 2`, then `true`.

## Corresponding iOS API

`[[UIStackView alloc] init]` is written `new UIStackView()`; `[[UIStackView alloc] initWithArrangedSubviews:@[a, b]]` is written `new UIStackView([a, b])`.

## See also

- [`addArrangedSubview()`](addarrangedsubview.md): adding arranged subviews later
- [Arranged subviews and subviews](../ui-stack-view.md#arranged-subviews-and-subviews)
