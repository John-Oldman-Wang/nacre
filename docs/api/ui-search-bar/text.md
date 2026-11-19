---
type: reference
native: UISearchBar.text
---

# `UISearchBar`：`text` 属性

**`text`** 属性是搜索框里的文字。

## 值

字符串。

- 可读，可写。
- 默认值是空串 `''`，不是 `null`。
- 写 `null` 或 `undefined` 得到 `''`；写数字得到它的字符串形式。
- 和 [`searchTextField`](searchtextfield.md) 的 `text` 是同一份文字。
- 用户改了文字（输入、删除、点清空按钮），搜索框派发 [`input`](input-event.md)。用代码写 `text` 不派发，所以在 `input` 的回调里改 `text` 不会造成循环。

## 示例

```js
const search = new UISearchBar();
search.text = 'beijing';
console.log(search.text);
```

**效果**：输入框里出现 `beijing`，控制台输出 `beijing`。不派发 `input`。

## 对应的 iOS API

`UISearchBar.text`。`nil` 读出来是 `''`。

## 参见

- [`input`](input-event.md) 事件
- [`placeholder`](placeholder.md)
