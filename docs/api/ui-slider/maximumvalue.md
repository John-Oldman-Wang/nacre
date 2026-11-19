---
type: reference
native: UISlider.maximumValue
---

# `UISlider`：`maximumValue` 属性

**`maximumValue`** 属性是滑块范围的上限，圆钮在最右边时的值。

## 值

数，没有单位，单精度浮点数。

- 可读，可写。
- 默认值是 1。
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
const slider = new UISlider();
slider.maximumValue = 100;
slider.value = 40;
console.log(slider.value);
```

**结果**：输出 `40`。先设范围再设值；顺序反过来，40 会先被改成原来的上限 1。

## 对应的 iOS API

`UISlider.maximumValue`。

## 参见

- [`minimumValue`](minimumvalue.md)
