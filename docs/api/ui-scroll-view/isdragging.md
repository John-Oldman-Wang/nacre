---
type: reference
native: UIScrollView.dragging
---

# `UIScrollView`：`isDragging` 属性

**`isDragging`** 属性表示用户正在拖动。

## 值

布尔。

| 取值 | 含义 |
| --- | --- |
| `true` | 用户正在拖动 |
| `false` | 不是 |

- 只读。给它赋值抛 `TypeError`。
- 新建的滚动视图是 `false`。
- 变成 `true` 时派发 [`dragbegin`](dragbegin-event.md)，变成 `false` 时派发 [`dragend`](dragend-event.md)。

## 示例

```js
const scroller = new UIScrollView();
scroller.addEventListener('scroll', () => {
  console.log(scroller.isDragging);
});
```

**效果**：滚动期间输出这个状态。用户正在拖动时是 `true`。

## 对应的 iOS API

`UIScrollView.dragging`。

## 参见

- [事件](../ui-scroll-view.md#事件)
