---
type: reference
native: CAShapeLayer.strokeColor
---

# `CAShapeLayer`：`strokeColor` 属性

**`strokeColor`** 属性是线的颜色。

## 值

[颜色](../ui-color.md)字符串，或者 `null`。

- 可读，可写。
- **默认值是 `null`，不描边。** 只设 `lineWidth` 不设颜色，看不到线。
- 写入时接受[颜色字符串](../ui-color.md)，也接受 `UIColor` 对象。
- 随深浅色模式变化的颜色在写入时换算成一个固定的颜色，之后切换模式不会变，见[图层上的颜色](../ca-layer.md#图层上的颜色)。

### 写错时

写入不合法的颜色时不抛异常。控制台输出一条警告，属性保持原来的值：

```
[Nacre] strokeColor: "#GGG" is not a valid color, ignored
```

## 示例

```js
const shape = new CAShapeLayer();
shape.path = UIBezierPath.bezierPathWithRect(new CGRect(20, 20, 260, 120));
shape.fillColor = null;
shape.strokeColor = 'systemBlue';
```

**效果**：一个蓝色线框的矩形，线宽 1 pt。

## 对应的 iOS API

`CAShapeLayer.strokeColor`。

## 参见

- [`lineWidth`](linewidth.md)
- [`fillColor`](fillcolor.md)
