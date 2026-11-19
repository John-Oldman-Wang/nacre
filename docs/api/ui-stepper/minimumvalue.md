---
type: reference
native: UIStepper.minimumValue
---

# `UIStepper`：`minimumValue` 属性

**`minimumValue`** 属性是步进器范围的下限。值等于它时，减号按钮不可点（[`wraps`](wraps.md) 为 `false` 时）。

## 值

数，没有单位。

- 可读，可写。
- 默认值是 0。
- 写入时按 `Number()` 转换。
- 写入后 [`value`](value.md) 低于它时，`value` 变成它。
- 写得比 [`maximumValue`](maximumvalue.md) 大时不报错：实测上限被改成和下限一样，`value` 也变成这个数。

这个属性没有变化通知，只有你的代码会改它。

### 写错时

转不成有限数的值抛 `TypeError`，属性保持原来的值：

```
TypeError: minimumValue must be a finite number, got "low"
```

## 示例

```js
const stepper = new UIStepper();
stepper.minimumValue = 200;
console.log(stepper.maximumValue, stepper.value);
```

**结果**：输出 `200 200`。

## 对应的 iOS API

`UIStepper.minimumValue`。Apple 的头文件要求下限小于上限，实际写大了不报错，表现见上。

## 参见

- [`maximumValue`](maximumvalue.md)
