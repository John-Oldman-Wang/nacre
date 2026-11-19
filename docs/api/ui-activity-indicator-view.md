---
type: reference
native: UIActivityIndicatorView
status: done
---

# `UIActivityIndicatorView`

**`UIActivityIndicatorView`** 表示一个转圈：一圈不停旋转的短线，告诉用户有一件事正在进行、还没有结果。它只有两种状态，在转和没在转，不表示完成了多少。知道完成了多少时用 [`UIProgressView`](ui-progress-view.md)。

转圈由 App 的代码控制。调 [`startAnimating()`](ui-activity-indicator-view/startanimating.md) 开始转，调 [`stopAnimating()`](ui-activity-indicator-view/stopanimating.md) 停下。它不知道 App 在等什么，不会自己开始，也不会自己停。默认情况下它没在转时隐藏自己，所以新建的转圈是看不见的。

转圈是[视图](ui-view.md)：位置、大小、隐藏、透明度来自 `UIView`。它不是控件：用户点它没有反应，它也不派发事件。它在转的时候不挡住界面，页面上的按钮照常能点。

本页和成员页里的数值和状态变化（大小、默认值、什么时候隐藏）是在模拟器（iPhone Air，iOS 27.2）上量的。画面上的样子（转圈的形状、颜色、是否在转）**未在模拟器验证**。

**继承关系**：`EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → `UIActivityIndicatorView`

怎么在等待时显示转圈，见指南[显示加载和进度](../guides/loading-and-progress.md)。

## 构造函数

[`UIActivityIndicatorView()`](ui-activity-indicator-view/constructor.md)

创建一个 `'medium'` 样式的转圈。它隐藏、没在转，`frame` 是 0 × 0。

## 实例属性

还继承 [`UIView`](ui-view.md) 的属性。转圈常用的继承属性是 `isHidden`、`center`、`translatesAutoresizingMaskIntoConstraints`。

| 属性 | 说明 |
| --- | --- |
| [`activityIndicatorViewStyle`](ui-activity-indicator-view/activityindicatorviewstyle.md) | 转圈的大小：`'medium'` 或 `'large'` |
| [`hidesWhenStopped`](ui-activity-indicator-view/hideswhenstopped.md) | 没在转的时候是否隐藏 |
| [`color`](ui-activity-indicator-view/color.md) | 转圈的颜色 |
| [`isAnimating`](ui-activity-indicator-view/isanimating.md) <small>只读</small> | 是否在转 |

## 实例方法

还继承 [`UIView`](ui-view.md) 的方法。用 `frame` 定位时常用继承的 `sizeToFit()`。

| 方法 | 说明 |
| --- | --- |
| [`startAnimating()`](ui-activity-indicator-view/startanimating.md) | 开始转，同时显示出来 |
| [`stopAnimating()`](ui-activity-indicator-view/stopanimating.md) | 停下，同时隐藏 |

## 事件

转圈不派发事件。它的状态只由 App 自己的代码改变。

## 概念

### 显示和隐藏由谁管

转圈自己写自己的 `isHidden`。是否显示由 `hidesWhenStopped` 和 `isAnimating` 共同决定：

| `hidesWhenStopped` | `isAnimating` | `isHidden` |
| --- | --- | --- |
| `true`（默认） | `false` | `true`，不显示 |
| `true`（默认） | `true` | `false`，显示并旋转 |
| `false` | `false` | `false`，显示但不动 |
| `false` | `true` | `false`，显示并旋转 |

所以用转圈时不需要写 `isHidden`，只调 `startAnimating()` 和 `stopAnimating()`。

`isHidden` 仍然是一个可以写的属性。在转的时候把 `isHidden` 写成 `true`，转圈被隐藏，`isAnimating` 仍然是 `true`。一般不需要这样做。

### 大小跟着样式走

转圈想要的大小由样式决定，读继承的 `intrinsicContentSize` 可以得到：

| 样式 | `intrinsicContentSize` |
| --- | --- |
| `'medium'`（默认） | 20 × 20 pt |
| `'large'` | 37 × 37 pt |

换样式只改这个值，不改 `frame`。[Auto Layout](auto-layout.md) 和 [`UIStackView`](ui-stack-view.md) 按这个值安排转圈的大小，所以用约束定位时只需要约束位置。`sizeToFit()` 把 `frame` 改成这个值。

所有尺寸的单位都是[点（pt）](units.md)。

## 示例

### 屏幕正中转三秒

从空白 App 开始，在屏幕正中放一个转圈，转三秒后停下。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const spinner = new UIActivityIndicatorView();
  spinner.activityIndicatorViewStyle = 'large';

  spinner.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(spinner);
  NSLayoutConstraint.activateConstraints([
    spinner.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
    spinner.centerYAnchor.constraintEqualToAnchor(page.view.centerYAnchor),
  ]);

  spinner.startAnimating();

  setTimeout(() => {
    spinner.stopAnimating();
    console.log('停了，isHidden =', spinner.isHidden);
  }, 3000);
});
```

**效果**

- 屏幕正中出现一个 37 × 37 pt 的灰色转圈，不停旋转。
- 三秒后转圈消失，控制台输出 `停了，isHidden = true`。

这段代码没有作为一个整体在模拟器运行过。

### 等一个请求时转圈

```js
const spinner = new UIActivityIndicatorView();

async function load() {
  spinner.startAnimating();
  try {
    const response = await fetch('https://httpbin.org/delay/2');
    console.log('状态码', response.status);
  } finally {
    spinner.stopAnimating();
  }
}
load();
```

**效果**：请求发出时转圈出现，请求结束时转圈消失，成功和失败都会消失。**未在模拟器验证。**

更多写法见指南[显示加载和进度](../guides/loading-and-progress.md)。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[UIActivityIndicatorView alloc] init]` | `new UIActivityIndicatorView()` |
| `[[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleLarge]` | `const s = new UIActivityIndicatorView(); s.activityIndicatorViewStyle = 'large'; s.sizeToFit();` |
| `s.activityIndicatorViewStyle = UIActivityIndicatorViewStyleMedium` | `s.activityIndicatorViewStyle = 'medium'` |
| `s.hidesWhenStopped = NO` | `s.hidesWhenStopped = false` |
| `s.color = UIColor.whiteColor` | `s.color = 'white'` |
| `[s startAnimating]` | `s.startAnimating()` |
| `[s stopAnimating]` | `s.stopAnimating()` |
| `s.isAnimating` | `s.isAnimating` |

`UIActivityIndicatorViewStyleWhiteLarge`、`UIActivityIndicatorViewStyleWhite`、`UIActivityIndicatorViewStyleGray` 这三个值从 iOS 13 起废弃，没有对应的写法。用 `'large'` 或 `'medium'` 加 `color` 代替。

## 参见

- [显示加载和进度](../guides/loading-and-progress.md)：等请求、放在文字旁边、等待期间禁用按钮
- [`UIProgressView`](ui-progress-view.md)：知道完成了多少时用它
- [`UIView`](ui-view.md)：父类，位置、大小、隐藏
- [Auto Layout](auto-layout.md)：只约束位置的写法
- [`UIStackView`](ui-stack-view.md)：把转圈和文字排成一行
- [颜色](ui-color.md)
- [单位](units.md)
- [实现原理：转圈和进度条](../internals/indicators.md)
