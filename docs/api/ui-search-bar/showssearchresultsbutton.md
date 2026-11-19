---
type: reference
native: UISearchBar.showsSearchResultsButton
---

# `UISearchBar`：`showsSearchResultsButton` 属性

**`showsSearchResultsButton`** 属性表示输入框右端是否显示结果列表按钮。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 输入框右端显示结果列表按钮 |
| `false` | 不显示 |

- 可读，可写。
- 默认值是 `false`。
- 用户点结果列表按钮时，搜索框派发 [`resultslistclick`](resultslistclick-event.md)。
- 和 [`showsBookmarkButton`](showsbookmarkbutton.md) 互不影响，可以同时是 `true`。两个都开时画面上显示哪一个**未在模拟器验证**。
- 关掉它不会把 [`isSearchResultsButtonSelected`](issearchresultsbuttonselected.md) 改回 `false`。
- 写别的类型的值时按真假转成布尔。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const search = new UISearchBar();
search.showsSearchResultsButton = true;
search.addEventListener('resultslistclick', () => console.log('显示结果列表'));
```

**效果**：输入框右端出现结果列表按钮。点它，控制台输出 `显示结果列表`。**未在模拟器验证。**

## 对应的 iOS API

`UISearchBar.showsSearchResultsButton`。

## 参见

- [`isSearchResultsButtonSelected`](issearchresultsbuttonselected.md)
- [`resultslistclick`](resultslistclick-event.md) 事件
