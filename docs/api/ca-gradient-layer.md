---
type: reference
native: CAGradientLayer
status: partial
---

# `CAGradientLayer`

**`CAGradientLayer`** 表示渐变图层：在自己的矩形范围里画一段颜色渐变。渐变可以沿一条直线、从中心向外，或者绕中心转一圈。

它是一个[图层](ca-layer.md)，和别的子图层一样要自己设 `frame`，再加到某个视图的图层下面。颜色至少给两个，不然什么都看不见。

`CAGradientLayer` 不派发事件。它的属性只会被 App 的代码修改，所以没有变化通知。

**继承关系**：`EventTarget` → `NSObject` → [`CALayer`](ca-layer.md) → `CAGradientLayer`

怎么做渐变底色、改方向，见指南[用图层画圆角、阴影、渐变和形状](../guides/layers.md)。

## 构造函数

[`CAGradientLayer()`](ca-gradient-layer/constructor.md)

创建一个渐变图层。大小是 0 × 0 pt，没有颜色。

## 实例属性

还继承 [`CALayer`](ca-layer.md) 的属性，常用的是 `frame`、`cornerRadius`。

| 属性 | 说明 |
| --- | --- |
| [`colors`](ca-gradient-layer/colors.md) | 渐变依次经过的颜色 |
| [`locations`](ca-gradient-layer/locations.md) | 每个颜色的位置 |
| [`startPoint`](ca-gradient-layer/startpoint.md) | 起点 |
| [`endPoint`](ca-gradient-layer/endpoint.md) | 终点 |
| [`type`](ca-gradient-layer/type.md) | 渐变的形状 |

## 实例方法

`CAGradientLayer` 没有自己的方法。还继承 [`CALayer`](ca-layer.md) 的方法。

## 单位坐标

[`startPoint`](ca-gradient-layer/startpoint.md) 和 [`endPoint`](ca-gradient-layer/endpoint.md) 用单位坐标：`(0, 0)` 是图层的左上角，`(1, 1)` 是右下角，和图层的实际大小无关。默认从 `(0.5, 0)` 到 `(0.5, 1)`，也就是从上到下。

两个点在每种 [`type`](ca-gradient-layer/type.md) 下的含义：

| `type` | 效果 | `startPoint` | `endPoint` |
| --- | --- | --- | --- |
| `'axial'` | 颜色沿一条直线变化 | 直线的起点 | 直线的终点 |
| `'radial'` | 颜色从圆心向外变化 | 圆心 | 决定圆的大小 |
| `'conic'` | 颜色绕圆心转一圈变化 | 圆心 | 决定从哪个角度开始 |

`'radial'` 和 `'conic'` 画出来的样子**未在模拟器验证**。

## 示例

### 从左上到右下的渐变

```js
const card = new UIView();
card.frame = new CGRect(20, 100, 300, 160);

const gradient = new CAGradientLayer();
gradient.colors = ['#5856D6', '#FF2D55'];
gradient.startPoint = new CGPoint(0, 0);
gradient.endPoint = new CGPoint(1, 1);
gradient.frame = card.bounds;
card.layer.addSublayer(gradient);
```

**效果**：卡片的底色从左上角的紫色渐变到右下角的粉红色。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[CAGradientLayer layer]` | `new CAGradientLayer()` |
| `gradient.colors = @[(id)a.CGColor, (id)b.CGColor]` | `gradient.colors = ['#000', '#fff']` |
| `gradient.locations = @[@0, @0.3, @1]` | `gradient.locations = [0, 0.3, 1]` |
| `gradient.type = kCAGradientLayerRadial` | `gradient.type = 'radial'` |

## 参见

- [`CALayer`](ca-layer.md)：父类，子图层的大小、图层上的颜色
- [用图层画圆角、阴影、渐变和形状](../guides/layers.md)
- [`UIColor`](ui-color.md)：颜色字符串的写法
