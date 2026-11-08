# 定时器

```js
setTimeout(fn, 100);
setInterval(fn, 100);
clearTimeout(id);
clearInterval(id);
queueMicrotask(fn);
```

和 Web 一样的签名，返回的是 `number`（不是 Node 的 `Timeout` 对象）。额外参数会透传：`setTimeout(fn, 0, a, b)` 用 `(a, b)` 调 `fn`。

## 为什么有它

[原则 4](../project.md#原则) 说「所有异步 API 返回 Promise，不要回调参数」，而 `setTimeout` 恰恰是回调式的。

**那条原则管的是我们设计的 API**。`setTimeout` 不是我们设计的，它和 `console`、`EventTarget` 一样是既有的事实标准，而且是生态的底座——`async/await` 降级后的代码、debounce、测试框架全都假设它存在。

要 Promise 形态自己包一行：

```js
await new Promise(r => setTimeout(r, 100));
```

运行时不提供这一层，因为它在 JS 里一行就有。

## 调度：参考 Chromium

不是「每个定时器一个系统 timer」，而是**一个最小堆 + 一个唤醒源**，这是 Chromium `MessagePump` 的结构。

```
     setTimeout ──┐
                  ↓
        ┌──────────────────────┐
        │ 到期堆                │   排序键 =（到期时间, 注册序号）
        └──────────────────────┘
                  ↓ 堆顶变了就重设
        ┌──────────────────────┐
        │ 一个 dispatch_after   │
        └──────────────────────┘
                  ↓ 到点
        逐个执行 → 每个之后跑微任务检查点 → 预算用完就让出主线程
```

### 同时到期按注册顺序

排序键的第二项是注册序号，所以：

```js
setTimeout(() => console.log('A'), 10);
setTimeout(() => console.log('B'), 10);   // 一定是 A 然后 B
```

这是 HTML 规范的要求。`NSTimer` 和多个 `dispatch_source` 都给不了这个保证——那正是不能「一个定时器一个系统 timer」的原因。

### 回调里注册的，等下一轮

```js
setTimeout(function f() { setTimeout(f, 0); }, 0);   // 不会卡死
```

每次唤醒只处理「进入这一轮之前」就已经在堆里的定时器。否则这段代码会在一次唤醒里无限循环，主线程再也回不到 run loop——界面就死了。

### 一次唤醒最多占用主线程约 8ms

超了就让出去，剩下的到期定时器下一轮再跑。因为 run loop 转一圈才会提交 Core Animation 事务（**渲染就发生在那里**）、响应触摸、跑增量 GC。

60fps 一帧 16.7ms，这里取大约一半。这是**尽力而为的上限，不是保证**——见下面「单个回调超时」。

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
[warn] 定时器回调占用主线程 83 ms，这一帧会掉
```

阈值参照 Chromium 的 Long Task API。取 8ms 会被正常的布局计算刷屏，取 50ms 基本只有真卡才响。符合[原则 7](../project.md#原则)：运行时提供事实，JS 做判断。

## 和原生事件的顺序

定时器的唤醒走 `dispatch_after`，原生事件走 `dispatch_async`，**两者提交到同一个主队列**，按入队时刻 FIFO。一个先入队的 `dispatch_async` 确实会排在更早到期的 timer 之前——这条实测验证过。

**但「原生事件」不等于「一次 dispatch_async」。** UIKit 的通知要走两跳：

```
UIKit 发通知
   ↓  观察者是用 addObserverForName:object:queue:（mainQueue）注册的
第一跳：观察者块排进主队列
   ↓  块跑起来之后才 postToJS
第二跳：事件派发给 JS
```

而 `setTimeout(fn, 0)` 只排一跳。两跳里**第一跳什么时候入队由 UIKit 决定**，所以：

```js
win.makeKeyAndVisible();
setTimeout(() => log('timer'), 0);
win.addEventListener('becomekey', () => log('窗口事件'));
// 顺序不确定——两种都实测到过
```

**不能靠「谁先发生」推断「谁先到 JS」。** 要排顺序就用自己能控制的那一端：同一批 `setTimeout` 之间的顺序是有保证的（见上面「同时到期按注册顺序」），跨到 UIKit 通知就没有了。

> 这一条是做图片那一步时被验收用例抓出来的。原来这里举的例子和 `main.js` 里的断言都写着「窗口事件先」，把两跳当成了一跳；换个负载顺序就翻了。现在验收只断言两边都到了。

**实现上有个坑**：`dispatch_after` 即使延迟为 0 也要过一次内核 timer，排进队列的时刻比当场 `dispatch_async` 晚。所以 `setTimeout(fn, 0)` 的唤醒**不走 `dispatch_after`，直接 `dispatch_async`**。

不这么做的后果实测到了：未处理拒绝的延后结算是 `dispatch_async` 排的，补在 `setTimeout(..., 0)` 里的 handler 本该抢在它前面抑制上报，结果反而落在后面，上报照样发出去了。

## `queueMicrotask` 不是定时器

它排的是**微任务**，在当前任务的微任务检查点里就跑，不等下一轮：

```js
setTimeout(() => console.log('宏任务'), 0);
Promise.resolve().then(() => console.log('微任务'));
queueMicrotask(() => console.log('queueMicrotask'));
console.log('同步');
// 同步 → 微任务 → queueMicrotask → 宏任务
```

## 未处理拒绝的结算被推后了

有了定时器之后，这条对齐了 Chromium：

```js
const p = Promise.reject(new Error('x'));
setTimeout(() => p.catch(() => {}), 0);   // 不会上报
```

未处理拒绝的上报排在宿主队列尾部，那个 timer task 排在它前面，所以补挂的 handler 来得及抑制上报。

代价是队列忙的时候上报会被推后。Chromium 也有这个问题，它接受了。

## 还没做

- `requestAnimationFrame` / `CADisplayLink`——做动画必须有，`setTimeout(fn, 16)` 替代不了（不和屏幕刷新同步）。属于动画那一步
- 任务优先级——Chromium 有多档，我们的宿主队列和 UIKit 共用，没法插队
- 动态 deadline——现在是固定 8ms，有了 `CADisplayLink.targetTimestamp` 才能按「距离下一帧还有多久」算
- `setImmediate`（Node 特有，Web 没有）
- 后台保活

---

← 返回 [API 文档](README.md)
