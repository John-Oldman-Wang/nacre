---
type: reference
native: UISearchBar.keyboardType
---

# `UISearchBar`：`keyboardType` 属性

**`keyboardType`** 属性设置弹出哪种键盘。它是搜索框的九个键盘设置之一。

## 值

字符串，取值和 [`UITextField` 的 `keyboardType`](../ui-text-field/keyboardtype.md) 相同，每个取值弹出什么键盘见那一页。

- 可读，可写。
- 默认值是 `'default'`：当前输入法的标准键盘。
- 和 [`searchTextField`](searchtextfield.md) 上的同名属性是同一份设置：写哪一边，另一边都读得到。
- 没有变化事件：改它的只有 App 的代码，写搜索框的属性或者写 `searchTextField` 上的同名属性。
- 默认值和读写在模拟器（iPhone Air，iOS 27.2）和真机（iPhone 14）上验证过。

### 写错时

写入不在取值表里的值：不抛异常，控制台输出一条警告，列出全部可用的值，原值不变。写 `null` 也按写错处理。

```
[Nacre] keyboardType has no value "x"; expected one of: …, ignored
```

## 示例

```js
const search = new UISearchBar();
search.keyboardType = 'emailAddress';
console.log(search.searchTextField.keyboardType);
```

**效果**：点搜索框时弹出输入邮箱用的键盘，上面有 `@` 和 `.` 键。**未在模拟器验证。**控制台输出新写入的值。

## 对应的 iOS API

`UISearchBar.keyboardType`。`UIKeyboardTypeURL` 写成 `'url'`，其余同理。

## 参见

- [`UITextField` 的 `keyboardType`](../ui-text-field/keyboardtype.md)：输入框上的同名属性
- [`searchTextField`](searchtextfield.md)
