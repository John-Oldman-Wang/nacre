---
type: reference
native: "-[CALayer animationForKey:]"
---

# `CALayer`：`animationForKey()` 方法

**`animationForKey()`** 方法读图层上某个名字的动画。

## 语法

```
animationForKey(key)
```

### 参数

**`key`**

动画的名字。

### 返回值

动画对象；没有这个名字的动画时是 `null`。

- 返回的是图层保存的那份副本，不是加进去的那个对象。
- 副本和加进去的对象是同一个类：加的是 `CASpringAnimation`，读到的也是 `CASpringAnimation`。
- 返回的对象只用来读，修改它的属性的结果没有定义。
- 图片视图播放动图时，它的图层上有一个名字是 `'nacreImageFrames'` 的动画，见 [`UIImageView`](../ui-image-view.md#动图的播放)。

### 异常

无。

## 示例

```js
const layer = new CALayer();
const fade = CABasicAnimation.animationWithKeyPath('opacity');
layer.addAnimation(fade, { forKey: 'fade' });
const copy = layer.animationForKey('fade');
console.log(copy === fade, copy instanceof CABasicAnimation);
```

**结果**：控制台输出 `false true`。

## 对应的 iOS API

`-[CALayer animationForKey:]`。

## 参见

- [`addAnimation()`](addanimation.md)
