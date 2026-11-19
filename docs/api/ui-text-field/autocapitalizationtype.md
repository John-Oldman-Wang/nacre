---
type: reference
native: UITextField.autocapitalizationType
---

# `UITextField`：`autocapitalizationType` 属性

**`autocapitalizationType`** 属性决定系统自动大写的规则。

## 值

字符串，下面几个之一：

| 取值 | 效果 |
| --- | --- |
| `'none'` | 不自动大写 |
| `'words'` | 每个单词的第一个字母大写 |
| `'sentences'` | 每句话的第一个字母大写 |
| `'allCharacters'` | 所有字母大写 |

- 可读，可写。
- 默认值是 `'sentences'`。
- 各取值的效果**未在模拟器验证**。
- 输入账号、邮箱、代码这类内容时设成 `'none'`。
- 没有变化事件：改它的只有 App 自己的代码。

### 写错时

写入不在取值表里的值：不抛异常，控制台输出一条警告，列出全部可用的值，属性保持原来的值。

```
[Nacre] autocapitalizationType has no value "x"; expected one of: …, ignored
```

## 示例

```js
const field = new UITextField();
field.autocapitalizationType = 'none';
```

**效果**：输入的第一个字母不自动变成大写。**未在模拟器验证。**

## 对应的 iOS API

`UITextField.autocapitalizationType`。`UITextAutocapitalizationTypeNone` 写成 `'none'`，其余同理。

## 参见

- [`autocorrectionType`](autocorrectiontype.md)
