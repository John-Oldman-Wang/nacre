---
type: concept
---

# 单位

Nacre 的 API 里，数值的单位和 iOS 一致：长度是点（pt），角度是弧度，动画的时间是秒。JS 自带的 API（定时器、`performance.now()`）保持 Web 的单位，时间是毫秒。各类文档里的每个数值属性都标了单位，这一页给出每种单位的定义和换算方法。

## 长度和坐标：点

所有长度、坐标、尺寸、间距的单位都是**点**（point，写作 pt）。包括 `frame`、`bounds`、`center`、`contentOffset`、`spacing`、`cornerRadius`、`borderWidth`、约束的 `constant`、字体大小。

点是和屏幕像素密度无关的长度单位。1 pt 在屏幕上占几个像素由设备决定，系统在显示时自动换算。布局代码只使用点，不需要按设备调整数值。

API 里没有以像素为单位的长度。唯一和像素直接有关的值是下面的屏幕倍率。

### 1 pt 等于几个像素

屏幕倍率表示 1 pt 在每个方向上占几个像素。倍率是 3 时，1 pt 是 3 × 3 个像素。从任意视图、页面或场景的 [`traitCollection.displayScale`](ui-trait-collection.md) 读取：

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const scale = page.view.traitCollection.displayScale;
  console.log(scale);
});
```

**结果**

- 在 iPhone Air 的模拟器上输出 `3`。其他设备上的值**未在模拟器验证**。

还没有加到界面上的视图也读得到这个值。

需要用到倍率的情况有两种：

**自己创建的图层。** `new CALayer()` 创建的图层，`contentsScale` 默认是 1，不随屏幕变化。内容需要按屏幕的像素密度绘制的图层（比如文字、形状），把它设成屏幕倍率：

```js
const view = new UIView();
const layer = new CAShapeLayer();
layer.contentsScale = view.traitCollection.displayScale;
view.layer.addSublayer(layer);
```

**效果**

- `layer` 按屏幕的实际像素密度绘制。设置前后的清晰度差别**未在模拟器验证**。

**画一条 1 像素宽的线。** 1 像素等于 `1 / displayScale` pt：

```js
const line = new UIView();
const hairline = 1 / line.traitCollection.displayScale;
line.frame = { x: 0, y: 100, width: 300, height: hairline };
line.backgroundColor = 'separator';
```

**效果**

- `line` 的高度是 1 个像素（倍率是 3 时约 0.33 pt）。实际显示的粗细**未在模拟器验证**。

倍率不要写成固定的 `3`，从 `displayScale` 读。

### 图片的尺寸

[`UIImage`](ui-image.md) 的 `size` 单位也是点，不是图片文件的像素数。图片有自己的倍率：一张 2 × 2 像素的图片，按倍率 1 加载时 `size` 是 2 × 2 pt，按倍率 2 加载时 `size` 是 1 × 1 pt。

### 点值会不会被系统改掉

写入的点值读回来还是原来的数，系统不会因为屏幕或显示设置改变属性里的值。

| 情况 | 属性里的点值 | 屏幕上的大小 |
| --- | --- | --- |
| 视图自己或祖先视图设了 `transform` 缩放 | 不变。`bounds` 和 `center` 不受 `transform` 影响 | 跟着缩放。这时 `frame` 读出来是变换之后的外接矩形，见 [`UIView`](ui-view.md) |
| 用户在系统设置里调大文字 | 不变 | 间距和尺寸不变。**未在模拟器验证** |
| 用户在系统设置里开启「放大显示」 | 不变 | 屏幕的总点数变少，所有内容等比变大。**未在模拟器验证** |

要在用户调整文字大小时得到通知，监听 `traitchange` 事件，见 [`UITraitCollection`](ui-trait-collection.md)。

### 小数

点值可以是小数，比如 `0.5`、`1 / 3`。

### 坐标方向

原点在左上角，`x` 向右增大，`y` 向下增大。视图的 `frame` 以父视图的左上角为原点。

## 角度：弧度

角度的单位都是**弧度**。包括 [`CGAffineTransform.rotation()`](structs.md#cgaffinetransform) 的参数、[`UIBezierPath`](ui-bezier-path.md) 画圆弧的起止角。

从角度换算成弧度：

```js
/** @param {number} degrees */
const toRadians = (degrees) => degrees * Math.PI / 180;

