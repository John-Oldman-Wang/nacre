---
type: reference
native: CAAnimation
status: partial
---

# `CAAnimation`

**`CAAnimation`** 表示一段作用在[图层](ca-layer.md)上的动画：在一段时间里，让图层的某个属性（不透明度、位置、圆角、颜色、路径等）从一个值连续变到另一个值。它是所有动画对象的基类，管的是时间：时长、重复、速度、结束后怎样，以及开始和结束时派发的事件。

`CAAnimation` 自己不能创建。实际使用的是它的子类，每个子类负责一种动画：

| 类 | 表示什么 |
| --- | --- |
| [`CABasicAnimation`](ca-basic-animation.md) | 一个属性从一个值变到另一个值 |
| [`CAKeyframeAnimation`](ca-keyframe-animation.md) | 一个属性依次经过几个值，或者图层沿一条路径移动 |
| [`CASpringAnimation`](ca-spring-animation.md) | 一个属性用弹簧的方式到达终点：越过终点，回弹几次后停住 |
| [`CAAnimationGroup`](ca-animation-group.md) | 几个动画作为一组，同时加到一个图层上 |

和动画配合的几个类：

| 类 | 表示什么 |
| --- | --- |
| [`CAPropertyAnimation`](ca-property-animation.md) | 改某一个属性的动画，前三个子类的共同父类。它决定动画改哪个属性 |
| [`CAMediaTimingFunction`](ca-media-timing-function.md) | 时间曲线：动画过程中先快后慢还是先慢后快 |
| [`CATransaction`](ca-transaction.md) | 事务：控制系统自动加的过渡动画（隐式动画） |
| [`CADisplayLink`](ca-display-link.md) | 屏幕每刷新一帧派发一次事件，用代码逐帧更新界面 |
| [`NSRunLoop`](ns-run-loop.md) | 主线程的事件循环。`CADisplayLink` 要加入它才开始工作 |

动画对象的用法都一样：创建一个动画对象，设好属性，调图层的 `addAnimation()` 加到图层上。给视图做动画，是给它的图层（`view.layer`）做动画。往图层上加、查、移除动画的五个方法在 [`CALayer`](ca-layer.md) 上。

这些类都不能被继承，见[原生类](native-classes.md)。

**继承关系**：`EventTarget` → `NSObject` → `CAAnimation`

怎么用它们做出常见的动画，见指南[做动画](../guides/animation.md)；用代码逐帧更新界面，见[每一帧执行一次代码](../guides/frame-callback.md)。

## 构造函数

不能用 `new` 创建。用子类的构造函数或 `animationWithKeyPath()` 静态方法创建，比如 [`CABasicAnimation.animationWithKeyPath()`](ca-basic-animation/animationwithkeypath.md)。

## 实例属性

下面的属性四种动画都有。时间的单位都是秒。

| 属性 | 说明 |
| --- | --- |
| [`duration`](ca-animation/duration.md) | 播放一遍的时长 |
| [`repeatCount`](ca-animation/repeatcount.md) | 重复次数，可以是小数，`Infinity` 是一直重复 |
| [`repeatDuration`](ca-animation/repeatduration.md) | 重复播放的总时长 |
| [`autoreverses`](ca-animation/autoreverses.md) | 播到终点后是否倒着播回起点 |
| [`timingFunction`](ca-animation/timingfunction.md) | 时间曲线 |
| [`fillMode`](ca-animation/fillmode.md) | 播放时段之外显示什么 |
| [`removedOnCompletion`](ca-animation/removedoncompletion.md) | 播完后是否从图层上移除 |
| [`beginTime`](ca-animation/begintime.md) | 开始时刻 |
| [`speed`](ca-animation/speed.md) | 播放速度的倍数 |
| [`timeOffset`](ca-animation/timeoffset.md) | 从动画的第几秒开始播 |

## 事件

用 `addEventListener()` 监听。

