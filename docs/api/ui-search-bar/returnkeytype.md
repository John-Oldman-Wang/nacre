---
type: reference
native: UISearchBar.returnKeyType
---

# `UISearchBar`：`returnKeyType` 属性

**`returnKeyType`** 属性设置回车键上显示什么字。它是搜索框的九个键盘设置之一。

## 值

字符串，取值和 [`UITextField` 的 `returnKeyType`](../ui-text-field/returnkeytype.md) 相同。

- 可读，可写。
- 默认值是 `'search'`：回车键上是「搜索」。新建的 `UITextField` 是 `'default'`。
- 用户按回车键时搜索框派发 [`search`](search-event.md)。换成别的取值之后，点它是否仍然派发 `search` **未在模拟器验证**。
- 和 [`searchTextField`](searchtextfield.md) 上的同名属性是同一份设置：写哪一边，另一边都读得到。
- 没有变化事件：改它的只有 App 的代码，写搜索框的属性或者写 `searchTextField` 上的同名属性。
- 默认值和读写在模拟器（iPhone Air，iOS 27.2）和真机（iPhone 14）上验证过。

### 写错时

写入不在取值表里的值：不抛异常，控制台输出一条警告，列出全部可用的值，原值不变。写 `null` 也按写错处理。

```
[Nacre] returnKeyType has no value "x"; expected one of: …, ignored
```

## 示例

```js
const search = new UISearchBar();
search.returnKeyType = 'go';
console.log(search.searchTextField.returnKeyType);
```

**效果**：回车键上的字换成「前往」。**未在模拟器验证。**控制台输出新写入的值。

## 对应的 iOS API

`UISearchBar.returnKeyType`。`UIReturnKeyGo` 写成 `'go'`，其余同理。

## 参见

- [`UITextField` 的 `returnKeyType`](../ui-text-field/returnkeytype.md)：输入框上的同名属性
- [`searchTextField`](searchtextfield.md)
