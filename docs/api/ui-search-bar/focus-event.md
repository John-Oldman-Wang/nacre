---
type: reference
native: "UISearchBarDelegate searchBarTextDidBeginEditing:"
---

# `UISearchBar`：`focus` 事件

**`focus`** 事件在开始输入：搜索框拿到了焦点，键盘弹出时派发。

## 语法

```
search.addEventListener('focus', (event) => { })
```

## 事件对象

`Event`。只有 `type`（`'focus'`）和 `target`（这个搜索框），不带别的数据。不能取消。

## 什么时候派发

- 用户点搜索框时派发。
- 用代码调 `becomeFirstResponder()` 并且成功时也派发。**未在模拟器验证。**
- 用代码让里面的输入框聚焦的方式验证过，没有经过真实的触摸。
- 事件在操作发生之后稍晚一点派发，不在操作的当时。

## 示例

```js
const search = new UISearchBar();
search.addEventListener('focus', () => {
  search.setShowsCancelButton(true, { animated: true });
});
```

**效果**：点搜索框，右边滑出取消按钮。**未在模拟器验证。**

## 对应的 iOS API

`UISearchBarDelegate` 的 `searchBarTextDidBeginEditing:`。JS 里不用委托对象，在搜索框上监听事件。

## 参见

- [`blur`](blur-event.md)
- [事件](../ui-search-bar.md#事件)：八个事件共同的规则
