---
type: reference
native: "-[UIDatePicker init]"
---

# `UIDatePicker()` 构造函数

**`UIDatePicker()`** 构造函数创建一个日期选择器。

## 语法

```
new UIDatePicker()
```

### 参数

无。

### 返回值

新建的 `UIDatePicker`：

- [`date`](date.md) 是创建的那一刻。
- [`datePickerMode`](datepickermode.md) 是 `'dateAndTime'`：日期和时间都选。
- [`preferredDatePickerStyle`](preferreddatepickerstyle.md) 是 `'automatic'`，iPhone 上实际用的 [`datePickerStyle`](datepickerstyle.md) 是 `'compact'`。
- [`minimumDate`](minimumdate.md) 和 [`maximumDate`](maximumdate.md) 是 `null`：不限。

## 示例

```js
const picker = new UIDatePicker();
console.log(picker.datePickerMode, picker.datePickerStyle);
```

**结果**：输出 `dateAndTime compact`。

## 对应的 iOS API

`[[UIDatePicker alloc] init]`。

## 参见

- [`datePickerMode`](datepickermode.md)：选什么
- [`preferredDatePickerStyle`](preferreddatepickerstyle.md)：长什么样
