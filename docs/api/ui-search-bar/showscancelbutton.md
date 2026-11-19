---
type: reference
native: UISearchBar.showsCancelButton
---

# `UISearchBar`：`showsCancelButton` 属性

**`showsCancelButton`** 属性表示搜索框右边是否显示取消按钮。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 搜索框右边显示取消按钮 |
| `false` | 不显示 |

- 可读，可写。
- 默认值是 `false`。
- 直接写它是立刻显示或隐藏。要动画用 [`setShowsCancelButton()`](setshowscancelbutton.md)。
- 用户点取消按钮时，搜索框派发 [`cancel`](cancel-event.md)。取消按钮只派发事件，不改 `text`，不收起键盘。
- 写别的类型的值时按真假转成布尔。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const search = new UISearchBar();
search.showsCancelButton = true;
```

**效果**：搜索框右边出现取消按钮。**未在模拟器验证。**

## 对应的 iOS API

`UISearchBar.showsCancelButton`。

## 参见

- [`setShowsCancelButton()`](setshowscancelbutton.md)
- [`cancel`](cancel-event.md) 事件
