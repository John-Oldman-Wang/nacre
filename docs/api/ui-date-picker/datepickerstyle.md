---
type: reference
native: UIDatePicker.datePickerStyle
---

# `UIDatePicker`：`datePickerStyle` 属性

**`datePickerStyle`** 属性是选择器实际用的样式。

## 值

字符串：`'wheels'`、`'compact'` 或 `'inline'`。不会是 `'automatic'`。

- 只读。给它赋值抛 `TypeError`。
- 新建的选择器在 iPhone 上是 `'compact'`。
- [`preferredDatePickerStyle`](preferreddatepickerstyle.md) 不是 `'automatic'` 时，和它相同。是 `'automatic'` 时由系统按 [`datePickerMode`](datepickermode.md) 选：`'countDownTimer'` 和 `'yearAndMonth'` 是 `'wheels'`，其余是 `'compact'`。
- 它的变化不派发事件。它只随你写 `preferredDatePickerStyle` 和 `datePickerMode` 而变。

## 示例

```js
const picker = new UIDatePicker();
console.log(picker.datePickerStyle);
picker.preferredDatePickerStyle = 'wheels';
console.log(picker.datePickerStyle);
```

**结果**：依次输出 `compact`、`wheels`。

## 对应的 iOS API

`UIDatePicker.datePickerStyle`。

## 参见

- [`preferredDatePickerStyle`](preferreddatepickerstyle.md)
