# `CALayer`、`CAGradientLayer` 和 `CAShapeLayer`

图层是真正把东西画出来的那一层。每个 `UIView` 背后都有一个（`view.layer`），
圆角、边框、阴影在它上面；也可以**自己建一个挂上去**，画渐变、形状、图表就靠这个。

```js
// view 自己那一层
card.layer.cornerRadius = 14;

// 自己建一个挂上去
const bg = new CAGradientLayer();
bg.colors = ['#5856D6', '#FF2D55'];
bg.frame = card.bounds;          // ← 必须自己设，往下看
card.layer.addSublayer(bg);
```

`view.layer` 和 view 一对一，取两次是同一个对象。

## 先读这一条：子图层不跟布局

**子图层不走 Auto Layout。** 约束只作用于 view；`CALayer` 在 macOS 上有
`autoresizingMask` 和 `layoutManager`，但这两个在 iOS 上都标着
`API_UNAVAILABLE(ios)`。所以：

```js
bg.frame = card.bounds;   // 现在对
// …旋转屏幕、字体变大、键盘弹出，card 变大了
// bg 还是原来那么大，不会自己跟上
```

原生 App 在 `layoutSubviews` 里重设一遍，而那是个覆写点，运行时还没有
（见功能清单的 **M2**）。所以现在能稳稳用的是**尺寸不变的内容**：固定大小的
卡片、图标、建好就不动的图表。

要让它跟上，只能在你自己知道布局变了的时候重设一次：

```js
root.layoutIfNeeded();        // 先让约束跑完，bounds 才是真的
bg.frame = card.bounds;
```

## 自己建图层

```js
const layer = new CALayer();
layer.frame = new CGRect(0, 0, 100, 40);
layer.backgroundColor = '#5856D6';
card.layer.addSublayer(layer);
```

**默认是 0×0**，不设 `frame` 什么都看不见。

### `contentsScale`

**默认是 `1`，不是屏幕的 scale**，光栅化出来会糊。

实测连 `view.layer` 在场景刚接入时也是 `1`（UIKit 要到真正绘制时才写上去），
**所以别拿它当屏幕 scale 读**：

```js
vc.view.layer.contentsScale;   // 1，不是 3
```

自己建的图层要自己设，而现在还没有地方读到屏幕的 scale（`UIScreen` 和
`UITraitCollection` 都没暴露），只能先写死：

```js
layer.contentsScale = 3;
```

渐变层是 GPU 直接合成的，这一条对它影响不大；等 `CAShapeLayer` 来了就很要紧。

## 几何

| 属性 | 说明 |
| --- | --- |
| `frame` | 在父图层坐标系里的位置和大小 |
| `bounds` | 自己的坐标系，`width` / `height` 和 `frame` 一致 |
| `position` | **中心点**，不是左上角——锚点默认在正中 |
| `zPosition` | 不动 `sublayers` 的顺序就能改叠放次序。默认 `0` |

```js
layer.frame = new CGRect(1, 2, 3, 4);
layer.position;        // CGPoint(2.5, 4)  ← 中心
```

## 层级

```js
host.addSublayer(a);
host.insertSublayer(c, { atIndex: 0 });   // 插到最前
host.insertSublayer(c, { above: b });     // 挪到 b 上面
host.insertSublayer(c, { below: a });     // 挪到 a 下面
c.removeFromSuperlayer();

host.sublayers;        // CALayer[]，顺序就是叠放顺序（zPosition 相同时）
a.superlayer;          // host
```

`insertSublayer` 三种插法必须选一种，不给就抛 `TypeError`。参数不是图层也抛。

> 一个图层同时只能有一个父层。把已经挂在别处的图层 `addSublayer` 过来，
> 它会自动从原来那层摘下来。

**view 的子视图也在这里。** `card.layer.sublayers` 里既有你自己加的图层，
也有每个子视图的 `layer`。

## 外观

| 属性 | 默认值 | `UIView` 上的对应物 |
| --- | --- | --- |
| `opacity` | `1` | `view.alpha` |
| `isHidden` | `false` | `view.isHidden` |
| `masksToBounds` | `false` | `view.clipsToBounds` |
| `backgroundColor` | `null` | `view.backgroundColor` |

右边这一列是**同一件事**。view 自己那一层请用 view 的写法——它才是参与布局和
动态色的那个；独立建的子图层上 view 没有对应物，只能用左边的。

```js
card.layer.masksToBounds = true;   // 不裁的话子图层会盖过圆角
```

## 圆角

### `cornerRadius: number`

默认 `0`。设了就圆。

```js
layer.cornerRadius = 14;
```

**只圆背景和边框。** 子视图、子图层、图片这些内容照样是直角，要让它们也跟着圆：

