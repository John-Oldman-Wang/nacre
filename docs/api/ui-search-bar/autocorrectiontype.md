---
type: reference
native: UISearchBar.autocorrectionType
---

# `UISearchBar`：`autocorrectionType` 属性

**`autocorrectionType`** 属性设置是否自动纠错。它是搜索框的九个键盘设置之一。

## 值

字符串，下面几个之一：

| 取值 | 效果 |
| --- | --- |
| `'default'` | 由系统按输入的内容决定 |
| `'no'` | 不自动替换系统认为拼错的词 |
| `'yes'` | 自动替换 |

- 可读，可写。
- 默认值是 `'no'`：搜索框默认不自动纠错。新建的 `UITextField` 是 `'default'`。
- 和 [`searchTextField`](searchtextfield.md) 上的同名属性是同一份设置：写哪一边，另一边都读得到。
- 没有变化事件：改它的只有 App 的代码，写搜索框的属性或者写 `searchTextField` 上的同名属性。
- 默认值和读写在模拟器（iPhone Air，iOS 27.2）和真机（iPhone 14）上验证过。

### 写错时

写入不在取值表里的值：不抛异常，控制台输出一条警告，列出全部可用的值，原值不变。写 `null` 也按写错处理。

```
[Nacre] autocorrectionType has no value "x"; expected one of: …, ignored
```

## 示例

```js
const search = new UISearchBar();
search.autocorrectionType = 'yes';
console.log(search.searchTextField.autocorrectionType);
```

**效果**：输入时系统自动替换拼错的词。**未在模拟器验证。**控制台输出新写入的值。

## 对应的 iOS API

`UISearchBar.autocorrectionType`。`UITextAutocorrectionTypeYes` 写成 `'yes'`，其余同理。

## 参见

- [`UITextField` 的 `autocorrectionType`](../ui-text-field/autocorrectiontype.md)：输入框上的同名属性
- [`searchTextField`](searchtextfield.md)
