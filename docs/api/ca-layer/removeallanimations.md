---
type: reference
native: "-[CALayer removeAllAnimations]"
---

# `CALayer`：`removeAllAnimations()` 方法

**`removeAllAnimations()`** 方法移除图层上的全部动画，包括没有名字的。

## 语法

```
removeAllAnimations()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

无。

## 示例

```js
const layer = new CALayer();
layer.addAnimation(CABasicAnimation.animationWithKeyPath('opacity'), { forKey: 'fade' });
layer.addAnimation(CABasicAnimation.animationWithKeyPath('position'), { forKey: 'move' });
layer.removeAllAnimations();
console.log(layer.animationKeys().length);
```

**结果**：控制台输出 `0`。

## 对应的 iOS API

`-[CALayer removeAllAnimations]`。

## 参见

- [`removeAnimationForKey()`](removeanimationforkey.md)
