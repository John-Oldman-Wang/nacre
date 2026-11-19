---
type: reference
native: "UISearchBarDelegate searchBarCancelButtonClicked:"
---

# `UISearchBar`：`cancel` 事件

**`cancel`** 事件在用户点了取消按钮时派发。

## 语法

```
search.addEventListener('cancel', (event) => { })
```

## 事件对象

`Event`。只有 `type`（`'cancel'`）和 `target`（这个搜索框），不带别的数据。不能取消。

## 什么时候派发

- 只有 [`showsCancelButton`](showscancelbutton.md) 是 `true` 时才有取消按钮。
- 取消按钮只派发事件，不改 `text`。要清空文字，在回调里自己写 `text = ''`；这时 `input` 不派发（文字是代码改的），筛选结果要自己恢复原样。
- 系统是否自己收起键盘**未在模拟器验证**。在回调里调一次 `resignFirstResponder()`。
- 要真实点击才能触发，**未在模拟器验证**。
- 事件在操作发生之后稍晚一点派发，不在操作的当时。

## 示例

```js
const search = new UISearchBar();
search.showsCancelButton = true;
search.addEventListener('cancel', () => {
  search.text = '';
  search.resignFirstResponder();
});
```

**效果**：点取消按钮，文字清空，键盘收起。**未在模拟器验证。**

## 对应的 iOS API

`UISearchBarDelegate` 的 `searchBarCancelButtonClicked:`。JS 里不用委托对象，在搜索框上监听事件。

## 参见

- [`showsCancelButton`](showscancelbutton.md)
- [事件](../ui-search-bar.md#事件)：八个事件共同的规则
