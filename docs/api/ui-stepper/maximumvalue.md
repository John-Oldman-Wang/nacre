---
type: reference
native: UIStepper.maximumValue
---

# `UIStepper`：`maximumValue` 属性

**`maximumValue`** 属性是步进器范围的上限。值等于它时，加号按钮不可点（[`wraps`](wraps.md) 为 `false` 时）。

## 值

数，没有单位。

- 可读，可写。
- 默认值是 100。
- 写入时按 `Number()` 转换。
- 写入后 [`value`](value.md) 高于它时，`value` 变成它。

这个属性没有变化通知，只有你的代码会改它。

### 写错时

转不成有限数的值抛 `TypeError`，属性保持原来的值：

```
TypeError: maximumValue must be a finite number, got "high"
```

## 示例

```js
const stepper = new UIStepper();
stepper.value = 50;
stepper.maximumValue = 10;
console.log(stepper.value);
```

**结果**：输出 `10`。压低上限时，值跟着变成上限。

## 对应的 iOS API

`UIStepper.maximumValue`。

## 参见

- [`minimumValue`](minimumvalue.md)