```js
view.clipsToBounds = true;       // 等价于 view.layer.masksToBounds = true
```

### `cornerCurve: 'circular' | 'continuous'`

**默认 `'continuous'`**——超椭圆圆角，Apple 的 App 图标和系统卡片用的就是它，转角过渡比正圆弧顺。要正圆弧得显式写 `'circular'`。

> `CALayer.h` 里写的是「默认 circular」，和 iOS 26 的实际行为不符。以实际为准。

### `maskedCorners: CACornerMask[]`

哪几个角要圆。默认四个角全圆。

```js
layer.maskedCorners = ['minXMinY', 'maxXMinY'];   // 只圆上面两个
layer.maskedCorners = [];                          // 一个都不圆
```

**UIKit 的 y 轴朝下**，所以 minY 是上边：

| 值 | 角 |
| --- | --- |
| `'minXMinY'` | 左上 |
| `'maxXMinY'` | 右上 |
| `'minXMaxY'` | 左下 |
| `'maxXMaxY'` | 右下 |

空数组合法。给了非数组、或者名字不认识，都抛 `TypeError`，两种错的信息不一样：

```js
layer.maskedCorners = ['topLeft'];   // has no value "topLeft"; expected…
layer.maskedCorners = 'minXMinY';    // needs an array of names; expected…
```

## 边框

### `borderWidth: number`

默认 `0`。边框画在**内容之上**，而且跟着 `cornerRadius` 走。

### `borderColor`

写进去是[颜色字符串](ui-color.md)或 `UIColor`，**读出来是字符串**。
默认**不透明黑**（不是 `null`）。所以默认看不见边框是因为宽度是 0，不是因为没颜色。

```js
layer.borderColor = '#5856D6';
layer.borderColor;                // '#5856D6'
```

ObjC 那边是 `CGColorRef`，所以有一条绕不开的：

```js
layer.borderColor = 'label';      // 动态色在这一刻被定死
layer.borderColor;                // 读回来是当时那个具体颜色，不是 'label'
```

**深色模式切换时它不会跟着变。** 要跟随外观，用 `view.backgroundColor`（那个支持动态色），或者等外观变化时自己重设一遍。`backgroundColor` 和 `shadowColor` 同理。

## 阴影

四个属性，**`shadowOpacity` 默认是 0**——只设颜色、半径、偏移，屏幕上不会有任何变化。

```js
layer.shadowColor   = 'black';              // 默认不透明黑
layer.shadowOpacity = 0.25;                 // 默认 0 ← 不设这个什么都看不见
layer.shadowRadius  = 8;                    // 默认 3
layer.shadowOffset  = new CGSize(0, 4);     // 默认 (0, -3)
```

`shadowOffset` 的 y 轴朝下，所以默认的 `-3` 是**往上偏**。

> **阴影和裁剪互斥。** 阴影画在图层外面，`clipsToBounds = true` 把外面全裁掉。两个都要就得套两层 view：外层放阴影，内层放圆角和裁剪。

## `CAGradientLayer`

```js
const g = new CAGradientLayer();
g.colors = ['#5856D6', '#FF2D55'];
g.startPoint = new CGPoint(0, 0);
g.endPoint = new CGPoint(1, 1);     // 左上 → 右下
g.frame = card.bounds;
card.layer.addSublayer(g);
```

颜色**至少给两个**，不然什么都看不见。

### `type: 'axial' | 'radial' | 'conic'`

默认 `'axial'`。`startPoint` / `endPoint` 在三种里含义不同：

| `type` | `startPoint` | `endPoint` |
| --- | --- | --- |
| `'axial'` | 渐变起点 | 渐变终点 |
| `'radial'` | 圆心 | 定半径（到圆心的距离） |
| `'conic'` | 圆心 | 定起始角度 |

### `startPoint` / `endPoint`

**单位坐标，不是点**：`(0, 0)` 是左上角，`(1, 1)` 是右下角。默认从 `(0.5, 0)`
到 `(0.5, 1)`，也就是从上到下。

### `locations: number[] | null`

每个颜色落在 0…1 的哪一处。`null`（默认）表示均匀分布。个数要和 `colors` 对得上。

```js
g.locations = [0, 0.3, 1];   // 第二个颜色挤到前面 30%
```

### `colors`

写进去是颜色字符串（或 `UIColor`）的数组。**读出来是字符串数组，但不一定是写
进去的那些串**——原生存的是 `CGColor`，和 `borderColor` 同一条路：

```js
g.colors = ['label', '#FF2D55'];
g.colors;    // ['#000000', '#FF2D55'] ← 'label' 在写入那一刻就被定死了
```

