---
type: reference
native: UISlider.minimumValue
---

# `UISlider`：`minimumValue` 属性

**`minimumValue`** 属性是滑块范围的下限，圆钮在最左边时的值。

## 值

数，没有单位，单精度浮点数。

- 可读，可写。
- 默认值是 0。
- 写入时按 `Number()` 转换。
- 写入后 [`value`](value.md) 低于它时，`value` 变成它（实测）。
- 写得比 [`maximumValue`](maximumvalue.md) 大时不报错：实测上限被改成和下限一样，`value` 也变成这个数。

这个属性没有变化通知，只有你的代码会改它。

### 写错时

转不成有限数的值抛 `TypeError`，属性保持原来的值：

```
TypeError: minimumValue must be a finite number, got "low"
```

## 示例

```js
const slider = new UISlider();
slider.maximumValue = 100;
slider.minimumValue = 10;
console.log(slider.value);
```

**结果**：输出 `10`。原来的值 0 低于新的下限，跟着变成 10。

## 对应的 iOS API

`UISlider.minimumValue`。

## 参见

- [`maximumValue`](maximumvalue.md)
