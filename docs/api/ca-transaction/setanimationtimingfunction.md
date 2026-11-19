---
type: reference
native: "+[CATransaction setAnimationTimingFunction:]"
---

# `CATransaction.setAnimationTimingFunction()` 静态方法

**`CATransaction.setAnimationTimingFunction()`** 静态方法设置当前事务的隐式动画用的[时间曲线](../ca-media-timing-function.md)。

## 语法

```
CATransaction.setAnimationTimingFunction(value)
```

### 参数

**`value`**

[`CAMediaTimingFunction`](../ca-media-timing-function.md)，或者 `null`。`null` 表示用默认的。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

`value` 不是时间曲线也不是 `null`：`setAnimationTimingFunction needs a CAMediaTimingFunction or null`。

## 示例

```js
const shape = new CAShapeLayer();

CATransaction.begin();
CATransaction.setAnimationDuration(1.5);
CATransaction.setAnimationTimingFunction(
  CAMediaTimingFunction.functionWithName('easeOut'));
shape.strokeEnd = 1;
CATransaction.commit();
```

**效果**：图层显示过时，`strokeEnd` 用 1.5 秒过渡到 1，开始快，结束前减慢。**未在模拟器验证。**

## 对应的 iOS API

`+[CATransaction setAnimationTimingFunction:]`。

## 参见

- [`animationTimingFunction()`](animationtimingfunction.md)
