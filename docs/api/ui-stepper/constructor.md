---
type: reference
native: "-[UIStepper init]"
---

# `UIStepper()` 构造函数

**`UIStepper()`** 构造函数创建一个步进器。

## 语法

```
new UIStepper()
```

### 参数

无。

### 返回值

新建的 `UIStepper`。它的属性是默认值：

| 属性 | 默认值 |
| --- | --- |
| [`value`](value.md) | 0 |
| [`minimumValue`](minimumvalue.md) | 0 |
| [`maximumValue`](maximumvalue.md) | 100 |
| [`stepValue`](stepvalue.md) | 1 |
| [`isContinuous`](iscontinuous.md) | `true` |
| [`autorepeat`](autorepeat.md) | `true` |
| [`wraps`](wraps.md) | `false` |

步进器的大小由系统决定，实测 iOS 27.2 上是 94 × 32 [pt](../units.md)。

### 异常

无。

不能继承：`class MyStepper extends UIStepper {}` 在 `new MyStepper()` 时抛 `TypeError`，见[原生类](../native-classes.md)。

## 示例

```js
const stepper = new UIStepper();
console.log(stepper.value, stepper.minimumValue, stepper.maximumValue, stepper.stepValue);
```

**结果**：输出 `0 0 100 1`。

## 对应的 iOS API

`[[UIStepper alloc] init]`。

## 参见

- [`value`](value.md)
