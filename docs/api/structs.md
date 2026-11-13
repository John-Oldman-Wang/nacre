---
type: concept
status: partial
---

# 结构体

**结构体**表示由几个数值组成的一个值：一个点、一个尺寸、一个矩形、一组边距、一个变换矩阵。视图的位置（`frame`）、滚动位置（`contentOffset`）、边距（`layoutMargins`）、变换（`transform`）这些属性的值都是结构体。

每种结构体是一个全局的类，用 `new` 构造。结构体只装数值，不对应界面上的任何东西：把一个 `CGRect` 赋给 `view.frame`，视图记下的是那四个数，之后这个 `CGRect` 对象和视图不再有关系。

| 类 | 字段 | 表示 | 单位 |
| --- | --- | --- | --- |
| `CGPoint` | `x` `y` | 一个点 | [pt](units.md) |
| `CGSize` | `width` `height` | 一个尺寸 | pt |
| [`CGRect`](#cgrect) | `x` `y` `width` `height` | 一个矩形：左上角的位置加尺寸 | pt |
| `UIEdgeInsets` | `top` `left` `bottom` `right` | 四条边各自向内缩进多少 | pt |
| `NSDirectionalEdgeInsets` | `top` `leading` `bottom` `trailing` | 同上，左右换成按文字方向区分的两侧 | pt |
| [`CGAffineTransform`](#cgaffinetransform) | `a` `b` `c` `d` `tx` `ty` | 二维仿射变换矩阵 | `tx` `ty` 是 pt，其余是比例 |
| `CAFrameRateRange` | `minimum` `maximum` `preferred` | 帧率区间，见 [`CADisplayLink`](ca-animation.md) | 帧每秒 |

`leading` 是文字开始的一侧，`trailing` 是文字结束的一侧。在从左往右书写的语言里 `leading` 是左、`trailing` 是右，在从右往左书写的语言里两者对调。

## 完整例子

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const box = new UIView();
  box.backgroundColor = 'systemIndigo';
  page.view.addSubview(box);

  // 1. 用结构体的实例写入
  box.frame = new CGRect(40, 100, 200, 120);

  // 2. 读出来的是 CGRect 的实例
  const f = box.frame;
  console.log(String(f), f.width, f.origin.x);

  // 3. 只改一个字段：用其余字段的旧值构造一个新的，整体赋回去
  box.frame = new CGRect(f.x, 300, f.width, f.height);

  // 4. 写入时也可以给带同名字段的普通对象
  box.frame = { x: 40, y: 300, width: 200, height: 60 };
});
```

**效果**

- 屏幕上有一个靛蓝色的矩形，左边距屏幕左边 40 pt，上边距屏幕顶部 300 pt，宽 200 pt，高 60 pt。
- 控制台输出 `CGRect(40, 100, 200, 120) 200 40`。

下面各节的例子沿用这里的 `box`。

## 字段只读，要改就整体换一个

结构体的字段不能赋值。赋值会抛 `TypeError`：

```js
try {
  // @ts-expect-error 字段是只读的，类型检查也会报错
  box.frame.x = 10;
} catch (err) {
  console.log(String(err));
}
```

**结果**

- 控制台输出 `TypeError: x is read-only: structs are values, assign a whole new one instead`。
- `box` 的位置不变。

不允许赋值的原因是：`box.frame` 每次读出的是视图当前位置的一份副本。即使能改这份副本，视图也不会移动。运行时让这种写法报错，而不是让它不起作用又不提示。

**推荐的写法**是读出旧值，用它的字段构造一个新的，再整体赋回去：

```js
const f = box.frame;
box.frame = new CGRect(10, f.y, f.width, f.height);
```

**效果**

- `box` 的左边移到 10 pt 处，上边、宽、高不变。

只想移动而不改尺寸时，可以写 `center`，它只有两个字段：

```js
box.center = new CGPoint(box.center.x + 20, box.center.y);
```

**效果**

- `box` 向右移动 20 pt。

结构体对象上也不能添加新的属性：`f.note = 1` 同样抛 `TypeError`。

## 写入时可以给普通对象

接受结构体的属性和方法参数，既接受结构体的实例，也接受带同名字段的普通对象。两种写法的结果相同：

```js
box.frame = new CGRect(60, 270, 160, 80);
box.frame = { x: 60, y: 270, width: 160, height: 80 };
```

**效果**

- 两行都把 `box` 放到 (60, 270)，宽 160 pt，高 80 pt。

两种写法写进去的值相同，按可读性选：字段多、容易记错顺序时写普通对象，字段名直接出现在代码里；数值少而明确时写 `new CGPoint(x, y)`。

普通对象的规则：

| 情况 | 结果 |
| --- | --- |
| 字段齐全，值是有限的数 | 写入成功 |
| 少一个字段 | 抛 `TypeError`，不会把缺少的字段当成 0 |
| 字段的值不是有限的数（`NaN`、`Infinity`、`undefined`、`'abc'`） | 抛同一个 `TypeError` |
| 字段的值是能转成数的字符串（`'60'`） | 按数使用。类型检查会报错，不推荐这样写 |
| 多出别的字段 | 多出的字段被忽略 |
| 给的不是对象（`null`、数、字符串） | 抛 `TypeError` |

报错信息以属性名或方法名开头：

```js
try {
  // @ts-expect-error 少了 height，类型检查也会报错
  box.frame = { x: 60, y: 270, width: 160 };
} catch (err) {
  console.log(String(err));
}

