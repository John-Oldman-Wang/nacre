---
type: reference
native: CADisplayLinkEvent.frame
---

# `CADisplayLinkEvent`：`frame` 属性

**`frame`** 属性是这一帧的三个时间。

## 值

对象，三个字段都是数，单位都是**秒**：

- 只读。给它赋值抛 `TypeError`。
- `timestamp`：这一帧的时刻。
- `duration`：两帧之间的间隔。
- `targetTimestamp`：这一帧的内容将要显示到屏幕上的时刻，比 `timestamp` 晚。按时间算位置时用它。
- 这三个时刻只能用来互相求差。它们的起点和 `Date.now()` 不同，不能混在一起算。
- 用 [`new`](constructor.md) 创建时没给，是 `null`。

## 示例

```js
const link = new CADisplayLink();
let first = 0;
link.addEventListener('tick', (e) => {
  if (first === 0) first = e.frame.targetTimestamp;
  console.log('过了', (e.frame.targetTimestamp - first).toFixed(3), '秒');
});
link.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' });
```

**效果**：每一帧输出从第一帧起过了多少秒。

## 对应的 iOS API

`CADisplayLink` 的 `timestamp`、`duration`、`targetTimestamp`。

## 参见

- [`CADisplayLinkEvent`](../ca-display-link-event.md)
