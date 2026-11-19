---
type: reference
native: UITextView.returnKeyType
---

# `UITextView`：`returnKeyType` 属性

**`returnKeyType`** 属性决定回车键上显示什么字。

## 值

字符串，取值和 [`UITextField` 的 `returnKeyType`](../ui-text-field/returnkeytype.md) 相同。

- 可读，可写。
- 默认值是 `'default'`。
- 只改键上的字。多行输入里按它仍然是换行，不会结束输入，也不派发事件。

### 写错时

写入不在取值表里的值：不抛异常，控制台输出一条警告，列出全部可用的值，属性保持原来的值。

```
[Nacre] returnKeyType has no value "x"; expected one of: …, ignored
```
- 取值的效果**未在模拟器验证**。验收用例验证的是：能写入并读回，写错时属性保持原值并输出一条警告。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const input = new UITextView();
input.returnKeyType = 'send';
```

**效果**：回车键上显示「发送」，按下去仍然是换行。**未在模拟器验证。**

## 对应的 iOS API

`UITextView.returnKeyType`。`UIReturnKeySend` 写成 `'send'`，其余同理。

## 参见

- [`UITextField` 的 `returnKeyType`](../ui-text-field/returnkeytype.md)：单行输入框上的同名属性
