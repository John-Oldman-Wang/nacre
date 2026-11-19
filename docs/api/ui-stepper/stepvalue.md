---
type: reference
native: UIStepper.stepValue
---

# `UIStepper`：`stepValue` 属性

**`stepValue`** 属性是用户点一下加号或减号，[`value`](value.md) 变化多少。

## 值

数，没有单位，必须大于 0。

- 可读，可写。
- 默认值是 1。
- 写入时按 `Number()` 转换。
- 它只决定点按钮时的变化量。代码写 `value` 时不按它对齐。

这个属性没有变化通知，只有你的代码会改它。

### 写错时

写 0 或负数抛 `TypeError`，属性保持原来的值：

```
TypeError: stepValue must be greater than 0, got 0
```

转不成有限数的值也抛 `TypeError`：`stepValue must be a finite number, got …`。

## 示例

```js
const stepper = new UIStepper();
stepper.stepValue = 0.5;
stepper.value = 1;
```

**效果**：点一下加号，值从 1 变成 1.5。**未在模拟器验证。**

## 对应的 iOS API

`UIStepper.stepValue`。原生写 0 或负数会抛 `NSInvalidArgumentException`，这里先拦下来抛 `TypeError`。

## 参见

- [`value`](value.md)
