---
type: reference
native: UIDatePicker.datePickerMode
---

# `UIDatePicker`：`datePickerMode` 属性

**`datePickerMode`** 属性决定选择器选什么。

## 值

字符串，下面五个之一：

| 取值 | 选什么 | 能用的样式 |
| --- | --- | --- |
| `'time'` | 小时和分钟 | 三种都行 |
| `'date'` | 年月日 | 三种都行 |
| `'dateAndTime'` | 日期加上小时和分钟 | 三种都行 |
| `'countDownTimer'` | 一段时长：几小时几分钟。读写 [`countDownDuration`](countdownduration.md) | 只有 `'wheels'` |
| `'yearAndMonth'` | 年和月 | 只有 `'wheels'` |

- 可读，可写。
- 默认值是 `'dateAndTime'`。
- 切到 `'countDownTimer'` 或 `'yearAndMonth'` 之前，[`preferredDatePickerStyle`](preferreddatepickerstyle.md) 必须是 `'wheels'` 或 `'automatic'`。是 `'automatic'` 时，实际的样式自动变成 `'wheels'`。
- 各模式在屏幕上的样子**未在模拟器验证**。

### 写错时

- 写入表里没有的值：不抛异常，控制台输出一条警告，属性保持原来的值。

  ```
  [Nacre] datePickerMode has no value "week"; expected one of: time / date / dateAndTime / countDownTimer / yearAndMonth, ignored
  ```

- 模式和样式配不上：抛 `TypeError`，属性保持原来的值。

  ```
  datePickerMode "countDownTimer" only works with the wheels style, but preferredDatePickerStyle is "compact"; set it to "wheels" or "automatic" first
  ```

## 示例

```js
const picker = new UIDatePicker();
picker.datePickerMode = 'yearAndMonth';
console.log(picker.datePickerStyle);
```

**结果**：输出 `wheels`。`preferredDatePickerStyle` 是默认的 `'automatic'`，实际的样式自动变成了滚轮。

## 对应的 iOS API

`UIDatePicker.datePickerMode`。`UIDatePickerModeDate` 写成 `'date'`，其余同理。原生在模式和样式配不上时抛一个 JS 接不住的原生异常，这里抛 `TypeError`。

## 参见

- [`preferredDatePickerStyle`](preferreddatepickerstyle.md)
- [`countDownDuration`](countdownduration.md)
- [枚举](../enums.md)
