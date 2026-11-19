---
type: reference
native: UIDatePicker.minimumDate
---

# `UIDatePicker`：`minimumDate` 属性

**`minimumDate`** 属性是能选的最早的时刻。

## 值

`Date`，或者 `null`。

- 可读，可写。
- 默认值是 `null`：不限。
- 写 `null` 或 `undefined` 都是不限。
- 每次读得到一个新的 `Date` 对象。
- 写了之后，超出范围的 [`date`](date.md) 被改成这个界限。用户在选择器上也选不到范围外的时刻。**选不到未在模拟器验证。**
- `minimumDate` 晚于 `maximumDate` 时不报错，两个界限都不起作用。
- 它的变化不派发事件。界限只会被你的代码改。

### 写错时

抛 `TypeError`，属性保持原来的值。

- 不是 `Date` 也不是 `null`：`minimumDate must be a Date, got "yesterday"`。
- 无效的 `Date`：`minimumDate must be a valid Date, got an invalid one`。

## 示例

```js
const picker = new UIDatePicker();
picker.minimumDate = new Date(2027, 0, 1);
picker.date = new Date(2026, 0, 1);
console.log(picker.date.getFullYear());
```

**结果**：输出 `2027`。写进去的日期早于 `minimumDate`，被改成了 `minimumDate`。

## 对应的 iOS API

`UIDatePicker.minimumDate`，原生的类型是 `NSDate`，这里是 `Date`。

## 参见

- [`maximumDate`](maximumdate.md)
- [`date`](date.md)
