---
type: reference
native: CALayer
status: partial
---

# `CALayer`

**`CALayer`** 表示图层：屏幕上的一块矩形区域，以及画在这块区域里的内容。底色、圆角、边框、阴影都是图层的属性。图层可以有子图层，子图层画在父图层的上面，位置按父图层的坐标系计算。

图层只负责显示。它不接收触摸，不参与 Auto Layout（iOS 按约束自动计算视图位置和大小的机制，见 [Auto Layout](auto-layout.md)）。

`CALayer` 有两个子类，各有自己的页面：

- [`CAGradientLayer`](ca-gradient-layer.md) 在自己的矩形里画一段颜色渐变。
- [`CAShapeLayer`](ca-shape-layer.md) 把一条路径（[`UIBezierPath`](ui-bezier-path.md)）画出来，可以描边，也可以填充。

`CALayer` 不派发事件。它的属性只会被 App 的代码修改，所以没有变化通知。

**继承关系**：`EventTarget` → `NSObject` → `CALayer`

怎么用图层做圆角、阴影、渐变和形状，见指南[用图层画圆角、阴影、渐变和形状](../guides/layers.md)。

## 构造函数

[`CALayer()`](ca-layer/constructor.md)

创建一个大小是 0 × 0 pt、没有父图层的图层。每个视图自己的图层不用创建，从 `view.layer` 读。

## 实例属性

还继承 `NSObject` 的属性。所有长度的单位是[点（pt）](units.md)。

位置和大小：

| 属性 | 说明 |
| --- | --- |
| [`frame`](ca-layer/frame.md) | 在父图层坐标系里的位置和大小 |
| [`bounds`](ca-layer/bounds.md) | 自己的坐标系 |
| [`position`](ca-layer/position.md) | 中心点在父图层坐标系里的坐标 |
| [`zPosition`](ca-layer/zposition.md) | 上下顺序 |

内容和层级：

| 属性 | 说明 |
| --- | --- |
| [`contents`](ca-layer/contents.md) | 图层显示的图片 |
| [`superlayer`](ca-layer/superlayer.md) <small>只读</small> | 父图层 |
| [`sublayers`](ca-layer/sublayers.md) <small>只读</small> | 子图层 |

外观：

| 属性 | 说明 |
| --- | --- |
| [`opacity`](ca-layer/opacity.md) | 不透明度 |
| [`isHidden`](ca-layer/ishidden.md) | 是否隐藏 |
| [`masksToBounds`](ca-layer/maskstobounds.md) | 是否裁掉超出范围的子图层 |
| [`backgroundColor`](ca-layer/backgroundcolor.md) | 底色 |
| [`contentsScale`](ca-layer/contentsscale.md) | 每 1 pt 用几个像素画 |

圆角和边框：

| 属性 | 说明 |
| --- | --- |
| [`cornerRadius`](ca-layer/cornerradius.md) | 圆角半径 |
| [`cornerCurve`](ca-layer/cornercurve.md) | 圆角的曲线 |
| [`maskedCorners`](ca-layer/maskedcorners.md) | 哪几个角是圆角 |
| [`borderWidth`](ca-layer/borderwidth.md) | 边框宽度 |
| [`borderColor`](ca-layer/bordercolor.md) | 边框颜色 |

阴影：

| 属性 | 说明 |
| --- | --- |
| [`shadowColor`](ca-layer/shadowcolor.md) | 阴影颜色 |
| [`shadowOpacity`](ca-layer/shadowopacity.md) | 阴影的不透明度。默认 0，阴影不显示 |
| [`shadowRadius`](ca-layer/shadowradius.md) | 阴影边缘模糊的范围 |
| [`shadowOffset`](ca-layer/shadowoffset.md) | 阴影相对图层的偏移 |

## 实例方法

还继承 `NSObject` 的方法。

层级：

| 方法 | 说明 |
| --- | --- |
| [`addSublayer()`](ca-layer/addsublayer.md) | 加为子图层，放在最上面 |
| [`insertSublayer()`](ca-layer/insertsublayer.md) | 插到指定位置 |
| [`removeFromSuperlayer()`](ca-layer/removefromsuperlayer.md) | 从父图层移除 |

动画。动画对象本身见 [`CAAnimation`](ca-animation.md)：

| 方法 | 说明 |
| --- | --- |
| [`addAnimation()`](ca-layer/addanimation.md) | 把一个动画加到图层上 |
| [`removeAnimationForKey()`](ca-layer/removeanimationforkey.md) | 移除指定名字的动画 |
| [`removeAllAnimations()`](ca-layer/removeallanimations.md) | 移除图层上的全部动画 |
| [`animationKeys()`](ca-layer/animationkeys.md) | 图层上所有动画的名字 |
| [`animationForKey()`](ca-layer/animationforkey.md) | 读某个名字的动画 |

