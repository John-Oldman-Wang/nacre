# 定时器

```js
setTimeout(fn, 100);
setInterval(fn, 100);
clearTimeout(id);
clearInterval(id);
queueMicrotask(fn);
```

和 Web 一样的签名，返回的是 `number`（不是 Node 的 `Timeout` 对象）。额外参数会透传：`setTimeout(fn, 0, a, b)` 用 `(a, b)` 调 `fn`。

## 三个平台事实

### App 进后台，定时器停

不是节流，是停。定时器挂在主线程上，后台 run loop 不转。这和浏览器切后台把 `setTimeout` 节流到 1 分钟一次是两回事。

### `setInterval` 不保证间隔

主线程被 JS 占住时会晚。落后太多时**不做补偿式连发**——主线程卡过之后连打十几次没有意义，所以直接重新计时。

### 启动时第一个定时器可能等很久

实测：App 启动期间 `setTimeout(fn, 0)` 等了 **253ms** 才执行。主队列那会儿正忙着首次布局、字体和首帧渲染。

这不是定时器的问题，是 JS 跑主线程的直接后果（见[技术选型](../project.md#js-为什么跑在主线程)）。**写验收代码时不要依赖绝对时间**，要等条件满足。

## 单个回调超时

```js
setTimeout(() => { while (Date.now() - t < 500) {} }, 0);   // 界面冻 500ms
```

没有办法打断——没有抢占式调度，jitless 下也没有 JIT 的中断检查点。8ms 预算只能在**任务之间**检查。

这是使用方的问题，不是运行时要解决的（浏览器里一个 `for` 循环跑 500ms 照样冻住页面）。但运行时会**让它可见**，超过 50ms 记一条：

```
[warn] Timer callback blocked the main thread for 83 ms; this frame will drop
```

阈值参照 Chromium 的 Long Task API。取 8ms 会被正常的布局计算刷屏，取 50ms 基本只有真卡才响。符合[原则 7](../project.md#原则)：运行时提供事实，JS 做判断。

## `queueMicrotask` 不是定时器

它排的是**微任务**，在当前任务的微任务检查点里就跑，不等下一轮：

```js
setTimeout(() => console.log('宏任务'), 0);
Promise.resolve().then(() => console.log('微任务'));
queueMicrotask(() => console.log('queueMicrotask'));
console.log('同步');
// 同步 → 微任务 → queueMicrotask → 宏任务
```

## 还没做

- `requestAnimationFrame` / `CADisplayLink`——做动画必须有，`setTimeout(fn, 16)` 替代不了（不和屏幕刷新同步）。属于动画那一步
- 任务优先级——Chromium 有多档，我们的宿主队列和 UIKit 共用，没法插队
- 动态 deadline——现在是固定 8ms，有了 `CADisplayLink.targetTimestamp` 才能按「距离下一帧还有多久」算
- `setImmediate`（Node 特有，Web 没有）
- 后台保活

## 和原生的对照

定时器不是 ObjC API 的映射，是宿主提供的 Web 标准接口。原生侧用一个最小堆加一个唤醒源实现，JS 侧的签名和浏览器一致。

| Web | Nacre |
| --- | --- |
| `setTimeout(fn, ms, ...args)` | 一样，返回 `number` |
| `setInterval` / `clearTimeout` / `clearInterval` | 一样 |
| `queueMicrotask(fn)` | 一样 |
| `requestAnimationFrame` | **没有**，见「还没做」 |

---

实现原理见[实现说明](../internals/timers.md)。

← 返回 [API 文档](README.md)
