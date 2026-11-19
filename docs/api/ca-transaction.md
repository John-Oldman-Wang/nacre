---
type: reference
native: CATransaction
status: partial
---

# `CATransaction`

**`CATransaction`** 表示事务：一组一起交给系统的图层修改。它用来控制这组修改的隐式动画：关掉它，或者改它的时长和时间曲线。

`CATransaction` 没有实例，全部是静态方法。`begin()` 和 `commit()` 成对出现，两者之间的设置只对这中间的修改有效；`commit()` 之后恢复原状。

**继承关系**：`CATransaction`。它不继承 `NSObject`，也不是 `EventTarget`。

什么时候关掉隐式动画、什么时候自己建动画对象，见指南[关掉隐式动画](../guides/animation.md#关掉隐式动画)。

## 构造函数

不能用 `new` 创建。`new CATransaction()` 抛 `TypeError: Illegal constructor: CATransaction is a set of class methods, not an object`。

## 静态方法

开始和结束一个事务：

| 方法 | 说明 |
| --- | --- |
| [`CATransaction.begin()`](ca-transaction/begin.md) | 开始一个事务 |
| [`CATransaction.commit()`](ca-transaction/commit.md) | 结束最近开始的那个事务 |
| [`CATransaction.flush()`](ca-transaction/flush.md) | 把已经做的图层修改立刻交给系统 |

当前事务的设置，每一项一个读、一个写：

| 方法 | 说明 |
| --- | --- |
| [`CATransaction.disableActions()`](ca-transaction/disableactions.md) | 当前事务是否关闭了隐式动画 |
| [`CATransaction.setDisableActions()`](ca-transaction/setdisableactions.md) | 关闭或打开当前事务的隐式动画 |
| [`CATransaction.animationDuration()`](ca-transaction/animationduration.md) | 当前事务的隐式动画时长 |
| [`CATransaction.setAnimationDuration()`](ca-transaction/setanimationduration.md) | 设置当前事务的隐式动画时长 |
| [`CATransaction.animationTimingFunction()`](ca-transaction/animationtimingfunction.md) | 当前事务的隐式动画用的时间曲线 |
| [`CATransaction.setAnimationTimingFunction()`](ca-transaction/setanimationtimingfunction.md) | 设置当前事务的隐式动画用的时间曲线 |

## 隐式动画

用 `new` 创建的图层在屏幕上显示过之后，改它的属性不会立刻跳到新值。系统自动加一段过渡动画，这叫隐式动画。时长是 iOS 的默认值 0.25 秒（**时长未在模拟器验证**）。

```js
const shape = new CAShapeLayer();
// ……shape 已经显示在屏幕上
shape.strokeEnd = 0.5;
console.log(shape.animationKeys());
```

**结果**：图层显示过之后，输出的数组里有 `'strokeEnd'`：这次赋值让系统在图层上加了一个名字是属性名的动画。

是否产生隐式动画，实测是这样的：

| 改属性的时候 | 是否产生隐式动画 |
| --- | --- |
| 图层还没有加到父图层下面 | 否 |
| 图层已经加进去，但还没有显示过 | 否 |
| 图层已经显示过 | 是 |
| 视图自己的图层（`view.layer`） | 否。**未在模拟器验证** |

在 `sceneconnect` 的回调里一次建好界面时，所有图层都还没显示过，改属性都是立刻生效的。之后在点击回调、定时器回调里再改，才会带过渡。

事务的规则：

- 事务可以嵌套。里层没有设置的项，沿用外层的。**嵌套未在模拟器验证。**
- 设置只影响隐式动画。用 `addAnimation()` 加的动画不受 `setDisableActions(true)` 影响，照常播放。

## 示例

```js
const shape = new CAShapeLayer();

CATransaction.begin();
CATransaction.setDisableActions(true);
shape.strokeEnd = 1;
CATransaction.commit();
```

**效果**：`strokeEnd` 立刻变成 1，图层上没有新增动画。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[CATransaction begin]` / `[CATransaction commit]` | `CATransaction.begin()` / `CATransaction.commit()` |
| `[CATransaction setDisableActions:YES]` | `CATransaction.setDisableActions(true)` |
| `[CATransaction setAnimationDuration:1.5]` | `CATransaction.setAnimationDuration(1.5)` |

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 整个事务里的动画都结束时得到通知。现在在动画对象上监听 `stop` | `CATransaction.completionBlock` |

## 参见

- [关掉隐式动画](../guides/animation.md#关掉隐式动画)
- [`CALayer`](ca-layer.md)：哪些属性会带隐式动画