## 通用规则

- 结构体 `CGRect`、`CGPoint`、`CGSize` 见[结构体](structs.md)：读出来的结构体字段只读，要改就整体赋一个新的。
- 数值属性按 `Number()` 转换，`'0.5'` 当作 0.5；转换结果不是有限数时抛 `TypeError`。布尔属性按真假值转换。
- `CALayer`、`CAGradientLayer`、`CAShapeLayer` 都不能被继承，见[原生类](native-classes.md)。

## 图层从哪里来

图层有两个来源。

**每个视图都有一个图层。** [`UIView`](ui-view.md) 自己不画内容，屏幕上看到的视图是它的图层画出来的。这个图层用 `view.layer` 读到，由系统随视图一起创建，视图存在它就存在。同一个视图每次读 `layer` 得到的是同一个对象。

**也可以用 `new` 创建图层**，再用 `addSublayer()` 加到某个视图的图层下面。渐变和形状都要这样做，因为视图没有对应的属性。新建的图层大小是 0 × 0 pt，没有父图层，要设了 `frame` 并加到一个已经在屏幕上的图层下面才看得见。

图层加到父图层下面之后，由父图层保管。代码里不需要另外保存它，它会一直显示到被 `removeFromSuperlayer()` 移除，或者父图层所在的视图被移除。

## 用视图的属性还是图层的属性

底色、透明度、隐藏、裁剪、位置和大小，视图和图层上各有一个属性，改的是同一件事：

| 要改的 | 视图的属性 | 图层的属性 |
| --- | --- | --- |
| 底色 | `view.backgroundColor` | `layer.backgroundColor` |
| 透明度 | `view.alpha` | `layer.opacity` |
| 隐藏 | `view.isHidden` | `layer.isHidden` |
| 裁掉超出范围的内容 | `view.clipsToBounds` | `layer.masksToBounds` |
| 位置和大小 | `view.frame`，或者约束 | `layer.frame` |

对视图自己的图层，这五项用视图的属性。理由有两条：

