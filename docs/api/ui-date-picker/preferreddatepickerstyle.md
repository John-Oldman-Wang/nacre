---
type: reference
native: UIDatePicker.preferredDatePickerStyle
---

# `UIDatePicker`：`preferredDatePickerStyle` 属性

**`preferredDatePickerStyle`** 属性是想要的样式。实际用的样式读 [`datePickerStyle`](datepickerstyle.md)。

## 值

字符串，下面四个之一：

| 取值 | 效果 |
| --- | --- |
| `'automatic'` | 系统选。`'countDownTimer'` 和 `'yearAndMonth'` 模式下是 `'wheels'`，其余模式下是 `'compact'` |
| `'wheels'` | 几列滚轮，直接嵌在页面里，实测 320 × 216 [pt](../units.md) |
| `'compact'` | 一个显示着当前值的小按钮，点了弹出日历或滚轮，实测高 36 pt |
| `'inline'` | 日历直接铺在页面里 |

- 可读，可写。
- 默认值是 `'automatic'`。
- [`datePickerMode`](datepickermode.md) 是 `'countDownTimer'` 或 `'yearAndMonth'` 时，只能写 `'wheels'` 或 `'automatic'`。
- 尺寸是 iOS 27.2 上的实测值。各样式在屏幕上的样子**未在模拟器验证**。

### 写错时

- 写入表里没有的值：不抛异常，控制台输出一条警告，列出全部可用的值，属性保持原来的值。
- 和当前的模式配不上：抛 `TypeError`，属性保持原来的值。

  ```
  preferredDatePickerStyle "inline" does not support datePickerMode "countDownTimer"; that mode only works with "wheels" or "automatic"
  ```

## 示例

```js
const picker = new UIDatePicker();
picker.preferredDatePickerStyle = 'inline';
console.log(picker.datePickerStyle);
```

**效果**：输出 `inline`。页面上直接显示一整块月历，不用点开。**月历的样子未在模拟器验证。**

## 对应的 iOS API

`UIDatePicker.preferredDatePickerStyle`。`UIDatePickerStyleWheels` 写成 `'wheels'`，其余同理。

## 参见

- [`datePickerStyle`](datepickerstyle.md)
- [`datePickerMode`](datepickermode.md)
- [让用户选日期和时间](../../guides/date-pickers.md#选哪种样式)
