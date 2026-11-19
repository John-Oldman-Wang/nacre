---
type: reference
native: UITextField.placeholder
---

# `UITextField`：`placeholder` 属性

**`placeholder`** 属性是框里没有内容时显示的提示。用户打第一个字后提示消失。

## 值

字符串，或者 `null`。

- 可读，可写。
- 默认值是 `null`，表示没有提示。
- 写 `null` 去掉提示。
- 提示的颜色**未在模拟器验证**。要改颜色，用 [`attributedPlaceholder`](attributedplaceholder.md)。
- 和 `attributedPlaceholder` 是同一份内容：写了其中一个，另一个读出来的文字跟着变。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const field = new UITextField();
field.placeholder = '请输入账号';
```

**效果**：框里没有内容时显示「请输入账号」。

## 对应的 iOS API

`UITextField.placeholder`。

## 参见

- [`attributedPlaceholder`](attributedplaceholder.md)
