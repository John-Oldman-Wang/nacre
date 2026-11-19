---
type: reference
native: "+[CATransaction setAnimationDuration:]"
---

# `CATransaction.setAnimationDuration()` 静态方法

**`CATransaction.setAnimationDuration()`** 静态方法设置当前事务的隐式动画时长。动画对象的 `duration` 是 0 时，也用这个时长。

## 语法

```
CATransaction.setAnimationDuration(value)
```

### 参数

**`value`**

数，单位是秒。按 `Number()` 转换。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

`value` 转换不出有限数：`duration must be a finite number, got …`。

## 示例

```js
const shape = new CAShapeLayer();

CATransaction.begin();
CATransaction.setAnimationDuration(1.5);
shape.strokeEnd = 1;
CATransaction.commit();
```

**效果**：图层显示过时，`strokeEnd` 用 1.5 秒过渡到 1。**未在模拟器验证。**

## 对应的 iOS API

`+[CATransaction setAnimationDuration:]`。

## 参见

- [`animationDuration()`](animationduration.md)
- [`CAAnimation.duration`](../ca-animation/duration.md)
