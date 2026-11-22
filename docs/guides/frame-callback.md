# 每一帧执行一次代码

这一篇讲怎么用 [`CADisplayLink`](../api/ca-display-link.md) 在屏幕每刷新一帧时执行一次代码，用代码逐帧更新界面：开始、停止、按经过的时间算位置、控制帧率。

## 推荐的做法

- **先考虑用动画对象。** 能写成「从一个值到另一个值」或「依次经过几个值」的动画，用[做动画](animation.md)里的动画对象。动画对象加到图层上之后，每一帧的中间值由系统计算，不执行 JS（**这一点来自 iOS 的定义，未在模拟器验证**）。`CADisplayLink` 的每一帧都要执行 JS 回调，JS 正在执行别的代码时，回调要等它执行完：验收用例里测到过一次，第一帧在 `addToRunLoop()` 之后 2.07 秒才到，因为这期间 JS 一直在运行别的代码。
- **适合用 `CADisplayLink` 的是动画对象表达不了的情况**：位置取决于实时数据、自己写的物理模拟、需要每帧做判断的游戏逻辑。
- **`forMode` 用 `'common'`。** 用户拖动滚动视图期间回调也继续。
- **按经过的时间推进，不按回调的次数。** 见[用时间算位置，不用帧数](#用时间算位置不用帧数)。
- **不用了一定要调 `invalidate()`。** 加入事件循环之后，代码里不保存它，它也会一直工作。
- **不要用定时器做动画。** 定时器的回调和屏幕刷新不同步，见[定时器](../api/timers.md)。

## 第一个例子

从空白 App 开始，让一个圆点在屏幕上左右来回移动。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 一个圆点
  const dot = new UIView();
  dot.frame = new CGRect(20, 200, 20, 20);
  dot.backgroundColor = 'systemBlue';
  dot.layer.cornerRadius = 10;
  page.view.addSubview(dot);

  // 2. 每帧按经过的时间算出位置
  const link = new CADisplayLink();
  let start = 0;
  link.addEventListener('tick', (ev) => {
    const frame = ev.frame;
    if (start === 0) start = frame.timestamp;

    const t = (frame.timestamp - start) % 2;          // 秒，2 秒一个来回
    const x = t < 1 ? t * 240 : (2 - t) * 240;
    dot.frame = new CGRect(20 + x, 200, 20, 20);
  });

  // 3. 加入主线程的事件循环，开始工作
  link.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' });
});
```

**效果**：圆点在屏幕上左右来回移动，1 秒从左到右，1 秒返回。

这段代码没有作为一个整体在模拟器运行过。

**两步都要做**：监听 [`tick`](../api/ca-display-link/tick-event.md)，并调 [`addToRunLoop()`](../api/ca-display-link/addtorunloop.md)。只做其中一步，回调一次都不会执行。

## 开始和停止

```js
const link = new CADisplayLink();

link.addEventListener('tick', (ev) => {
  const frame = ev.frame;
  console.log('这一帧的时刻:', frame.timestamp);
});

link.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' });
```

**结果**：屏幕每刷新一帧，控制台输出一行。

[`NSRunLoop.mainRunLoop`](../api/ns-run-loop/mainrunloop.md) 表示 App 主线程的事件循环。`CADisplayLink` 加入它之后才开始工作。

**加入之后，`CADisplayLink` 会一直工作到被停止。** 代码里不保存它，它也不会停，回调每帧照常执行。所以不用了一定要停止：

```js
link.isPaused = true;    // 暂停。设回 false 继续
link.invalidate();       // 彻底停止。之后不能再启动，要用就新建一个
```

**效果**：暂停或停止之后不再派发 `tick`。

回调不是在屏幕刷新的那一刻同步执行的，见[运行时怎么工作](../api/how-it-works.md)。所以暂停或停止之后，已经派发、还没执行的那一次回调仍然会执行。回调里如果依赖「已经停止」这个状态，要自己判断。

## 滚动时也继续

`addToRunLoop()` 的 `forMode` 决定用户拖动滚动视图期间回调是否继续：

| `forMode` | 效果 |
| --- | --- |
| `'common'` | 一直回调。**一般用这个** |
| `'default'` | 平时回调，用户拖动滚动视图期间暂停。不写 `forMode` 时是这个 |
| `'tracking'` | 只在用户拖动滚动视图期间回调 |

三种取值在滚动期间的差别来自 iOS 的定义，**未在模拟器验证**。验收用例只用了 `'common'`。

## 用时间算位置，不用帧数

`tick` 事件对象的 `frame` 里有三个时间，单位都是**秒**：

| 字段 | 含义 |
| --- | --- |
| `timestamp` | 这一帧的时刻 |
| `duration` | 两帧之间的间隔 |
| `targetTimestamp` | 这一帧的内容将要显示到屏幕上的时刻，比 `timestamp` 晚 |

这三个时刻只能用来互相求差。它们的起点和 `Date.now()` 不同，不能混在一起算。

```js
const mover = new CADisplayLink();
const speed = 120;       // pt 每秒
let last = 0;
let x = 0;

mover.addEventListener('tick', (ev) => {
  const frame = ev.frame;
  const dt = last === 0 ? 0 : frame.timestamp - last;   // 距上一次回调过了多少秒
  last = frame.timestamp;
  x += speed * dt;
  console.log(x);
});
mover.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' });
```

**结果**：`x` 每秒增加 120，和屏幕每秒刷新多少帧无关。

**每次回调按经过的时间推进，不要按「每次回调前进固定的距离」写。** 不同设备每秒的帧数不同，回调也可能晚到；按固定距离写，物体的速度会随帧数变化。

这三个值带在事件对象上。`mover.timestamp` 等属性也能读，但回调执行时它们可能已经是下一帧的值，回调里用事件对象上的。

## 降低帧率

不需要每帧都更新时，用 [`preferredFrameRateRange`](../api/ca-display-link/preferredframeraterange.md) 告诉系统希望每秒回调多少次：

```js
mover.preferredFrameRateRange = new CAFrameRateRange(30, 60, 30);
console.log(String(mover.preferredFrameRateRange));
```

**结果**：控制台输出 `CAFrameRateRange(30, 60, 30)`。三个数依次是最低、最高、最希望的帧率，单位是帧每秒。设置之后实际每秒回调多少次，**未在模拟器验证**。

## 参见

- [`CADisplayLink`](../api/ca-display-link.md)：全部成员
- [`NSRunLoop`](../api/ns-run-loop.md)：`addToRunLoop()` 的第一个参数
- [做动画](animation.md)：能用动画对象表达的动画
- [定时器](../api/timers.md)：为什么不用定时器做动画
