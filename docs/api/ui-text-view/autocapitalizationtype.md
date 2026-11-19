---
type: reference
native: UITextView.autocapitalizationType
---

# `UITextView`：`autocapitalizationType` 属性

**`autocapitalizationType`** 属性决定系统自动大写的规则。

## 值

字符串，下面几个之一：

| 取值 | 效果 |
| --- | --- |
| `'none'` | 不自动大写 |
| `'words'` | 每个词的首字母大写 |
| `'sentences'` | 每句的首字母大写 |
| `'allCharacters'` | 所有字母大写 |

- 可读，可写。
- 默认值是 `'sentences'`。

### 写错时

写入不在取值表里的值：不抛异常，控制台输出一条警告，列出全部可用的值，属性保持原来的值。

```
[Nacre] autocapitalizationType has no value "x"; expected one of: …, ignored
```
- 取值的效果**未在模拟器验证**。验收用例验证的是：能写入并读回，写错时属性保持原值并输出一条警告。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const input = new UITextView();
input.autocapitalizationType = 'none';
```

**效果**：输入的第一个字母不自动变成大写。**未在模拟器验证。**

## 对应的 iOS API

`UITextView.autocapitalizationType`。`UITextAutocapitalizationTypeNone` 写成 `'none'`，其余同理。

## 参见

- [`UITextField` 的 `autocapitalizationType`](../ui-text-field/autocapitalizationtype.md)：单行输入框上的同名属性
