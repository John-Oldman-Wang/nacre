---
type: reference
native: CABasicAnimation.fromValue
---

# `CABasicAnimation`：`fromValue` 属性

**`fromValue`** 属性是动画的起点值。

## 值

类型由 [`keyPath`](../ca-property-animation/keypath.md) 决定，见[能做动画的属性](../ca-property-animation.md#能做动画的属性)；或者 `null`。

- 可读，可写。
- 默认值是 `null`。
- 不给时，起点用属性的值。**未在模拟器验证。**
- 读出来的值：数是数；`CGPoint`、`CGSize`、`CGRect` 是对应的结构体；颜色是字符串；路径和图片是对象。
- 颜色读出来是字符串。随深浅色变化的颜色（如 `'systemBlue'`）读出来是换算后的固定颜色，规则和[图层上的颜色](../ca-layer.md#图层上的颜色)相同。
- 数必须写成数。字符串一律当作颜色，`'0.5'` 不会被当成 0.5。
- 写 `null` 或 `undefined` 清掉这个值。

### 写错时

颜色写错时不抛异常：控制台输出一条警告，原来的值不变。

其他情况抛 `TypeError`：

- 还没有 `keyPath`：`set keyPath before fromValue; the value's type depends on it`
- 类型和 `keyPath` 不对应：`fromValue does not fit keyPath "position"`
- `keyPath` 要颜色，给的不是：`fromValue for keyPath "strokeColor" needs a color`
- `keyPath` 要路径，给的不是：`fromValue for keyPath "path" needs a UIBezierPath`
- `keyPath` 要图片，给的不是：`fromValue for keyPath "contents" needs a UIImage`
- 给的不是数、结构体、颜色、路径、图片中的任何一种：`fromValue needs a number, a CGPoint / CGSize / CGRect, a color, a UIBezierPath, or a UIImage`

## 示例

```js
const move = CABasicAnimation.animationWithKeyPath('position');
move.fromValue = new CGPoint(30, 80);
move.toValue = new CGPoint(270, 80);
move.duration = 0.6;
console.log(String(move.fromValue));
```

**效果**：加到图层上之后，图层的中心在 0.6 秒里从 (30, 80) 移到 (270, 80)。控制台输出 `CGPoint(30, 80)`。

## 对应的 iOS API

`CABasicAnimation.fromValue`。ObjC 里要包成 `NSNumber`、`NSValue`、`CGColorRef`、`CGPathRef` 的值，这里直接写数、结构体、颜色字符串、`UIBezierPath`。

## 参见

- [`toValue`](tovalue.md)：终点值
- [`byValue`](byvalue.md)：变化量
