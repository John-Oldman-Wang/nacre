---
type: reference
native: +[CATransaction animationTimingFunction]
---

# `CATransaction.animationTimingFunction()` 静态方法

**`CATransaction.animationTimingFunction()`** 静态方法返回当前事务的隐式动画用的[时间曲线](../ca-media-timing-function.md)。

## 语法

```
CATransaction.animationTimingFunction()
```

### 参数

无。

### 返回值

[`CAMediaTimingFunction`](../ca-media-timing-function.md)，或者 `null`。`null` 表示用默认的。

### 异常

无。

## 示例

```js
CATransaction.begin();
CATransaction.setAnimationTimingFunction(
  CAMediaTimingFunction.functionWithName('easeOut'));
const fn = CATransaction.animationTimingFunction();
console.log(fn !== null);
CATransaction.commit();
```

**结果**：控制台输出 `true`。

## 对应的 iOS API

`+[CATransaction animationTimingFunction]`。

## 参见

- [`setAnimationTimingFunction()`](setanimationtimingfunction.md)
