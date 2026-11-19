# 做动画

这一篇讲怎么让[图层](../api/ca-layer.md)的属性在一段时间里连续变化：淡入淡出、移动、闪烁、沿路径移动、弹簧回弹，以及怎么关掉系统自动加的过渡。用到的类是 [`CABasicAnimation`](../api/ca-basic-animation.md)、[`CAKeyframeAnimation`](../api/ca-keyframe-animation.md)、[`CASpringAnimation`](../api/ca-spring-animation.md)、[`CAAnimationGroup`](../api/ca-animation-group.md)、[`CAMediaTimingFunction`](../api/ca-media-timing-function.md) 和 [`CATransaction`](../api/ca-transaction.md)，它们的共同基类是 [`CAAnimation`](../api/ca-animation.md)。每个属性和方法的细节在各自的参考页。

用代码逐帧更新界面，见[每一帧执行一次代码](frame-callback.md)。

## 推荐的做法

- **动画结束后要停在终点，就把属性的值也设成终点值。** 动画只改变屏幕上的显示，不改变属性的值；播完之后显示回到属性的值。写法见[让图层停在终点](#让图层停在终点)。
- **用 `start`、`stop` 事件得知动画的开始和结束，不要用 `setTimeout()` 估算。** 动画不是在 `addAnimation()` 那一行开始的，JS 一直在执行时会开始得晚。
- **只是让一次修改平滑一点，直接改属性就行。** 显示过的图层改属性时，系统自动加一段过渡（隐式动画）。需要指定起点、重复、关键帧、结束事件时，才自己建动画对象，并用事务关掉这次修改的隐式动画。
- **修改必须立刻生效时，用事务关掉隐式动画。** 比如跟着手指移动、布局变化后重设子图层的大小。见[关掉隐式动画](#关掉隐式动画)。

## 第一个动画

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

步骤是：建动画对象、设起点和终点、设时长、监听结束、把属性的值设成终点、加到图层上。

下面的例子都沿用一块已经在页面上的区域 `card`，和它上面的一个图层 `dot`：

```js
const card = new UIView();
card.frame = new CGRect(20, 100, 300, 160);
card.backgroundColor = 'secondarySystemBackground';
// ……card 已经加到页面上

const dot = new CALayer();
dot.frame = new CGRect(20, 70, 20, 20);
dot.backgroundColor = 'systemBlue';
dot.cornerRadius = 10;
card.layer.addSublayer(dot);
```

**效果**：卡片左侧出现一个直径 20 pt 的蓝色圆点，中心在 (30, 80)。

## 让图层停在终点

动画结束后，系统把它从图层上移除，屏幕上显示的值回到属性的值。一个把不透明度从 1 变到 0 的动画，如果 `dot.opacity` 一直是 1，动画播完的那一刻图层会重新完全显示出来。

要让图层停在终点，**把属性的值也设成终点值**。动画只负责「过程怎么显示」，属性的值负责「结束之后是什么」：

```js
// 1. 属性的值直接设成终点。放在关闭了隐式动画的事务里
CATransaction.begin();
CATransaction.setDisableActions(true);
dot.opacity = 0;
CATransaction.commit();

// 2. 动画负责显示从 1 到 0 的过程。起点要明确写出来
const fade = CABasicAnimation.animationWithKeyPath('opacity');
fade.fromValue = 1;
fade.toValue = 0;
fade.duration = 0.3;
dot.addAnimation(fade, { forKey: 'fade' });
```

**效果**：圆点在 0.3 秒里逐渐消失，之后保持不可见。读 `dot.opacity` 得到 0。**画面上的表现未在模拟器验证。**

这种写法有三点要注意：

- **`fromValue` 必须写。** 属性的值已经是终点了，不写起点的话动画从终点变到终点，看不到变化。
- **第 1 步的事务只对用 `new` 创建的图层有必要。** 这类图层显示之后，改属性会自动带一段过渡动画（见[关掉隐式动画](#关掉隐式动画)），事务把它关掉，画面上就只有第 2 步的动画。图层还没显示过时，这个事务不起作用，加上也没有坏处。
- **视图的图层用视图的属性设终点。** 例如先写 `view.alpha = 0`，再给 `view.layer` 加 `'opacity'` 动画。不需要事务。

另一种写法是让动画结束后不被移除，一直显示终点值：

```js
const fadeAndHold = CABasicAnimation.animationWithKeyPath('opacity');
fadeAndHold.fromValue = 1;
fadeAndHold.toValue = 0;
fadeAndHold.duration = 0.3;
fadeAndHold.fillMode = 'forwards';
fadeAndHold.removedOnCompletion = false;
dot.addAnimation(fadeAndHold, { forKey: 'fade' });
```

**效果**：圆点在 0.3 秒里逐渐消失，之后保持不可见。**未在模拟器验证。**

这种写法的代价：

- 属性的值没有变，和屏幕上显示的不一致。
- 动画一直留在图层上。之后再改 `dot.opacity`，画面不变，要先 `removeAnimationForKey('fade')`；而移除的那一刻，画面跳回属性的值。

它适用于终点状态只是临时的情况，比如动画播完后图层马上会被移除。其他时候用第一种写法。

## 移动一个图层

```js
const to = new CGPoint(270, 80);

const move = CABasicAnimation.animationWithKeyPath('position');
move.fromValue = dot.position;
move.toValue = to;
move.duration = 0.6;

CATransaction.begin();
CATransaction.setDisableActions(true);
dot.position = to;
CATransaction.commit();

dot.addAnimation(move, { forKey: 'move' });
```

**效果**：圆点在 0.6 秒里从左侧匀速移到右侧，然后停在右侧。**未在模拟器验证。**

`'position'` 的值是图层中心点在父图层里的坐标。先读出移动前的 `dot.position` 作为起点，再把属性的值设成终点。`frame` 不能做动画，移动用 `'position'`，改大小用 `'bounds'`，见[能做动画的属性](../api/ca-property-animation.md#能做动画的属性)。

## 给视图做动画

视图的属性动画通常用 [`UIView.animateWithDuration()`](view-animations.md)。要用动画对象（指定起点值、关键帧、沿路径运动）时，把动画加在 `view.layer` 上，终点值用视图的属性设。

```js
const box = new UIView();
box.frame = new CGRect(200, 40, 80, 80);
box.backgroundColor = 'systemIndigo';
card.addSubview(box);

const appear = CABasicAnimation.animationWithKeyPath('opacity');
appear.fromValue = 0;
appear.toValue = 1;
appear.duration = 0.4;
box.layer.addAnimation(appear, { forKey: 'appear' });
```

**效果**：一个 80 × 80 pt 的色块在 0.4 秒里从透明变成完全显示。

`box.alpha` 本来就是 1，等于终点值，所以这里不用再设。验收用例里用同样的方式给视图的图层加过 `'opacity'`、`'cornerRadius'`、`'position'` 动画。

## 来回重复

```js
const pulse = CABasicAnimation.animationWithKeyPath('opacity');
pulse.fromValue = 1;
pulse.toValue = 0.2;
pulse.duration = 0.7;
pulse.autoreverses = true;
pulse.repeatCount = Infinity;
dot.addAnimation(pulse, { forKey: 'pulse' });
```

**效果**：圆点在 0.7 秒里变淡，再用 0.7 秒变回来，一直重复。

- [`autoreverses`](../api/ca-animation/autoreverses.md) 是 `true` 时，动画播到终点后倒着播回起点。一次来回是 `duration` 的两倍。
- [`repeatCount`](../api/ca-animation/repeatcount.md) 是重复的次数，可以是小数，2.5 表示播两遍半。`Infinity` 表示一直重复。
- 一直重复的动画不会自己结束。要停下来，调 `dot.removeAnimationForKey('pulse')`。

## 改变速度曲线

```js
const slide = CABasicAnimation.animationWithKeyPath('position');
slide.fromValue = new CGPoint(30, 80);
slide.toValue = new CGPoint(270, 80);
slide.duration = 0.6;
slide.timingFunction = CAMediaTimingFunction.functionWithName('easeOut');
dot.addAnimation(slide, { forKey: 'move' });
```

**效果**：圆点开始时移动得快，接近终点时慢下来。**未在模拟器验证。**

不设 `timingFunction` 时动画匀速进行。五条内置曲线见 [`functionWithName()`](../api/ca-media-timing-function/functionwithname.md)，自定义曲线见 [`functionWithControlPoints()`](../api/ca-media-timing-function/functionwithcontrolpoints.md)。

## 动画结束后做下一件事

```js
const vanish = CABasicAnimation.animationWithKeyPath('opacity');
vanish.fromValue = 1;
vanish.toValue = 0;
vanish.duration = 0.3;

vanish.addEventListener('stop', (ev) => {
  if (ev.finished) {
    dot.removeFromSuperlayer();
  }
});

dot.addAnimation(vanish, { forKey: 'fade' });
```

**效果**：圆点在 0.3 秒里消失，播完后从卡片上移除。

[`stop`](../api/ca-animation/stop-event.md) 事件的 `finished` 区分两种结束方式：`true` 是播放到了结尾，`false` 是中途被移除。只想在正常播完时执行的代码，要判断 `finished`。

监听器要在 `addAnimation()` 之前加。加到图层上的是副本，但事件派发给原来的对象，所以在原来的对象上监听。

## 中途停止动画

```js
dot.removeAnimationForKey('pulse');   // 停掉名字是 'pulse' 的那一个
dot.removeAllAnimations();            // 停掉这个图层上的全部动画
```

**效果**：动画从图层上移除，屏幕上显示的值回到属性的值（**画面上的表现未在模拟器验证**）。被 `removeAnimationForKey()` 停掉的动画派发 `stop`，`finished` 是 `false`。

`forKey` 给的名字就是用在这里的。不给名字的动画只能用 `removeAllAnimations()` 停掉。

## 延迟开始

```js
const fadeIn = CABasicAnimation.animationWithKeyPath('opacity');
fadeIn.fromValue = 0;
fadeIn.toValue = 1;
fadeIn.duration = 0.3;

setTimeout(() => {
  dot.addAnimation(fadeIn, { forKey: 'fade' });
}, 500);
```

**效果**：大约 0.5 秒后，圆点开始一段 0.3 秒的淡入。

用[定时器](../api/timers.md)推迟 `addAnimation()` 的调用。动画对象的 `beginTime` 属性不能直接用来做这件事，原因见 [`beginTime`](../api/ca-animation/begintime.md)。

## 依次经过几个值

```js
const blink = CAKeyframeAnimation.animationWithKeyPath('opacity');
blink.values = [1, 0.2, 1, 0.2, 1];
blink.keyTimes = [0, 0.2, 0.5, 0.7, 1];
blink.duration = 1.5;
dot.addAnimation(blink, { forKey: 'blink' });
```

**效果**：圆点在 1.5 秒里闪两下：变淡、恢复、再变淡、再恢复。**未在模拟器验证。**

- [`values`](../api/ca-keyframe-animation/values.md) 是属性依次经过的值，类型由 `keyPath` 决定，规则和 `toValue` 相同。
- [`keyTimes`](../api/ca-keyframe-animation/keytimes.md) 给出每个值出现的时刻，是 0 到 1 的比例：0 是动画开始，1 是结束。个数和 `values` 相同。不设时各个值之间的间隔相等。
- 相邻两个值之间默认是连续变化的。

## 不渐变，到时间直接换

```js
const chip = new CAShapeLayer();
chip.path = UIBezierPath.bezierPathWithRoundedRect(
  new CGRect(0, 0, 24, 24), { cornerRadius: 5 });
chip.fillColor = 'systemRed';
chip.frame = new CGRect(60, 20, 24, 24);
card.layer.addSublayer(chip);

const jump = CAKeyframeAnimation.animationWithKeyPath('fillColor');
jump.values = ['systemRed', '#FFCC00', 'systemGreen'];
jump.calculationMode = 'discrete';
jump.duration = 1.8;
jump.repeatCount = Infinity;
chip.addAnimation(jump, { forKey: 'jump' });
```

**效果**：一个小方块依次显示红、黄、绿三种颜色，每种停留一段时间后直接换成下一种，没有渐变，1.8 秒一轮，一直重复。

[`calculationMode`](../api/ca-keyframe-animation/calculationmode.md) 是 `'discrete'` 表示值与值之间不做过渡。去掉这一行，颜色会连续地从一种变到下一种。

## 沿一条路径移动

```js
const trail = new UIBezierPath();
trail.moveToPoint(new CGPoint(30, 130));
trail.addQuadCurveToPoint(new CGPoint(270, 130), { controlPoint: new CGPoint(150, 10) });

const walk = CAKeyframeAnimation.animationWithKeyPath('position');
walk.path = trail;
walk.calculationMode = 'paced';
walk.duration = 2.4;
walk.autoreverses = true;
walk.repeatCount = Infinity;
dot.addAnimation(walk, { forKey: 'walk' });
```

**效果**：圆点沿一条向上拱起的弧线从左下角移到右下角，再沿原路返回，一直重复，全程匀速。

- 设了 [`path`](../api/ca-keyframe-animation/path.md) 之后，`values` 不起作用。
- 路径的坐标按图层的父图层的坐标系算，和 `position` 相同。
- `calculationMode = 'paced'` 让图层沿路径匀速移动。不设时，路径上每一段用的时间相同，长的一段移动得快。
- 要让图层的朝向跟着行进方向转，设 `walk.rotationMode = 'auto'`，见 [`rotationMode`](../api/ca-keyframe-animation/rotationmode.md)。圆点转了也看不出来，长条形的图层才有区别。

## 用弹簧的方式到达终点

```js
const spring = CASpringAnimation.animationWithKeyPath('position');
spring.fromValue = new CGPoint(dot.position.x, -40);
spring.toValue = dot.position;
spring.stiffness = 120;
spring.damping = 8;
spring.duration = spring.settlingDuration;
dot.addAnimation(spring, { forKey: 'drop' });
```

**效果**：圆点从卡片上方落下来，越过原来的位置，上下回弹几次后停在原位。**回弹的样子未在模拟器验证。**

弹簧动画的过程由四个物理量决定，不由时间曲线决定：

- [`stiffness`](../api/ca-spring-animation/stiffness.md)（劲度）越大，弹簧越硬，动得越快。
- [`damping`](../api/ca-spring-animation/damping.md)（阻尼）越大，回弹越少。足够大时不回弹，直接停在终点。
- [`mass`](../api/ca-spring-animation/mass.md)（质量）越大，动得越慢，回弹持续得越久。
- [`initialVelocity`](../api/ca-spring-animation/initialvelocity.md)（初速度）是动画开始时已有的速度。

弹簧停下来需要多久由这四个量算出，读 [`settlingDuration`](../api/ca-spring-animation/settlingduration.md) 得到，单位是秒。默认的四个值算出来是 1.473 秒；把 `damping` 从 10 调到 40，变成 1.000 秒。

推荐把 `duration` 设成 `settlingDuration`，像上面那样。`settlingDuration` 要在四个物理量都设好之后再读。

## 几个属性一起动

```js
const radius = CABasicAnimation.animationWithKeyPath('cornerRadius');
radius.fromValue = 0;
radius.toValue = 10;

const show = CABasicAnimation.animationWithKeyPath('opacity');
show.fromValue = 0;
show.toValue = 1;

const group = new CAAnimationGroup();
group.animations = [radius, show];
group.duration = 1.2;
dot.addAnimation(group, { forKey: 'intro' });
```

**效果**：圆点在 1.2 秒里从透明的方块变成完全显示的圆。

- 组的 `duration` 是整组的时长。成员没有设 `duration` 时，用组的时长。
- 组也有 `timingFunction`、`repeatCount`、`autoreverses`，作用于整组。
- 要知道整组何时结束，在组上监听 `stop`。

不需要统一控制时，也可以不用组，直接把几个动画分别加到图层上。在同一段代码里加的动画一起开始。

## 关掉隐式动画

用 `new` 创建的图层在屏幕上显示过之后，改它的属性会自动带一段 0.25 秒的过渡（**时长未在模拟器验证**）。哪些情况会带，见[隐式动画](../api/ca-transaction.md#隐式动画)。要让修改立刻生效，把它放进关闭了隐式动画的事务里：

```js
CATransaction.begin();
CATransaction.setDisableActions(true);
dot.position = new CGPoint(150, 80);
dot.opacity = 0.5;
CATransaction.commit();
```

**效果**：圆点立刻出现在新位置，变成半透明，没有过渡过程。

要保留过渡、只改它的时长和曲线：

```js
CATransaction.begin();
CATransaction.setAnimationDuration(1.5);
CATransaction.setAnimationTimingFunction(
  CAMediaTimingFunction.functionWithName('easeOut'));
dot.opacity = 1;
CATransaction.commit();
```

**效果**：图层显示过时，`opacity` 用 1.5 秒过渡到 1，开始快，结束前减慢。**未在模拟器验证。**

什么时候用隐式动画，什么时候自己建动画对象：

- 只是让一次修改平滑一点，时长和曲线用默认的就行：直接改属性，用隐式动画。
- 需要指定起点、重复、关键帧、结束事件：建动画对象。同时用事务关掉这次修改的隐式动画，见[让图层停在终点](#让图层停在终点)。
- 修改必须立刻生效，比如跟着手指移动、布局变化后重设子图层的大小：用事务关掉。

## 参见

- [`CAAnimation`](../api/ca-animation.md)：时长、重复、事件，以及动画加到图层上之后的规则
- [`CABasicAnimation`](../api/ca-basic-animation.md)、[`CAKeyframeAnimation`](../api/ca-keyframe-animation.md)、[`CASpringAnimation`](../api/ca-spring-animation.md)、[`CAAnimationGroup`](../api/ca-animation-group.md)
- [`CAPropertyAnimation`](../api/ca-property-animation.md)：能做动画的属性
- [`CAMediaTimingFunction`](../api/ca-media-timing-function.md)：时间曲线
- [`CATransaction`](../api/ca-transaction.md)：隐式动画
- [`CALayer`](../api/ca-layer.md)：动画作用的对象
- [每一帧执行一次代码](frame-callback.md)：动画对象表达不了时
