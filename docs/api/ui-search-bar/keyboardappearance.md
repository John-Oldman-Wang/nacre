---
type: reference
native: UISearchBar.keyboardAppearance
---

# `UISearchBar`：`keyboardAppearance` 属性

**`keyboardAppearance`** 属性设置键盘的明暗。它是搜索框的九个键盘设置之一。

## 值

字符串，下面几个之一：

| 取值 | 效果 |
| --- | --- |
| `'default'` | 跟随系统当前的浅色或深色外观 |
| `'light'` | 一直是浅色键盘 |
| `'dark'` | 一直是深色键盘 |
| `'alert'` | `'dark'` 的旧名字。写得进去，读出来是 `'dark'` |

- 可读，可写。
- 默认值是 `'default'`。
- 和 [`searchTextField`](searchtextfield.md) 上的同名属性是同一份设置：写哪一边，另一边都读得到。
- 没有变化事件：改它的只有 App 的代码，写搜索框的属性或者写 `searchTextField` 上的同名属性。
- 默认值和读写在模拟器（iPhone Air，iOS 27.2）和真机（iPhone 14）上验证过。

### 写错时

写入不在取值表里的值：不抛异常，控制台输出一条警告，列出全部可用的值，原值不变。写 `null` 也按写错处理。

```
[Nacre] keyboardAppearance has no value "x"; expected one of: …, ignored
```

## 示例

```js
const search = new UISearchBar();
search.keyboardAppearance = 'dark';
console.log(search.searchTextField.keyboardAppearance);
```

**效果**：键盘一直是深色的。**未在模拟器验证。**控制台输出新写入的值。

## 对应的 iOS API

`UISearchBar.keyboardAppearance`。`UIKeyboardAppearanceDark` 写成 `'dark'`。

## 参见

- [`UITextField` 的 `keyboardAppearance`](../ui-text-field/keyboardappearance.md)：输入框上的同名属性
- [`searchTextField`](searchtextfield.md)
