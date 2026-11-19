---
type: reference
native: UISearchBar.searchResultsButtonSelected
---

# `UISearchBar`：`isSearchResultsButtonSelected` 属性

**`isSearchResultsButtonSelected`** 属性表示结果列表按钮是不是显示成选中的样子。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 结果列表按钮显示成选中的样子 |
| `false` | 普通的样子 |

- 可读，可写。
- 默认值是 `false`。
- 关掉 [`showsSearchResultsButton`](showssearchresultsbutton.md) 不会把它改回 `false`。
- 用户点结果列表按钮不会自动切换它，要在 [`resultslistclick`](resultslistclick-event.md) 里自己改。**未在模拟器验证。**
- 两种样子在画面上的差别**未在模拟器验证**。
- 写别的类型的值时按真假转成布尔。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const search = new UISearchBar();
search.showsSearchResultsButton = true;
search.addEventListener('resultslistclick', () => {
  search.isSearchResultsButtonSelected = !search.isSearchResultsButtonSelected;
});
```

**效果**：每点一次结果列表按钮，它在选中和普通两种样子之间切换。**未在模拟器验证。**

## 对应的 iOS API

`UISearchBar.searchResultsButtonSelected`（getter 是 `isSearchResultsButtonSelected`）。

## 参见

- [`showsSearchResultsButton`](showssearchresultsbutton.md)
