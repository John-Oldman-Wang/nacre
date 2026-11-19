---
type: reference
native: UIDatePicker.date
---

# `UIDatePicker`：`date` 属性

**`date`** 属性是选择器选中的时刻。

## 值

`Date`。

- 可读，可写。
- 默认值是创建选择器的那一刻。
- 精确到毫秒：写进去的毫秒读回来不丢。[`minuteInterval`](minuteinterval.md) 不是 1 时会被取整，见 [`roundsToMinuteInterval`](roundstominuteinterval.md)。
- 每次读得到一个新的 `Date` 对象，`picker.date !== picker.date`。改这个对象不影响选择器，要改选中的时刻就写 `date`。
- 写入只接受 `Date`，不从字符串或时间戳转换。
- 早于 [`minimumDate`](minimumdate.md) 或晚于 [`maximumDate`](maximumdate.md) 的值不报错，被改成最近的那个界限。
- `date` 是一个时刻，不带时区。选择器按设备的时区显示它。只选日期的模式下，取年月日用 `getFullYear()`、`getMonth()`、`getDate()`，不要拿两个 `date` 的毫秒数直接比较是不是同一天。
- 在 `'countDownTimer'` 模式下，选中的时长不在 `date` 里，在 [`countDownDuration`](countdownduration.md) 里。

### 怎么得知它变了

用户改了选择时，控件派发 [`change`](../ui-control/change-event.md)。代码写入不派发：验收用例里写入之后 300 毫秒内没有收到 `change`。

### 写错时

抛 `TypeError`，属性保持原来的值。

- 不是 `Date`（字符串、数字）：`date must be a Date, got "2026-01-01"`。
- 写 `null`：`date must be a Date, got null`。
- 无效的 `Date`（比如 `new Date('abc')`）：`date must be a valid Date, got an invalid one`。

## 示例

```js
const picker = new UIDatePicker();
picker.date = new Date(2027, 0, 1);
console.log(picker.date.getFullYear(), picker.date.getMonth() + 1, picker.date.getDate());
picker.addEventListener('change', () => {
  console.log('选了', picker.date.toLocaleString());
});
```

**效果**：先输出 `2027 1 1`。`new Date(2027, 0, 1)` 的月份从 0 数，0 是 1 月。之后用户改了选择，控制台输出选中的时刻。**用户操作的效果未在模拟器验证。**

## 对应的 iOS API

`UIDatePicker.date`，原生的类型是 `NSDate`，这里是 `Date`。

## 参见

- [`setDate()`](setdate.md)：带动画地改
- [`change`](../ui-control/change-event.md) 事件
- [`Intl.DateTimeFormat`](../intl-date.md)：把日期按地区写成文字
