# 动画

Core Animation 的显式动画：`CABasicAnimation` 把一个图层属性从一个值推到另一个值。

```js
const draw = CABasicAnimation.animationWithKeyPath('strokeEnd');
draw.fromValue = 0;
draw.toValue = 1;
draw.duration = 1.2;
draw.timingFunction = CAMediaTimingFunction.functionWithName('easeInEaseOut');

shape.strokeEnd = 1;                      // ← 模型值也设过去，见下面那条坑
shape.addAnimation(draw, { forKey: 'draw' });
```

## 先读这三条

### 1. 动画完了会弹回原值

`removedOnCompletion` 默认 `true`，`fillMode` 默认 `'removed'`。两条加起来的意思是：**动画一结束就被摘掉，属性显示回它的模型值**。

这是 Core Animation 最常被当成 bug 的行为。正确的做法**不是**把 `removedOnCompletion` 设成 `false`（那会让图层一直顶着一个已经结束的动画，之后再改那个属性也看不出变化），而是：

```js
shape.strokeEnd = 1;                      // 模型值先到位
shape.addAnimation(draw, { forKey: 'draw' });   // 动画只负责「怎么过去」
```

### 2. `addAnimation` 会拷贝

```js
layer.addAnimation(anim, { forKey: 'fade' });
anim.duration = 5;                        // 没有任何效果
layer.animationForKey('fade') === anim;   // false
```

挂上去之后再改原来那个对象不会影响已经在跑的动画。`animationForKey()` 读回来的是**图层持有的那份拷贝**——Apple 的头文件写着「改它的任何属性都是未定义行为」。

事件是例外：`'start'` / `'stop'` 仍然派发给**你建的那个对象**，因为你监听的本来就是它。

### 3. 值的类型由 `keyPath` 决定

`fromValue` / `toValue` / `byValue` 在 ObjC 里是 `id`，放什么由 `keyPath` 说了算：

| `keyPath` | 值 |
| --- | --- |
| `opacity`、`strokeEnd`、`cornerRadius`… | 数字 |
| `position`、`startPoint`、`endPoint` | `CGPoint` |
| `bounds` | `CGRect` |
| `shadowOffset` | `CGSize` |
| `backgroundColor`、`strokeColor`、`fillColor`… | 颜色（字符串或 `UIColor`） |
| `path` | `UIBezierPath` |

所以**要先设 `keyPath`**。没设就赋值会抛，而且会说清原因：

```js
const anim = new CABasicAnimation();
anim.toValue = 1;
// TypeError: set keyPath before toValue; the value's type depends on it
```

给错类型也抛，并点名是哪个 `keyPath`：

```js
const move = CABasicAnimation.animationWithKeyPath('position');
move.toValue = 5;
// TypeError: toValue does not fit keyPath "position"
```

能动画的 `keyPath` 就是 `CAAnimationKeyPath` 那张表。写别的名字当场抛，并把全表列出来。**没有 `frame`**——它在 Core Animation 里是从 `position` / `bounds` 推出来的，Apple 明说别动画它；要动就动 `position` 或 `bounds`。

## 时间

全部来自 `CAMediaTiming`，`CAAnimation` 继承了它们。

| 属性 | 默认 | 说明 |
| --- | --- | --- |
| `duration` | `0` | 秒。**0 不是「不动画」**：挂上去时 0 会被换成当前事务的 `animationDuration`，没设过的话是 0.25 秒 |
| `beginTime` | `0` | 相对父级时间轴的开始时刻 |
| `speed` | `1` | 时间流速。2 是两倍快，0 是停住 |
| `timeOffset` | `0` | |
| `repeatCount` | `0` | 可以是小数（1.5 = 跑一遍半）。无限循环用 `Infinity` |
| `repeatDuration` | `0` | |
| `autoreverses` | `false` | 跑完再倒着跑回来。配 `repeatCount` 做脉动 |
| `fillMode` | `'removed'` | 活动区间之外属性显示成什么 |

脉动就是这两条凑出来的：

```js
pulse.autoreverses = true;
pulse.repeatCount = Infinity;
```

## 时间曲线

```js
CAMediaTimingFunction.functionWithName('easeInEaseOut')
CAMediaTimingFunction.functionWithControlPoints(0.25, 0.1, 0.25, 1)
```

五个内置名字：`linear` / `easeIn` / `easeOut` / `easeInEaseOut` / `default`。

