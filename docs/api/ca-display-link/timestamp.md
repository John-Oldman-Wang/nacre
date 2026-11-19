---
type: reference
native: CADisplayLink.timestamp
---

# `CADisplayLink`：`timestamp` 属性

**`timestamp`** 属性是最近一帧的时刻。

## 值

数，单位是秒。

- 只读。给它赋值抛 `TypeError`。
- 开始工作之前是 `0`。
- 起点和 `Date.now()` 不同，只能和另外两个时间互相求差，不能和 `Date.now()` 混在一起算。
- 每帧都变，没有单独的变化事件。回调执行时这个属性可能已经是下一帧的值，回调里用 [`tick`](tick-event.md) 事件对象上 `frame.timestamp` 的值。


## 示例

```js
const link = new CADisplayLink();
link.addEventListener('tick', () => {
  console.log(link.timestamp);
});
link.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' });
```

**结果**：每帧输出一次最近一帧的时刻。

## 对应的 iOS API

`CADisplayLink.timestamp`（`CFTimeInterval`）。

## 参见

- [`tick`](tick-event.md)：事件对象上的同名字段
