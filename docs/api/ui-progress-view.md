---
type: reference
native: UIProgressView
status: partial
---

# `UIProgressView`

**`UIProgressView`** 表示一条进度条：一条横线，从左边起有一段是填满的，填满的长度表示一件事完成了多少。完成的比例由 `progress` 属性给出，0 是还没开始，1 是全部完成。

进度条是[视图](ui-view.md)，位置、宽度、隐藏、透明度都来自视图。它不是控件：用户不能拖它，它也不派发事件。

不知道完成了多少、只知道还在进行时，用 [`UIActivityIndicatorView`](ui-activity-indicator-view.md)。

这一页里的数值和状态变化（高度、默认值、取值范围）是在模拟器（iPhone Air，iOS 27.2）上量的。画面上的样子（颜色、动画、图片怎么铺）**未在模拟器验证**。

## 进度从哪里来

进度条不会自己走。它显示的是 App 写进 `progress` 的值，App 每次得知任务前进了一步，就写一次新的值。

所以进度条适合能数出步骤的任务：一共 10 张图片，上传完第 3 张，进度是 0.3。

> **注意**：[`fetch()`](fetch.md) 目前得不到单个请求下载或上传了多少，见 [fetch 还不能做的](fetch.md#还不能做的)。一个请求内部的进度现在显示不出来，只能按「完成了几个请求」来算。

## 新建的进度条为什么看不见

新建的进度条 `frame` 的宽度是 0，高度是 4 pt。要给它宽度：

- 用 [Auto Layout](auto-layout.md) 定位时，约束它的左右两边或宽度。高度不用约束，它自己是 4 pt。
- 用 `frame` 定位时，写 `frame` 给出位置和宽度。

新建的进度条 `progress` 是 0，填满的那一段长度为 0，屏幕上只有一条浅色的底。

## 高度不能用 `frame` 改

进度条的高度由样式决定：`'default'` 样式是 4 pt。**写 `frame` 时高度不生效**，写 30 读回来还是 4，只有位置和宽度写得进去。

要更粗的进度条，加一条高度约束：

```js
bar.heightAnchor.constraintEqualToConstant(10).isActive = true;
```

写法见[改粗细](#改粗细)。

## `progress` 读回来和写进去的不完全一样

`progress` 存成 32 位浮点数。写 `0.3`，读回来是 `0.30000001192092896`。0.5、0.25 这类 32 位浮点数能精确表示的值读回来不变。

所以不要用 `bar.progress === 0.3` 判断。要比较，和 `Math.fround(0.3)` 比；要显示百分比，用 `Math.round(bar.progress * 100)`。

小于 0 的值按 0，大于 1 的值按 1，不抛异常。

## 推荐的做法

**用 Auto Layout 定位，约束左右两边。** 屏幕宽度变化时进度条跟着变宽。

**进度前进时用 `setProgress(value, { animated: true })`，回到 0 时不带动画。** 带动画时填满的那一段滑到新位置。从 1 回到 0 如果带动画，用户会看到进度条倒着走。

**自己保存完成了多少，进度条只负责显示。** 完成的个数、总数放在自己的变量里，每次更新时算出比例写给进度条。不要从 `bar.progress` 读回来再加，读回来的值有 32 位浮点数的误差。

**任务完成后把进度条隐藏或移除。** 进度条不会在到达 1 时自己消失。

## 完整例子

下面的代码从空白 App 开始，在页面上放一条进度条，每半秒前进一格，走满后停下。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 创建进度条
  const bar = new UIProgressView();

  // 2. 放到页面上：左右各留 24 pt，离安全区顶部 40 pt。高度不用给
  const safe = page.view.safeAreaLayoutGuide;
  bar.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(bar);
  NSLayoutConstraint.activateConstraints([
    bar.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 24 }),
    bar.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -24 }),
    bar.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 40 }),
  ]);

  // 3. 每半秒完成一步，一共 10 步
  const total = 10;
  let done = 0;
  const timer = setInterval(() => {
    done += 1;
    bar.setProgress(done / total, { animated: true });
    console.log('完成', done, '/', total);
    if (done === total) clearInterval(timer);
  }, 500);
});
```

**效果**

- 页面上方出现一条 4 pt 高的浅色横线，左右各留 24 pt。
- 每半秒，横线左边蓝色的那一段变长一格，控制台输出 `完成 1 / 10`、`完成 2 / 10`……
- 五秒后整条变成蓝色，停下。

安全区是屏幕上不被刘海、圆角和底部横条遮挡的区域，见 [`UIView` 的安全区](ui-view.md#安全区)。

这段代码没有作为一个整体在模拟器运行过。

三步分别是：创建、放到页面上、更新进度。后面的每种用法都是在这三步上改。

## 常见用法

以下例子都假设已经有上面的 `bar` 和 `page`。

### 直接设进度

```js
bar.progress = 0.5;
```

**效果**：填满的那一段立刻变成整条的一半，没有动画。

### 带动画改进度

```js
bar.setProgress(0.8, { animated: true });
console.log(bar.progress);
```

**效果**：填满的那一段滑到整条的 80%。控制台输出 `0.800000011920929`：`progress` 当场就是新的值，不是滑到一半的值。

不传第二个参数，或者 `animated` 是 `false`，等同于直接写 `progress`。

### 把「完成了几个」换算成进度

```js
const total = 8;
let done = 0;

