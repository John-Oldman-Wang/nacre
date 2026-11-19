---
type: reference
native: "-[CALayer removeAnimationForKey:]"
---

# `CALayer`：`removeAnimationForKey()` 方法

**`removeAnimationForKey()`** 方法移除图层上指定名字的动画。

## 语法

```
removeAnimationForKey(key)
```

### 参数

**`key`**

动画的名字，就是 [`addAnimation()`](addanimation.md) 时给的 `forKey`。

### 返回值

无（`undefined`）。

动画被中途移除时，它的 `stop` 事件的 `finished` 是 `false`，见 [`CAAnimation`](../ca-animation.md)。

### 异常

无。

## 示例

```js
const layer = new CALayer();
layer.addAnimation(CABasicAnimation.animationWithKeyPath('opacity'), { forKey: 'fade' });
layer.removeAnimationForKey('fade');
console.log(layer.animationForKey('fade'));
```

**结果**：控制台输出 `null`。

## 对应的 iOS API

`-[CALayer removeAnimationForKey:]`。

## 参见

- [`removeAllAnimations()`](removeallanimations.md)