try {
  // @ts-expect-error 不是对象
  box.frame = null;
} catch (err) {
  console.log(String(err));
}
```

**结果**

- 第一段输出 `TypeError: frame is missing height, or it is not a finite number`。
- 第二段输出 `TypeError: frame needs an object with all of: x, y, width, height`。
- 两次赋值都没有生效，`box.frame` 保持原值。

少字段和类型不对在写代码时就能发现：开启[类型检查](native-classes.md)后，编辑器会在这两处报错。

## 读出来的是新对象

读一个结构体属性，每次得到一个新建的实例。它记录的是读取那一刻的值，之后视图移动了，这个实例里的数不会跟着变。

```js
const before = box.frame;
box.frame = new CGRect(0, 0, 50, 50);

console.log(before.width);                 // 读取时的值
console.log(box.frame === box.frame);      // 两次读是两个对象
console.log(box.frame instanceof CGRect);
```

**结果**

- 第一行输出改之前的宽度，不是 `50`。
- 第二行输出 `false`。
- 第三行输出 `true`。写入时给的是普通对象，读出来也是 `CGRect` 的实例。

所以结构体不能用 `===` 比较。比较两个结构体是否相等，逐个比较字段，或者比较它们转成的字符串：

```js
const a = new CGPoint(10, 20);
const b = new CGPoint(10, 20);

console.log(a === b);                         // false
console.log(a.x === b.x && a.y === b.y);      // true
console.log(String(a) === String(b));         // true
```

**结果**

- 依次输出 `false`、`true`、`true`。

## 构造函数的参数

构造函数的参数按「数」转换：

| 给的值 | 结果 |
| --- | --- |
| 不给（`undefined`） | 这个字段是 0。`new CGPoint()` 得到 `CGPoint(0, 0)` |
| 能转成数的值（`'3'`、`null`、`true`） | 按 `Number()` 的结果使用：`3`、`0`、`1`。类型检查会报错，不推荐这样写 |
| 转不成有限的数（`NaN`、`Infinity`、`'abc'`） | 抛 `TypeError: a struct field must be a finite number, got NaN`（末尾是收到的值） |

构造函数和「写入时给普通对象」的区别在于缺少的值：构造函数把没给的参数当成 0，普通对象少字段会抛错。

## 数值精度

结构体的字段是普通的 JS 数（64 位浮点数）。整数值写入后读回是同一个数。

带小数的值经过系统的计算后，读回来可能和写入的值在末尾几位上不同。验收用例对变换矩阵的往返只比较到小数点后 4 位；逐位相等**未在模拟器验证**。比较带小数的字段时留出容差：

```js
box.transform = CGAffineTransform.rotation(Math.PI / 6);
const t = box.transform;
console.log(Math.abs(t.a - Math.cos(Math.PI / 6)) < 0.0001);
```

**结果**

- 输出 `true`。

## 转成字符串和 JSON

每种结构体转成字符串时是「类名(字段值, …)」，字段按构造函数的参数顺序排列。`JSON.stringify` 输出各个字段：

```js
const r = new CGRect(10, 20, 100, 50);

console.log(String(r));
console.log(JSON.stringify(r));
console.log(String(new UIEdgeInsets(8, 16, 8, 16)));
```

**结果**

- 第一行输出 `CGRect(10, 20, 100, 50)`。
- 第二行输出 `{"x":10,"y":20,"width":100,"height":50}`。`origin` 和 `size` 不出现在 JSON 里。
- 第三行输出 `UIEdgeInsets(8, 16, 8, 16)`。

## `CGRect`

`CGRect` 表示一个矩形。`x`、`y` 是矩形左上角的坐标，`width`、`height` 是宽和高，单位都是 [pt](units.md)。坐标原点在左上角，`y` 向下增大。

```js
const r = new CGRect(10, 20, 100, 50);

