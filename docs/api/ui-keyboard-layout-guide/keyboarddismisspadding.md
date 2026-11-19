---
type: reference
native: UIKeyboardLayoutGuide.keyboardDismissPadding
---

# `UIKeyboardLayoutGuide`：`keyboardDismissPadding` 属性

**`keyboardDismissPadding`** 属性是用户拖动收起键盘时提前开始收起的距离。

## 值

数，单位 [pt](../units.md)。

- 可读，可写。
- 默认值是 `0`。读写和默认值在验收用例里断言过。
- 没有变化通知。只有 App 自己的代码会改它。

用户向下拖动滚动视图来收起键盘时，手指离键盘顶边还有多远就开始收起。对界面的实际影响**未在模拟器验证**。

- 写入时按 `Number()` 转换。转不出有限的数时抛 `TypeError: keyboardDismissPadding must be a finite number, got …`，末尾是收到的值，属性保持原值。

## 示例

```js
const guide = new UIView().keyboardLayoutGuide;
guide.keyboardDismissPadding = 20;
console.log(guide.keyboardDismissPadding);
```

**结果**：输出 `20`。

## 对应的 iOS API

`UIKeyboardLayoutGuide.keyboardDismissPadding`。

## 参见

- [`UIKeyboardLayoutGuide`](../ui-keyboard-layout-guide.md)
