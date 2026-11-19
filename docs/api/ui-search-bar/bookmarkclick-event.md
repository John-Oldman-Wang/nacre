---
type: reference
native: "UISearchBarDelegate searchBarBookmarkButtonClicked:"
---

# `UISearchBar`：`bookmarkclick` 事件

**`bookmarkclick`** 事件在用户点了书签按钮时派发。

## 语法

```
search.addEventListener('bookmarkclick', (event) => { })
```

## 事件对象

`Event`。只有 `type`（`'bookmarkclick'`）和 `target`（这个搜索框），不带别的数据。不能取消。

## 什么时候派发

- 只有 [`showsBookmarkButton`](showsbookmarkbutton.md) 是 `true` 时才有书签按钮。
- 要真实点击才能触发，**未在模拟器验证**。
- 事件在操作发生之后稍晚一点派发，不在操作的当时。

## 示例

```js
const search = new UISearchBar();
search.showsBookmarkButton = true;
search.addEventListener('bookmarkclick', () => console.log('打开书签'));
```

**效果**：点书签按钮，控制台输出 `打开书签`。**未在模拟器验证。**

## 对应的 iOS API

`UISearchBarDelegate` 的 `searchBarBookmarkButtonClicked:`。JS 里不用委托对象，在搜索框上监听事件。

## 参见

- [`showsBookmarkButton`](showsbookmarkbutton.md)
- [事件](../ui-search-bar.md#事件)：八个事件共同的规则