- 视图的位置和大小由 Auto Layout 管。直接改 `view.layer.frame`，下一次布局时会被约束算出的结果覆盖。**这一条未在模拟器验证。**
- `view.backgroundColor` 写入 `'label'` 这类随深浅色模式变化的颜色时，系统切换模式后底色自动跟着变。`layer.backgroundColor` 不会，见[图层上的颜色](#图层上的颜色)。

视图没有对应属性的那些，直接写 `view.layer`：圆角（`cornerRadius`、`cornerCurve`、`maskedCorners`）、边框（`borderWidth`、`borderColor`）、阴影（`shadowColor` 等四个）。

用 `new` 创建的图层没有对应的视图，全部用图层自己的属性。

## 子图层的大小不随视图变化

用 `new` 创建的图层，位置和大小只有一个来源：代码写进去的 `frame`。约束只作用于视图，图层没有约束，也没有「跟随父图层大小」的设置。

```js
const card = new UIView();
card.frame = new CGRect(20, 100, 300, 160);

const gradient = new CAGradientLayer();
gradient.frame = card.bounds;        // 这一刻是 300 × 160 pt
card.layer.addSublayer(gradient);

card.frame = new CGRect(20, 100, 340, 200);
console.log(gradient.frame.width);   // 300
```

**结果**：卡片变成 340 × 200 pt，渐变图层仍是 300 × 160 pt，卡片右边和下边各露出一条没有渐变的区域。**未在模拟器验证**。

还要注意读 `bounds` 的时机。用约束定位的视图，在系统做完第一次布局之前 `bounds` 是 0 × 0 pt，这时把它赋给图层的 `frame`，图层就是 0 × 0 pt，什么都看不见。

怎么让子图层和视图的大小对得上，见指南[用图层画圆角、阴影、渐变和形状](../guides/layers.md#子图层的大小跟上视图)。

## 图层上的颜色

图层上接受颜色的属性有六个：`backgroundColor`、`borderColor`、`shadowColor`，`CAShapeLayer` 的 `fillColor`、`strokeColor`，`CAGradientLayer` 的 `colors`。写法和视图上的颜色相同：写入[颜色字符串](ui-color.md)，读出来也是字符串。

**写错了不会抛异常。** 控制台输出一条警告，属性保持原来的值：

```
[Nacre] borderColor: "sytemBlue" is not a valid color, ignored; expected a color name, one of: …
```

`colors` 数组里只要有一个写错，整个数组都不写入，原来的渐变不变。

**图层上的颜色不随深浅色模式变化。** `'label'`、`'systemBackground'`、`'light-dark(#fff, #000)'` 这类颜色在浅色模式和深色模式下是两个不同的值。写进图层时，它被当场换算成其中一个具体的颜色，图层只保存这个结果。之后系统切换模式，图层的颜色不变。

- **换算时按哪种模式**：按这个图层所属视图当时的模式。视图自己的图层看这个视图；用 `new` 创建的图层沿父图层往上找，用找到的第一个视图。还没加到任何视图下面的图层，按系统当时的模式。
- **读出来是什么**：固定颜色读回来是表示同一个颜色的字符串，验收里写入 `'#FF2D55'` 读到的是 `'#FF2D55'`；不保证大小写和写法与写入时完全相同。随模式变化的颜色读回来是换算后的 `'#rrggbb'`，例如浅色模式下写 `'label'`，读到 `'#000000'`。

要让图层的颜色跟上模式切换，监听所属视图的 `traitchange` 事件（见 [`UITraitCollection`](ui-trait-collection.md#traitchange-事件)），在回调里把颜色再写一遍。写法见指南[用图层画圆角、阴影、渐变和形状](../guides/layers.md#切换深浅色后更新图层的颜色)。只要底色时，优先用 `view.backgroundColor`，不需要监听。

## 改属性时的过渡动画

用 `new` 创建的图层在屏幕上显示过之后，改它的属性不会立刻跳到新值。系统自动用一段动画从旧值过渡到新值，时长是 iOS 的默认值 0.25 秒（时长**未在模拟器验证**）。这种自动产生的动画叫隐式动画。

```js
const ring = new CAShapeLayer();
// ……设好路径并加到屏幕上，等它显示出来之后：
ring.strokeEnd = 0.5;   // 画面用一段动画过渡到 0.5，不是立刻跳过去
```

三种情况下没有隐式动画，改属性立刻生效：

- 图层还没有加到父图层下面。
- 图层刚加进去，还没有显示过。在 `sceneconnect` 的回调里一次建好界面时，所有图层都属于这种情况。
- 视图自己的图层（`view.layer`）。**这一条未在模拟器验证。**

要让某一次修改立刻生效，把它放进关闭了隐式动画的事务里，见 [`CATransaction`](ca-transaction.md#隐式动画)。要自己控制动画的时长和曲线，见 [`CAAnimation`](ca-animation.md)。

## 位置：`frame`、`bounds`、`position`

三个属性描述同一个矩形，单位都是[点（pt）](units.md)，y 轴朝下。

| 属性 | 含义 |
| --- | --- |
| `frame` | 图层在父图层坐标系里的位置和大小。`x`、`y` 是图层左上角的坐标 |
| `bounds` | 图层自己的坐标系。`width`、`height` 和 `frame` 相同，`x`、`y` 默认是 0 |
| `position` | 图层**中心点**在父图层坐标系里的坐标 |

```js
const layer = new CALayer();
layer.frame = new CGRect(1, 2, 3, 4);
console.log(String(layer.position));   // CGPoint(2.5, 4)

layer.position = new CGPoint(10, 10);
console.log(layer.frame.x);            // 8.5
```

**结果**：`frame` 的左上角是 (1, 2)、大小是 3 × 4 pt，所以中心点是 (2.5, 4)。把中心点移到 (10, 10)，大小不变，左上角的 x 变成 10 − 1.5 = 8.5。

摆放图层时用 `frame`。做位移动画时用 `position`：`frame` 不能做动画，见 [`CAAnimation`](ca-animation.md)。

## `contentsScale`：每个点用几个像素

`contentsScale` 表示图层的内容每 1 pt 用几个像素来画。iPhone 的屏幕上 1 pt 是 2 或 3 个像素。

- 用 `new` 创建的图层，`contentsScale` 默认是 1。
- 视图自己的图层，在 `sceneconnect` 的回调里读到的也是 1，所以不能用它来读屏幕是几倍的。

屏幕的倍数从视图的 [`traitCollection.displayScale`](ui-trait-collection/displayscale.md) 读：

```js
const card = new UIView();
const layer = new CAShapeLayer();
layer.contentsScale = card.traitCollection.displayScale;
console.log(layer.contentsScale);
```

**结果**：在 3 倍屏的 iPhone 上输出 `3`。

渐变图层和形状图层在 `contentsScale` 是 1 时画出来是否模糊，**未在模拟器验证**。验收用例里的渐变和形状都没有设过这个属性。

## 子类

### `CAGradientLayer`

[`CAGradientLayer`](ca-gradient-layer.md) 按 `colors` 在自己的 `frame` 范围内画渐变：沿一条直线、从中心向外，或者绕中心转一圈。

### `CAShapeLayer`

[`CAShapeLayer`](ca-shape-layer.md) 把 `path` 画出来：先填充路径围出的区域，再沿路径描边。折线图、饼图、进度环都用它画。

## 示例

### 渐变卡片上的折线

从空白 App 开始，做一张固定大小的卡片：圆角，渐变底色，上面画一条白色的折线。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 一张固定大小的卡片。圆角写在视图自己的图层上
  const card = new UIView();
  card.frame = new CGRect(20, 100, 300, 160);
  card.layer.cornerRadius = 16;
  card.clipsToBounds = true;          // 让子图层也按圆角裁掉
  page.view.addSubview(card);

  // 2. 渐变图层：从左上角的紫色到右下角的粉红色
  const gradient = new CAGradientLayer();
  gradient.colors = ['#5856D6', '#FF2D55'];
  gradient.startPoint = new CGPoint(0, 0);
  gradient.endPoint = new CGPoint(1, 1);
  gradient.frame = card.bounds;       // 子图层的大小要自己设
  card.layer.addSublayer(gradient);

  // 3. 一条折线。路径只描述形状
  const path = new UIBezierPath();
  path.moveToPoint(new CGPoint(24, 120));
  path.addLineToPoint(new CGPoint(96, 60));
  path.addLineToPoint(new CGPoint(168, 96));
  path.addLineToPoint(new CGPoint(276, 36));

  // 4. 形状图层把路径画出来
  const line = new CAShapeLayer();
  line.path = path;
  line.fillColor = null;              // 默认会用黑色填充，只要线条时必须去掉
  line.strokeColor = 'white';
  line.lineWidth = 3;
  line.lineCap = 'round';
  line.lineJoin = 'round';
  line.frame = card.bounds;
  card.layer.addSublayer(line);       // 后加的图层画在上面
});
```

**效果**

- 屏幕上方出现一张 300 × 160 pt 的卡片，四个角是半径 16 pt 的圆角。
- 卡片的底色从左上角的紫色渐变到右下角的粉红色。
- 渐变上面有一条 3 pt 粗的白色折线，共三段，线的两端和拐角是圆的。

这段代码没有作为一个整体在模拟器运行过。其中用到的每个 API 都在验收用例里运行过。

更多写法见指南[用图层画圆角、阴影、渐变和形状](../guides/layers.md)。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `view.layer` | `view.layer` |
| `[CALayer layer]` | `new CALayer()` |
| `[host addSublayer:a]` | `host.addSublayer(a)` |
| `[host insertSublayer:c atIndex:0]` | `host.insertSublayer(c, { atIndex: 0 })` |
| `[host insertSublayer:c above:b]` | `host.insertSublayer(c, { above: b })` |
| `[host insertSublayer:c below:a]` | `host.insertSublayer(c, { below: a })` |
| `[c removeFromSuperlayer]` | `c.removeFromSuperlayer()` |
| `layer.frame = CGRectMake(1, 2, 3, 4)` | `layer.frame = new CGRect(1, 2, 3, 4)` |
| `layer.position = CGPointMake(10, 10)` | `layer.position = new CGPoint(10, 10)` |
| `layer.hidden = YES` | `layer.isHidden = true` |
| `layer.backgroundColor = color.CGColor` | `layer.backgroundColor = '#5856D6'` |
| `layer.cornerRadius = 14` | `layer.cornerRadius = 14` |
| `layer.cornerCurve = kCACornerCurveContinuous` | `layer.cornerCurve = 'continuous'` |
| `layer.maskedCorners = kCALayerMinXMinYCorner \| kCALayerMaxXMinYCorner` | `layer.maskedCorners = ['minXMinY', 'maxXMinY']` |
| `layer.borderColor = UIColor.systemBlueColor.CGColor` | `layer.borderColor = 'systemBlue'` |
| `[UIColor colorWithCGColor:layer.borderColor]` | `layer.borderColor`（读到的是字符串） |
| `layer.shadowOffset = CGSizeMake(0, 4)` | `layer.shadowOffset = new CGSize(0, 4)` |
| `layer.contentsScale = view.traitCollection.displayScale` | `layer.contentsScale = view.traitCollection.displayScale` |
| `layer.contents = (id)image.CGImage` | `layer.contents = image` |

## 参见

- [用图层画圆角、阴影、渐变和形状](../guides/layers.md)
- [`CAGradientLayer`](ca-gradient-layer.md)、[`CAShapeLayer`](ca-shape-layer.md)：两个子类
- [`UIBezierPath`](ui-bezier-path.md)：路径怎么画
- [`CAAnimation`](ca-animation.md)：给图层的属性做动画
- [`CATransaction`](ca-transaction.md)：关闭隐式动画
- [`UIView`](ui-view.md)：`view.layer` 的来源，视图上和图层重叠的那几个属性
- [`UIColor`](ui-color.md)：颜色字符串的写法
- [`UIImage`](ui-image.md)：`contents` 的类型
- [`UITraitCollection`](ui-trait-collection.md)：`traitchange` 事件和 `displayScale`
- [结构体](structs.md)：`CGRect`、`CGPoint`、`CGSize`
- [单位](units.md)
