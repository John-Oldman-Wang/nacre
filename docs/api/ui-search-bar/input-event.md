---
type: reference
native: "UISearchBarDelegate searchBar:textDidChange:"
---

# `UISearchBar`：`input` 事件

**`input`** 事件在用户改了一次文字：输入、删除、点清空按钮时派发。

## 语法

```
search.addEventListener('input', (event) => { })
```

## 事件对象

`Event`。只有 `type`（`'input'`）和 `target`（这个搜索框），不带别的数据。不能取消。

## 什么时候派发

- 用户每改一次文字派发一次。
- 文字从 [`text`](text.md) 读，读到的是回调执行时的值。
- 用代码写 `text` 不派发，所以在回调里改 `text` 不会造成循环。
- 适合做「边输入边筛选」：每改一个字就来一次，适合筛选已经在手里的数据。发网络请求用 [`search`](search-event.md)。
- 用代码让里面的输入框发出输入动作的方式验证过，没有经过真实的键盘。
- 事件在操作发生之后稍晚一点派发，不在操作的当时。

## 示例

```js
const search = new UISearchBar();
search.addEventListener('input', (ev) => {
  console.log(ev.type, ev.target === search, search.text);
});
```

**效果**：用户输入 `a`，输出 `input true a`。

## 对应的 iOS API

`UISearchBarDelegate` 的 `searchBar:textDidChange:`。JS 里不用委托对象，在搜索框上监听事件。

## 参见

- [`search`](search-event.md)
- [事件](../ui-search-bar.md#事件)：八个事件共同的规则
