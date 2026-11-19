---
type: reference
native: "-[CALayer addAnimation:forKey:]"
---

# `CALayer`：`addAnimation()` 方法

**`addAnimation()`** 方法把一个[动画](../ca-animation.md)加到图层上。

## 语法

```
addAnimation(animation, [{ forKey }])
```

### 参数

**`animation`**

一个动画对象，比如 [`CABasicAnimation`](../ca-basic-animation.md)。

**`options.forKey`**

可选。给这个动画起的名字，字符串，用于之后查询和移除。不给名字的动画只能用 [`removeAllAnimations()`](removeallanimations.md) 移除。

### 返回值

无（`undefined`）。

- 动画不是在这一行立刻开始。当前这段 JS 代码执行完、界面的修改交给系统之后，动画才开始播放。开始和结束用动画的 `start`、`stop` 事件得知，见 [`CAAnimation`](../ca-animation.md)。
- 图层保存的是动画对象的一份副本。加上去之后再改原来那个对象，正在播放的动画不变。要改，重新建一个，用同一个 `forKey` 再加一次。
- 事件派发给代码创建的那个对象，不是副本。所以在原来的对象上监听，并且在 `addAnimation()` 之前加监听器。
- 同一个图层上，同一个名字只能有一个动画。用已有的名字再加，原来的那个被移除并替换。**替换这一点未在模拟器验证。**

### 异常

**`TypeError`**

`animation` 不是动画对象：`addAnimation: expects a CAAnimation`。

## 示例

```js
const layer = new CALayer();
const fade = CABasicAnimation.animationWithKeyPath('opacity');
fade.fromValue = 1;
fade.toValue = 0;
fade.duration = 0.3;
layer.addAnimation(fade, { forKey: 'fade' });
console.log(layer.animationKeys().join(','));
```

**结果**：控制台输出 `fade`。

## 对应的 iOS API

`-[CALayer addAnimation:forKey:]`。第二段 `forKey:` 放进 options 对象。

## 参见

- [`CAAnimation`](../ca-animation.md)
- [`animationForKey()`](animationforkey.md)、[`removeAnimationForKey()`](removeanimationforkey.md)
