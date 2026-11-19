---
type: reference
native: "-[NSLayoutAnchor constraintLessThanOrEqualToAnchor:constant:]"
---

# `NSLayoutAnchor`：`constraintLessThanOrEqualToAnchor()` 方法

**`constraintLessThanOrEqualToAnchor()`** 方法创建一条约束：这个锚点小于或等于另一个锚点加上一个常数（这个锚点 ≤ `other` + `constant`）。

`NSLayoutXAxisAnchor`、`NSLayoutYAxisAnchor`、`NSLayoutDimension` 都有这个方法。`NSLayoutDimension` 的版本还能带 `multiplier`，见 [`NSLayoutDimension.constraintLessThanOrEqualToAnchor()`](../ns-layout-dimension/constraintlessthanorequaltoanchor.md)。

## 语法

```
constraintLessThanOrEqualToAnchor(other[, { constant }])
```

### 参数

**`other`**

同一种类型的另一个锚点：水平位置只能连水平位置，垂直位置只能连垂直位置，尺寸只能连尺寸。

**`options.constant`**

数，单位 [pt](../units.md)，可省略，省略时是 `0`。水平方向向右为正，垂直方向向下为正。写成 `{ constant: undefined }` 和省略相同。之后可以改约束的 [`constant`](../auto-layout/constant.md)。

### 返回值

新的 [`NSLayoutConstraint`](../auto-layout.md)。**它还没有激活**，要用 [`NSLayoutConstraint.activateConstraints()`](../auto-layout/activateconstraints.md) 或 [`isActive`](../auto-layout/isactive.md) 激活之后才参与布局。

### 异常

**`TypeError`**

- `other` 是另一种类型的锚点：`NSLayoutYAxisAnchor cannot be constrained to NSLayoutXAxisAnchor: their units are not compatible`，两个类名是实际的类名。
- `other` 不是锚点（包括 `null`）：`constraintLessThanOrEqualToAnchor: needs an anchor as its argument`。开头是完整的原生方法名，带了 `constant` 时是 `constraintLessThanOrEqualToAnchor:constant:`。
- `constant` 转不成有限数：`constant must be a finite number, got "abc"`。

类型不对的锚点，类型检查在编辑器里就会报错。

## 示例

```js
const parent = new UIView();
const a = new UIView();
const b = new UIView();
for (const v of [a, b]) {
  v.translatesAutoresizingMaskIntoConstraints = false;
  parent.addSubview(v);
}

const c = b.topAnchor.constraintLessThanOrEqualToAnchor(a.bottomAnchor, { constant: 20 });
c.isActive = true;
console.log(c.relation, c.constant);
```

**结果**：`b` 的上边最多在 `a` 的下边再往下 20 pt 处。控制台输出 `lessThanOrEqual 20`。

## 对应的 iOS API

`-[NSLayoutAnchor constraintLessThanOrEqualToAnchor:]` 和 `-[NSLayoutAnchor constraintLessThanOrEqualToAnchor:constant:]` 在 JS 里是同一个方法，`constant:` 写成 options 的键。

## 参见

- [`constraintEqualToAnchor()`](constraintequaltoanchor.md)
- [`constraintGreaterThanOrEqualToAnchor()`](constraintgreaterthanorequaltoanchor.md)
- [约束是一个等式](../auto-layout.md#约束是一个等式)
