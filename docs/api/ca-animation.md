---
type: reference
native: CAAnimation
status: partial
---

# 动画

这一页的类用来给[图层](ca-layer.md)的属性做动画：让不透明度、位置、圆角、颜色、路径等属性在一段时间里从一个值连续变到另一个值。动画作用在图层上；给视图做动画，是给它的图层（`view.layer`）做动画。

每个类负责一件事：

| 类 | 表示什么 |
| --- | --- |
| `CABasicAnimation` | 一个属性从一个值变到另一个值 |
| `CAKeyframeAnimation` | 一个属性依次经过几个值，或者图层沿一条路径移动 |
| `CASpringAnimation` | 一个属性用弹簧的方式到达终点：越过终点，回弹几次后停住 |
| `CAAnimationGroup` | 几个动画作为一组，同时加到一个图层上 |
| `CAMediaTimingFunction` | 时间曲线：动画过程中先快后慢还是先慢后快 |
| `CATransaction` | 事务：控制系统自动加的过渡动画（隐式动画） |
| `CADisplayLink` | 屏幕每刷新一帧执行一次回调，用代码逐帧更新界面 |

前四个都是 `CAAnimation` 的子类，用法相同：创建一个动画对象，设好属性，调 `layer.addAnimation()` 加到图层上。

## 动画只改变显示，不改变属性的值

图层的每个属性有一个值，例如 `layer.opacity` 是 1。动画不修改这个值。动画进行期间，系统在屏幕上显示的是动画算出的中间值；这时读 `layer.opacity`，得到的仍然是 1。

所以有两个互相独立的东西：

- **属性的值**：代码写进去的，读属性读到的就是它。
- **屏幕上显示的值**：没有动画时等于属性的值；有动画时由动画决定。

动画进行中屏幕上正显示的值目前读不到。**这一节的行为来自 iOS 的定义，未在模拟器验证。**

## 动画结束后停在哪里

动画结束后，系统把它从图层上移除，屏幕上显示的值回到属性的值。一个把不透明度从 1 变到 0 的动画，如果 `layer.opacity` 一直是 1，动画播完的那一刻图层会重新完全显示出来。

要让图层停在终点，**把属性的值也设成终点值**。动画只负责「过程怎么显示」，属性的值负责「结束之后是什么」：

```js
const layer = new CALayer();
// ……layer 已经在屏幕上

// 1. 属性的值直接设成终点。放在关闭了隐式动画的事务里
CATransaction.begin();
CATransaction.setDisableActions(true);
layer.opacity = 0;
CATransaction.commit();

// 2. 动画负责显示从 1 到 0 的过程。起点要明确写出来
const fade = CABasicAnimation.animationWithKeyPath('opacity');
fade.fromValue = 1;
fade.toValue = 0;
fade.duration = 0.3;
layer.addAnimation(fade, { forKey: 'fade' });
```

**效果**：图层在 0.3 秒里逐渐消失，之后保持不可见。读 `layer.opacity` 得到 0。**画面上的表现未在模拟器验证。**

这种写法有三点要注意：

