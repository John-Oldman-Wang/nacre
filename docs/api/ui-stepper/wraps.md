---
type: reference
native: UIStepper.wraps
---

# `UIStepper`：`wraps` 属性

**`wraps`** 属性决定值到了范围的一头之后，用户再点会怎样。

## 值

布尔值。

| 取值 | 效果 |
| --- | --- |
| `true` | 值在上限时点加号，回到下限；在下限时点减号，回到上限。两个按钮一直可点 |
| `false` | 值在上限时加号不可点，在下限时减号不可点 |

两种取值的效果**未在模拟器验证**。

- 可读，可写。
- 默认值是 `false`。
- 写入按 JS 的真假值转换。
- 只影响用户点按钮。代码写超出范围的 [`value`](value.md) 时，值仍然被改成最近的那一头（实测）。

这个属性没有变化通知，只有你的代码会改它。

## 示例

```js
const stepper = new UIStepper();
stepper.minimumValue = 1;
stepper.maximumValue = 10;
stepper.wraps = true;
stepper.value = 500;
console.log(stepper.value);
```

**效果**

- 控制台输出 `10`：代码写的值不回绕。
- 值是 10 时点加号，变成 1。**未在模拟器验证。**

## 对应的 iOS API

`UIStepper.wraps`。

## 参见

- [`minimumValue`](minimumvalue.md)、[`maximumValue`](maximumvalue.md)
