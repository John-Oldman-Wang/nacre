---
type: reference
native: UIDatePicker.minuteInterval
---

# `UIDatePicker`：`minuteInterval` 属性

**`minuteInterval`** 属性是分钟那一栏隔几分钟一档。

## 值

数，单位是分钟。

- 可读，可写。
- 默认值是 1。
- 必须能整除 60，并且在 1 到 30 之间：1、2、3、4、5、6、10、12、15、20、30。
- 写入时先按数转换，小数向零取整。
- 写了之后，[`date`](date.md) 立刻被取整到档位上，之后写进去的 `date` 也会被取整，见 [`roundsToMinuteInterval`](roundstominuteinterval.md)。实测 15 分钟一档时，22:14:02 变成 22:00:02：分钟向下取到档位上，秒保留，毫秒去掉。

### 写错时

抛 `TypeError`，属性保持原来的值。

- 不能整除 60 或不在 1 到 30 之间：`minuteInterval must divide 60 evenly and be between 1 and 30, got 7`。
- 转不出有限数：`minuteInterval must be a finite number, got "quarter"`。

## 示例

```js
const picker = new UIDatePicker();
picker.datePickerMode = 'time';
picker.minuteInterval = 15;
```

**效果**：选择器只有小时和分钟，分钟只有 00、15、30、45 四个选项。**屏幕上的样子未在模拟器验证。**

## 对应的 iOS API

`UIDatePicker.minuteInterval`。原生对不合法的值不做任何事也不报错，这里抛 `TypeError`。

## 参见

- [`roundsToMinuteInterval`](roundstominuteinterval.md)
