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

## 间隔是 0 的 `setInterval`：重复，不设最小间隔

### 原来只执行一次

```js
let n = 0;
setInterval(() => { n++; }, 0);
// 300 ms 之后 n 是 1。对照的 setInterval(fn, 16) 是 18
```

不报错，也不重复。从 Web 搬来的「尽快反复执行，直到条件满足」那种写法会静默地只跑一次。不写间隔的 `setInterval(fn)` 也一样，因为缺省值就是 0。

原因在引擎里：没有单独记「要不要重复」，拿间隔当了判断。

```cpp
entry.interval_ms = repeats ? std::max(0.0, delay_ms) : 0.0;   // AddTimer
…
if (entry.interval_ms > 0 && …) { /* 重新入堆 */ }            // FireDueTimers
```

间隔是 0 时，「重复、间隔为 0」和「不重复」落在同一个值上。修法是 `TimerEntry` 加一个 `repeats` 字段，判断改成看它。JS 那一侧一个字没动。

### 要不要加一个最小间隔

浏览器把重复间隔加长到至少 4 ms，Node 把 0 当成 1 ms。指出这个问题的那份审查建议照做，理由是「0 间隔的重复定时器永远处于到期状态，会一直占着主线程」。

前半句对，后半句要分开看。重复定时器重新入堆时拿到的是新的序号，而[一次唤醒只处理进入这一轮之前就在堆里的](#回调里注册的等下一轮)——所以它每执行一次就回一趟主队列，走的是和 `setTimeout(function f() { setTimeout(f, 0); }, 0)` 同一条路。主线程一直在**忙**，但没有被**占住**：排在主队列里的触摸、系统通知、Core Animation 的提交，都排得进它的两次回调之间。

这一条是量出来的，不是推出来的（iPhone Air 模拟器，iOS 27.2，一条 0 延迟的 `setTimeout` 链连续跑着）：

| 量什么 | 链在跑 | 对照（链不跑） |
| --- | --- | --- |
| 2 秒里 `CADisplayLink` 的 `tick` 次数 | 120 | 124 |
| 一个 500 ms 的定时器晚了多久 | 0.0 ms | 25.1 ms |
| 链每秒执行多少次 | 19.2 万到 29.4 万（六次读数） | — |
| 链的两次回调之间最长隔了多久 | 1.1 ms | — |
| 系统切换深浅色（`simctl`），`traitchange` 到没到 | 切 3 次到 3 次，其中两次量了延迟：275 ms、767 ms | 到了，延迟 535 ms |
| 手点按钮，`click` 到没到 | 点 5 次到 5 次 | — |

第二行是意料之外的：链在跑的时候别的定时器反而更准，因为主线程没有睡下去，不用等系统把它叫醒。

所以**不设最小间隔**。这和 `setTimeout` 已经定的一致（嵌套的 `setTimeout(fn, 0)` 也不加长），也合「不为可能会慢提前加机制」那条。代价是写了 `setInterval(fn, 0)` 的 App 主线程会一直转，CPU 被占着。

要不要改主意以后再议，记在[项目说明](../project.md#以后有空再议)里。到时候要补的数据：

- **真机上没量。** 上面全是模拟器的数。
- **空闲 GC 还跑不跑没验证。** V8 的空闲任务挂在 run loop 即将等待（`kCFRunLoopBeforeWaiting`）那一刻，而一条不停的 0 延迟链可能让 run loop 一直等不下去。
- **内存警告到不到没测成。** `simctl` 发的模拟内存警告 App 没收到，不带链的对照也没收到，所以什么都说明不了。
- **耗电没量。**

### 验收怎么盯

三条断言，都在 `acceptance/src/steps/timers.js`：间隔 0 的重复 5 次后停得住；不写间隔的重复 3 次后停得住；第一次回调里注册的 `setTimeout(fn, 0)` 在第 5 次之前就执行了——最后这一条盯的是「每次都回一趟队列」，哪天有人把重新入堆改成沿用旧序号，它会失败。

先在没修的引擎上跑过：前两条失败（`= 1（期望 5）`、`= 1（期望 3）`），第三条通过——没修的时候它只执行一次，`setTimeout` 当然插得进来，所以第三条单独拿出来证明不了修复，它防的是以后。

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

## `performance.now()`：时钟就是定时器那一个

定时器的到期时间本来就靠引擎里的 `NowMs()`（`std::chrono::steady_clock`），`performance.now()` 只是把它减去一个零点再交给 JS。所以没有新的时钟，也没有过桥到 ObjC——两个 V8 函数回调，纯 C++，将来 Android 原样复用。

| | 定法 | 理由 |
| --- | --- | --- |
| 零点 | 引擎构造的那一刻 | Web 的 `timeOrigin` 是「这个上下文开始的时刻」。它早于内置脚本和 `main.js`，所以 `performance.now()` 直接读出来就是「JS 环境活了多久」 |
| `timeOrigin` | 同一刻用 `system_clock` 记一次 | 墙上时钟会被用户改、被 NTP 校正，只能拿来做这一次换算，不能参与算差 |
| 精度 | 不降 | 浏览器把读数取整是防计时攻击（Spectre 那一类），前提是跑不受信任的代码。我们的 JS 是开发者自己打进包里的——原则 8 |
| 范围 | 只有 `now()`、`timeOrigin`、`toJSON()` | `mark` / `measure` 是在 `now()` 之上的记账，JS 自己写得出来；判据是「JS 层封装得出来的不做」 |

没查的一件事：`steady_clock` 在设备**睡眠期间走不走**。libc++ 在 Apple 平台上的实现决定了它，没有去读。对「量一段代码花多久」没有影响，对「App 在后台待了多久」有影响——那种用途应该用 `Date.now()`。

---

← 返回[实现原理](README.md) ・ [API 文档](../api/timers.md)
