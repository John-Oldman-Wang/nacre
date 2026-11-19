---
type: reference
native: UIScrollView.decelerating
---

# `UIScrollView`：`isDecelerating` 属性

**`isDecelerating`** 属性表示用户已经松手，内容还在滑。

## 值

布尔。

| 取值 | 含义 |
| --- | --- |
| `true` | 用户已经松手，内容还在滑 |
| `false` | 不是 |

- 只读。给它赋值抛 `TypeError`。
- 新建的滚动视图是 `false`。
- 变成 `true` 时派发 [`deceleratebegin`](deceleratebegin-event.md)，变成 `false` 时派发 [`decelerateend`](decelerateend-event.md)。

## 示例

```js
const scroller = new UIScrollView();
scroller.addEventListener('dragend', () => {
  if (!scroller.isDecelerating) console.log('松手时已经停住了');
});
```

**效果**：松手时手指没有速度、内容不再滑，控制台输出 `松手时已经停住了`。**未在模拟器验证。**

## 对应的 iOS API

`UIScrollView.decelerating`。

## 参见

- [事件](../ui-scroll-view.md#事件)
