---
type: reference
native: "UISearchBarDelegate searchBarResultsListButtonClicked:"
---

# `UISearchBar`：`resultslistclick` 事件

**`resultslistclick`** 事件在用户点了结果列表按钮时派发。

## 语法

```
search.addEventListener('resultslistclick', (event) => { })
```

## 事件对象

`Event`。只有 `type`（`'resultslistclick'`）和 `target`（这个搜索框），不带别的数据。不能取消。

## 什么时候派发

- 只有 [`showsSearchResultsButton`](showssearchresultsbutton.md) 是 `true` 时才有结果列表按钮。
- 要真实点击才能触发，**未在模拟器验证**。
- 事件在操作发生之后稍晚一点派发，不在操作的当时。

## 示例

```js
const search = new UISearchBar();
search.showsSearchResultsButton = true;
search.addEventListener('resultslistclick', () => console.log('显示结果列表'));
```

**效果**：点结果列表按钮，控制台输出 `显示结果列表`。**未在模拟器验证。**

## 对应的 iOS API

`UISearchBarDelegate` 的 `searchBarResultsListButtonClicked:`。JS 里不用委托对象，在搜索框上监听事件。

## 参见

- [`isSearchResultsButtonSelected`](issearchresultsbuttonselected.md)
- [事件](../ui-search-bar.md#事件)：八个事件共同的规则
