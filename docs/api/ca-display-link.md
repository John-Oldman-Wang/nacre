---
type: reference
native: CADisplayLink
status: partial
---

# `CADisplayLink`

**`CADisplayLink`** 表示一个和屏幕刷新同步的定时器。屏幕每刷新一帧，它派发一次 [`tick`](ca-display-link/tick-event.md) 事件。回调里用代码计算并设置这一帧的界面，就得到一段完全由代码控制的动画。

新建的 `CADisplayLink` 不会自己开始。要监听 `tick`，并调 [`addToRunLoop()`](ca-display-link/addtorunloop.md) 把它加入主线程的事件循环 [`NSRunLoop.mainRunLoop`](ns-run-loop/mainrunloop.md)，两步都做了才开始派发。

**加入之后，它会一直工作到被停止。** 代码里不保存它，它也不会被回收，回调每帧照常执行。不用了一定要调 [`invalidate()`](ca-display-link/invalidate.md)。

能写成「从一个值到另一个值」或「依次经过几个值」的动画，用[动画对象](ca-animation.md)：动画对象加到图层上之后，每一帧的中间值由系统计算，不执行 JS（**这一点来自 iOS 的定义，未在模拟器验证**）。`CADisplayLink` 的每一帧都要执行 JS 回调，JS 正在执行别的代码时，回调要等它执行完：验收用例里测到过一次，第一帧在 `addToRunLoop()` 之后 2.07 秒才到，因为这期间 JS 一直在运行别的代码。适合用 `CADisplayLink` 的是动画对象表达不了的情况：位置取决于实时数据、自己写的物理模拟、需要每帧做判断的游戏逻辑。

**继承关系**：`EventTarget` → `NSObject` → `CADisplayLink`

怎么用它做逐帧动画，见指南[每一帧执行一次代码](../guides/frame-callback.md)。

## 构造函数

[`CADisplayLink()`](ca-display-link/constructor.md)

创建一个还没开始工作的 `CADisplayLink`。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`isPaused`](ca-display-link/ispaused.md) | 是否暂停派发 `tick` |
| [`preferredFrameRateRange`](ca-display-link/preferredframeraterange.md) | 希望每秒回调多少次 |
| [`timestamp`](ca-display-link/timestamp.md) <small>只读</small> | 最近一帧的时刻 |
| [`duration`](ca-display-link/duration.md) <small>只读</small> | 两帧之间的间隔 |
| [`targetTimestamp`](ca-display-link/targettimestamp.md) <small>只读</small> | 最近一帧的内容将要显示的时刻 |

## 实例方法

| 方法 | 说明 |
| --- | --- |
| [`addToRunLoop()`](ca-display-link/addtorunloop.md) | 让它开始工作 |
| [`removeFromRunLoop()`](ca-display-link/removefromrunloop.md) | 取消某个模式上的回调 |
| [`invalidate()`](ca-display-link/invalidate.md) | 彻底停止 |

## 事件

| 事件 | 什么时候派发 |
| --- | --- |
| [`tick`](ca-display-link/tick-event.md) | 屏幕每刷新一帧 |

## 示例

```js
const link = new CADisplayLink();

link.addEventListener('tick', (ev) => {
  const frame = /** @type {CADisplayLinkEvent} */ (ev).frame;
  console.log('这一帧的时刻:', frame.timestamp);
});

link.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' });
```

**结果**：屏幕每刷新一帧，控制台输出一行。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[CADisplayLink displayLinkWithTarget:self selector:@selector(tick:)]` | `new CADisplayLink()`，再 `addEventListener('tick', …)` |
| `[link addToRunLoop:NSRunLoop.mainRunLoop forMode:NSRunLoopCommonModes]` | `link.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' })` |
| `link.paused = YES` | `link.isPaused = true` |
| `link.preferredFrameRateRange = CAFrameRateRangeMake(30, 60, 30)` | `link.preferredFrameRateRange = new CAFrameRateRange(30, 60, 30)` |

## 参见

- [每一帧执行一次代码](../guides/frame-callback.md)
- [`NSRunLoop`](ns-run-loop.md)：`addToRunLoop()` 的第一个参数
- [结构体](structs.md)：`CAFrameRateRange`
- [运行时怎么工作](how-it-works.md)：回调什么时候执行