| 事件 | 什么时候派发 |
| --- | --- |
| [`start`](ca-animation/start-event.md) | 动画开始播放 |
| [`stop`](ca-animation/stop-event.md) | 动画结束，带 `finished` 区分是播完了还是被移除了 |

## 属性的值和屏幕上显示的值

图层的每个属性有一个值，例如 `layer.opacity` 是 1。动画不修改这个值。动画进行期间，系统在屏幕上显示的是动画算出的中间值；这时读 `layer.opacity`，得到的仍然是 1。

所以有两个互相独立的东西：

- **属性的值**：代码写进去的，读属性读到的就是它。
- **屏幕上显示的值**：没有动画时等于属性的值；有动画时由动画决定。

动画结束后，系统把它从图层上移除，屏幕上显示的值回到属性的值。要让图层停在终点，把属性的值也设成终点值，写法见[让图层停在终点](../guides/animation.md#让图层停在终点)。

动画进行中屏幕上正显示的值目前读不到。**这一节的行为来自 iOS 的定义，未在模拟器验证。**

## 加到图层上之后

- **`addAnimation()` 调用之后，动画不是在这一行立刻开始。** 当前这段 JS 代码执行完、界面的修改交给系统之后，动画才开始播放。JS 一直在执行时，开始得晚：验收用例里测到过一次，`addAnimation()` 之后 751 毫秒动画才开始，因为这期间 JS 一直在运行别的代码。所以不要用 `setTimeout()` 估算动画何时结束，用 [`start`](ca-animation/start-event.md) 和 [`stop`](ca-animation/stop-event.md) 事件。在同一段代码里加的几个动画一起开始。
- **图层保存的是动画对象的一份副本。** 加到图层上之后再改原来那个对象，正在播放的动画不变；`layer.animationForKey()` 读到的也不是原来那个对象。要改一个已经加上去的动画，重新建一个，用同一个 `forKey` 再加一次。
- **事件派发给代码创建的那个对象**，不是副本。所以在原来的对象上监听，并且在 `addAnimation()` 之前加监听器。
- 同一个图层上，同一个名字只能有一个动画。用已有的名字再加，原来的那个被移除并替换。**替换这一点未在模拟器验证。**
- `forKey` 给的名字用于之后查询和移除。不给名字的动画只能用 `removeAllAnimations()` 移除。
- `layer.animationForKey()` 返回的副本和加进去的对象是同一个类：加的是 `CASpringAnimation`，读到的也是 `CASpringAnimation`。返回的对象只用来读，修改它的属性的结果没有定义。
- `addAnimation()` 的第一个参数不是动画对象时抛 `TypeError: addAnimation: expects a CAAnimation`。

## 示例

从空白 App 开始，画一条折线，让它在 1.2 秒里从左到右逐渐画出来，画完后在控制台输出一行。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 一块固定大小的区域
  const card = new UIView();
  card.frame = new CGRect(20, 100, 300, 160);
  card.backgroundColor = 'secondarySystemBackground';
  card.layer.cornerRadius = 12;
  page.view.addSubview(card);

  // 2. 用形状图层画一条折线
  const path = new UIBezierPath();
  path.moveToPoint(new CGPoint(24, 130));
  path.addLineToPoint(new CGPoint(96, 56));
  path.addLineToPoint(new CGPoint(168, 100));
  path.addLineToPoint(new CGPoint(276, 30));

  const line = new CAShapeLayer();
  line.path = path;
  line.fillColor = null;
  line.strokeColor = 'systemGreen';
  line.lineWidth = 3;
  line.lineCap = 'round';
  line.lineJoin = 'round';
  line.frame = card.bounds;
  card.layer.addSublayer(line);

  // 3. 动画：strokeEnd 从 0 变到 1，也就是描边从起点延伸到终点
  const draw = CABasicAnimation.animationWithKeyPath('strokeEnd');
  draw.fromValue = 0;
  draw.toValue = 1;
  draw.duration = 1.2;                 // 秒
  draw.timingFunction = CAMediaTimingFunction.functionWithName('easeInEaseOut');

  // 4. 结束时得到通知
  draw.addEventListener('stop', (ev) => {
    console.log('画完了，是否播放到结尾:', ev.finished);
  });

  // 5. 属性的值是终点值（strokeEnd 默认就是 1），再把动画加到图层上
  line.strokeEnd = 1;
  line.addAnimation(draw, { forKey: 'draw' });
});
```

**效果**

- 屏幕上方出现一块 300 × 160 pt 的浅灰色圆角区域。
- 一条绿色折线从左端开始逐渐延伸，1.2 秒后画完整条，开始和结束时慢，中间快。
- 画完后折线保持完整，控制台输出 `画完了，是否播放到结尾: true`。

这段代码没有作为一个整体在模拟器运行过。其中的动画写法和验收用例相同：验收用例在模拟器里运行过，折线逐渐画出、播完的动画派发带 `finished: true` 的 `stop` 都验证过。

更多写法见指南[做动画](../guides/animation.md)。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[CABasicAnimation animationWithKeyPath:@"opacity"]` | `CABasicAnimation.animationWithKeyPath('opacity')` |
| `[CABasicAnimation animation]` | `new CABasicAnimation()` |
| `anim.repeatCount = HUGE_VALF` | `anim.repeatCount = Infinity` |
| `anim.fillMode = kCAFillModeForwards` | `anim.fillMode = 'forwards'` |
| `anim.removedOnCompletion = NO` | `anim.removedOnCompletion = false` |
| `anim.delegate = self`，实现 `animationDidStart:` | `anim.addEventListener('start', …)` |
| `anim.delegate = self`，实现 `animationDidStop:finished:` | `anim.addEventListener('stop', (e) => e.finished)` |
| `[layer addAnimation:a forKey:@"fade"]` | `layer.addAnimation(a, { forKey: 'fade' })` |
| `[layer animationForKey:@"fade"]` | `layer.animationForKey('fade')` |
| `[layer animationKeys]` | `layer.animationKeys()` |
| `[layer removeAnimationForKey:@"fade"]` | `layer.removeAnimationForKey('fade')` |

