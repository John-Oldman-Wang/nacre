---
type: reference
native: UIScrollViewDragEndEvent.targetContentOffset
---

# `UIScrollViewDragEndEvent`：`targetContentOffset` 属性

**`targetContentOffset`** 属性是内容停下时的 [`contentOffset`](../ui-scroll-view/contentoffset.md)。监听器写了它，内容就停在写的位置。

## 值

[`CGPoint`](../cg-point.md)，单位 [pt](../units.md)。初值是系统算出的停下的位置。

- 可读，可写。
- 写一个 `CGPoint`，或者带数值 `x`、`y` 的普通对象，比如 `{ x: 0, y: 40 }`。监听器全部执行完之后，内容滑到这个位置停下。
- 不写，按系统算出的位置停。
- 写的位置超出内容区时内容怎么停，**未在模拟器验证**。
- 用 [`new`](constructor.md) 创建的事件上，写它之前是 `null`。

### 写错时

- 写别的值（字符串、缺字段的对象、`NaN`）不报错，也没有警告。这一次按系统算出的位置停。

## 示例

```js
const scroller = new UIScrollView();
const rowHeight = 80;
scroller.addEventListener('beforedragend', (e) => {
  const y = Math.round(e.targetContentOffset.y / rowHeight) * rowHeight;
  e.targetContentOffset = new CGPoint(0, y);
});
```

**效果**：拖动后松手，内容停下时总是对齐到 80 pt 的整数倍。

## 对应的 iOS API

`scrollViewWillEndDragging:withVelocity:targetContentOffset:` 的参数 `targetContentOffset`。原生通过指针改它，这里直接给属性赋值。

## 参见

- [`UIScrollViewDragEndEvent`](../ui-scroll-view-drag-end-event.md)
