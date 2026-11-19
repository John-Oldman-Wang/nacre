---
type: reference
native: "-[NSLayoutDimension constraintGreaterThanOrEqualToAnchor:multiplier:constant:]"
---

# `NSLayoutDimension`：`constraintGreaterThanOrEqualToAnchor()` 方法

**`constraintGreaterThanOrEqualToAnchor()`** 方法创建一条约束：这个尺寸大于或等于另一个尺寸乘以倍数再加上常数（这个尺寸 ≥ `other` × `multiplier` + `constant`）。

它覆盖了 [`NSLayoutAnchor`](../ns-layout-anchor.md) 上的同名方法，多了 `multiplier`。

## 语法

```
constraintGreaterThanOrEqualToAnchor(other[, { multiplier, constant }])
```

### 参数

**`other`**

另一个 `NSLayoutDimension`：宽或高。宽和高是同一种类型，可以互相约束，同一个视图的高可以约束到它自己的宽。

**`options.multiplier`**

数，比例，没有单位。可省略，省略时是 `1`。

**`options.constant`**

数，单位 [pt](../units.md)。可省略，省略时是 `0`。

两个都可以同时给：`{ multiplier: 0.5, constant: -8 }` 表示「一半再减 8 pt」。

### 返回值

新的 [`NSLayoutConstraint`](../auto-layout.md)。**它还没有激活**，要用 [`NSLayoutConstraint.activateConstraints()`](../auto-layout/activateconstraints.md) 或 [`isActive`](../auto-layout/isactive.md) 激活之后才参与布局。

### 异常

**`TypeError`**

- `other` 不是尺寸锚点：和 [`NSLayoutAnchor.constraintGreaterThanOrEqualToAnchor()`](../ns-layout-anchor/constraintgreaterthanorequaltoanchor.md) 相同。
- `multiplier` 或 `constant` 转不成有限数：`multiplier must be a finite number, got "abc"`（或 `constant …`）。

## 示例

```js
const parent = new UIView();
const cover = new UIView();
cover.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(cover);

const ratio = cover.heightAnchor.constraintGreaterThanOrEqualToAnchor(cover.widthAnchor, { multiplier: 9 / 16 });
ratio.isActive = true;
console.log(ratio.multiplier);
```

**效果**：`cover` 的高大于或等于宽的 9/16。控制台输出 `0.5625`。`multiplier` 在屏幕上的效果**未在模拟器验证**。

## 对应的 iOS API

`-[NSLayoutDimension constraintGreaterThanOrEqualToAnchor:multiplier:]`、`-[NSLayoutDimension constraintGreaterThanOrEqualToAnchor:multiplier:constant:]` 和 `-[NSLayoutAnchor constraintGreaterThanOrEqualToAnchor:constant:]` 在 JS 里是同一个方法，`multiplier:`、`constant:` 写成 options 的键。

## 参见

- [`constraintEqualToAnchor()`](constraintequaltoanchor.md)
- [`constraintLessThanOrEqualToAnchor()`](constraintlessthanorequaltoanchor.md)
- [`constraintGreaterThanOrEqualToConstant()`](constraintgreaterthanorequaltoconstant.md)：和常数比
