---
type: reference
native: UITextField.attributedPlaceholder
---

# `UITextField`：`attributedPlaceholder` 属性

**`attributedPlaceholder`** 属性是带样式的提示，用来改提示的颜色和字体。

## 值

[`NSAttributedString`](../ns-attributed-string.md)，或者 `null`。

- 可读，可写。
- 默认值是 `null`。
- 写 `null` 去掉提示。
- 和 [`placeholder`](placeholder.md) 是同一份内容：写了它，`placeholder` 读出来是其中的纯文字；再写 `placeholder`，它的文字跟着变。
- 没有变化事件：改它的只有 App 自己的代码。

### 写错时

写了不是 `NSAttributedString` 的值（比如字符串）：抛 `TypeError`，报错信息里有 `attributedPlaceholder`。

## 示例

```js
const field = new UITextField();
field.attributedPlaceholder = new NSAttributedString('请输入手机号', {
  foregroundColor: 'systemOrange',
});
console.log(field.placeholder);
```

**效果**：输入框为空时显示橙色的「请输入手机号」。控制台输出 `请输入手机号`。橙色**未在模拟器验证**。

## 对应的 iOS API

`UITextField.attributedPlaceholder`。

## 参见

- [`placeholder`](placeholder.md)
- [富文本](../ns-attributed-string.md)
