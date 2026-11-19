---
type: reference
native: UIButton.currentAttributedTitle
---

# `UIButton`：`currentAttributedTitle` 属性

**`currentAttributedTitle`** 属性是按钮此刻显示的带样式的文字，也就是按当前[状态](../ui-button.md#状态)选出来的那一个。

## 值

[`NSAttributedString`](../ns-attributed-string.md)，或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 当前状态没有单独设过时，读出的是 `normal` 状态的那一个。
- 没有变化通知。它跟着按钮的[状态](../ui-button.md#状态)变：手指按下和松开（系统派发 `touchdown`、`touchupinside` 这类[控件事件](../ui-control.md#事件)），或者代码改了 `isEnabled`、`isSelected`。状态本身没有变化事件，所以要在这些时机重新读。
- 任何状态都没用 [`setAttributedTitle()`](setattributedtitle.md) 设过时是 `null`。

## 示例

```js
const button = UIButton.buttonWithType('system');
console.log(button.currentAttributedTitle);
button.setAttributedTitle(new NSAttributedString('提交', { foregroundColor: 'systemBlue' }),
                          { forState: ['normal'] });
console.log(button.currentAttributedTitle !== null);
```

**结果**：先输出 `null`，再输出 `true`。

## 对应的 iOS API

`UIButton.currentAttributedTitle`。

## 参见

- [状态](../ui-button.md#状态)：按钮什么时候处于哪个状态
