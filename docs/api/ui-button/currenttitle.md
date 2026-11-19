---
type: reference
native: UIButton.currentTitle
---

# `UIButton`：`currentTitle` 属性

**`currentTitle`** 属性是按钮此刻显示的文字，也就是按当前[状态](../ui-button.md#状态)选出来的那一个。

## 值

字符串，或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 当前状态没有单独设过时，读出的是 `normal` 状态的那一个。
- 没有变化通知。它跟着按钮的[状态](../ui-button.md#状态)变：手指按下和松开（系统派发 `touchdown`、`touchupinside` 这类[控件事件](../ui-control.md#事件)），或者代码改了 `isEnabled`、`isSelected`。状态本身没有变化事件，所以要在这些时机重新读。
- 任何状态都没设过文字时是 `null`。

## 示例

```js
const button = UIButton.buttonWithType('system');
button.setTitle('提交', { forState: ['normal'] });
button.setTitle('请先填写表单', { forState: ['disabled'] });

console.log(button.currentTitle);
button.isEnabled = false;
console.log(button.currentTitle);
```

**结果**：先输出 `提交`，禁用之后输出 `请先填写表单`。

## 对应的 iOS API

`UIButton.currentTitle`。

## 参见

- [状态](../ui-button.md#状态)：按钮什么时候处于哪个状态
