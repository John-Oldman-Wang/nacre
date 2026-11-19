---
type: reference
native: UISearchBar.textContentType
---

# `UISearchBar`：`textContentType` 属性

**`textContentType`** 属性设置这里装的是什么内容，系统据此提供自动填充。它是搜索框的九个键盘设置之一。

## 值

字符串，或者 `null`。取值和 [`UITextField` 的 `textContentType`](../ui-text-field/textcontenttype.md) 相同，一共 48 个。

- 可读，可写。
- 默认值是 `null`，表示没配。
- 写 `null` 清掉。
- 它不改变键盘的样子。
- 和 [`searchTextField`](searchtextfield.md) 上的同名属性是同一份设置：写哪一边，另一边都读得到。
- 没有变化事件：改它的只有 App 的代码，写搜索框的属性或者写 `searchTextField` 上的同名属性。
- 默认值和读写在模拟器（iPhone Air，iOS 27.2）和真机（iPhone 14）上验证过。

### 写错时

写入不在取值表里的值：不抛异常，控制台输出一条警告，列出全部可用的值，原值不变。

```
[Nacre] textContentType has no value "x"; expected one of: …, ignored
```

## 示例

```js
const search = new UISearchBar();
search.textContentType = 'username';
console.log(search.searchTextField.textContentType);
```

**效果**：系统把这个搜索框当成填用户名的地方，可能在键盘上方给出保存过的账号。**未在模拟器验证。**控制台输出新写入的值。

## 对应的 iOS API

`UISearchBar.textContentType`。`UITextContentTypeUsername` 写成 `'username'`，`nil` 写成 `null`。

## 参见

- [`UITextField` 的 `textContentType`](../ui-text-field/textcontenttype.md)：输入框上的同名属性
- [`searchTextField`](searchtextfield.md)
