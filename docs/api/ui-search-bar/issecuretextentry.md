---
type: reference
native: UISearchBar.secureTextEntry
---

# `UISearchBar`：`isSecureTextEntry` 属性

**`isSecureTextEntry`** 属性设置是否把输入的字显示成圆点。它是搜索框的九个键盘设置之一。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 输入的内容显示成圆点 |
| `false` | 正常显示 |

- 可读，可写。
- 默认值是 `false`。
- 写别的类型的值时按真假转成布尔。
- 和 [`searchTextField`](searchtextfield.md) 上的同名属性是同一份设置：写哪一边，另一边都读得到。
- 没有变化事件：改它的只有 App 的代码，写搜索框的属性或者写 `searchTextField` 上的同名属性。
- 默认值和读写在模拟器（iPhone Air，iOS 27.2）和真机（iPhone 14）上验证过。

## 示例

```js
const search = new UISearchBar();
search.isSecureTextEntry = true;
console.log(search.searchTextField.isSecureTextEntry);
```

**效果**：输入的字显示成圆点。**未在模拟器验证。**控制台输出新写入的值。

## 对应的 iOS API

`UISearchBar.secureTextEntry`（getter 是 `isSecureTextEntry`）。

## 参见

- [`UITextField` 的 `isSecureTextEntry`](../ui-text-field/issecuretextentry.md)：输入框上的同名属性
- [`searchTextField`](searchtextfield.md)
