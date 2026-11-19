---
type: reference
native: UITextField.background
---

# `UITextField`：`background` 属性

**`background`** 属性是输入框的背景图。

## 值

[`UIImage`](../ui-image.md)，或者 `null`。

- 可读，可写。
- 按 Apple 的文档，设了它之后 `borderStyle` 是 `'roundedRect'` 时不显示这张图。**未在模拟器验证。**
- 这个属性是按 iOS 的头文件补上的。验收用例验证过它读得出来、类型对、写回原值读到的不变；默认值和各取值的效果**未在模拟器验证**，用法照 Apple 的文档。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const field = new UITextField();
field.borderStyle = 'none';
field.background = UIImage.systemImageNamed('rectangle');
```

**效果**：输入框用这张图做背景。**未在模拟器验证。**

## 对应的 iOS API

`UITextField.background`。

## 参见

- [`borderStyle`](borderstyle.md)
