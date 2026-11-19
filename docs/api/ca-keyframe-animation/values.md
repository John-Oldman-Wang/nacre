---
type: reference
native: CAKeyframeAnimation.values
---

# `CAKeyframeAnimation`：`values` 属性

**`values`** 属性是动画依次经过的值，也就是关键帧。

## 值

数组，每一项的类型由 [`keyPath`](../ca-property-animation/keypath.md) 决定，规则和 [`CABasicAnimation.toValue`](../ca-basic-animation/tovalue.md) 相同；或者 `null`。

- 可读，可写。
- 默认值是 `null`。
- 设了 [`path`](path.md) 之后，`values` 不起作用。
- 每个值出现的时刻由 [`keyTimes`](keytimes.md) 决定，不设时间隔相等。
- 相邻两个值之间默认是连续变化的，怎么过渡由 [`calculationMode`](calculationmode.md) 决定。
- 各项的类型要相同。是按第一项判断整个数组是哪一类的。
- 是颜色时，读出来的是字符串，随深浅色变化的颜色读出来是换算后的固定颜色，不一定是写进去的字符串。
- 是图片时，读出来的每一项是一个新的 `UIImage` 对象，不是写进去的那个，它的 `scale` 是 1。用一组图片做逐帧动画的写法见[自己控制动图的播放](../../guides/images.md#自己控制动图的播放)。
- 写 `null` 或 `undefined` 清掉。

### 写错时

- 某一项是写错的颜色：不抛异常，控制台输出一条警告，整次赋值不生效。
- 还没有 `keyPath`：抛 `TypeError: set keyPath before values; the value's type depends on it`。
- 值的类型和 `keyPath` 不对应：抛 `TypeError`。颜色、路径、图片不对应时是 `values does not fit this keyPath`。

## 示例

```js
const flash = CAKeyframeAnimation.animationWithKeyPath('fillColor');
flash.values = ['systemRed', '#FFCC00', 'systemGreen'];
console.log((flash.values || []).length);

const move = CAKeyframeAnimation.animationWithKeyPath('position');
move.values = [new CGPoint(0, 0), new CGPoint(10, 20), new CGPoint(30, 5)];
console.log(String((move.values || [])[1]));
```

**结果**：先输出 `3`，再输出 `CGPoint(10, 20)`。

## 对应的 iOS API

`CAKeyframeAnimation.values`。ObjC 里要包成 `NSNumber`、`NSValue`、`CGColorRef` 的项，这里直接写数、结构体、颜色字符串。

## 参见

- [`keyTimes`](keytimes.md)
- [依次经过几个值](../../guides/animation.md#依次经过几个值)
