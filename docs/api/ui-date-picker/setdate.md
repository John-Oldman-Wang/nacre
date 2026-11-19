---
type: reference
native: "-[UIDatePicker setDate:animated:]"
---

# `UIDatePicker`：`setDate()` 方法

**`setDate()`** 方法改选择器选中的时刻，可以带动画。和写 [`date`](date.md) 的差别只在动画。

## 语法

```
setDate(date[, { animated }])
```

### 参数

**`date`**

要选中的时刻，`Date`。不从字符串或时间戳转换。早于 [`minimumDate`](minimumdate.md) 或晚于 [`maximumDate`](maximumdate.md) 时不报错，被改成最近的那个界限。

**`options.animated`** <small>可选</small>

布尔值。`true`：滚轮样式下滚轮转过去。不传时没有动画。

### 返回值

无（`undefined`）。

带动画时，[`date`](date.md) 在方法返回时就已经是新的值。

不派发 [`change`](../ui-control/change-event.md)。

### 异常

**`TypeError`**

- `date` 不是 `Date`：`setDate must be a Date, got 1700000000000`。
- `date` 是无效的 `Date`：`setDate must be a valid Date, got an invalid one`。

抛了之后选中的时刻不变。

## 示例

```js
const picker = new UIDatePicker();
picker.preferredDatePickerStyle = 'wheels';
picker.setDate(new Date(2027, 0, 1), { animated: true });
console.log(picker.date.getFullYear());
```

**效果**：输出 `2027`。滚轮转到 2027 年 1 月 1 日。**滚轮转动未在模拟器验证。**

## 对应的 iOS API

`-[UIDatePicker setDate:animated:]`。`animated` 在原生里是必传的参数，这里可以不传。

## 参见

- [`date`](date.md)
