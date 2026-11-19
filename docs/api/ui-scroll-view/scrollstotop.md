---
type: reference
native: UIScrollView.scrollsToTop
---

# `UIScrollView`：`scrollsToTop` 属性

**`scrollsToTop`** 属性表示用户点屏幕顶部的状态栏时，是否滚回顶部。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 用户点状态栏时滚回顶部，之后派发 [`scrolltotop`](scrolltotop-event.md) |
| `false` | 点状态栏没有反应 |

- 可读，可写。
- 默认值是 `true`。
- 一个屏幕上只能有一个滚动视图的 `scrollsToTop` 是 `true`。有多个时，点状态栏都没有反应。
- 写别的类型的值时按 JS 的真假转换。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const scroller = new UIScrollView();
scroller.scrollsToTop = false;
```

**效果**：点状态栏，这个滚动视图不滚。**未在模拟器验证。**

## 对应的 iOS API

`UIScrollView.scrollsToTop`。

## 参见

- [`scrolltotop`](scrolltotop-event.md) 事件
