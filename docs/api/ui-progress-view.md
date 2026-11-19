---
type: reference
native: UIProgressView
status: partial
---

# `UIProgressView`

**`UIProgressView`** 表示一条进度条：一条横线，从左边起有一段是填满的，填满的长度表示一件事完成了多少。完成的比例由 [`progress`](ui-progress-view/progress.md) 属性给出，0 是还没开始，1 是全部完成。

进度条不会自己走。它显示的是 App 写进 `progress` 的值，App 每次得知任务前进了一步，就写一次新的值。所以它适合能数出步骤的任务：一共 10 张图片，上传完第 3 张，进度是 0.3。不知道完成了多少、只知道还在进行时，用 [`UIActivityIndicatorView`](ui-activity-indicator-view.md)。

> **注意**：[`fetch()`](fetch.md) 目前得不到单个请求下载或上传了多少，见 [fetch 还不能做的](fetch.md#还不能做的)。一个请求内部的进度现在显示不出来，只能按「完成了几个请求」来算。

进度条是[视图](ui-view.md)：位置、宽度、隐藏、透明度来自 `UIView`。它不是控件：用户不能拖它，它也不派发事件。

本页和成员页里的数值和状态变化（高度、默认值、取值范围）是在模拟器（iPhone Air，iOS 27.2）上量的。画面上的样子（颜色、动画、图片怎么铺）**未在模拟器验证**。

**继承关系**：`EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → `UIProgressView`

怎么显示一件事的进度，见指南[显示加载和进度](../guides/loading-and-progress.md)。

## 构造函数

[`UIProgressView()`](ui-progress-view/constructor.md)

创建一条 `'default'` 样式的进度条。`progress` 是 0，`frame` 宽 0、高 4 pt。

## 实例属性

还继承 [`UIView`](ui-view.md) 的属性。进度条常用的继承属性是 `isHidden`、`frame`、`translatesAutoresizingMaskIntoConstraints`。

| 属性 | 说明 |
| --- | --- |
| [`progress`](ui-progress-view/progress.md) | 完成的比例，0 到 1 |
| [`progressViewStyle`](ui-progress-view/progressviewstyle.md) | 样式，决定高度 |
| [`progressTintColor`](ui-progress-view/progresstintcolor.md) | 填满的那一段的颜色 |
| [`trackTintColor`](ui-progress-view/tracktintcolor.md) | 没填的那一段的颜色 |
| [`progressImage`](ui-progress-view/progressimage.md) | 填满的那一段用的图片 |
| [`trackImage`](ui-progress-view/trackimage.md) | 没填的那一段用的图片 |

## 实例方法

还继承 [`UIView`](ui-view.md) 的方法。

| 方法 | 说明 |
| --- | --- |
| [`setProgress()`](ui-progress-view/setprogress.md) | 改进度，可以带动画 |

## 事件

进度条不派发事件。它的值只由 App 自己的代码改变。

## 概念

### 高度由样式决定

| 样式 | 高度 |
| --- | --- |
| `'default'`（默认） | 4 pt |
| `'bar'` | 小于 4 pt。3 倍屏上是 2.67 pt |

进度条每次被设置 `frame` 或 `bounds` 时，都把高度改回样式决定的值：写 `frame` 时高度不生效，写 30 读回来还是 4，只有位置和宽度写得进去。高度约束不受这个限制，要更粗的进度条就加一条高度约束。

读继承的 `intrinsicContentSize` 得到的宽度是 -1，表示进度条对宽度没有要求，宽度由 `frame` 或约束给出。

所有尺寸的单位都是[点（pt）](units.md)。

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

### `progress` 是 32 位浮点数

`progress` 存成 32 位浮点数。写 `0.3`，读回来是 `0.30000001192092896`。0.5、0.25 这类 32 位浮点数能精确表示的值读回来不变。所以不要用 `bar.progress === 0.3` 判断：要比较，和 `Math.fround(0.3)` 比；要显示百分比，用 `Math.round(bar.progress * 100)`。

## 示例

### 每半秒前进一格

从空白 App 开始，在页面上放一条进度条，每半秒前进一格，走满后停下。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const bar = new UIProgressView();

  const safe = page.view.safeAreaLayoutGuide;
  bar.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(bar);
  NSLayoutConstraint.activateConstraints([
    bar.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 24 }),
    bar.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -24 }),
    bar.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 40 }),
  ]);

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

更多写法见指南[显示加载和进度](../guides/loading-and-progress.md)。

## 对应的 iOS API

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

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 让进度条自动跟随一个任务的进度对象 | `observedProgress`（`NSProgress`） |
| 显示一个网络请求下载或上传了多少 | `NSURLSessionTask` 的进度，见 [fetch 还不能做的](fetch.md#还不能做的) |

## 参见

- [显示加载和进度](../guides/loading-and-progress.md)：换算进度、显示百分比、改粗细、完成后隐藏
- [`UIActivityIndicatorView`](ui-activity-indicator-view.md)：不知道完成了多少时用它
- [`UIView`](ui-view.md)：父类，位置、宽度、隐藏
- [Auto Layout](auto-layout.md)：约束左右两边和高度的写法
- [颜色](ui-color.md)
- [`UIImage`](ui-image.md)：`progressImage` 和 `trackImage` 的类型
- [单位](units.md)
- [实现原理：转圈和进度条](../internals/indicators.md)
