---
type: reference
native: CAGradientLayer.type
---

# `CAGradientLayer`：`type` 属性

**`type`** 属性是渐变的形状。

## 值

字符串：

| 取值 | 效果 |
| --- | --- |
| `'axial'` | 颜色沿一条直线变化 |
| `'radial'` | 颜色从圆心向外变化 |
| `'conic'` | 颜色绕圆心转一圈变化 |

- 可读，可写。
- 默认值是 `'axial'`。
- `startPoint` 和 `endPoint` 在每种取值下的含义见[单位坐标](../ca-gradient-layer.md#单位坐标)。
- `'radial'` 和 `'conic'` 画出来的样子**未在模拟器验证**。

### 写错时

写了表里没有的值时不抛异常：属性保持原来的值，控制台输出一条警告：

```
[Nacre] type has no value "linear"; expected one of: axial / radial / conic, ignored
```

## 示例

```js
const gradient = new CAGradientLayer();
gradient.type = 'radial';
gradient.startPoint = new CGPoint(0.5, 0.5);
gradient.endPoint = new CGPoint(1, 1);
console.log(gradient.type);
```

**结果**：控制台输出 `radial`。颜色从图层中心向外变化，**未在模拟器验证**。

## 对应的 iOS API

`CAGradientLayer.type`。`kCAGradientLayerRadial` 写成 `'radial'`，其余同理。

## 参见

- [`startPoint`](startpoint.md)、[`endPoint`](endpoint.md)
