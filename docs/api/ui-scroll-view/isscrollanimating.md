---
type: reference
native: UIScrollView.isScrollAnimating
---

# `UIScrollView`：`isScrollAnimating` 属性

**`isScrollAnimating`** 属性表示正在执行 [`setContentOffset()`](setcontentoffset.md) 发起的动画。

## 值

布尔。

| 取值 | 含义 |
| --- | --- |
| `true` | 正在执行 [`setContentOffset()`](setcontentoffset.md) 发起的动画 |
| `false` | 不是 |

- 只读。给它赋值抛 `TypeError`。
- 新建的滚动视图是 `false`。
- 动画结束时派发 [`scrollanimationend`](scrollanimationend-event.md)。

## 示例

```js
const scroller = new UIScrollView();
scroller.addEventListener('scroll', () => {
  console.log(scroller.isScrollAnimating);
});
```

**效果**：滚动期间输出这个状态。正在执行 [`setContentOffset()`](setcontentoffset.md) 发起的动画时是 `true`。

## 对应的 iOS API

`UIScrollView.isScrollAnimating`。

## 参见

- [事件](../ui-scroll-view.md#事件)
