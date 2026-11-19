---
type: reference
native: CAKeyframeAnimation.rotationMode
---

# `CAKeyframeAnimation`：`rotationMode` 属性

**`rotationMode`** 属性决定图层沿[路径](path.md)移动时，朝向是否跟着行进方向转。

## 值

下面三个之一：

| 取值 | 效果 |
| --- | --- |
| `null` | 图层不转向 |
| `'auto'` | 图层转向行进的方向 |
| `'autoReverse'` | 图层转向行进方向的反方向 |

- 可读，可写。
- 默认值是 `null`。
- 只在设了 [`path`](path.md) 时使用。圆形的图层转了也看不出来，长条形的图层才有区别。

### 写错时

写入表里没有的值：不抛异常，控制台输出一条警告，列出全部可用的值，`rotationMode` 保持原来的值。

## 示例

```js
const trail = new UIBezierPath();
trail.moveToPoint(new CGPoint(30, 130));
trail.addQuadCurveToPoint(new CGPoint(270, 130), { controlPoint: new CGPoint(150, 10) });

const walk = CAKeyframeAnimation.animationWithKeyPath('position');
walk.path = trail;
walk.rotationMode = 'auto';
walk.duration = 2.4;
```

**效果**：加到一个长条形的图层上之后，图层沿弧线移动，长边始终朝着行进的方向。**未在模拟器验证。**

## 对应的 iOS API

`CAKeyframeAnimation.rotationMode`。`kCAAnimationRotateAuto` 写成 `'auto'`，`kCAAnimationRotateAutoReverse` 写成 `'autoReverse'`。

## 参见

- [`path`](path.md)
