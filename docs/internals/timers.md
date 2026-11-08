# 定时器

调度怎么做的、时间预算、未处理拒绝的结算为什么推后。

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

## 同时到期按注册顺序

排序键的第二项是注册序号，所以：

```js
setTimeout(() => console.log('A'), 10);
setTimeout(() => console.log('B'), 10);   // 一定是 A 然后 B
```

这是 HTML 规范的要求。`NSTimer` 和多个 `dispatch_source` 都给不了这个保证——那正是不能「一个定时器一个系统 timer」的原因。

## 回调里注册的，等下一轮

```js
setTimeout(function f() { setTimeout(f, 0); }, 0);   // 不会卡死
```

每次唤醒只处理「进入这一轮之前」就已经在堆里的定时器。否则这段代码会在一次唤醒里无限循环，主线程再也回不到 run loop——界面就死了。

## 一次唤醒最多占用主线程约 8ms

超了就让出去，剩下的到期定时器下一轮再跑。因为 run loop 转一圈才会提交 Core Animation 事务（**渲染就发生在那里**）、响应触摸、跑增量 GC。

60fps 一帧 16.7ms，这里取大约一半。这是**尽力而为的上限，不是保证**——见下面「单个回调超时」。

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

## 未处理拒绝的结算被推后了

有了定时器之后，这条对齐了 Chromium：

```js
const p = Promise.reject(new Error('x'));
setTimeout(() => p.catch(() => {}), 0);   // 不会上报
```

未处理拒绝的上报排在宿主队列尾部，那个 timer task 排在它前面，所以补挂的 handler 来得及抑制上报。

代价是队列忙的时候上报会被推后。Chromium 也有这个问题，它接受了。

---

← 返回[实现原理](README.md) ・ [API 文档](../api/timers.md)
