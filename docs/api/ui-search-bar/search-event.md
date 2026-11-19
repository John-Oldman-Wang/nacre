---
type: reference
native: "UISearchBarDelegate searchBarSearchButtonClicked:"
---

# `UISearchBar`：`search` 事件

**`search`** 事件在用户点了键盘上的「搜索」键时派发。

## 语法

```
search.addEventListener('search', (event) => { })
```

## 事件对象

`Event`。只有 `type`（`'search'`）和 `target`（这个搜索框），不带别的数据。不能取消。

## 什么时候派发

- 回调里读 [`text`](text.md) 得到搜索词。
- 适合做「提交搜索」：只在用户点了「搜索」时来一次，适合发网络请求。
- 系统是否自己收起键盘**未在模拟器验证**。在回调里调一次 `resignFirstResponder()`。
- [`returnKeyType`](returnkeytype.md) 换成别的取值之后，按回车是否仍然派发 `search` **未在模拟器验证**。
- 用代码让里面的输入框发出回车动作的方式验证过，没有经过真实的键盘。
- 事件在操作发生之后稍晚一点派发，不在操作的当时。

## 示例

```js
const search = new UISearchBar();
search.addEventListener('search', () => {
  search.resignFirstResponder();
  console.log('搜索', search.text);
});
```

**效果**：输入 `bei`，点键盘上的「搜索」，键盘收起，控制台输出 `搜索 bei`。

## 对应的 iOS API

`UISearchBarDelegate` 的 `searchBarSearchButtonClicked:`。JS 里不用委托对象，在搜索框上监听事件。

## 参见

- [`input`](input-event.md)
- [事件](../ui-search-bar.md#事件)：八个事件共同的规则
