---
type: reference
native: "-[CAAnimationGroup init]"
---

# `CAAnimationGroup()` 构造函数

**`CAAnimationGroup()`** 构造函数创建一个空的动画组。

## 语法

```
new CAAnimationGroup()
```

### 参数

无。

### 返回值

新建的 `CAAnimationGroup`。它的 [`animations`](animations.md) 是空数组。

## 示例

```js
const group = new CAAnimationGroup();
console.log(group.animations.length);
```

**结果**：控制台输出 `0`。

## 对应的 iOS API

`[CAAnimationGroup animation]`。

## 参见

- [`animations`](animations.md)