各子类的对照见各自的页面。

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 用一个代码块描述视图动画 | `UIView.animateWithDuration:animations:` |
| 给旋转和缩放做动画 | `transform` 的动画、`valueFunction` |
| 给渐变的颜色和位置做动画 | `colors`、`locations` 的动画 |
| 读动画进行中屏幕上正显示的值 | `presentationLayer` |
| 用 `beginTime` 让单独一个动画延迟开始。现在用定时器代替 | `CACurrentMediaTime()`、`convertTime:fromLayer:` |
| 整个事务里的动画都结束时得到通知。现在在动画对象上监听 `stop` | `CATransaction.completionBlock` |
| 用「感觉上的时长」和「回弹程度」创建弹簧动画。这两个值现在可以读，不能直接指定 | `initWithPerceptualDuration:bounce:` |
| 页面切换那样的整体转场 | `CATransition` |
| 让动画的值叠加在属性的值之上 | `additive`、`cumulative` |
| 每帧回调一次的 `requestAnimationFrame()`。现在用 `CADisplayLink` | — |

## 参见

- [做动画](../guides/animation.md)：让图层停在终点、移动、重复、关键帧、弹簧、动画组、关掉隐式动画
- [`CALayer`](ca-layer.md)：动画作用的对象，以及加、查、移除动画的方法
- [`CAPropertyAnimation`](ca-property-animation.md)：能做动画的属性
- [`UIBezierPath`](ui-bezier-path.md)：`'path'` 动画和沿路径移动用到的路径
- [结构体](structs.md)：`CGPoint`、`CGRect`、`CGSize`
- [运行时怎么工作](how-it-works.md)：事件回调什么时候执行
- [实现原理：动画](../internals/ca-animation.md)
