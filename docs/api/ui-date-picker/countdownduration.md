---
type: reference
native: UIDatePicker.countDownDuration
---

# `UIDatePicker`：`countDownDuration` 属性

**`countDownDuration`** 属性是 `'countDownTimer'` 模式下选中的时长。

## 值

数，单位是秒。

- 可读，可写。只能在 [`datePickerMode`](datepickermode.md) 是 `'countDownTimer'` 时写。
- 没进过 `'countDownTimer'` 模式的选择器上读出来是 0；切到这个模式之后是 60。
- 范围是 0 到 86399（23 小时 59 分）。
- 只精确到分钟：写 125，读回来是 120；写 86399，读回来是 86340。
- 最短 1 分钟：写 0 到 59 之间的数，读回来是 60。

### 怎么得知它变了

用户拨了滚轮时派发 [`change`](../ui-control/change-event.md)。**未在模拟器验证。**

### 写错时

抛 `TypeError`，属性保持原来的值。

- 不在倒计时模式下写：`countDownDuration can only be set while datePickerMode is "countDownTimer"; it is "dateAndTime"`。
- 超出范围：`countDownDuration must be between 0 and 86399 seconds, got 86400`。
- 转不出有限数：`countDownDuration must be a finite number, got "an hour"`。

## 示例

```js
const timer = new UIDatePicker();
timer.datePickerMode = 'countDownTimer';
timer.countDownDuration = 5 * 60;
timer.addEventListener('change', () => {
  console.log('选了', timer.countDownDuration / 60, '分钟');
});
```

**效果**：两列滚轮，「小时」和「分钟」，停在 0 小时 5 分钟。拨到 1 小时 30 分钟，控制台输出 `选了 90 分钟`。**未在模拟器验证。**

## 对应的 iOS API

`UIDatePicker.countDownDuration`，原生的类型是 `NSTimeInterval`（秒）。原生在不在倒计时模式时丢掉写入的值、超出范围时改成 60，都不报错；这里都抛 `TypeError`。

## 参见

- [`datePickerMode`](datepickermode.md)
- [让用户选日期和时间](../../guides/date-pickers.md#选一段时长)
