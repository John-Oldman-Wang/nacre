---
type: reference
native: NSLayoutConstraint.secondAnchor
---

# `NSLayoutConstraint`：`secondAnchor` 属性

**`secondAnchor`** 属性是约束等式右边的锚点。

## 值

[`NSLayoutXAxisAnchor`](../ns-layout-x-axis-anchor.md)、[`NSLayoutYAxisAnchor`](../ns-layout-y-axis-anchor.md)、[`NSLayoutDimension`](../ns-layout-dimension.md)，或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 和创建约束时传入的 `other` 是同一个对象。
- 约束到常数时是 `null`。

## 示例

```js
const parent = new UIView();
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

const c = box.topAnchor.constraintEqualToAnchor(parent.topAnchor);
console.log(c.secondAnchor === parent.topAnchor);
console.log(box.widthAnchor.constraintEqualToConstant(10).secondAnchor);
```

**结果**：依次输出 `true`、`null`。

## 对应的 iOS API

`NSLayoutConstraint.secondAnchor`。

## 参见

- [`firstAnchor`](firstanchor.md)
