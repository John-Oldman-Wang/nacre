---
type: reference
native: UITextView.keyboardType
---

# `UITextView`：`keyboardType` 属性

**`keyboardType`** 属性决定用户点多行输入时弹出哪种键盘。

## 值

字符串，取值和 [`UITextField` 的 `keyboardType`](../ui-text-field/keyboardtype.md) 相同，一共 13 个，每个取值弹出什么键盘见那一页。

- 可读，可写。
- 默认值是 `'default'`。
- 它只决定弹出哪种键盘，不校验内容。

### 写错时

写入不在取值表里的值：不抛异常，控制台输出一条警告，列出全部可用的值，属性保持原来的值。

```
[Nacre] keyboardType has no value "x"; expected one of: …, ignored
```
- 取值的效果**未在模拟器验证**。验收用例验证的是：能写入并读回，写错时属性保持原值并输出一条警告。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const input = new UITextView();
input.keyboardType = 'emailAddress';
```

**效果**：点多行输入时弹出输入邮箱用的键盘。**未在模拟器验证。**

## 对应的 iOS API

`UITextView.keyboardType`。`UIKeyboardTypeEmailAddress` 写成 `'emailAddress'`，其余同理。

## 参见

- [`UITextField` 的 `keyboardType`](../ui-text-field/keyboardtype.md)：单行输入框上的同名属性