数组里有一个不合法，**整条都不写**（并打一条警告），不会写进去一半。

## `CAShapeLayer`

画一条[路径](ui-bezier-path.md)的图层。折线、扇形、饼图、K 线都靠它。

```js
const shape = new CAShapeLayer();
shape.path = somePath;
shape.strokeColor = 'systemBlue';
shape.fillColor = null;        // 默认是**黑色实心**，只要线的话必须设
shape.lineWidth = 3;
shape.frame = card.bounds;     // 和别的子图层一样要自己设
card.layer.addSublayer(shape);
```

它**不自己量尺寸**：`path` 的坐标就是图层自己坐标系里的点，和 `frame` 的大小没有关系，路径超出去的部分照样画（除非 `masksToBounds`）。

### `path`

```js
shape.path = line;
shape.path === line;    // true
shape.path = null;      // 什么都不画
```

**写进去的那个对象会原样还回来。** 原生存的是 `CGPath`，读回来只能现包一个新的 `UIBezierPath`，所以 JS 这边记了一份镜像。包装被回收重建过之后镜像就没了，那时读到的是按原生重建的新对象——和 `sublayers` 一个规矩：按原生的真相整层重建。

还有一条照着 Apple 的头文件：**存的是副本**（`on assignment the path is copied`）。写进去之后再改那条 `UIBezierPath`，图层不会跟着变，要再赋值一次。

### `fillColor` / `fillRule`

`fillColor` **默认是不透明黑，不是透明**。只想要一条线的时候必须显式设成 `null`，否则整块被填满——这是最容易踩的一个坑。

`fillRule` 只在路径自交或者嵌套时看得出区别：

| | |
| --- | --- |
| `'nonZero'`（默认） | 射线穿过路径时按绕向加减，不为零就填 |
| `'evenOdd'` | 数穿过次数，奇数才填 |

### 描边

`strokeColor` **默认是 `null`**，所以只设 `lineWidth` 看不见线。

线是**骑在路径上**的，两边各占一半线宽——所以 `lineWidth = 10` 的路径，实际占的范围比 `bounds` 每边多 5。

| | |
| --- | --- |
| `lineCap` | `'butt'`（默认，齐根切）/ `'round'` / `'square'`。后两种让线比路径长出半个线宽 |
| `lineJoin` | `'miter'`（默认，尖角）/ `'round'` / `'bevel'` |
| `miterLimit` | 尖角尖到什么程度就削平成 `bevel`，默认 10 |

### `strokeStart` / `strokeEnd`

只描路径的一段，0…1。配动画能做「线一点点画出来」；现在还没有动画，直接设也能当进度条用。

### 虚线

```js
shape.lineDashPattern = [4, 2];   // 画 4 空 2，循环
shape.lineDashPhase = 1;          // 从哪里开始
shape.lineDashPattern = null;     // 实线（默认）
```

数组里有一个不是数字就抛，不会写进去一半。

## 属性一览

### `CALayer`

| 属性 | 类型 | 默认值 |
| --- | --- | --- |
| `frame` | `CGRect` | `(0, 0, 0, 0)` |
| `bounds` | `CGRect` | `(0, 0, 0, 0)` |
| `position` | `CGPoint` | `(0, 0)` |
| `zPosition` | `number` | `0` |
| `superlayer` | `CALayer \| null`（只读） | `null` |
| `sublayers` | `CALayer[]`（只读） | `[]` |
| `opacity` | `number` | `1` |
| `isHidden` | `boolean` | `false` |
| `masksToBounds` | `boolean` | `false` |
| `contentsScale` | `number` | `1`（`view.layer` 实测也是） |
| `backgroundColor` | `string \| null` | `null` |
| `cornerRadius` | `number` | `0` |
| `cornerCurve` | `'circular'` \| `'continuous'` | `'continuous'` |
| `maskedCorners` | `CACornerMask[]` | 四个角全圆 |
| `borderWidth` | `number` | `0` |
| `borderColor` | `string \| null` | 不透明黑 |
| `shadowColor` | `string \| null` | 不透明黑 |
| `shadowOpacity` | `number` | `0` |
| `shadowRadius` | `number` | `3` |
| `shadowOffset` | `CGSize` | `(0, -3)` |

### `CAGradientLayer`（在上面那些之外）

| 属性 | 类型 | 默认值 |
| --- | --- | --- |
| `colors` | `string[]` 读 / `ColorValue[]` 写 | `[]` |
| `locations` | `number[] \| null` | `null` |
| `startPoint` | `CGPoint` | `(0.5, 0)` |
| `endPoint` | `CGPoint` | `(0.5, 1)` |
| `type` | `'axial'` \| `'radial'` \| `'conic'` | `'axial'` |