**`default` 和 `easeInEaseOut` 不是一回事**：`default` 的控制点是 (0.25, 0.1) (0.25, 1)，`easeInEaseOut` 是 (0.42, 0) (0.58, 1)。

读控制点：

```js
ease.controlPointAtIndex(1)    // CGPoint
```

ObjC 那边是出参（`float[2]`），这里改成返回一个点。0 和 3 是端点，永远是 (0, 0) 和 (1, 1)。

不可 `new`——ObjC 的 `initWithControlPoints` 要四个浮点数，而构造通道只传对象句柄。

## 事件

```js
anim.addEventListener('start', () => { … });
anim.addEventListener('stop', (e) => {
  if (e.finished) { … }        // 自己跑完的
  else { … }                   // 被 removeAnimationForKey 掐掉的
});
```

`finished` 是**事件自带的**，因为那个事实在动画对象上读不出来。事件名只有这两个，写别的当场抛。

事件延后一轮派发，和运行时里别的原生事件一致。

## 挂上和摘掉

```js
layer.addAnimation(anim, { forKey: 'fade' });   // forKey 可以不给（= nil）
layer.animationKeys();                          // ['fade']，没有时给 []
layer.animationForKey('fade');                  // 那份拷贝
layer.removeAnimationForKey('fade');
layer.removeAllAnimations();
```

同一个 `forKey` 只能有一个动画，再加会顶掉前一个。

## `CAKeyframeAnimation`：多个关键帧

```js
const flash = CAKeyframeAnimation.animationWithKeyPath('fillColor');
flash.values = ['systemRed', '#FFCC00', 'systemGreen'];
flash.keyTimes = [0, 0.4, 1];
flash.calculationMode = 'discrete';    // 到点直接换，不渐变
flash.duration = 1.8;
chip.addAnimation(flash, { forKey: 'flash' });
```

`values` 的类型和 `toValue` 一样**由 `keyPath` 决定**，所以同样要先设 `keyPath`。

| 属性 | 说明 |
| --- | --- |
| `values` | 一串关键帧值 |
| `keyTimes` | 每帧落在 0…1 的哪一处，个数要和 `values` 对上。`null` 是均匀分布 |
| `timingFunctions` | 每**段**一条曲线，所以个数是 `values.length - 1` |
| `calculationMode` | 见下 |
| `tensionValues` / `continuityValues` / `biasValues` | 只有 `cubic` 那两档用得上 |

### `calculationMode`

| | |
| --- | --- |
| `'linear'`（默认） | 线性插值 |
| `'discrete'` | **不插值**，到点直接跳。做「闪三下」「换三个颜色」用它 |
| `'paced'` | 按路程均匀分配，**忽略 `keyTimes` 和 `timingFunctions`** |
| `'cubic'` | 三次样条，可以用那三个 tension / continuity / bias 调 |
| `'cubicPaced'` | 三次 + 匀速，同样忽略 `keyTimes` |

### 沿路径走

```js
const walk = CAKeyframeAnimation.animationWithKeyPath('position');
walk.path = trail;                 // 一条 UIBezierPath
walk.rotationMode = 'auto';        // 跟着切线转
walk.calculationMode = 'paced';    // 匀速
walk.duration = 2.4;
dot.addAnimation(walk, { forKey: 'walk' });
```

**给了 `path`，`values` 就作废**（Apple 的头文件原话）。路径上除 `moveToPoint` 之外的每个点算一个关键帧。

`rotationMode` 默认 `null` = 不转；`'auto'` 跟着切线，`'autoReverse'` 是切线再转 180°。**只在给了 `path` 时有意义**——没有 `path` 时设非 `null` 的效果头文件写明是未定义的。

`path` 和 `CAShapeLayer.path` 一样：写进去的那个对象原样还回来，但原生存的是副本。

## `CASpringAnimation`：弹簧

```js
const bounceIn = CASpringAnimation.animationWithKeyPath('position');
bounceIn.fromValue = new CGPoint(x, -40);
bounceIn.toValue = box.layer.position;
bounceIn.stiffness = 120;
bounceIn.damping = 8;
box.layer.addAnimation(bounceIn, { forKey: 'bounce' });
```

它是 `CABasicAnimation` 的子类，所以 `fromValue` / `toValue` 照用。区别是**走过去的方式由四个物理参数决定**：

