---
type: reference
native: UIStepper.value
---

# `UIStepper`：`value` 属性

**`value`** 属性是步进器当前的值。

## 值

数，没有单位。双精度浮点数：写 0.3 读回来就是 0.3。

- 可读，可写。
- 默认值是 0。
- 写入时按 `Number()` 转换，所以 `'5'` 得到 5。
- 超出 [`minimumValue`](minimumvalue.md) 到 [`maximumValue`](maximumvalue.md) 的值被改成最近的那一头：范围是 0 到 100 时写 500，读回来是 100。开着 [`wraps`](wraps.md) 时也是这样，`wraps` 只影响用户点按钮。
- 步进器不把值对齐到 [`stepValue`](stepvalue.md) 的倍数：写 0.3，之后点加号得到 1.3（`stepValue` 是 1 时）。**点加号之后的值未在模拟器验证**；写 0.3 读回 0.3 是实测。

### 怎么得知它变了

用户点加号或减号时派发 [`change`](../ui-control/change-event.md)。代码写 `value` 不派发。验收用例断言过：写入之后没有收到 `change`。

### 写错时

转不成有限数的值（`'many'`、`undefined`、`NaN`）抛 `TypeError`，属性保持原来的值：

```
TypeError: value must be a finite number, got "many"
```

## 示例

```js
const stepper = new UIStepper();
stepper.maximumValue = 10;
stepper.value = 500;
console.log(stepper.value);
```

**结果**：输出 `10`。

## 对应的 iOS API

`UIStepper.value`。

## 参见

- [`minimumValue`](minimumvalue.md)、[`maximumValue`](maximumvalue.md)
- [`change`](../ui-control/change-event.md) 事件