### `CAShapeLayer`（在 `CALayer` 那些之外）

默认值全部对着 `CAShapeLayer.h` 的注释核过。

| 属性 | 类型 | 默认值 |
| --- | --- | --- |
| `path` | `UIBezierPath \| null` | `null` |
| `fillColor` | `string \| null` | **不透明黑** |
| `fillRule` | `'nonZero'` \| `'evenOdd'` | `'nonZero'` |
| `strokeColor` | `string \| null` | `null` |
| `lineWidth` | `number` | `1` |
| `lineCap` | `'butt'` \| `'round'` \| `'square'` | `'butt'` |
| `lineJoin` | `'miter'` \| `'round'` \| `'bevel'` | `'miter'` |
| `miterLimit` | `number` | `10` |
| `strokeStart` | `number` | `0` |
| `strokeEnd` | `number` | `1` |
| `lineDashPattern` | `number[] \| null` | `null` |
| `lineDashPhase` | `number` | `0` |

## 和原生的对照

| ObjC | JS |
| --- | --- |
| `view.layer` | `view.layer` |
| `[CALayer layer]` | `new CALayer()` |
| `[CAGradientLayer layer]` | `new CAGradientLayer()` |
| `[host addSublayer:a]` | `host.addSublayer(a)` |
| `[host insertSublayer:c atIndex:0]` | `host.insertSublayer(c, { atIndex: 0 })` |
| `[host insertSublayer:c above:b]` | `host.insertSublayer(c, { above: b })` |
| `[host insertSublayer:c below:a]` | `host.insertSublayer(c, { below: a })` |
| `[c removeFromSuperlayer]` | `c.removeFromSuperlayer()` |
| `layer.frame = CGRectMake(1, 2, 3, 4)` | `layer.frame = new CGRect(1, 2, 3, 4)` |
| `layer.position = CGPointMake(10, 10)` | `layer.position = new CGPoint(10, 10)` |
| `layer.backgroundColor = color.CGColor` | `layer.backgroundColor = '#5856D6'` |
| `layer.cornerRadius = 14` | `layer.cornerRadius = 14` |
| `layer.cornerCurve = kCACornerCurveContinuous` | `layer.cornerCurve = 'continuous'` |
| `layer.maskedCorners = kCALayerMinXMinYCorner \| kCALayerMaxXMinYCorner` | `layer.maskedCorners = ['minXMinY', 'maxXMinY']` |
| `layer.borderColor = UIColor.systemBlueColor.CGColor` | `layer.borderColor = 'systemBlue'` |
| `[UIColor colorWithCGColor:layer.borderColor]` | `layer.borderColor`（给的是字符串） |
| `layer.shadowOffset = CGSizeMake(0, 4)` | `layer.shadowOffset = new CGSize(0, 4)` |
| `gradient.colors = @[(id)a.CGColor, (id)b.CGColor]` | `gradient.colors = ['#000', '#fff']` |
| `gradient.type = kCAGradientLayerRadial` | `gradient.type = 'radial'` |
| `[CAShapeLayer layer]` | `new CAShapeLayer()` |
| `shape.path = path.CGPath` | `shape.path = path` |
| `shape.fillColor = UIColor.clearColor.CGColor` | `shape.fillColor = null` |
| `shape.fillRule = kCAFillRuleEvenOdd` | `shape.fillRule = 'evenOdd'` |
| `shape.lineCap = kCALineCapRound` | `shape.lineCap = 'round'` |
| `shape.lineJoin = kCALineJoinBevel` | `shape.lineJoin = 'bevel'` |
| `shape.lineDashPattern = @[@4, @2]` | `shape.lineDashPattern = [4, 2]` |

## 还没做

| | |
| --- | --- |
| 布局回调 | 子图层的 `frame` 要自己维护，没有 `layoutSubviews` 可覆写（**M2**） |
| 读屏幕 scale | `UIScreen` / `UITraitCollection.displayScale` 都没暴露，`contentsScale` 只能写死 |
| `mask` / `shadowPath` | 要 `CGPath`。`shadowPath` 收的是 `CGPathRef`，不是 `UIBezierPath` |
| `anchorPoint` / `transform` | 要 `CATransform3D`，和动画一起做 |
| `contents` | 直接给图层塞一张图 |
| 其余 `CALayer` 子类 | `CATextLayer`、`CAReplicatorLayer`… |
| 隐式动画 | ~~未验证~~ **已实测**：是真的，但要等图层渲染过一轮。关它用 [`CATransaction.setDisableActions`](ca-animation.md#隐式动画和-catransaction) |

---

设计理由和实测依据见[项目说明](../internals/ca-layer.md)。

← 返回 [API 文档](README.md)