| 属性 | 默认 | 说明 |
| --- | --- | --- |
| `mass` | `1` | 质量，要大于 0。越大越沉、晃得越久 |
| `stiffness` | `100` | 劲度，要大于 0。越大越快 |
| `damping` | `10` | 阻尼，要 ≥ 0。越大越不晃，够大就不回弹 |
| `initialVelocity` | `0` | 初速度。正值朝终点冲，负值反着来 |
| `allowsOverdamping` | `false` | 不开的话，过阻尼被当成临界阻尼 |

**`duration` 对弹簧不起作用。** 要知道多久停下来，读 `settlingDuration`（只读，系统按当前参数估的）。另外两个只读的 `perceptualDuration` 和 `bounce` 同理。

> iOS 17 的 `initWithPerceptualDuration:bounce:` **还没做**：构造通道只传对象句柄，传不了标量。那两个属性照样读得出来，是系统反算的。

## `CAAnimationGroup`：一组一起跑

```js
const together = new CAAnimationGroup();
together.animations = [radius, dim];
together.duration = 1.2;
box.layer.addAnimation(together, { forKey: 'together' });
```

组自己的 `duration` / `repeatCount` 管整组，成员的时间都落在组的时间轴里。

## 隐式动画和 `CATransaction`

**独立子图层改属性，默认就在动画。** 不是只有显式动画才动——Core Animation 给每个可动画属性准备了一个默认 action，在 UIKit 的动画块外面改就会生成一个 0.25 秒的过渡。

```js
shape.strokeEnd = 0.5;          // 这一行本身就是一次动画
```

关掉它只有一个办法：

```js
CATransaction.begin();
CATransaction.setDisableActions(true);
shape.strokeEnd = 1;            // 立刻生效
CATransaction.commit();
```

`CATransaction` 全是类方法，没有实例。`begin` 和 `commit` 成对出现，没 `begin` 就 `commit` 会抛。

| | |
| --- | --- |
| `begin()` / `commit()` / `flush()` | 事务的开合 |
| `disableActions()` / `setDisableActions(v)` | 关不关隐式动画 |
| `animationDuration()` / `setAnimationDuration(v)` | 这个事务里隐式动画多长 |
| `animationTimingFunction()` / `setAnimationTimingFunction(v)` | 用哪条曲线 |

> `view.layer` 那一层**不走这套**：UIKit 自己把 view-backed 图层的默认 action 关掉了，只有在 `UIView` 的动画块里才动。所以这条只对你自己 `new` 出来的子图层成立。

## `CADisplayLink`：每帧回调

和屏幕刷新同步的回调。**这是逃生口，不是日常工具。**

```js
const link = new CADisplayLink();
link.addEventListener('tick', (e) => {
  const frame = /** @type {CADisplayLinkEvent} */ (e).frame;
  dot.frame = new CGRect(positionAt(frame.timestamp), 22, 16, 16);
});
link.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' });

// 不用了
link.invalidate();
```

### 先读这三条

**① 日常动画别用它。** `CAAnimation` 跑在 render server（另一个进程）里，主线程卡住照样走；display link 驱动的每帧都要 JS，主线程一忙就掉帧。它适合的是 Core Animation 表达不了的：跟手、依赖实时数据、自定义物理、掉帧统计。

**② 两道闸都要开。** 挂了 `tick` 监听器**还要** `addToRunLoop`，少一个都不发。这是 ObjC 的事实，不是我们加的。

**③ `'default'` 在滚动时会停。** 滚动期间主 run loop 切到 tracking 模式，只挂 `'default'` 的源就不跑了。要全程跑用 `'common'`——这是 display link 最常见的坑。

| 模式 | 什么时候跑 |
| --- | --- |
| `'default'`（不给 `forMode` 时的默认） | 平时跑，**滚动时停** |
| `'common'` | 一直跑 |
| `'tracking'` | **只在**滚动时跑 |

### 事件带的三个时间

```js
frame.timestamp         // 这一帧的时刻
frame.duration          // 一帧多长
frame.targetTimestamp   // 该为哪一帧渲染，做预测用这个
```

**单位是秒**，和 ObjC 一致（底层跟原生走）。

**基准是设备启动，不是 `Date.now()`**——两者不是一个坐标系，别混算，只能拿来求差值。

这三个值**带在事件上**而不是让你回头读 `link.timestamp`，因为下一轮读到的已经是下一帧的值了。

### 暂停、摘掉

```js
link.isPaused = true;    // 还挂在 run loop 上，设回 false 就继续
link.invalidate();       // 从所有模式摘掉，**再也启动不了**，要新的就再 new 一个
```

