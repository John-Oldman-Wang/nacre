---
type: reference
native: UITextField.font
---

# `UITextField`：`font` 属性

**`font`** 属性是框里文字的字体和字号。

## 值

[`UIFont`](../ui-font.md)。

- 可读，可写。
- 默认值**未在模拟器验证**。
- 输入框按字体算出自己的高度。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const field = new UITextField();
field.font = UIFont.systemFontOfSize(20);
```

**效果**：框里的文字是 20 pt。**未在模拟器验证。**

## 对应的 iOS API

`UITextField.font`。

## 参见

- [`UIFont`](../ui-font.md)
- [`textColor`](textcolor.md)