console.log(r.x, r.y, r.width, r.height);
console.log(String(r.origin), String(r.size));
console.log(r.origin.x === r.x);
```

**结果**

- 第一行输出 `10 20 100 50`。
- 第二行输出 `CGPoint(10, 20) CGSize(100, 50)`。
- 第三行输出 `true`。

| 成员 | 类型 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `new CGRect(x, y, width, height)` | | | | 构造 |
| `x` `y` | 数 | 是 | 否 | 左上角的坐标，pt |
| `width` `height` | 数 | 是 | 否 | 宽和高，pt |
| `origin` | `CGPoint` | 是 | 否 | 左上角，等于 `(x, y)`。每次读得到一个新的 `CGPoint` |
| `size` | `CGSize` | 是 | 否 | 尺寸，等于 `(width, height)`。每次读得到一个新的 `CGSize` |

`origin`、`size` 和四个直接字段给出的是同一组数，用哪一种都可以。写入时给普通对象只认四个直接字段：`{ origin, size }` 这种形状不被接受，会按「少字段」抛错。

用到 `CGRect` 的地方：[`UIView`](ui-view.md) 的 `frame` 和 `bounds`、[`CALayer`](ca-layer.md) 的 `frame` 和 `bounds`、[`UIBezierPath`](ui-bezier-path.md) 的矩形和椭圆路径、[`UIScrollView`](ui-scroll-view.md) 的 `scrollRectToVisible()`。

## `CGPoint`、`CGSize` 和两种边距

```js
const p = new CGPoint(10, 20);
const s = new CGSize(100, 50);
const insets = new UIEdgeInsets(8, 16, 8, 16);
const margins = new NSDirectionalEdgeInsets(8, 16, 8, 16);

console.log(p.x, s.height, insets.left, margins.leading);
```

**结果**

- 输出 `10 50 16 16`。

| 构造 | 参数顺序 | 用在哪 |
| --- | --- | --- |
| `new CGPoint(x, y)` | 横坐标、纵坐标 | `center`、`contentOffset`、`convertPoint()`、路径上的点 |
| `new CGSize(width, height)` | 宽、高 | `contentSize`、`sizeThatFits()`、图层的 `shadowOffset` |
| `new UIEdgeInsets(top, left, bottom, right)` | 上、左、下、右 | `layoutMargins`、`safeAreaInsets`、`contentInset` |
| `new NSDirectionalEdgeInsets(top, leading, bottom, trailing)` | 上、文字开始侧、下、文字结束侧 | `directionalLayoutMargins` |

边距的四个参数从上边开始，按逆时针方向排列：上、左、下、右。

界面需要支持从右往左书写的语言时，用 `NSDirectionalEdgeInsets`，它的两侧会随文字方向对调；`UIEdgeInsets` 的 `left` 和 `right` 固定是屏幕的左和右。从右往左的语言下的对调效果**未在模拟器验证**。

所有字段可读、不可写。

## `CGAffineTransform`

`CGAffineTransform` 表示一个二维仿射变换：缩放、旋转、平移，以及它们的组合。[`UIView`](ui-view.md) 的 `transform` 属性的值是它。六个字段是下面这个矩阵里的六个数：

```
| a  b  0 |
| c  d  0 |
| tx ty 1 |
```

日常使用不需要直接填这六个数。用三个静态方法造出基本变换，再用 `concat()` 组合：

```js
box.transform = CGAffineTransform.rotation(Math.PI / 6);
box.transform = CGAffineTransform.scale(1.2);
box.transform = CGAffineTransform.scale(1.2)
  .concat(CGAffineTransform.rotation(Math.PI / 6));
