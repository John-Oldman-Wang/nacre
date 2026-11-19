---
type: reference
---

# 结构体

**结构体**表示由几个数值组成的一个值：一个点、一个尺寸、一个矩形、一组边距、一个变换矩阵。视图的位置（`frame`）、滚动位置（`contentOffset`）、边距（`layoutMargins`）、变换（`transform`）这些属性的值都是结构体。

每种结构体是一个全局的类，用 `new` 构造。结构体只装数值，不对应界面上的任何东西：把一个 `CGRect` 赋给 `view.frame`，视图记下的是那四个数，之后这个 `CGRect` 对象和视图不再有关系。

| 类 | 字段 | 表示 | 单位 |
| --- | --- | --- | --- |
| [`CGPoint`](cg-point.md) | `x` `y` | 一个点 | [pt](units.md) |
| [`CGSize`](cg-size.md) | `width` `height` | 一个尺寸 | pt |
| [`CGRect`](cg-rect.md) | `x` `y` `width` `height` | 一个矩形：左上角的位置加尺寸 | pt |
| [`UIEdgeInsets`](ui-edge-insets.md) | `top` `left` `bottom` `right` | 四条边各自向内缩进多少 | pt |
| [`NSDirectionalEdgeInsets`](ns-directional-edge-insets.md) | `top` `leading` `bottom` `trailing` | 同上，左右换成按文字方向区分的两侧 | pt |
| [`CGAffineTransform`](cg-affine-transform.md) | `a` `b` `c` `d` `tx` `ty` | 二维仿射变换矩阵 | `tx` `ty` 是 pt，其余是比例 |
| [`CAFrameRateRange`](ca-frame-rate-range.md) | `minimum` `maximum` `preferred` | 帧率区间，见 [`CADisplayLink`](ca-animation.md) | 帧每秒 |

每个类的构造函数和字段见各自的页面。这一页讲所有结构体共同的规则。

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

各个结构体自己的对照见它的页面。

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 三维变换（透视、绕 x 或 y 轴翻转） | `CATransform3D`、`CALayer.transform` |
| 用向量、范围、偏移这几种结构体 | `CGVector`、`NSRange`、`UIOffset` |
| 矩形的几何运算（求交集、判断包含、向内缩进） | `CGRectIntersection`、`CGRectContainsPoint`、`CGRectInset` 等 C 函数。可以在 JS 里按字段自己计算 |
| 用预定义的零值常量 | `CGPointZero`、`CGRectZero`、`UIEdgeInsetsZero`。用 `new CGPoint()`、`new CGRect()` 代替，没给的参数是 0 |

## 参见

- [单位](units.md)：pt 是什么、弧度和角度。
- 各结构体的类页：[`CGPoint`](cg-point.md)、[`CGSize`](cg-size.md)、[`CGRect`](cg-rect.md)、[`UIEdgeInsets`](ui-edge-insets.md)、[`NSDirectionalEdgeInsets`](ns-directional-edge-insets.md)、[`CGAffineTransform`](cg-affine-transform.md)、[`CAFrameRateRange`](ca-frame-rate-range.md)。
- [`UIView`](ui-view.md)：`frame`、`bounds`、`center`、`transform` 的含义，以及变换对 `frame` 的影响。
- [原生类](native-classes.md)：数、字符串、对象这几类参数的转换规则，以及怎么开启类型检查。
- [实现说明](../internals/structs.md)：字段为什么做成只读、变换为什么在 JS 里计算。
