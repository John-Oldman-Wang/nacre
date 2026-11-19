---
type: reference
native: "+[CADisplayLink displayLinkWithTarget:selector:]"
---

# `CADisplayLink`：`tick` 事件

**`tick`** 事件在屏幕每刷新一帧时派发一次。

## 语法

```
link.addEventListener('tick', (event) => { })
```

## 事件对象

`CADisplayLinkEvent`，除 `type`、`target` 外带一个字段：

**`frame`**

这一帧的三个时间，单位都是**秒**：

| 字段 | 含义 |
| --- | --- |
| `timestamp` | 这一帧的时刻 |
| `duration` | 两帧之间的间隔 |
| `targetTimestamp` | 这一帧的内容将要显示到屏幕上的时刻，比 `timestamp` 晚 |

这三个时刻只能用来互相求差。它们的起点和 `Date.now()` 不同，不能混在一起算。

回调参数的类型声明是普通的 `Event`。读 `frame` 时要像下面的例子那样先转成 `CADisplayLinkEvent`。

不能取消。

## 什么时候派发

- 监听了 `tick`、并且调过 [`addToRunLoop()`](addtorunloop.md) 之后，屏幕每刷新一帧派发一次。两步缺一步都不派发。
- [`isPaused`](ispaused.md) 是 `true` 时、[`invalidate()`](invalidate.md) 之后不派发。
- 回调不是在屏幕刷新的那一刻同步执行的，见[运行时怎么工作](../how-it-works.md)。JS 正在执行别的代码时，回调要等它执行完。
- 类型定义里，`addEventListener()` 只接受 `'tick'`。运行时监听别的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。

## 示例

```js
const link = new CADisplayLink();
const speed = 120;       // pt 每秒
let last = 0;
let x = 0;

link.addEventListener('tick', (ev) => {
  const frame = /** @type {CADisplayLinkEvent} */ (ev).frame;
  const dt = last === 0 ? 0 : frame.timestamp - last;   // 距上一次回调过了多少秒
  last = frame.timestamp;
  x += speed * dt;
  console.log(x);
});
link.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' });
```

**结果**：`x` 每秒增加 120，和屏幕每秒刷新多少帧无关。

## 对应的 iOS API

`+[CADisplayLink displayLinkWithTarget:selector:]` 里 selector 指定的那个方法。不用 target 和 selector，直接监听 `tick`；ObjC 回调参数里的 `link.timestamp` 等写成事件对象的 `frame`。

## 参见

- [用时间算位置，不用帧数](../../guides/frame-callback.md#用时间算位置不用帧数)
