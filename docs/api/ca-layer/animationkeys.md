---
type: reference
native: "-[CALayer animationKeys]"
---

# `CALayer`：`animationKeys()` 方法

**`animationKeys()`** 方法返回图层上所有动画的名字。

## 语法

```
animationKeys()
```

### 参数

无。

### 返回值

字符串数组。没有动画时是空数组 `[]`，不是 `null`。不给名字加上去的动画不在里面。

### 异常

无。

## 示例

```js
const layer = new CALayer();
console.log(layer.animationKeys().length);
layer.addAnimation(CABasicAnimation.animationWithKeyPath('opacity'), { forKey: 'fade' });
console.log(layer.animationKeys().join(','));
```

**结果**：依次输出 `0` 和 `fade`。

## 对应的 iOS API

`-[CALayer animationKeys]`。原生里没有动画时是 `nil`，这里是空数组。

## 参见

- [`animationForKey()`](animationforkey.md)
