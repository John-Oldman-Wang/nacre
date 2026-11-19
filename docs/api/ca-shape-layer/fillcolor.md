---
type: reference
native: CAShapeLayer.fillColor
---

# `CAShapeLayer`：`fillColor` 属性

**`fillColor`** 属性是填充路径围出的区域用的颜色。

## 值

[颜色](../ui-color.md)字符串，或者 `null`。

- 可读，可写。
- **默认值是 `'#000000'`，不透明的黑色。** 只要线条时必须设成 `null`，不然路径围出的区域被填成黑色。
- `null` 是不填充。
- 没有闭合的路径也会被填充：填充时按起点和终点连起来算。
- 写入时接受[颜色字符串](../ui-color.md)，也接受 `UIColor` 对象。
- 随深浅色模式变化的颜色在写入时换算成一个固定的颜色，之后切换模式不会变，见[图层上的颜色](../ca-layer.md#图层上的颜色)。

### 写错时

写入不合法的颜色时不抛异常。控制台输出一条警告，属性保持原来的值：

```
[Nacre] fillColor: "#GGG" is not a valid color, ignored
```

## 示例

```js
const shape = new CAShapeLayer();
shape.path = UIBezierPath.bezierPathWithRect(new CGRect(20, 20, 260, 120));
shape.fillColor = 'systemOrange';
```

**效果**：一个填成橙色的 260 × 120 pt 矩形。

## 对应的 iOS API

`CAShapeLayer.fillColor`。`UIColor.clearColor.CGColor` 写成 `null`。

## 参见

- [`fillRule`](fillrule.md)
- [`strokeColor`](strokecolor.md)