- **`fromValue` 必须写。** 属性的值已经是终点了，不写起点的话动画从终点变到终点，看不到变化。
- **第 1 步的事务只对用 `new` 创建的图层有必要。** 这类图层显示之后，改属性会自动带一段过渡动画（见[隐式动画和 `CATransaction`](#隐式动画和-catransaction)），事务把它关掉，画面上就只有第 2 步的动画。图层还没显示过时，这个事务不起作用，加上也没有坏处。
- **视图的图层用视图的属性设终点。** 例如先写 `view.alpha = 0`，再给 `view.layer` 加 `'opacity'` 动画。不需要事务。

另一种写法是让动画结束后不被移除，一直显示终点值：

```js
const layer = new CALayer();
const fade = CABasicAnimation.animationWithKeyPath('opacity');
fade.fromValue = 1;
fade.toValue = 0;
fade.duration = 0.3;
fade.fillMode = 'forwards';
fade.removedOnCompletion = false;
layer.addAnimation(fade, { forKey: 'fade' });
```

**效果**：图层在 0.3 秒里逐渐消失，之后保持不可见。**未在模拟器验证。**

这种写法的代价：

- `layer.opacity` 读出来仍然是 1，属性的值和屏幕上显示的不一致。
- 动画一直留在图层上。之后再改 `layer.opacity`，画面不变，要先 `removeAnimationForKey('fade')`；而移除的那一刻，画面跳回属性的值。

它适用于终点状态只是临时的情况，比如动画播完后图层马上会被移除。其他时候用第一种写法。

## 能做动画的属性

动画对象的 `keyPath` 指定它改哪个属性。能用的名字和每个名字对应的值的类型如下：

| `keyPath` | 值的类型 | 属于 |
| --- | --- | --- |
| `'opacity'`、`'cornerRadius'`、`'borderWidth'`、`'shadowOpacity'`、`'shadowRadius'`、`'zPosition'` | 数 | 所有图层 |
| `'position'` | `CGPoint` | 所有图层 |
| `'bounds'` | `CGRect` | 所有图层 |
| `'shadowOffset'` | `CGSize` | 所有图层 |
| `'backgroundColor'`、`'borderColor'`、`'shadowColor'` | [颜色](ui-color.md) | 所有图层 |
| `'lineWidth'`、`'miterLimit'`、`'strokeStart'`、`'strokeEnd'`、`'lineDashPhase'` | 数 | `CAShapeLayer` |
| `'fillColor'`、`'strokeColor'` | [颜色](ui-color.md) | `CAShapeLayer` |
| `'path'` | [`UIBezierPath`](ui-bezier-path.md) | `CAShapeLayer` |
| `'startPoint'`、`'endPoint'` | `CGPoint` | `CAGradientLayer` |

写表里没有的名字抛 `TypeError`，报错信息列出全部能用的名字：

```
TypeError: keyPath has no value "frame"; expected one of: backgroundColor / borderColor / …
```

几个常被问到的情况：

- **`frame` 不能做动画。** 移动图层用 `'position'`（中心点的坐标），改大小用 `'bounds'`。
- **旋转和缩放不能做动画。** 表里没有 `transform`，见[还不能做的](#还不能做的)。
- **渐变的颜色不能做动画。** 表里没有 `colors` 和 `locations`。
- **`fromValue`、`toValue` 等值的类型必须和 `keyPath` 对应。** 所以要先有 `keyPath` 才能设值。类型不对时抛 `TypeError`，见[成员说明](#cabasicanimation)。
- **数必须写成数，不能写成字符串。** 这些值位置上的字符串一律当作颜色。`fade.toValue = '0.5'` 不会被当成 0.5。

## 动画什么时候开始

`addAnimation()` 调用之后，动画不是在这一行立刻开始。当前这段 JS 代码执行完、界面的修改交给系统之后，动画才开始播放。JS 一直在执行时，开始得晚：验收用例里测到过一次，`addAnimation()` 之后 751 毫秒动画才开始，因为这期间 JS 一直在运行别的代码。

所以：

- 不要用 `setTimeout()` 估算动画何时结束。动画的开始和结束用 `'start'`、`'stop'` 事件得知。
- 在同一段代码里加几个动画，它们一起开始。

**`addAnimation()` 保存的是动画对象的一份副本。** 加到图层上之后再改原来那个对象，正在播放的动画不变：

```js
const layer = new CALayer();
const fade = CABasicAnimation.animationWithKeyPath('opacity');
fade.fromValue = 1;
fade.toValue = 0;
fade.duration = 20;
layer.addAnimation(fade, { forKey: 'fade' });

fade.duration = 5;                                  // 对已经加上去的动画没有影响
console.log(layer.animationForKey('fade') === fade);   // false
```

**结果**：控制台输出 `false`。图层上的动画时长仍是 20 秒（**时长不变这一点未在模拟器验证**）。

要改一个已经加上去的动画，重新建一个，用同一个 `forKey` 再加一次。事件不受副本的影响：`'start'` 和 `'stop'` 派发给代码创建的那个对象。

## 完整例子

下面的代码从空白 App 开始，画一条折线，让它在 1.2 秒里从左到右逐渐画出来，画完后在控制台输出一行。

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

这段代码没有作为一个整体在模拟器运行过。其中的动画写法和验收用例相同：验收用例在模拟器里运行过，折线逐渐画出、播完的动画派发带 `finished: true` 的 `'stop'` 都验证过。

## 常见用法

以下例子都假设已经有上面的 `page` 和 `card`，以及一个已经加到 `card.layer` 下面的图层 `dot`：

```js
const dot = new CALayer();
dot.frame = new CGRect(20, 70, 20, 20);
dot.backgroundColor = 'systemBlue';
dot.cornerRadius = 10;
card.layer.addSublayer(dot);
```

**效果**：卡片左侧出现一个直径 20 pt 的蓝色圆点，中心在 (30, 80)。

### 移动一个图层

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

`'position'` 的值是图层中心点在父图层里的坐标。先读出移动前的 `dot.position` 作为起点，再把属性的值设成终点。

### 给视图做动画

视图没有自己的动画方法，动画加在 `view.layer` 上。终点值用视图的属性设。

```js
const box = new UIView();
box.frame = new CGRect(40, 300, 80, 80);
box.backgroundColor = 'systemIndigo';
page.view.addSubview(box);

const appear = CABasicAnimation.animationWithKeyPath('opacity');
appear.fromValue = 0;
appear.toValue = 1;
appear.duration = 0.4;
box.layer.addAnimation(appear, { forKey: 'appear' });
```

**效果**：一个 80 × 80 pt 的色块在 0.4 秒里从透明变成完全显示。

`box.alpha` 本来就是 1，等于终点值，所以这里不用再设。验收用例里用同样的方式给视图的图层加过 `'opacity'`、`'cornerRadius'`、`'position'` 动画。

### 来回重复

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

- `autoreverses = true` 让动画播到终点后倒着播回起点。一次来回是 `duration` 的两倍。
- `repeatCount` 是重复的次数，可以是小数，2.5 表示播两遍半。`Infinity` 表示一直重复。
- 一直重复的动画不会自己结束。要停下来，调 `dot.removeAnimationForKey('pulse')`。

### 改变速度曲线

```js
const move = CABasicAnimation.animationWithKeyPath('position');
move.fromValue = new CGPoint(30, 80);
move.toValue = new CGPoint(270, 80);
move.duration = 0.6;
move.timingFunction = CAMediaTimingFunction.functionWithName('easeOut');
dot.addAnimation(move, { forKey: 'move' });
```

**效果**：圆点开始时移动得快，接近终点时慢下来。**未在模拟器验证。**

不设 `timingFunction` 时动画匀速进行。五个内置曲线和自定义曲线见[时间曲线](#时间曲线)。

### 动画结束后做下一件事

```js
const fade = CABasicAnimation.animationWithKeyPath('opacity');
fade.fromValue = 1;
fade.toValue = 0;
fade.duration = 0.3;

fade.addEventListener('stop', (ev) => {
  if (ev.finished) {
    dot.removeFromSuperlayer();
  }
});

dot.addAnimation(fade, { forKey: 'fade' });
```

**效果**：圆点在 0.3 秒里消失，播完后从卡片上移除。

`'stop'` 事件的 `finished` 区分两种结束方式：`true` 是播放到了结尾，`false` 是中途被移除，例如调了 `removeAnimationForKey()`。只想在正常播完时执行的代码，要判断 `finished`。

监听器要在 `addAnimation()` 之前加。加到图层上的是副本，但事件派发给原来的对象，所以在原来的对象上监听。

### 中途停止动画

```js
dot.removeAnimationForKey('pulse');   // 停掉名字是 'pulse' 的那一个
dot.removeAllAnimations();            // 停掉这个图层上的全部动画
```

**效果**：动画从图层上移除，屏幕上显示的值回到属性的值（**画面上的表现未在模拟器验证**）。被 `removeAnimationForKey()` 停掉的动画派发 `'stop'`，`finished` 是 `false`。

`forKey` 给的名字就是用在这里的。不给名字的动画只能用 `removeAllAnimations()` 停掉。

### 延迟开始

```js
const fade = CABasicAnimation.animationWithKeyPath('opacity');
fade.fromValue = 0;
fade.toValue = 1;
fade.duration = 0.3;

setTimeout(() => {
  dot.addAnimation(fade, { forKey: 'fade' });
}, 500);
```

**效果**：大约 0.5 秒后，圆点开始一段 0.3 秒的淡入。

用[定时器](timers.md)推迟 `addAnimation()` 的调用。动画对象的 `beginTime` 属性不能直接用来做这件事，原因见[成员说明](#caanimation)。

### 依次经过几个值

```js
const blink = CAKeyframeAnimation.animationWithKeyPath('opacity');
blink.values = [1, 0.2, 1, 0.2, 1];
blink.keyTimes = [0, 0.2, 0.5, 0.7, 1];
blink.duration = 1.5;
dot.addAnimation(blink, { forKey: 'blink' });
```

**效果**：圆点在 1.5 秒里闪两下：变淡、恢复、再变淡、再恢复。**未在模拟器验证。**

- `values` 是属性依次经过的值，类型由 `keyPath` 决定，规则和 `toValue` 相同。
- `keyTimes` 给出每个值出现的时刻，是 0 到 1 的比例：0 是动画开始，1 是结束。个数和 `values` 相同。不设时各个值之间的间隔相等。
- 相邻两个值之间默认是连续变化的。

### 不渐变，到时间直接换

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

`calculationMode = 'discrete'` 表示值与值之间不做过渡。去掉这一行，颜色会连续地从一种变到下一种。

### 沿一条路径移动

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

- 设了 `path` 之后，`values` 不起作用。
- 路径的坐标按图层的父图层的坐标系算，和 `position` 相同。
- `calculationMode = 'paced'` 让图层沿路径匀速移动。不设时，路径上每一段用的时间相同，长的一段移动得快。
- 要让图层的朝向跟着行进方向转，设 `walk.rotationMode = 'auto'`。圆点转了也看不出来，长条形的图层才有区别。

### 用弹簧的方式到达终点

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

- `stiffness`（劲度）越大，弹簧越硬，动得越快。
- `damping`（阻尼）越大，回弹越少。足够大时不回弹，直接停在终点。
- `mass`（质量）越大，动得越慢，回弹持续得越久。
- `initialVelocity`（初速度）是动画开始时已有的速度。

弹簧停下来需要多久由这四个量算出，读 `settlingDuration` 得到，单位是秒。默认的四个值算出来是 1.473 秒；把 `damping` 从 10 调到 40，变成 1.000 秒。

推荐把 `duration` 设成 `settlingDuration`，像上面那样。`duration` 和 `settlingDuration` 不一致时动画怎么表现，**未在模拟器验证**。`settlingDuration` 要在四个物理量都设好之后再读。

### 几个属性一起动

```js
const radius = CABasicAnimation.animationWithKeyPath('cornerRadius');
radius.fromValue = 0;
radius.toValue = 10;

const appear = CABasicAnimation.animationWithKeyPath('opacity');
appear.fromValue = 0;
appear.toValue = 1;

const group = new CAAnimationGroup();
group.animations = [radius, appear];
group.duration = 1.2;
dot.addAnimation(group, { forKey: 'intro' });
```

**效果**：圆点在 1.2 秒里从透明的方块变成完全显示的圆。

- 组的 `duration` 是整组的时长。成员没有设 `duration` 时，用组的时长。
- 组也有 `timingFunction`、`repeatCount`、`autoreverses`，作用于整组。
- 要知道整组何时结束，在组上监听 `'stop'`。成员上的 `'start'` 和 `'stop'` 是否派发，**未在模拟器验证**。

不需要统一控制时，也可以不用组，直接把几个动画分别加到图层上。在同一段代码里加的动画一起开始。

### 立刻修改，不要过渡

```js
CATransaction.begin();
CATransaction.setDisableActions(true);
dot.position = new CGPoint(150, 80);
dot.opacity = 0.5;
CATransaction.commit();
```

**效果**：圆点立刻出现在新位置，变成半透明，没有过渡过程。

### 每一帧执行一次代码

```js
const link = new CADisplayLink();
let start = 0;

link.addEventListener('tick', (ev) => {
  const frame = /** @type {CADisplayLinkEvent} */ (ev).frame;
  if (start === 0) start = frame.timestamp;

  const t = (frame.timestamp - start) % 2;          // 秒，2 秒一个来回
  const x = t < 1 ? t * 240 : (2 - t) * 240;
  dot.frame = new CGRect(20 + x, 70, 20, 20);
});

link.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' });
```

**效果**：圆点在卡片里左右来回移动，1 秒从左到右，1 秒返回。

位置按经过的时间算，不按回调的次数算。说明见 [`CADisplayLink`](#cadisplaylink每一帧执行一次代码)。不再需要时调 `link.invalidate()`。

## 时间曲线

时间曲线决定动画在时间上怎么分配进度：匀速，还是先慢后快。它由 `CAMediaTimingFunction` 表示，赋给动画的 `timingFunction`。

曲线画在一个边长为 1 的正方形里。横轴是时间的比例，0 是动画开始，1 是结束。纵轴是进度的比例，0 是起点值，1 是终点值。曲线是一条三次贝塞尔曲线，从 (0, 0) 到 (1, 1)，形状由中间的两个控制点决定。曲线陡的地方，属性变化得快；平的地方变化得慢。

内置的曲线有五个，用名字取得：

```js
const ease = CAMediaTimingFunction.functionWithName('easeInEaseOut');
console.log(String(ease.controlPointAtIndex(1)), String(ease.controlPointAtIndex(2)));
```

**结果**：控制台输出两个控制点，约为 `CGPoint(0.42, 0)` 和 `CGPoint(0.58, 1)`。数值是单精度浮点数，输出时带有末位误差。

| 名字 | 效果 |
| --- | --- |
| `'linear'` | 匀速 |
| `'easeIn'` | 开始慢，之后加快 |
| `'easeOut'` | 开始快，结束前减慢 |
| `'easeInEaseOut'` | 开始和结束慢，中间快。控制点是 (0.42, 0) 和 (0.58, 1) |
| `'default'` | 开始较快，结束前明显减慢。控制点是 (0.25, 0.1) 和 (0.25, 1) |

`'default'` 和 `'easeInEaseOut'` 是两条不同的曲线。五条曲线画面上的差别**未在模拟器验证**；两组控制点的数值是实测的。

自定义曲线直接给出两个控制点的坐标：

```js
const custom = CAMediaTimingFunction.functionWithControlPoints(0.25, 0.1, 0.25, 1);
```

**结果**：得到一条和 `'default'` 相同的曲线。四个参数依次是第一个控制点的 x、y 和第二个控制点的 x、y。

动画的 `timingFunction` 是 `null` 时匀速进行。

## 隐式动画和 `CATransaction`

用 `new` 创建的图层在屏幕上显示过之后，改它的属性不会立刻跳到新值。系统自动加一段过渡动画，这叫隐式动画。时长是 iOS 的默认值 0.25 秒（**时长未在模拟器验证**）。

```js
const shape = new CAShapeLayer();
// ……shape 已经显示在屏幕上
shape.strokeEnd = 0.5;
console.log(shape.animationKeys());
```

**结果**：图层显示过之后，输出的数组里有 `'strokeEnd'`：这次赋值让系统在图层上加了一个名字是属性名的动画。

是否产生隐式动画，实测是这样的：

| 改属性的时候 | 是否产生隐式动画 |
| --- | --- |
| 图层还没有加到父图层下面 | 否 |
| 图层已经加进去，但还没有显示过 | 否 |
| 图层已经显示过 | 是 |
| 视图自己的图层（`view.layer`） | 否。**未在模拟器验证** |

在 `sceneconnect` 的回调里一次建好界面时，所有图层都还没显示过，改属性都是立刻生效的。之后在点击回调、定时器回调里再改，才会带过渡。

**`CATransaction`** 表示事务：一组一起提交的图层修改。它用来控制这组修改的隐式动画。`CATransaction` 没有实例，全部是类方法。

关闭隐式动画，让修改立刻生效：

```js
const shape = new CAShapeLayer();

CATransaction.begin();
CATransaction.setDisableActions(true);
shape.strokeEnd = 1;
CATransaction.commit();
```

**效果**：`strokeEnd` 立刻变成 1，图层上没有新增动画。

改变隐式动画的时长和曲线：

```js
const shape = new CAShapeLayer();

CATransaction.begin();
CATransaction.setAnimationDuration(1.5);
CATransaction.setAnimationTimingFunction(
  CAMediaTimingFunction.functionWithName('easeOut'));
shape.strokeEnd = 1;
CATransaction.commit();
```

**效果**：图层显示过时，`strokeEnd` 用 1.5 秒过渡到 1，开始快，结束前减慢。**未在模拟器验证。**

事务的规则：

- `begin()` 和 `commit()` 成对出现。两者之间的设置只对这中间的修改有效；`commit()` 之后恢复原状。
- 事务可以嵌套。里层没有设置的项，沿用外层的。**嵌套未在模拟器验证。**
- 设置只影响隐式动画。用 `addAnimation()` 加的动画不受 `setDisableActions(true)` 影响，照常播放。

什么时候用隐式动画，什么时候自己建动画对象：

- 只是让一次修改平滑一点，时长和曲线用默认的就行：直接改属性，用隐式动画。
- 需要指定起点、重复、关键帧、结束事件：建动画对象。同时用事务关掉这次修改的隐式动画，见[动画结束后停在哪里](#动画结束后停在哪里)。
- 修改必须立刻生效，比如跟着手指移动、布局变化后重设子图层的大小：用事务关掉。

## `CADisplayLink`：每一帧执行一次代码

**`CADisplayLink`** 表示一个和屏幕刷新同步的定时器。屏幕每刷新一帧，它派发一次 `'tick'` 事件。回调里用代码计算并设置这一帧的界面，就得到一段完全由代码控制的动画。

### 先考虑用动画对象

能写成「从一个值到另一个值」或「依次经过几个值」的动画，用前面的动画对象。动画对象加到图层上之后，每一帧的中间值由系统计算，不执行 JS（**这一点来自 iOS 的定义，未在模拟器验证**）。

`CADisplayLink` 的每一帧都要执行 JS 回调。JS 正在执行别的代码时，回调要等它执行完：验收用例里测到过一次，第一帧在 `addToRunLoop()` 之后 2.07 秒才到，因为这期间 JS 一直在运行别的代码。

适合用 `CADisplayLink` 的是动画对象表达不了的情况：位置取决于实时数据、自己写的物理模拟、需要每帧做判断的游戏逻辑。

### 开始和停止

```js
const link = new CADisplayLink();

link.addEventListener('tick', (ev) => {
  const frame = /** @type {CADisplayLinkEvent} */ (ev).frame;
  console.log('这一帧的时刻:', frame.timestamp);
});

link.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' });
```

**结果**：屏幕每刷新一帧，控制台输出一行。

**两步都要做**：监听 `'tick'`，并调 `addToRunLoop()`。只做其中一步，回调一次都不会执行。

`NSRunLoop.mainRunLoop` 表示 App 主线程的事件循环。`CADisplayLink` 加入它之后才开始工作。它没有别的成员，唯一的用处是作为这个参数。

`forMode` 决定用户拖动滚动视图期间回调是否继续：

| `forMode` | 效果 |
| --- | --- |
| `'common'` | 一直回调。**一般用这个** |
| `'default'` | 平时回调，用户拖动滚动视图期间暂停。不写 `forMode` 时是这个 |
| `'tracking'` | 只在用户拖动滚动视图期间回调 |

三种取值在滚动期间的差别来自 iOS 的定义，**未在模拟器验证**。验收用例只用了 `'common'`。

**加入之后，`CADisplayLink` 会一直工作到被停止。** 代码里不保存它，它也不会停，回调每帧照常执行。所以不用了一定要停止：

```js
const link = new CADisplayLink();

link.isPaused = true;    // 暂停。设回 false 继续
link.invalidate();       // 彻底停止。之后不能再启动，要用就新建一个
```

**效果**：暂停或停止之后不再派发 `'tick'`。

回调不是在屏幕刷新的那一刻同步执行的，见[运行时怎么工作](how-it-works.md)。所以暂停或停止之后，已经派发、还没执行的那一次回调仍然会执行。回调里如果依赖「已经停止」这个状态，要自己判断。

### 用时间算位置，不用帧数

`'tick'` 事件对象的 `frame` 里有三个时间，单位都是**秒**：

| 字段 | 含义 |
| --- | --- |
| `timestamp` | 这一帧的时刻 |
| `duration` | 两帧之间的间隔 |
| `targetTimestamp` | 这一帧的内容将要显示到屏幕上的时刻，比 `timestamp` 晚 |

这三个时刻只能用来互相求差。它们的起点和 `Date.now()` 不同，不能混在一起算。

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

**每次回调按经过的时间推进，不要按「每次回调前进固定的距离」写。** 不同设备每秒的帧数不同，回调也可能晚到；按固定距离写，物体的速度会随帧数变化。

这三个值带在事件对象上。`link.timestamp` 等属性也能读，但回调执行时它们可能已经是下一帧的值，回调里用事件对象上的。

## 成员说明

时间的单位是秒。数值属性按 `Number()` 转换，转换结果不是有限数时抛 `TypeError`。枚举属性写了不认识的值抛 `TypeError`，报错信息列出全部可用的值：

```
TypeError: fillMode has no value "hold"; expected one of: …
```

这一页的类都不能被继承，见[原生类](native-classes.md)。

### 图层上的方法

这五个方法在 [`CALayer`](ca-layer.md) 上。

**`layer.addAnimation(animation, options)`**

把动画加到图层上。

- **参数**：
  - `animation`：一个动画对象。
  - `options.forKey`：字符串，这个动画的名字，可以不给。用于之后查询和移除。
- **返回**：无。
- 图层保存的是 `animation` 的副本。
- 同一个图层上，同一个名字只能有一个动画。用已有的名字再加，原来的那个被移除并替换。**替换这一点未在模拟器验证。**
- **出错**：`animation` 不是动画对象时抛 `TypeError: addAnimation: expects a CAAnimation`。

**`layer.removeAnimationForKey(key)`**

移除名字是 `key` 的动画。没有这个名字时什么都不做。返回：无。

**`layer.removeAllAnimations()`**

移除图层上的全部动画，包括隐式动画。返回：无。

**`layer.animationKeys()`**

- **返回**：字符串数组，图层上所有动画的名字。没有动画时是空数组。隐式动画的名字是属性名，例如 `'strokeEnd'`。

**`layer.animationForKey(key)`**

- **返回**：名字是 `key` 的动画，没有时是 `null`。返回的是图层保存的副本，不是加进去的那个对象。它的类和加进去的相同：加的是 `CASpringAnimation`，读到的也是 `CASpringAnimation`。
- 返回的对象只用来读。修改它的属性的结果没有定义。

### `CAAnimation`

所有动画的基类。它不能直接创建，下面的成员四种动画都有。

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `duration` | 数 | 是 | 是 | `0` | 播放一遍的时长，秒。0 表示用默认时长，见下 |
| `repeatCount` | 数 | 是 | 是 | `0` | 重复次数，可以是小数。0 和 1 都是播一遍。`Infinity` 是一直重复 |
| `repeatDuration` | 数 | 是 | 是 | `0` | 重复播放的总时长，秒。和 `repeatCount` 二选一 |
| `autoreverses` | 布尔 | 是 | 是 | `false` | `true` 时播到终点后倒着播回起点，一遍的时长变成两倍；`false` 时到终点就结束 |
| `timingFunction` | `CAMediaTimingFunction` 或 `null` | 是 | 是 | `null` | [时间曲线](#时间曲线)。`null` 是匀速 |
| `fillMode` | 字符串 | 是 | 是 | `'removed'` | 动画的播放时段之外显示什么，见下表 |
| `removedOnCompletion` | 布尔 | 是 | 是 | `true` | `true` 时动画播完后从图层上移除；`false` 时留在图层上 |
| `beginTime` | 数 | 是 | 是 | `0` | 开始时刻，秒。见下 |
| `speed` | 数 | 是 | 是 | `1` | 播放速度的倍数。2 是两倍速，时长减半 |
| `timeOffset` | 数 | 是 | 是 | `0` | 从动画的第几秒开始播 |

- **`duration` 是 0 时**，动画用当前事务的时长，没有设过就是 iOS 的默认值 0.25 秒。0 不表示「没有动画」。**未在模拟器验证。**
- **`beginTime`** 的基准是图层自己的时间，不是「加到图层上的那一刻」。读图层当前时间的能力还没有，所以单独一个动画不能用 `beginTime` 表示「0.5 秒后开始」，要用定时器，见[延迟开始](#延迟开始)。放在 `CAAnimationGroup` 里的动画，`beginTime` 是相对于组开始的时刻，可以用来让成员先后开始。**后一句未在模拟器验证。**
- `speed`、`timeOffset`、`repeatDuration` 的效果**未在模拟器验证**。

`fillMode` 的取值。「播放时段」指从动画开始到结束的这段时间：

| 取值 | 效果 |
| --- | --- |
| `'removed'` | 播放时段之外，显示属性的值 |
| `'forwards'` | 结束之后，继续显示终点值。要同时把 `removedOnCompletion` 设成 `false` 才有效 |
| `'backwards'` | 开始之前，就显示起点值。只在动画延迟开始时有区别 |
| `'both'` | 以上两者 |

四种取值在画面上的效果**未在模拟器验证**。

#### 事件

用 `addEventListener()` 监听。

| 事件 | 什么时候派发 | 事件对象 |
| --- | --- | --- |
| `'start'` | 动画开始播放 | `type`、`target` |
| `'stop'` | 动画结束 | `type`、`target`、`finished` |

- `finished` 是布尔：`true` 表示播放到了结尾，`false` 表示中途被移除。
- `target` 是代码创建的那个动画对象。
- 回调不是在动画开始或结束的那一刻同步执行的，见[运行时怎么工作](how-it-works.md)。
- 事件不能取消。
- 监听别的事件名抛 `TypeError: addEventListener has no value "finish"; expected one of: …`。

### `CABasicAnimation`

#### 创建

```js
const fade = CABasicAnimation.animationWithKeyPath('opacity');
```

| 写法 | 得到什么 |
| --- | --- |
| `CABasicAnimation.animationWithKeyPath(keyPath)` | 指定了属性的动画。**一般用这个** |
| `new CABasicAnimation()` | 还没有指定属性的动画。`keyPath` 是 `null`，要先设 `keyPath` 才能设值 |

`keyPath` 不在[能做动画的属性](#能做动画的属性)里时抛 `TypeError`。

#### 属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `keyPath` | 字符串或 `null` | 是 | 是 | 创建时给的 | 改哪个属性 |
| `fromValue` | 由 `keyPath` 决定，或 `null` | 是 | 是 | `null` | 起点值 |
| `toValue` | 同上 | 是 | 是 | `null` | 终点值 |
| `byValue` | 同上 | 是 | 是 | `null` | 变化量。只给 `fromValue` 和 `byValue` 时，终点是两者之和 |

- 三个值可以只给一部分。没给的那一端用属性的值：只给 `toValue`，动画从属性的值变到 `toValue`；只给 `fromValue`，从 `fromValue` 变到属性的值。**未在模拟器验证**；例子里都把两端写全。
- 颜色读出来是字符串。随深浅色变化的颜色（如 `'systemBlue'`）读出来是换算后的固定颜色，规则和[图层上的颜色](ca-layer.md#图层上的颜色)相同。
- 颜色写错时不抛，控制台输出警告，原来的值不变。
- **出错**：
  - 还没有 `keyPath`：`TypeError: set keyPath before toValue; the value's type depends on it`
  - 类型和 `keyPath` 不对应：`TypeError: toValue does not fit keyPath "position"`
  - `keyPath` 要颜色，给的不是：`TypeError: toValue for keyPath "strokeColor" needs a color`
  - `keyPath` 要路径，给的不是：`TypeError: toValue for keyPath "path" needs a UIBezierPath`
  - 给的不是数、结构体、颜色、路径中的任何一种：`TypeError: toValue needs a number, a CGPoint / CGSize / CGRect, a color, or a UIBezierPath`

### `CAKeyframeAnimation`

#### 创建

| 写法 | 得到什么 |
| --- | --- |
| `CAKeyframeAnimation.animationWithKeyPath(keyPath)` | 指定了属性的关键帧动画 |
| `new CAKeyframeAnimation()` | 还没有指定属性的关键帧动画 |

#### 属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `keyPath` | 字符串或 `null` | 是 | 是 | 创建时给的 | 改哪个属性 |
| `values` | 数组或 `null` | 是 | 是 | `null` | 依次经过的值。每一项的类型由 `keyPath` 决定 |
| `path` | [`UIBezierPath`](ui-bezier-path.md) 或 `null` | 是 | 是 | `null` | 沿这条路径移动。设了它，`values` 不起作用。用于 `'position'` |
| `keyTimes` | 数的数组或 `null` | 是 | 是 | `null` | 每个值出现的时刻，0 到 1 的比例。`null` 是间隔相等 |
| `timingFunctions` | `CAMediaTimingFunction` 数组 | 是 | 是 | `[]` | 相邻两个值之间各用一条时间曲线。个数比 `values` 少一 |
| `calculationMode` | 字符串 | 是 | 是 | `'linear'` | 值与值之间怎么过渡，见下表 |
| `rotationMode` | `'auto'` \| `'autoReverse'` \| `null` | 是 | 是 | `null` | 沿路径移动时图层是否转向，见下表 |
| `tensionValues`、`continuityValues`、`biasValues` | 数的数组或 `null` | 是 | 是 | `null` | 只在 `calculationMode` 是 `'cubic'` 或 `'cubicPaced'` 时有效，调整曲线在每个值附近的松紧、连续性和偏向。每项取值 −1 到 1 |

`calculationMode` 的取值：

| 取值 | 效果 |
| --- | --- |
| `'linear'` | 相邻两个值之间直线过渡 |
| `'discrete'` | 不过渡。到了时刻直接换成下一个值 |
| `'paced'` | 直线过渡，并且全程匀速。`keyTimes` 和 `timingFunctions` 不起作用 |
| `'cubic'` | 用平滑的曲线经过每个值，拐弯处没有折角 |
| `'cubicPaced'` | 平滑曲线，并且全程匀速。`keyTimes` 和 `timingFunctions` 不起作用 |

`'cubic'` 和 `'cubicPaced'` 的效果**未在模拟器验证**。

`rotationMode` 的取值。只在设了 `path` 时使用：

| 取值 | 效果 |
| --- | --- |
| `null` | 图层不转向 |
| `'auto'` | 图层转向行进的方向 |
| `'autoReverse'` | 图层转向行进方向的反方向 |

- `path` 读出来是写进去的那个对象。和形状图层一样，写入之后再修改这条路径，动画不会变。
- `values` 是颜色时，读出来的是换算后的固定颜色字符串，不一定是写进去的字符串。
- `values` 里各项的类型要相同。是按第一项判断整个数组是哪一类的。
- **出错**：
  - 还没有 `keyPath`：`TypeError: set keyPath before values; the value's type depends on it`
  - 值的类型和 `keyPath` 不对应：抛 `TypeError`
  - `keyTimes` 等数组里有一项转换不出有限数：`TypeError: keyTimes[0] must be a finite number, got …`

### `CASpringAnimation`

`CASpringAnimation` 继承 `CABasicAnimation`，`keyPath`、`fromValue`、`toValue`、`byValue` 的用法相同。

| 写法 | 得到什么 |
| --- | --- |
| `CASpringAnimation.animationWithKeyPath(keyPath)` | 指定了属性的弹簧动画 |
| `new CASpringAnimation()` | 还没有指定属性的弹簧动画 |

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `mass` | 数 | 是 | 是 | `1` | 质量，要大于 0。越大动得越慢、回弹越久 |
| `stiffness` | 数 | 是 | 是 | `100` | 劲度，要大于 0。越大动得越快 |
| `damping` | 数 | 是 | 是 | `10` | 阻尼，不能是负数。越大回弹越少 |
| `initialVelocity` | 数 | 是 | 是 | `0` | 初速度。正数朝终点方向，负数朝反方向 |
| `allowsOverdamping` | 布尔 | 是 | 是 | `false` | 阻尼大到不再回弹之后，继续加大阻尼是否让到达终点变得更慢。`true` 是会，`false` 是不会 |
| `settlingDuration` | 数 | 是 | 否 | 由上面几项算出 | 弹簧停下来需要的时间，秒。默认参数下是 1.473 |
| `perceptualDuration` | 数 | 是 | 否 | 由上面几项算出 | 看起来动画持续的时间，秒，比 `settlingDuration` 短。默认参数下是 0.628 |
| `bounce` | 数 | 是 | 否 | 由上面几项算出 | 回弹的程度。0 是不回弹，越大回弹越明显，负数是比不回弹还慢。默认参数下是 0.5 |

- 三个只读属性随四个物理量变化，每次读都是按当前的值算的。没有变化事件。
- `mass`、`stiffness` 给 0 或负数，`damping` 给负数时的行为**未在模拟器验证**。
- `allowsOverdamping` 的效果**未在模拟器验证**。

### `CAAnimationGroup`

```js
const group = new CAAnimationGroup();
```

没有参数。

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `animations` | 动画对象的数组 | 是 | 是 | `[]` | 组里的动画。读出来是写进去的那些对象 |

- 组没有 `keyPath`。每个成员各有自己的 `keyPath`。
- 组的 `duration` 是整组的时长。成员的时长超过组的时长时，超出的部分不播放。**未在模拟器验证。**
- **出错**：数组里有不是动画的对象时抛 `TypeError`。

### `CAMediaTimingFunction`

不能用 `new` 创建，只能用下面两个方法取得。

**`CAMediaTimingFunction.functionWithName(name)`**

- **参数**：`name`，五个名字之一，见[时间曲线](#时间曲线)。
- **返回**：`CAMediaTimingFunction`。
- **出错**：名字不认识时抛 `TypeError: functionWithName has no value "bounce"; expected one of: …`。

**`CAMediaTimingFunction.functionWithControlPoints(c1x, c1y, c2x, c2y)`**

- **参数**：四个数，依次是第一个控制点的 x、y 和第二个控制点的 x、y。没有单位，是单位正方形里的坐标。
- **返回**：`CAMediaTimingFunction`。
- **出错**：某个参数转换不出有限数时抛 `TypeError`。

**`fn.controlPointAtIndex(index)`**

- **参数**：`index`，0 到 3 的整数。0 和 3 是曲线的两端，固定是 (0, 0) 和 (1, 1)；1 和 2 是两个控制点。
- **返回**：`CGPoint`。
- **出错**：`index` 超出范围时抛 `TypeError: controlPointAtIndex: index must be 0…3`。

### `CATransaction`

没有实例，`new CATransaction()` 抛 `TypeError: Illegal constructor: CATransaction is a set of class methods, not an object`。

| 方法 | 返回 | 作用 |
| --- | --- | --- |
| `CATransaction.begin()` | 无 | 开始一个事务 |
| `CATransaction.commit()` | 无 | 结束最近开始的那个事务 |
| `CATransaction.flush()` | 无 | 把已经做的图层修改立刻交给系统，不等当前这段代码执行完。平时不需要调。**效果未在模拟器验证** |
| `CATransaction.disableActions()` | 布尔 | 当前事务是否关闭了隐式动画 |
| `CATransaction.setDisableActions(value)` | 无 | `true` 关闭当前事务的隐式动画，`false` 打开 |
| `CATransaction.animationDuration()` | 数 | 当前事务的隐式动画时长，秒 |
| `CATransaction.setAnimationDuration(value)` | 无 | 设置当前事务的隐式动画时长，秒 |
| `CATransaction.animationTimingFunction()` | `CAMediaTimingFunction` 或 `null` | 当前事务的隐式动画用的时间曲线 |
| `CATransaction.setAnimationTimingFunction(value)` | 无 | 设置当前事务的隐式动画用的时间曲线。`null` 是用默认的 |

- `commit()` 之后，`disableActions()` 回到 `false`。
- 没有调 `begin()` 就调 `commit()` 的结果**未在模拟器验证**。
- **出错**：`setAnimationTimingFunction()` 的参数不是时间曲线也不是 `null` 时抛 `TypeError: setAnimationTimingFunction needs a CAMediaTimingFunction or null`。

### `CADisplayLink`

```js
const link = new CADisplayLink();
```

没有参数。创建之后不会自己开始，见[开始和停止](#开始和停止)。

**`link.addToRunLoop(runLoop, options)`**

让它开始工作。

- **参数**：
  - `runLoop`：只能是 `NSRunLoop.mainRunLoop`。
  - `options.forMode`：`'default'`、`'common'`、`'tracking'` 之一，不给时是 `'default'`。
- **返回**：无。
- 可以用不同的 `forMode` 调多次。
- **出错**：
  - `runLoop` 不是 `NSRunLoop.mainRunLoop`：`TypeError: addToRunLoop expects an NSRunLoop`。类型检查发现不了这个错误，只有运行时会抛。
  - `forMode` 不认识：`TypeError: forMode has no value "idle"; expected one of: …`

**`link.removeFromRunLoop(runLoop, options)`**

取消某个 `forMode` 上的回调，参数和 `addToRunLoop()` 相同。加过的 `forMode` 全部取消之后不再回调。返回：无。**未在模拟器验证。**

**`link.invalidate()`**

彻底停止。之后不再派发 `'tick'`，也不能再启动。返回：无。

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `isPaused` | 布尔 | 是 | 是 | `false` | `true` 时暂停派发 `'tick'`；设回 `false` 继续 |
| `timestamp` | 数 | 是 | 否 | `0` | 最近一帧的时刻，秒。开始工作之前是 0 |
| `duration` | 数 | 是 | 否 | `0` | 两帧之间的间隔，秒。开始工作之前是 0 |
| `targetTimestamp` | 数 | 是 | 否 | — | 最近一帧的内容将要显示的时刻，秒 |
| `preferredFrameRateRange` | `CAFrameRateRange` | 是 | 是 | `(0, 0, 0)` | 希望每秒回调多少次，见下 |

`CAFrameRateRange` 有三个字段，单位都是帧每秒：`minimum`（最低）、`maximum`（最高）、`preferred`（最希望的）。三个都是 0 表示由系统决定。

```js
const link = new CADisplayLink();
link.preferredFrameRateRange = new CAFrameRateRange(30, 60, 30);
console.log(String(link.preferredFrameRateRange));
```

**结果**：控制台输出 `CAFrameRateRange(30, 60, 30)`。设置之后实际每秒回调多少次，**未在模拟器验证**。

#### 事件

| 事件 | 什么时候派发 | 事件对象 |
| --- | --- | --- |
| `'tick'` | 屏幕每刷新一帧 | `type`、`target`、`frame` |

- `frame` 有三个字段：`timestamp`、`duration`、`targetTimestamp`，含义见[用时间算位置，不用帧数](#用时间算位置不用帧数)。
- 回调参数的类型声明是普通的 `Event`。读 `frame` 时要像例子里那样先转成 `CADisplayLinkEvent`。
- 监听别的事件名抛 `TypeError: addEventListener has no value "frame"; expected one of: tick`。

### `NSRunLoop`

不能用 `new` 创建。只有一个成员：

| 成员 | 类型 | 可读 | 可写 | 说明 |
| --- | --- | --- | --- | --- |
| `NSRunLoop.mainRunLoop` | `NSRunLoop` | 是 | 否 | 主线程的事件循环。每次读到的是同一个对象 |

## 与 iOS 原生写法的对照

如果你在看 Apple 的文档或 iOS 的示例代码，按这张表换成 JS 的写法。

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
| `anim.removedOnCompletion = NO` | `anim.removedOnCompletion = false` |
| `anim.delegate = self`，实现 `animationDidStart:` | `anim.addEventListener('start', …)` |
| `anim.delegate = self`，实现 `animationDidStop:finished:` | `anim.addEventListener('stop', (e) => e.finished)` |
| `[CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseIn]` | `CAMediaTimingFunction.functionWithName('easeIn')` |
| `[CAMediaTimingFunction functionWithControlPoints:a :b :c :d]` | `CAMediaTimingFunction.functionWithControlPoints(a, b, c, d)` |
| `[fn getControlPointAtIndex:1 values:v]` | `fn.controlPointAtIndex(1)` |
| `[layer addAnimation:a forKey:@"fade"]` | `layer.addAnimation(a, { forKey: 'fade' })` |
| `[layer animationForKey:@"fade"]` | `layer.animationForKey('fade')` |
| `[layer animationKeys]` | `layer.animationKeys()` |
| `[layer removeAnimationForKey:@"fade"]` | `layer.removeAnimationForKey('fade')` |
| `keyframe.values = @[@0, @1]` | `keyframe.values = [0, 1]` |
| `keyframe.path = path.CGPath` | `keyframe.path = path` |
| `keyframe.calculationMode = kCAAnimationPaced` | `keyframe.calculationMode = 'paced'` |
| `keyframe.rotationMode = kCAAnimationRotateAuto` | `keyframe.rotationMode = 'auto'` |
| `group.animations = @[a, b]` | `group.animations = [a, b]` |
| `[CATransaction begin]` / `[CATransaction commit]` | `CATransaction.begin()` / `CATransaction.commit()` |
| `[CATransaction setDisableActions:YES]` | `CATransaction.setDisableActions(true)` |
| `[CADisplayLink displayLinkWithTarget:self selector:@selector(tick:)]` | `new CADisplayLink()`，再 `addEventListener('tick', …)` |
| `[link addToRunLoop:NSRunLoop.mainRunLoop forMode:NSRunLoopCommonModes]` | `link.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' })` |
| `link.paused = YES` | `link.isPaused = true` |
| `link.preferredFrameRateRange = CAFrameRateRangeMake(30, 60, 30)` | `link.preferredFrameRateRange = new CAFrameRateRange(30, 60, 30)` |

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 用一个代码块描述视图动画 | `UIView.animateWithDuration:animations:` | 未实现 |
| 给旋转和缩放做动画 | `transform` 的动画、`valueFunction` | 未实现 |
| 给渐变的颜色和位置做动画 | `colors`、`locations` 的动画 | 未实现 |
| 读动画进行中屏幕上正显示的值 | `presentationLayer` | 未实现 |
| 用 `beginTime` 让单独一个动画延迟开始 | `CACurrentMediaTime()`、`convertTime:fromLayer:` | 未实现。用定时器代替 |
| 整个事务里的动画都结束时得到通知 | `CATransaction.completionBlock` | 未实现。在动画对象上监听 `'stop'` |
| 用「感觉上的时长」和「回弹程度」创建弹簧动画 | `initWithPerceptualDuration:bounce:` | 未实现。这两个值可以读，不能直接指定 |
| 页面切换那样的整体转场 | `CATransition` | 未实现 |
| 让动画的值叠加在属性的值之上 | `additive`、`cumulative` | 未实现 |
| 类似浏览器的 `requestAnimationFrame()` | — | 未实现。用 `CADisplayLink` |

## 参见

- [`CALayer`](ca-layer.md)：动画作用的对象，各个属性的含义
- [`UIBezierPath`](ui-bezier-path.md)：`'path'` 动画和沿路径移动用到的路径
- [定时器](timers.md)：延迟开始一个动画
- [颜色](ui-color.md)：颜色值的写法
- [结构体](structs.md)：`CGPoint`、`CGRect`、`CGSize`、`CAFrameRateRange`
- [运行时怎么工作](how-it-works.md)：事件回调什么时候执行
- [实现原理：动画](../internals/ca-animation.md)
