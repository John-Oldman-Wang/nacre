---
type: reference
native: UISearchBar.showsBookmarkButton
---

# `UISearchBar`：`showsBookmarkButton` 属性

**`showsBookmarkButton`** 属性表示输入框右端是否显示书签按钮。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 输入框右端显示书签按钮 |
| `false` | 不显示 |

- 可读，可写。
- 默认值是 `false`。
- 用户点书签按钮时，搜索框派发 [`bookmarkclick`](bookmarkclick-event.md)。
- 和 [`showsSearchResultsButton`](showssearchresultsbutton.md) 互不影响，可以同时是 `true`。两个都开时画面上显示哪一个**未在模拟器验证**。
- 写别的类型的值时按真假转成布尔。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const search = new UISearchBar();
search.showsBookmarkButton = true;
search.addEventListener('bookmarkclick', () => console.log('打开书签'));
```

**效果**：输入框右端出现书签图标。点它，控制台输出 `打开书签`。**未在模拟器验证。**

## 对应的 iOS API

`UISearchBar.showsBookmarkButton`。

## 参见

- [`bookmarkclick`](bookmarkclick-event.md) 事件
