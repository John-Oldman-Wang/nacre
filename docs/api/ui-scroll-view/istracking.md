---
type: reference
native: UIScrollView.tracking
---

# `UIScrollView`：`isTracking` 属性

**`isTracking`** 属性表示手指按在滚动视图上，包括还没开始移动的时候。

## 值

布尔。

| 取值 | 含义 |
| --- | --- |
| `true` | 手指按在滚动视图上，包括还没开始移动的时候 |
| `false` | 不是 |

- 只读。给它赋值抛 `TypeError`。
- 新建的滚动视图是 `false`。
- 没有变化事件。

## 示例

```js
const scroller = new UIScrollView();
scroller.addEventListener('scroll', () => {
  console.log(scroller.isTracking);
});
```

**效果**：滚动期间输出这个状态。手指按在滚动视图上，包括还没开始移动的时候时是 `true`。

## 对应的 iOS API

`UIScrollView.tracking`。

## 参见

- [事件](../ui-scroll-view.md#事件)
