---
type: reference
native: UIScrollView.pagingEnabled
---

# `UIScrollView`：`isPagingEnabled` 属性

**`isPagingEnabled`** 属性表示是否一页一页地翻：松手后停在可视区宽度（或高度）的整数倍上。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 松手后停在可视区宽度（或高度）的整数倍上，不会停在两页中间 |
| `false` | 停在任意位置 |

- 可读，可写。
- 默认值是 `false`。
- 只能按可视区的整数倍停，不能按别的宽度。
- 写别的类型的值时按 JS 的真假转换。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const scroller = new UIScrollView();
scroller.isPagingEnabled = true;
```

**效果**：每次滑动松手后，停在某一页正好占满可视区的位置。**未在模拟器验证。**

## 对应的 iOS API

`UIScrollView.pagingEnabled`（getter 是 `isPagingEnabled`）。

## 参见

- [做一个轮播](../../guides/scrolling.md#一页一页地翻轮播)
