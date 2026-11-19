---
type: reference
native: UISearchBar.spellCheckingType
---

# `UISearchBar`：`spellCheckingType` 属性

**`spellCheckingType`** 属性设置是否检查拼写。它是搜索框的九个键盘设置之一。

## 值

字符串，下面几个之一：

| 取值 | 效果 |
| --- | --- |
| `'default'` | 由系统按输入的内容决定 |
| `'no'` | 不在拼错的词下面画红线 |
| `'yes'` | 画红线 |

- 可读，可写。
- 默认值是 `'default'`。
- 和 [`searchTextField`](searchtextfield.md) 上的同名属性是同一份设置：写哪一边，另一边都读得到。
- 没有变化事件：改它的只有 App 的代码，写搜索框的属性或者写 `searchTextField` 上的同名属性。
- 默认值和读写在模拟器（iPhone Air，iOS 27.2）和真机（iPhone 14）上验证过。

### 写错时

写入不在取值表里的值：不抛异常，控制台输出一条警告，列出全部可用的值，原值不变。写 `null` 也按写错处理。

```
[Nacre] spellCheckingType has no value "x"; expected one of: …, ignored
```

## 示例

```js
const search = new UISearchBar();
search.spellCheckingType = 'no';
console.log(search.searchTextField.spellCheckingType);
```

**效果**：拼错的词下面不画红线。**未在模拟器验证。**控制台输出新写入的值。

## 对应的 iOS API

`UISearchBar.spellCheckingType`。`UITextSpellCheckingTypeNo` 写成 `'no'`，其余同理。

## 参见

- [`UITextField` 的 `spellCheckingType`](../ui-text-field/spellcheckingtype.md)：输入框上的同名属性
- [`searchTextField`](searchtextfield.md)
