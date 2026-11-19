---
type: reference
native: UITextField.disabledBackground
---

# `UITextField`：`disabledBackground` 属性

**`disabledBackground`** 属性是输入框禁用时的背景图。

## 值

[`UIImage`](../ui-image.md)，或者 `null`。

- 可读，可写。
- 按 Apple 的文档，只有设了 [`background`](background.md) 时它才起作用。**未在模拟器验证。**
- 这个属性是按 iOS 的头文件补上的。验收用例验证过它读得出来、类型对、写回原值读到的不变；默认值和各取值的效果**未在模拟器验证**，用法照 Apple 的文档。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const field = new UITextField();
field.borderStyle = 'none';
field.disabledBackground = UIImage.systemImageNamed('rectangle');
```

**效果**：输入框禁用时用这张图做背景。**未在模拟器验证。**

## 对应的 iOS API

`UITextField.disabledBackground`。

## 参见

- [`borderStyle`](borderstyle.md)
