---
type: reference
native: "-[UITextField init]"
---

# `UITextField()` 构造函数

**`UITextField()`** 构造函数创建一个单行输入框。

## 语法

```
new UITextField()
```

### 参数

无。

### 返回值

新建的 `UITextField`。没有边框（[`borderStyle`](borderstyle.md) 是 `'none'`）、没有内容、没有占位文字，大小是 0。放到页面上看不出哪里可以点，见[新建的输入框为什么看不见](../../guides/text-fields.md#新建的输入框为什么看不见)。

### 异常

**`TypeError`**

`UITextField` 不能被继承，`class X extends UITextField {}` 在 `new X()` 时抛，见[原生类](../native-classes.md#不能继承)。

## 示例

```js
const field = new UITextField();
console.log(JSON.stringify(field.text), field.placeholder, field.borderStyle);
```

**结果**：输出 `"" null none`。

## 对应的 iOS API

`[[UITextField alloc] init]`。

## 参见

- [`borderStyle`](borderstyle.md)：给输入框加边框
