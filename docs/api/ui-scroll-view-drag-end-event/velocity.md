---
type: reference
native: UIScrollViewDragEndEvent.velocity
---

# `UIScrollViewDragEndEvent`：`velocity` 属性

**`velocity`** 属性是松手时内容移动的速度。

## 值

[`CGPoint`](../cg-point.md)，单位是 [pt](../units.md) 每毫秒。

- 只读。给它赋值抛 `TypeError`。
- 正负号表示方向，和 `contentOffset` 变化的方向一致：`y` 为正时，内容往 `contentOffset.y` 增大的方向滑。**未用真实的手指验证。**
- 松手时手指不动，是 `(0, 0)`。
- 用 [`new`](constructor.md) 创建时没给，是 `null`。

## 示例

```js
const scroller = new UIScrollView();
scroller.addEventListener('beforedragend', (e) => {
  console.log('松手时的速度', e.velocity.y);
});
```

**效果**：拖动 `scroller` 后松手，输出纵向的速度。

## 对应的 iOS API

`scrollViewWillEndDragging:withVelocity:targetContentOffset:` 的参数 `velocity`。

## 参见

- [`UIScrollViewDragEndEvent`](../ui-scroll-view-drag-end-event.md)
