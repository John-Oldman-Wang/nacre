---
type: reference
native: UISlider.value
---

# `UISlider`：`value` 属性

**`value`** 属性是滑块当前的值，也就是圆钮所在的位置对应的数。

## 值

数，没有单位。单精度浮点数：写 0.3 读回来是 0.30000001192092896（实测）。显示之前先取整或者保留固定的小数位；比较两个值时不要用 `===` 比小数。

- 可读，可写。
- 默认值是 0。
- 写入时按 `Number()` 转换，所以 `'0.25'` 得到 0.25。
- 超出 [`minimumValue`](minimumvalue.md) 到 [`maximumValue`](maximumvalue.md) 的值不报错，被改成最近的那一头：范围是 0 到 1 时写 5，读回来是 1；写 -5，读回来是 0。所以要先设范围，再设值。
- 写 `value` 没有动画。要动画用 [`setValue()`](setvalue.md)。

### 怎么得知它变了

用户拖动时派发 [`change`](../ui-control/change-event.md)，什么时候派发由 [`isContinuous`](iscontinuous.md) 决定。代码写 `value` 不派发 `change`，所以在 `change` 的回调里写 `value` 不会循环。验收用例断言过：写入之后没有收到 `change`。

### 写错时

转不成有限数的值（`'half'`、`undefined`、`NaN`）抛 `TypeError`，属性保持原来的值：

```
TypeError: value must be a finite number, got "half"
```

## 示例

```js
const slider = new UISlider();
slider.value = 0.5;
console.log(slider.value);
slider.value = 5;
console.log(slider.value);
```

**结果**：依次输出 `0.5`、`1`。

## 对应的 iOS API

`UISlider.value`。原生是 `float`。

## 参见

- [`setValue()`](setvalue.md)：带动画地改值
- [`change`](../ui-control/change-event.md) 事件
- [让滑块按固定的档位取值](../../guides/switches-sliders-steppers.md#让滑块按固定的档位取值)