function finishOne() {
  done += 1;
  bar.setProgress(done / total, { animated: true });
}
finishOne();
finishOne();
```

**效果**：调两次之后，填满的那一段是整条的四分之一。

### 旁边显示百分比

```js
const percent = new UILabel();
percent.text = Math.round(bar.progress * 100) + '%';
```

**效果**：`progress` 是 0.3 时，文字是 `30%`。

`Math.round()` 是必须的。`0.3` 读回来是 `0.30000001192092896`，直接乘 100 得到 `30.000001192092896`。

文字要在每次改进度之后重新设一遍，进度条不会通知。[`UILabel`](ui-label.md) 怎么放到页面上见它的文档。

### 换颜色

```js
bar.progressTintColor = 'systemGreen';
bar.trackTintColor = '#E5E5EA';
```

**效果**：填满的那一段是绿色，没填的那一段是浅灰色。

颜色的写法见[颜色](ui-color.md)。写 `null` 恢复系统默认的颜色。

### 改粗细

```js
NSLayoutConstraint.activateConstraints([
  bar.heightAnchor.constraintEqualToConstant(10),
]);
```

**效果**：进度条的高度变成 10 pt。

只有高度约束能改高度。用 `frame` 定位的进度条改不了高度。

更细的进度条用另一种样式：

```js
bar.progressViewStyle = 'bar';
```

**效果**：进度条变细，高度小于 4 pt。在 3 倍屏上量到的是 2.67 pt。

### 用 `frame` 定位

```js
const fixed = new UIProgressView();
fixed.frame = new CGRect(24, 200, 240, 4);
page.view.addSubview(fixed);
fixed.progress = 0.4;
```

**效果**：一条 240 pt 宽、4 pt 高的进度条，左上角在页面的 (24, 200) 处，填满 40%。

`CGRect` 的第四个参数（高度）写多少都不生效，进度条的高度总是样式决定的那个值。

### 完成后隐藏

```js
bar.setProgress(1, { animated: true });
setTimeout(() => {
  bar.isHidden = true;
  bar.progress = 0;
}, 600);
```

**效果**：进度条走满，0.6 秒后消失，进度回到 0。下次用时把 `isHidden` 设回 `false`，从头开始。**这个例子未在模拟器验证。**

等 0.6 秒是为了让用户看到走满的那一下。动画实际持续多久**未在模拟器验证**。

### 用图片代替颜色

```js
const filled = UIImage.imageNamed('progress-filled');
const empty = UIImage.imageNamed('progress-empty');
if (filled && empty) {
  bar.progressImage = filled;
  bar.trackImage = empty;
}
```

**效果**：填满的那一段用 `filled` 这张图，没填的那一段用 `empty` 这张图。**图片怎么拉伸和裁剪未在模拟器验证。**

图片从哪里来见 [`UIImage`](ui-image.md)。图片和颜色只能用一种，见[颜色和图片二选一](#颜色和图片二选一)。

## 概念

### 颜色和图片二选一

进度条的两段各有一个颜色属性和一个图片属性：

| | 颜色 | 图片 |
| --- | --- | --- |
| 填满的那一段 | `progressTintColor` | `progressImage` |
| 没填的那一段 | `trackTintColor` | `trackImage` |

同一段的颜色和图片只有一个有效，后写的那个生效：

- 写图片，同一段的颜色变成 `null`。
- 写颜色，同一段的图片变成 `null`。
- 把颜色写成 `null`，图片不受影响。

两段之间互不影响。

```js
bar.progressTintColor = 'systemRed';
const star = UIImage.systemImageNamed('star.fill');
if (star) bar.progressImage = star;
console.log(bar.progressTintColor);
```

**效果**：控制台输出 `null`。写图片时系统清掉了刚才写的颜色。

### 高度由样式决定

| 样式 | 高度 |
| --- | --- |
| `'default'`（默认） | 4 pt |
| `'bar'` | 小于 4 pt。3 倍屏上是 2.67 pt |

进度条每次被设置 `frame` 或 `bounds` 时，都把高度改回样式决定的值。高度约束不受这个限制。

读 `intrinsicContentSize` 得到的宽度是 -1，表示进度条对宽度没有要求，宽度由 `frame` 或约束给出。

所有尺寸的单位都是[点（pt）](units.md)。

## 成员说明

### 创建

#### `new UIProgressView()`

创建一条进度条。没有参数。样式是 `'default'`，`progress` 是 0，`frame` 宽 0、高 4 pt。

`UIProgressView` 不能被继承，`class X extends UIProgressView` 在 `new X()` 时抛 `TypeError`，见[原生类](native-classes.md)。

### 属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `progress` | 数 | 是 | 是 | `0` | 完成的比例，0 到 1，没有单位。小于 0 按 0，大于 1 按 1。存成 32 位浮点数。写这个属性没有动画。没有变化事件：改它的是 App 自己的代码 |
| `progressViewStyle` | `'default'` \| `'bar'` | 是 | 是 | `'default'` | `'default'`：高 4 pt。`'bar'`：更细，用在工具栏里 |
| `progressTintColor` | [颜色](ui-color.md)字符串或 `null` | 是 | 是 | `null` | 填满的那一段的颜色。`null` 表示用系统默认的颜色。写入一个颜色时，`progressImage` 变成 `null` |
| `trackTintColor` | [颜色](ui-color.md)字符串或 `null` | 是 | 是 | `null` | 没填的那一段的颜色。`null` 表示用系统默认的颜色。写入一个颜色时，`trackImage` 变成 `null` |
| `progressImage` | [`UIImage`](ui-image.md) 或 `null` | 是 | 是 | `null` | 填满的那一段用的图片。写入一张图片时，`progressTintColor` 变成 `null` |
| `trackImage` | [`UIImage`](ui-image.md) 或 `null` | 是 | 是 | `null` | 没填的那一段用的图片。写入一张图片时，`trackTintColor` 变成 `null` |

写错时：

- `progress` 写了转不成有限数的值（`undefined`、`NaN`、`Infinity`、`'half'`），抛 `TypeError: progress must be a finite number, got undefined`，原值不变。`'0.25'` 这样的字符串按数处理，`null` 按 0 处理。
- `progressViewStyle` 写了别的值，不抛，在控制台输出一条警告 `[Nacre] progressViewStyle has no value "thick"; expected one of: default / bar, ignored`，原值不变。
- 两个颜色属性写了不合法的颜色，不抛，在控制台输出一条警告，原值不变，见[颜色](ui-color.md#写错不抛打警告)。
- 两个图片属性写了 `UIImage` 和 `null` 以外的值，抛 `TypeError`，原值不变。写别的原生对象时信息是 `progressImage needs a UIImage or null`，写字符串等普通值时是 `progressImage needs a native object or null, got "star.fill"`。

位置、宽度、隐藏、透明度等继承自 [`UIView`](ui-view.md)。

### 方法

#### `setProgress(progress, options)`

改进度，可以带动画。

```js
bar.setProgress(0.8, { animated: true });
```

- **`progress`**：数，0 到 1。小于 0 按 0，大于 1 按 1。
- **`options.animated`**：布尔，可以不传。`true` 时填满的那一段滑到新位置；不传或 `false` 时直接跳到新位置。
- **返回**：无。
- 带动画时，`progress` 属性在调用返回时已经是新的值。没有「动画结束」的通知。
- **出错**：`progress` 转不成有限数时抛 `TypeError: progress must be a finite number, got undefined`，进度不变。

## 与 iOS 原生写法的对照

如果你在看 Apple 的文档或 iOS 的示例代码，按这张表换成 JS 的写法。

| ObjC | JS |
| --- | --- |
| `[[UIProgressView alloc] init]` | `new UIProgressView()` |
| `[[UIProgressView alloc] initWithProgressViewStyle:UIProgressViewStyleBar]` | `const bar = new UIProgressView(); bar.progressViewStyle = 'bar';` |
| `bar.progress = 0.5f` | `bar.progress = 0.5` |
| `[bar setProgress:0.8f animated:YES]` | `bar.setProgress(0.8, { animated: true })` |
| `bar.progressViewStyle = UIProgressViewStyleBar` | `bar.progressViewStyle = 'bar'` |
| `bar.progressTintColor = UIColor.systemGreenColor` | `bar.progressTintColor = 'systemGreen'` |
| `bar.trackTintColor = nil` | `bar.trackTintColor = null` |
| `bar.progressImage = image` | `bar.progressImage = image` |
| `bar.trackImage = image` | `bar.trackImage = image` |

`initWithProgressViewStyle:` 创建的进度条 `frame` 宽 160 pt，`new UIProgressView()` 创建的宽 0。两种写法在给了宽度之后没有区别。

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 让进度条自动跟随一个任务的进度对象 | `observedProgress`（`NSProgress`） | 未实现 |
| 显示一个网络请求下载或上传了多少 | `NSURLSessionTask` 的进度 | 未实现，见 [fetch 还不能做的](fetch.md#还不能做的) |

## 参见

- [`UIActivityIndicatorView`](ui-activity-indicator-view.md)：不知道完成了多少时用它
- [`UIView`](ui-view.md)：进度条的父类，位置、宽度、隐藏
- [Auto Layout](auto-layout.md)：约束左右两边和高度的写法
- [颜色](ui-color.md)
- [`UIImage`](ui-image.md)：`progressImage` 和 `trackImage` 的类型
- [单位](units.md)
- [实现原理：转圈和进度条](../internals/indicators.md)
