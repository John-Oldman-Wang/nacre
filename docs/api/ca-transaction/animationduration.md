---
type: reference
native: +[CATransaction animationDuration]
---

# `CATransaction.animationDuration()` 静态方法

**`CATransaction.animationDuration()`** 静态方法返回当前事务的隐式动画时长。

## 语法

```
CATransaction.animationDuration()
```

### 参数

无。

### 返回值

数，单位是秒。

### 异常

无。

## 示例

```js
CATransaction.begin();
CATransaction.setAnimationDuration(1.5);
console.log(CATransaction.animationDuration());
CATransaction.commit();
```

**结果**：控制台输出 `1.5`。

## 对应的 iOS API

`+[CATransaction animationDuration]`。

## 参见

- [`setAnimationDuration()`](setanimationduration.md)