console.log(toRadians(180) === Math.PI);
console.log(toRadians(90) === Math.PI / 2);
```

**结果**

- 输出两个 `true`。

因为 `y` 轴向下，角度增大的方向在屏幕上是顺时针：0 弧度指向正右方，`Math.PI / 2` 指向正下方。

## 时间：秒和毫秒

时间有两种单位，按 API 的来源区分：

| 单位 | 用在哪 | 例子 |
| --- | --- | --- |
| 秒 | iOS 的 API | 动画的 `duration`、`beginTime`；`CADisplayLink` 的 `timestamp`；长按手势的 `minimumPressDuration` |
| 毫秒 | JS 和 Web 的 API | `setTimeout()` 和 `setInterval()` 的延迟；`performance.now()` 的返回值；`AbortSignal.timeout()` 的参数 |

```js
const fade = CABasicAnimation.animationWithKeyPath('opacity');
fade.duration = 0.3;                 // 0.3 秒

setTimeout(() => {
  console.log('done');
}, 300);                             // 300 毫秒
```

**结果**

- `fade` 是一个时长 0.3 秒的动画。
- 300 毫秒之后控制台输出 `done`。两者表示的是同样长的时间。

> **注意**：动画时长是秒，定时器延迟是毫秒，相差 1000 倍。把 `300` 写进 `duration` 得到的是 5 分钟的动画。

表示时刻的值也有两种：

| 值 | 单位 |
| --- | --- |
| `performance.timeOrigin`、文件信息的 `modified` | 从 1970 年起的毫秒数，可以直接交给 `new Date()` |
| cookie 的 `expirationDate` | 从 1970 年起的秒数 |
| `CADisplayLink` 的 `timestamp` | 从设备启动起的秒数，不能和 `Date.now()` 比较 |

## 没有单位的数

| 量 | 取值 | 例子 |
| --- | --- | --- |
| 不透明度 | 0 到 1 的比例。0 是完全透明，1 是完全不透明 | `alpha`、图层的 `opacity`、`shadowOpacity` |
| 缩放倍数 | 比例，1 表示原大小 | `CGAffineTransform.scale()` 的参数 |
| 图层的单位坐标 | 0 到 1 的比例，相对图层自身的宽和高。`(0, 0)` 是左上角，`(1, 1)` 是右下角 | `CAGradientLayer` 的 `startPoint`、`endPoint` |
| 触感强度 | 0 到 1 的比例 | `impactOccurredWithIntensity()` 的参数 |
| 布局优先级 | 1 到 1000 的数，越大越优先，1000 表示必须满足 | 约束的 `priority`，见 [Auto Layout](auto-layout.md) |
| 帧率 | 帧每秒 | `CAFrameRateRange` 的三个字段 |
| 个数、下标 | 整数。给了小数会去掉小数部分 | `numberOfLines`、`insertSubview()` 的 `atIndex` |

部分比例值由系统用较低的精度保存，读回来的数和写入的数在末尾几位上不同：`alpha` 写 `0.6`，读回 `0.6000000238418579`。比较这类值时留出容差，不要用 `===`。

## 与 iOS 原生写法的对照

单位和 iOS 的 API 相同，没有换算。

| ObjC | JS |
| --- | --- |
| `CGFloat`（点） | 数，单位 pt |
| `NSTimeInterval`、`CFTimeInterval`（秒） | 数，单位秒 |
| `traitCollection.displayScale` | `traitCollection.displayScale` |
| `M_PI` | `Math.PI` |

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 读屏幕的像素尺寸和点尺寸 | `UIScreen` 的 `bounds`、`nativeBounds`。可以读窗口根视图的 `bounds` 得到窗口的点尺寸 |

## 参见

- [结构体](structs.md)：`CGRect`、`CGPoint` 等值的字段都以 pt 为单位。
- [`UITraitCollection`](ui-trait-collection.md)：`displayScale` 和其他外观特征，以及变化时的通知。
- [`UIImage`](ui-image.md)：图片的 `size` 和倍率。
- [动画](ca-animation.md)：以秒为单位的时间属性。
- [定时器](timers.md)：以毫秒为单位的延迟。
