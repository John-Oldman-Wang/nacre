---
type: reference
native: UIButton.currentTitleColor
---

# `UIButton`：`currentTitleColor` 属性

**`currentTitleColor`** 属性是按钮此刻显示的文字颜色，也就是按当前[状态](../ui-button.md#状态)选出来的那一个。

## 值

[颜色](../ui-color.md)字符串。

- 只读。给它赋值抛 `TypeError`。
- 当前状态没有单独设过时，读出的是 `normal` 状态的那一个。
- 没有变化通知。它跟着按钮的[状态](../ui-button.md#状态)变：手指按下和松开（系统派发 `touchdown`、`touchupinside` 这类[控件事件](../ui-control.md#事件)），或者代码改了 `isEnabled`、`isSelected`。状态本身没有变化事件，所以要在这些时机重新读。
- 总是有值，不会是 `null`。

## 示例

```js
const button = UIButton.buttonWithType('system');
button.setTitleColor('#FF3B30', { forState: ['normal'] });
console.log(button.currentTitleColor);
```

**结果**：输出 `#FF3B30`。写进去的颜色字符串原样读回。

## 对应的 iOS API

`UIButton.currentTitleColor`。

## 参见

- [状态](../ui-button.md#状态)：按钮什么时候处于哪个状态
