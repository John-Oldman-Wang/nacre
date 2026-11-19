---
type: reference
native: "UISearchBarDelegate searchBar:selectedScopeButtonIndexDidChange:"
---

# `UISearchBar`：`scopechange` 事件

**`scopechange`** 事件在用户点了另一个范围按钮时派发。

## 语法

```
search.addEventListener('scopechange', (event) => { })
```

## 事件对象

`Event`。只有 `type`（`'scopechange'`）和 `target`（这个搜索框），不带别的数据。不能取消。

## 什么时候派发

- 新的下标从 [`selectedScopeButtonIndex`](selectedscopebuttonindex.md) 读。
- 用代码写 `selectedScopeButtonIndex` 不派发。
- 要真实点击才能触发，**未在模拟器验证**。
- 事件在操作发生之后稍晚一点派发，不在操作的当时。

## 示例

```js
const search = new UISearchBar();
search.scopeButtonTitles = ['全部', '我的', '共享'];
search.showsScopeBar = true;
search.addEventListener('scopechange', () => {
  console.log('范围', search.selectedScopeButtonIndex);
});
```

**效果**：点「我的」，控制台输出 `范围 1`。**未在模拟器验证。**

## 对应的 iOS API

`UISearchBarDelegate` 的 `searchBar:selectedScopeButtonIndexDidChange:`。JS 里不用委托对象，在搜索框上监听事件。

## 参见

- [`scopeButtonTitles`](scopebuttontitles.md)
- [事件](../ui-search-bar.md#事件)：八个事件共同的规则
