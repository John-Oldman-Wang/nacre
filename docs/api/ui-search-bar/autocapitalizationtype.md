---
type: reference
native: UISearchBar.autocapitalizationType
---

# `UISearchBar`：`autocapitalizationType` 属性

**`autocapitalizationType`** 属性设置自动大写的规则。它是搜索框的九个键盘设置之一。

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
- 和 [`searchTextField`](searchtextfield.md) 上的同名属性是同一份设置：写哪一边，另一边都读得到。
- 没有变化事件：改它的只有 App 的代码，写搜索框的属性或者写 `searchTextField` 上的同名属性。
- 默认值和读写在模拟器（iPhone Air，iOS 27.2）和真机（iPhone 14）上验证过。

### 写错时

写入不在取值表里的值：不抛异常，控制台输出一条警告，列出全部可用的值，原值不变。写 `null` 也按写错处理。

```
[Nacre] autocapitalizationType has no value "x"; expected one of: …, ignored
```

## 示例

```js
const search = new UISearchBar();
search.autocapitalizationType = 'none';
console.log(search.searchTextField.autocapitalizationType);
```

**效果**：输入的第一个字母不自动变成大写。适合搜索用户名、代码这类不是自然语言的内容。**未在模拟器验证。**控制台输出新写入的值。

## 对应的 iOS API

`UISearchBar.autocapitalizationType`。`UITextAutocapitalizationTypeNone` 写成 `'none'`，其余同理。

## 参见

- [`UITextField` 的 `autocapitalizationType`](../ui-text-field/autocapitalizationtype.md)：输入框上的同名属性
- [`searchTextField`](searchtextfield.md)
