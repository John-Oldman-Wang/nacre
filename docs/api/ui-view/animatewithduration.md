---
type: reference
native: "+[UIView animateWithDuration:delay:usingSpringWithDamping:initialSpringVelocity:options:animations:completion:]"
---

# `UIView.animateWithDuration()` 静态方法

**`UIView.animateWithDuration()`** 静态方法带动画地改视图的属性：把改属性的代码放进 `animations` 函数里，改动在 `duration` 秒里逐渐生效。

## 语法

```
UIView.animateWithDuration(duration, { animations[, delay][, options][, usingSpringWithDamping, initialSpringVelocity] })
```

### 参数

**`duration`**

动画的时长，单位是秒。`0` 表示不带动画，改动立刻生效。

**`options.animations`**

函数，必填。在里面改视图的属性。没有参数，返回值不用。

能带动画的属性有 `alpha`、`frame`、`bounds`、`center`、`transform`、`backgroundColor`。改了约束之后在这里调 [`layoutIfNeeded()`](layoutifneeded.md)，约束的改动也带动画。

**`options.delay`**

开始之前等多久，单位是秒。可省略，默认 0。

**`options.options`**

速度曲线和别的选项，字符串数组。可省略，默认 `['curveEaseInOut']`。

| 取值 | 效果 |
| --- | --- |
| `'curveEaseInOut'` | 开头和结尾慢，中间快。默认 |
| `'curveEaseIn'` | 开头慢，之后加速 |
| `'curveEaseOut'` | 开头快，结尾减速 |
| `'curveLinear'` | 全程匀速 |
| `'allowUserInteraction'` | 动画期间视图照常响应触摸。不写时动画中的视图不响应触摸 |
| `'beginFromCurrentState'` | 视图正在做别的动画时，从屏幕上此刻的样子开始 |
| `'repeat'` | 一直重复。返回的 Promise 不会兑现 |
| `'autoreverse'` | 播到头之后倒着播回来。和 `'repeat'` 一起用 |
| `'layoutSubviews'` | 动画期间跟着重新布局子视图 |
| `'allowAnimatedContent'` | 动画期间每一帧重新绘制内容 |
| `'overrideInheritedDuration'` | 嵌套在另一个动画里时，用自己的时长，不用外层的 |
| `'overrideInheritedCurve'` | 嵌套在另一个动画里时，用自己的速度曲线 |
| `'overrideInheritedOptions'` | 嵌套在另一个动画里时，不继承外层的任何选项 |

四个 `curve…` 里选一个，其余的可以同时写多个。各个取值在屏幕上的效果**未在模拟器验证**，含义来自 Apple 的文档。

**`options.usingSpringWithDamping`**

弹簧的阻尼，0 到 1 的比例：1 不回弹，越小回弹越多。给了它就是弹簧动画，必须和 `initialSpringVelocity` 一起给。

**`options.initialSpringVelocity`**

弹簧的初速度，单位是「每秒走完全程的几倍」。一般给 0。必须和 `usingSpringWithDamping` 一起给。

### 返回值

`Promise<boolean>`，动画结束时兑现：

- `true`：动画播完了。`duration` 是 0 时也兑现，值是 `true`（实测）。
- `false`：动画播到一半被打断。实测对同一个属性再开一个动画，前一个动画以 `false` 兑现。
- 带 `'repeat'` 时不会兑现。

### 异常

**`TypeError`**

| 情况 | 报错 |
| --- | --- |
| 没给 `options`，或者 `animations` 不是函数 | `UIView.animateWithDuration: animations must be a function` |
| `duration` 转不出有限的数 | `duration must be a finite number, got "abc"` |
| `duration` 是负数 | `duration must be a non-negative number` |
| `options.options` 不是数组 | `options must be an array of option names` |
| `options.options` 里有不认识的名字 | `options has no value "bounce"; expected one of: …` |
| 弹簧的两个参数只给了一个 | `usingSpringWithDamping and initialSpringVelocity must be given together` |

出错时 `animations` 不执行，动画不开始。

`animations` 里抛出的异常原样抛给调用方，可以用 `try` / `catch` 捕获。这时不返回 Promise，已经执行的那部分改动照常生效。

## 说明

`animations` 的执行时机和别的回调不一样：

- **它在这次调用里当场执行，只执行一次。** 调用返回时它已经执行完了，写进去的属性当场读得回来（实测：调用返回时 `alpha` 读出来已经是新值），屏幕上的变化在之后的 `duration` 秒里发生。
- 它里面可以调任何接口。
- 它里面可以再调 `animateWithDuration()` 和 [`performWithoutAnimation()`](performwithoutanimation.md)。实测嵌套时的执行顺序是外层开始 → 内层 → 外层结束 → 调用返回。

## 示例

```js
const card = new UIView();
card.frame = new CGRect(40, 120, 200, 120);
card.backgroundColor = 'systemIndigo';

async function dismissCard() {
  const finished = await UIView.animateWithDuration(0.3, {
    animations() { card.alpha = 0; },
  });
  if (finished) card.removeFromSuperview();
}
dismissCard();
```

**效果**：卡片在 0.3 秒里淡出，淡出结束后从视图树里移除。

```js
const dot = new UIView();
UIView.animateWithDuration(0.5, {
  usingSpringWithDamping: 0.6,
  initialSpringVelocity: 0,
  animations() { dot.transform = CGAffineTransform.scale(1.5); },
});
```

**效果**：方块放大到 1.5 倍，超过一点再回来，来回几次后停下。**屏幕上的样子未在模拟器验证。**

## 对应的 iOS API

ObjC 的四个 `animateWithDuration:…` 在 JS 里是同一个方法，`completion:` 这个参数换成了返回的 Promise。

| ObjC | JS |
| --- | --- |
| `[UIView animateWithDuration:0.3 animations:^{ view.alpha = 0; }]` | `UIView.animateWithDuration(0.3, { animations() { view.alpha = 0; } })` |
| `[UIView animateWithDuration:0.3 animations:^{ … } completion:^(BOOL finished) { … }]` | `const finished = await UIView.animateWithDuration(0.3, { animations() { … } })` |
| `[UIView animateWithDuration:0.3 delay:0.1 options:UIViewAnimationOptionCurveEaseOut animations:^{ … } completion:nil]` | `UIView.animateWithDuration(0.3, { delay: 0.1, options: ['curveEaseOut'], animations() { … } })` |
| `[UIView animateWithDuration:0.5 delay:0 usingSpringWithDamping:0.6 initialSpringVelocity:0 options:0 animations:^{ … } completion:nil]` | `UIView.animateWithDuration(0.5, { usingSpringWithDamping: 0.6, initialSpringVelocity: 0, animations() { … } })` |

## 参见

- [让视图动起来](../../guides/view-animations.md)
- [`performWithoutAnimation()`](performwithoutanimation.md)
- [Core Animation](../ca-animation.md)：直接在图层上做动画，能做关键帧、沿路径运动、动画组
