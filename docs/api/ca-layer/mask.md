---
type: reference
native: CALayer.mask
---

# `CALayer`：`mask` 属性

**`mask`** 属性是图层的遮罩：另一个图层，它不透明的部分决定这个图层哪里显示、哪里不显示。

## 值

[`CALayer`](../ca-layer.md)（包括 [`CAShapeLayer`](../ca-shape-layer.md)、[`CAGradientLayer`](../ca-gradient-layer.md)），或者 `null`。

- 可读，可写。
- 默认值是 `null`，表示没有遮罩，整个图层照常显示。
- 读出来的是写进去的那个对象。写 `null` 去掉遮罩。
- 图层保管它的遮罩：写进去之后，代码里不需要另外保存遮罩图层。
- 只看遮罩图层每一处的不透明度，不看颜色：遮罩不透明的地方显示这个图层，透明的地方不显示，半透明的地方半透明地显示。**屏幕上的效果未在模拟器验证。**
- 遮罩图层的 `frame` 按这个图层自己的坐标系算，和子图层一样。遮罩图层不加到任何父图层下面。**未在模拟器验证。**

视图上做同样的事用 [`UIView.maskView`](../ui-view/maskview.md)，遮罩是一个视图。

### 写错时

**`TypeError`**

写入的是别的原生对象，比如一个视图：

```
TypeError: mask needs a CALayer or null
```

写入的不是原生对象：

```
TypeError: mask needs a native object or null, got "x"
```

出错时属性保持原值。

## 示例

用一个圆形的形状图层，把方形的图层裁成圆形：

```js
const avatar = new CALayer();
avatar.frame = new CGRect(40, 120, 96, 96);
avatar.backgroundColor = 'systemTeal';

const circle = new CAShapeLayer();
circle.frame = new CGRect(0, 0, 96, 96);
circle.path = UIBezierPath.bezierPathWithOvalInRect(new CGRect(0, 0, 96, 96));
avatar.mask = circle;

console.log(avatar.mask === circle);
```

**效果**

- 控制台输出 `true`。
- 图层只显示圆形里的部分，四个角不显示。形状图层的填充色默认是黑色，不透明，所以圆里面全部显示。**屏幕上的样子未在模拟器验证。**

只是要圆角时用 [`cornerRadius`](cornerradius.md) 加 [`masksToBounds`](maskstobounds.md)，不需要遮罩。

## 对应的 iOS API

`CALayer.mask`。

## 参见

- [`masksToBounds`](maskstobounds.md)：按图层自己的范围裁剪
- [`CAShapeLayer`](../ca-shape-layer.md)：用路径画遮罩的形状
- [`UIView.maskView`](../ui-view/maskview.md)：视图上的遮罩
