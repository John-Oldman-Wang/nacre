---
type: reference
native: "-[UITextView init]"
---

# `UITextView()` 构造函数

**`UITextView()`** 构造函数创建一块多行输入。

## 语法

```
new UITextView()
```

### 参数

无。

### 返回值

新建的 `UITextView`。没有内容，没有设字体（[`font`](font.md) 是 `null`），底色是 `'systemBackground'`，大小是 0，可以编辑、可以选中、可以滚动（实测）。

新建的多行输入底色和页面一样、没有边框，放到页面上看不出哪里可以点；没有设字体时文字比系统标准的 17 pt 正文小。所以要设 `font`，再给它底色和圆角，见[做一个多行输入框](../../guides/multiline-text.md)。

### 异常

**`TypeError`**

`UITextView` 不能被继承，`class X extends UITextView {}` 在 `new X()` 时抛，见[原生类](../native-classes.md#不能继承)。

## 示例

```js
const input = new UITextView();
console.log(JSON.stringify(input.text), input.font, input.isEditable, input.isScrollEnabled);
```

**结果**：输出 `"" null true true`。

## 对应的 iOS API

`[[UITextView alloc] init]`。

## 参见

- [`font`](font.md)
