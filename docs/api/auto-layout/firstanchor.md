---
type: reference
native: NSLayoutConstraint.firstAnchor
---

# `NSLayoutConstraint`：`firstAnchor` 属性

**`firstAnchor`** 属性是约束等式左边的锚点。

## 值

[`NSLayoutXAxisAnchor`](../ns-layout-x-axis-anchor.md)、[`NSLayoutYAxisAnchor`](../ns-layout-y-axis-anchor.md) 或 [`NSLayoutDimension`](../ns-layout-dimension.md)。

- 只读。给它赋值抛 `TypeError`。
- 和创建约束时调用方法的那个锚点是同一个对象，可以用 `===` 比较。
- 约束上没有 `firstItem` 和 `secondItem`。要找约束两端的视图，自己在创建约束时记下来。

## 示例

```js
const parent = new UIView();
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

const c = box.topAnchor.constraintEqualToAnchor(parent.topAnchor);
console.log(c.firstAnchor === box.topAnchor);
```

**结果**：输出 `true`。

## 对应的 iOS API

`NSLayoutConstraint.firstAnchor`。

## 参见

- [`secondAnchor`](secondanchor.md)