box.transform = CGAffineTransform.identity;
```

**效果**

- 第一行：`box` 绕自己的中心顺时针转 30°。
- 第二行：`box` 以中心为基准放大到 1.2 倍。每次赋值替换之前的变换，不累加，所以这时不再旋转。
- 第三行：`box` 放大到 1.2 倍并旋转 30°。
- 第四行：`box` 恢复原样。

变换不改变 `bounds` 和 `center`。变换不是单位矩阵时，`frame` 读出来的是变换之后的外接矩形，详见 [`UIView`](ui-view.md)。

### 成员

| 成员 | 返回 | 含义 |
| --- | --- | --- |
| `CGAffineTransform.identity` | `CGAffineTransform` | 单位矩阵，表示不做任何变换。只读。每次读得到一个新的实例 |
| `CGAffineTransform.scale(sx, sy?)` | `CGAffineTransform` | 缩放。`sx`、`sy` 是横向和纵向的倍数（比例，1 表示不变）。只给一个参数时两个方向相同 |
| `CGAffineTransform.translation(tx, ty)` | `CGAffineTransform` | 平移。`tx`、`ty` 的单位是 pt |
| `CGAffineTransform.rotation(radians)` | `CGAffineTransform` | 旋转。参数是[弧度](units.md)，正值在屏幕上是顺时针。角度换算成弧度：`角度 * Math.PI / 180` |
| `t.concat(other)` | `CGAffineTransform` | 返回一个新变换：先做 `t`，再做 `other`。`t` 本身不变 |
| `t.invert()` | `CGAffineTransform` 或 `null` | 返回逆变换。`t` 不可逆（行列式为 0，比如 `scale(0)`）时返回 `null` |
| `t.isIdentity` | 布尔 | `t` 是不是单位矩阵。只读 |
| `new CGAffineTransform(a, b, c, d, tx, ty)` | | 直接给出六个数。上面的方法组合不出需要的变换时使用 |
| `a` `b` `c` `d` `tx` `ty` | 数 | 矩阵的六个数。可读，不可写 |

静态方法的参数转不成有限的数时，抛 `TypeError: a struct field must be a finite number, got …`。

### `concat` 的顺序

`concat` 的两种顺序得到的结果不同：

```js
const scale = CGAffineTransform.scale(2);
const move = CGAffineTransform.translation(10, 20);

console.log(scale.concat(move).tx, scale.concat(move).ty);
console.log(move.concat(scale).tx, move.concat(scale).ty);
```

**结果**

- 第一行输出 `10 20`：先缩放再平移，平移量不受缩放影响。
- 第二行输出 `20 40`：先平移再缩放，平移量也被放大了 2 倍。

### 不可逆的情况

`invert()` 的返回值可能是 `null`，使用之前先判空：

```js
const back = CGAffineTransform.scale(2).invert();
if (back !== null) {
  console.log(back.a);
}

console.log(CGAffineTransform.scale(0).invert());
```

**结果**

- 第一段输出 `0.5`。
- 第二段输出 `null`。

## 与 iOS 原生写法的对照

| ObjC | JS |
| --- | --- |
| `CGPointMake(10, 20)` | `new CGPoint(10, 20)` |
| `CGSizeMake(100, 50)` | `new CGSize(100, 50)` |
| `CGRectMake(0, 0, 100, 50)` | `new CGRect(0, 0, 100, 50)` |
| `UIEdgeInsetsMake(8, 16, 8, 16)` | `new UIEdgeInsets(8, 16, 8, 16)` |
| `NSDirectionalEdgeInsetsMake(8, 16, 8, 16)` | `new NSDirectionalEdgeInsets(8, 16, 8, 16)` |
| `rect.origin.x` | `rect.origin.x` 或 `rect.x` |
| `rect.size.width` | `rect.size.width` 或 `rect.width` |
| `view.frame = CGRectMake(…)` | `view.frame = new CGRect(…)` 或 `= { x, y, width, height }` |
| `CGAffineTransformIdentity` | `CGAffineTransform.identity` |
| `CGAffineTransformMakeScale(sx, sy)` | `CGAffineTransform.scale(sx, sy)` |
| `CGAffineTransformMakeTranslation(tx, ty)` | `CGAffineTransform.translation(tx, ty)` |
| `CGAffineTransformMakeRotation(r)` | `CGAffineTransform.rotation(r)` |
| `CGAffineTransformConcat(t1, t2)` | `t1.concat(t2)` |
| `CGAffineTransformInvert(t)`（不可逆时返回 `t` 本身） | `t.invert()`（不可逆时返回 `null`） |
| `CGAffineTransformIsIdentity(t)` | `t.isIdentity` |

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 三维变换（透视、绕 x 或 y 轴翻转） | `CATransform3D`、`CALayer.transform` |
| 用向量、范围、偏移这几种结构体 | `CGVector`、`NSRange`、`UIOffset` |
| 矩形的几何运算（求交集、判断包含、向内缩进） | `CGRectIntersection`、`CGRectContainsPoint`、`CGRectInset` 等 C 函数。可以在 JS 里按字段自己计算 |
| 用预定义的零值常量 | `CGPointZero`、`CGRectZero`、`UIEdgeInsetsZero`。用 `new CGPoint()`、`new CGRect()` 代替，没给的参数是 0 |

## 参见

- [单位](units.md)：pt 是什么、弧度和角度。
- [`UIView`](ui-view.md)：`frame`、`bounds`、`center`、`transform` 的含义，以及变换对 `frame` 的影响。
- [原生类](native-classes.md)：数、字符串、对象这几类参数的转换规则，以及怎么开启类型检查。
- [实现说明](../internals/structs.md)：字段为什么做成只读、变换为什么在 JS 里计算。
