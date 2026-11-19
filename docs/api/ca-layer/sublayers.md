---
type: reference
native: CALayer.sublayers
---

# `CALayer`：`sublayers` 属性

**`sublayers`** 属性是图层的子图层，靠后的画在上面。

## 值

`CALayer` 的数组。

- 只读。给它赋值抛 `TypeError`。改顺序用 [`insertSublayer()`](insertsublayer.md)。
- 没有子图层时是空数组。
- 里面的图层读出来是它实际的类：渐变图层读出来是 `CAGradientLayer`，形状图层是 `CAShapeLayer`。
- 视图的图层的 `sublayers` 里，除了代码加进去的图层，还有每个子视图的图层。**这一句未在模拟器验证。**

## 示例

```js
const host = new CALayer();
host.addSublayer(new CAGradientLayer());
host.addSublayer(new CAShapeLayer());
console.log(host.sublayers.length, host.sublayers[0] instanceof CAGradientLayer);
```

**结果**：控制台输出 `2 true`。

## 对应的 iOS API

`CALayer.sublayers`。原生里没有子图层时是 `nil`，这里是空数组。

## 参见

- [`superlayer`](superlayer.md)
- [`addSublayer()`](addsublayer.md)
