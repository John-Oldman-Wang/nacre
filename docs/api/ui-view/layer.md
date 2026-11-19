---
type: reference
native: UIView.layer
---

# `UIView`：`layer` 属性

**`layer`** 属性是视图的图层：视图背后负责绘制的对象。圆角、边框、阴影在它上面设。

## 值

[`CALayer`](../ca-layer.md)。

- 只读。给它赋值抛 `TypeError`。
- 每个视图对应一个图层，多次读取得到同一个对象。

## 示例

```js
const card = new UIView();
card.layer.cornerRadius = 12;
console.log(card.layer === card.layer);
```

**效果**：视图的四个角变成半径 12 pt 的圆角。控制台输出 `true`。

## 对应的 iOS API

`UIView.layer`。

## 参见

- [`CALayer`](../ca-layer.md)：圆角、边框、阴影、渐变
- [`clipsToBounds`](clipstobounds.md)
