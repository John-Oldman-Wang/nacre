---
type: reference
native: "UISearchBarDelegate searchBarTextDidEndEditing:"
---

# `UISearchBar`：`blur` 事件

**`blur`** 事件在结束输入：搜索框交出了焦点，键盘收起时派发。

## 语法

```
search.addEventListener('blur', (event) => { })
```

## 事件对象

`Event`。只有 `type`（`'blur'`）和 `target`（这个搜索框），不带别的数据。不能取消。

## 什么时候派发

- 调 `resignFirstResponder()` 时派发。
- 回调里读 [`text`](text.md) 得到用户输入完的文字。
- 用代码让里面的输入框失焦的方式验证过，没有经过真实的键盘。
- 事件在操作发生之后稍晚一点派发，不在操作的当时。

## 示例

```js
const search = new UISearchBar();
search.addEventListener('blur', () => {
  console.log('输入完了', search.text);
});
```

**效果**：键盘收起时，控制台输出 `输入完了` 和当时的文字。

## 对应的 iOS API

`UISearchBarDelegate` 的 `searchBarTextDidEndEditing:`。JS 里不用委托对象，在搜索框上监听事件。

## 参见

- [`focus`](focus-event.md)
- [事件](../ui-search-bar.md#事件)：八个事件共同的规则