### 帧率

```js
link.preferredFrameRateRange = new CAFrameRateRange(30, 60, 30);
```

默认三个 0 = 跟硬件走。`preferred` 是「最想要多少」。

> `preferredFramesPerSecond` 和 `frameInterval` **不暴露**，头文件里都标着废弃。

### `NSRunLoop`

只给 `mainRunLoop` 一个——JS 跑在主线程，`currentRunLoop` 永远等于它。暴露它纯粹是因为 `addToRunLoop` 躲不开这个参数。

> **类型检查挡不住传错。** `NSRunLoop` 没有任何实例成员，而 TypeScript 是结构化类型，所以任何 `NSObject` 都「符合」它。运行时会抛，但 `tsc` 不会报。

## 属性一览

### `CAAnimation`

| 属性 | 类型 | 默认值 |
| --- | --- | --- |
| `duration` | `number` | `0` |
| `beginTime` | `number` | `0` |
| `speed` | `number` | `1` |
| `timeOffset` | `number` | `0` |
| `repeatCount` | `number` | `0` |
| `repeatDuration` | `number` | `0` |
| `autoreverses` | `boolean` | `false` |
| `fillMode` | `CAMediaTimingFillMode` | `'removed'` |
| `timingFunction` | `CAMediaTimingFunction \| null` | `null` |
| `removedOnCompletion` | `boolean` | `true` |

### `CAPropertyAnimation`（在上面那些之外）

| 属性 | 类型 | 默认值 |
| --- | --- | --- |
| `keyPath` | `CAAnimationKeyPath \| null` | `null` |

### `CABasicAnimation`（在上面那些之外）

| 属性 | 类型 | 默认值 |
| --- | --- | --- |
| `fromValue` | 由 `keyPath` 决定 | `null` |
| `toValue` | 同上 | `null` |
| `byValue` | 同上 | `null` |

## 和原生的对照

| ObjC | JS |
| --- | --- |
| `[CABasicAnimation animationWithKeyPath:@"opacity"]` | `CABasicAnimation.animationWithKeyPath('opacity')` |
| `[CABasicAnimation animation]` | `new CABasicAnimation()` |
| `anim.toValue = @1` | `anim.toValue = 1` |
| `anim.toValue = [NSValue valueWithCGPoint:p]` | `anim.toValue = p` |
| `anim.toValue = (id)color.CGColor` | `anim.toValue = 'systemBlue'` |
| `anim.toValue = (id)path.CGPath` | `anim.toValue = path` |
| `anim.repeatCount = HUGE_VALF` | `anim.repeatCount = Infinity` |
| `anim.fillMode = kCAFillModeForwards` | `anim.fillMode = 'forwards'` |
| `anim.delegate = self` + `animationDidStop:finished:` | `anim.addEventListener('stop', e => e.finished)` |
| `[CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseIn]` | `CAMediaTimingFunction.functionWithName('easeIn')` |
| `[CAMediaTimingFunction functionWithControlPoints:a :b :c :d]` | `CAMediaTimingFunction.functionWithControlPoints(a, b, c, d)` |
| `[fn getControlPointAtIndex:1 values:v]` | `fn.controlPointAtIndex(1)` |
| `[layer addAnimation:a forKey:@"fade"]` | `layer.addAnimation(a, { forKey: 'fade' })` |
| `[layer animationForKey:@"fade"]` | `layer.animationForKey('fade')` |
| `[layer animationKeys]` | `layer.animationKeys()` |
| `[CATransaction setDisableActions:YES]` | `CATransaction.setDisableActions(true)` |

## 还没做

| | |
| --- | --- |
| `CATransition` | 转场 |
| `UIView.animateWithDuration:` | animations 是**同步执行的 block**，要 M1b |
| `locations` / `colors` 的动画 | 要再加一种「数组 of X」的取值。注意这和 `CAKeyframeAnimation.values` 是两件事 |
| `CASpringAnimation` 的感知时长初始化器 | `initWithPerceptualDuration:bounce:`，构造通道传不了标量 |
| `additive` / `cumulative` / `valueFunction` | |
| `preferredFrameRateRange` | 要新结构体 `CAFrameRateRange` |
| `CATransaction.completionBlock` | 它该不该做成 Promise 要单独定 |

---

设计理由和实测依据见[实现原理](../internals/ca-animation.md)。

← 返回 [API 文档](README.md)
