---
type: reference
native: UITextView.textContentType
---

# `UITextView`：`textContentType` 属性

**`textContentType`** 属性说明这里装的是什么内容，系统据此提供自动填充。

## 值

字符串，或者 `null`。取值和 [`UITextField` 的 `textContentType`](../ui-text-field/textcontenttype.md) 相同，一共 48 个。

- 可读，可写。
- 默认值是 `null`，表示没配。
- 写 `null` 清除。

### 写错时

写入不在取值表里的值：不抛异常，控制台输出一条警告，列出全部可用的值，属性保持原来的值。

```
[Nacre] textContentType has no value "x"; expected one of: …, ignored
```
- 取值的效果**未在模拟器验证**。验收用例验证的是：能写入并读回，写错时属性保持原值并输出一条警告。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const input = new UITextView();
input.textContentType = 'fullStreetAddress';
```

**效果**：系统可能在键盘上方给出保存过的地址。**未在模拟器验证。**

## 对应的 iOS API

`UITextView.textContentType`。`UITextContentTypeFullStreetAddress` 写成 `'fullStreetAddress'`，`nil` 写成 `null`。

## 参见

- [`UITextField` 的 `textContentType`](../ui-text-field/textcontenttype.md)：单行输入框上的同名属性
