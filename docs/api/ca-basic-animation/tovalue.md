---
type: reference
native: CABasicAnimation.toValue
---

# `CABasicAnimation`：`toValue` 属性

**`toValue`** 属性是动画的终点值。

## 值

类型由 [`keyPath`](../ca-property-animation/keypath.md) 决定，见[能做动画的属性](../ca-property-animation.md#能做动画的属性)；或者 `null`。

- 可读，可写。
- 默认值是 `null`。
- 不给时，终点用属性的值；只给 `fromValue` 和 `byValue` 时，终点是两者之和。**未在模拟器验证。**
- 读出来的值：数是数；`CGPoint`、`CGSize`、`CGRect` 是对应的结构体；颜色是字符串；路径和图片是对象。
- 颜色读出来是字符串。随深浅色变化的颜色（如 `'systemBlue'`）读出来是换算后的固定颜色，规则和[图层上的颜色](../ca-layer.md#图层上的颜色)相同。
- 数必须写成数。字符串一律当作颜色，`'0.5'` 不会被当成 0.5。
- 写 `null` 或 `undefined` 清掉这个值。

### 写错时

颜色写错时不抛异常：控制台输出一条警告，原来的值不变。

其他情况抛 `TypeError`：

- 还没有 `keyPath`：`set keyPath before toValue; the value's type depends on it`
- 类型和 `keyPath` 不对应：`toValue does not fit keyPath "position"`
- `keyPath` 要颜色，给的不是：`toValue for keyPath "strokeColor" needs a color`
- `keyPath` 要路径，给的不是：`toValue for keyPath "path" needs a UIBezierPath`
- `keyPath` 要图片，给的不是：`toValue for keyPath "contents" needs a UIImage`
- 给的不是数、结构体、颜色、路径、图片中的任何一种：`toValue needs a number, a CGPoint / CGSize / CGRect, a color, a UIBezierPath, or a UIImage`

## 示例

```js
const stroke = CABasicAnimation.animationWithKeyPath('strokeColor');
stroke.fromValue = 'systemBlue';
stroke.toValue = '#FF2D55';
stroke.duration = 1;
console.log(stroke.toValue);
```

**效果**：加到形状图层上之后，描边颜色在 1 秒里从蓝色渐变到粉红色（**画面上的表现未在模拟器验证**）。控制台输出 `#FF2D55`：十六进制写法的颜色原样读回。

## 对应的 iOS API

`CABasicAnimation.toValue`。ObjC 里要包成 `NSNumber`、`NSValue`、`CGColorRef`、`CGPathRef` 的值，这里直接写数、结构体、颜色字符串、`UIBezierPath`。

## 参见

- [`fromValue`](fromvalue.md)：起点值
- [`byValue`](byvalue.md)：变化量
- [颜色](../ui-color.md)：颜色值的写法
