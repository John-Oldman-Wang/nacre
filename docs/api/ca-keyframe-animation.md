---
type: reference
native: CAKeyframeAnimation
status: partial
---

# `CAKeyframeAnimation`

**`CAKeyframeAnimation`** 表示让图层的一个属性依次经过几个值的动画，或者让图层沿一条路径移动的动画。经过的值叫关键帧。

关键帧值的类型和 [`CABasicAnimation`](ca-basic-animation.md) 的 `toValue` 一样由 [`keyPath`](ca-property-animation/keypath.md) 决定，所以要先有 `keyPath` 才能设 `values`。

**继承关系**：`EventTarget` → `NSObject` → [`CAAnimation`](ca-animation.md) → [`CAPropertyAnimation`](ca-property-animation.md) → `CAKeyframeAnimation`

怎么用它做闪烁、换色、沿路径移动，见指南[做动画](../guides/animation.md#依次经过几个值)。

## 构造函数

[`CAKeyframeAnimation()`](ca-keyframe-animation/constructor.md)

创建一个还没有指定属性的关键帧动画。

## 静态方法

[`CAKeyframeAnimation.animationWithKeyPath()`](ca-keyframe-animation/animationwithkeypath.md)

创建一个指定了属性的关键帧动画。

## 实例属性

还继承 [`CAPropertyAnimation`](ca-property-animation.md) 的 `keyPath`，以及 [`CAAnimation`](ca-animation.md) 的属性，常用的是 `duration`、`repeatCount`、`autoreverses`。

| 属性 | 说明 |
| --- | --- |
| [`values`](ca-keyframe-animation/values.md) | 依次经过的值 |
| [`path`](ca-keyframe-animation/path.md) | 图层沿这条路径移动。设了它，`values` 不起作用 |
| [`keyTimes`](ca-keyframe-animation/keytimes.md) | 每个值出现的时刻 |
| [`timingFunctions`](ca-keyframe-animation/timingfunctions.md) | 相邻两个值之间各用的时间曲线 |
| [`calculationMode`](ca-keyframe-animation/calculationmode.md) | 值与值之间怎么过渡 |
| [`rotationMode`](ca-keyframe-animation/rotationmode.md) | 沿路径移动时图层是否转向 |
| [`tensionValues`](ca-keyframe-animation/tensionvalues.md) | 平滑曲线在每个值附近的松紧 |
| [`continuityValues`](ca-keyframe-animation/continuityvalues.md) | 平滑曲线在每个值附近的连续性 |
| [`biasValues`](ca-keyframe-animation/biasvalues.md) | 平滑曲线在每个值附近的偏向 |

## 事件

继承 [`CAAnimation`](ca-animation.md) 的 [`start`](ca-animation/start-event.md) 和 [`stop`](ca-animation/stop-event.md)。

## 示例

```js
const layer = new CALayer();
layer.frame = new CGRect(20, 70, 20, 20);
layer.backgroundColor = 'systemBlue';

const blink = CAKeyframeAnimation.animationWithKeyPath('opacity');
blink.values = [1, 0.2, 1, 0.2, 1];
blink.keyTimes = [0, 0.2, 0.5, 0.7, 1];
blink.duration = 1.5;
layer.addAnimation(blink, { forKey: 'blink' });
```

**效果**：图层显示在屏幕上之后，在 1.5 秒里闪两下：变淡、恢复、再变淡、再恢复。**未在模拟器验证。**

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[CAKeyframeAnimation animationWithKeyPath:@"position"]` | `CAKeyframeAnimation.animationWithKeyPath('position')` |
| `keyframe.values = @[@0, @1]` | `keyframe.values = [0, 1]` |
| `keyframe.path = path.CGPath` | `keyframe.path = path` |
| `keyframe.calculationMode = kCAAnimationPaced` | `keyframe.calculationMode = 'paced'` |
| `keyframe.rotationMode = kCAAnimationRotateAuto` | `keyframe.rotationMode = 'auto'` |

## 参见

- [做动画](../guides/animation.md)：依次经过几个值、不渐变地换值、沿路径移动
- [`UIBezierPath`](ui-bezier-path.md)：沿路径移动用到的路径
- [`UIImage`](../guides/images.md#自己控制动图的播放)：用一组图片做逐帧动画
