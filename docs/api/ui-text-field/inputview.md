---
type: reference
native: UITextField.inputView
---

# `UITextField`：`inputView` 属性

**`inputView`** 属性是输入框开始输入时代替系统键盘弹出的视图。比如一个自己画的数字面板。

## 值

[`UIView`](../ui-view.md)，或者 `null`。

- 可读，可写。
- `null` 表示用系统键盘。
- 这个属性是按 iOS 的头文件补上的。验收用例验证过它读得出来、类型对、写回原值读到的不变；默认值和各取值的效果**未在模拟器验证**，用法照 Apple 的文档。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const field = new UITextField();
const pad = new UIView();
pad.frame = new CGRect(0, 0, 0, 260);
pad.backgroundColor = 'secondarySystemBackground';
field.inputView = pad;
```

**效果**：点输入框时，屏幕底部弹出的是这个 260 pt 高的灰色视图，不是系统键盘。**未在模拟器验证。**

## 对应的 iOS API

`UITextField.inputView`。

## 参见

- [`inputAccessoryView`](inputaccessoryview.md)：贴在键盘上面的视图
