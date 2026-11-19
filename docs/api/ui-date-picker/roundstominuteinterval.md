---
type: reference
native: UIDatePicker.roundsToMinuteInterval
---

# `UIDatePicker`：`roundsToMinuteInterval` 属性

**`roundsToMinuteInterval`** 属性决定代码写进去的 [`date`](date.md) 是否取整到 [`minuteInterval`](minuteinterval.md) 的档位上。

## 值

布尔值。

| 取值 | 效果 |
| --- | --- |
| `true` | `date` 总是被取整到档位上 |
| `false` | 代码写进去的 `date` 写什么是什么，不取整 |

- 可读，可写。
- 默认值是 `true`。
- 写入时按 JS 的真假值转换。

## 示例

```js
const picker = new UIDatePicker();
picker.minuteInterval = 15;
picker.roundsToMinuteInterval = false;
const when = new Date(2027, 0, 1, 9, 7);
picker.date = when;
console.log(picker.date.getTime() === when.getTime());
```

**结果**：输出 `true`。9:07 没有被取整到 9:00。

## 对应的 iOS API

`UIDatePicker.roundsToMinuteInterval`。

## 参见

- [`minuteInterval`](minuteinterval.md)
