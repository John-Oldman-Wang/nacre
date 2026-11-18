---
type: reference
native: UIActivityIndicatorView
status: done
---

# `UIActivityIndicatorView`

**`UIActivityIndicatorView`** 表示一个转圈：一圈不停旋转的短线，告诉用户有一件事正在进行、还没有结果。它只有两种状态，在转和没在转，不表示完成了多少。知道完成了多少时用 [`UIProgressView`](ui-progress-view.md)。

转圈是[视图](ui-view.md)，位置、大小、隐藏、透明度都来自视图。它不是控件：用户点它没有反应，它也不派发事件。

转圈由 App 的代码控制。调 `startAnimating()` 开始转，调 `stopAnimating()` 停下。它不知道 App 在等什么，不会自己开始，也不会自己停。

这一页里的数值和状态变化（大小、默认值、什么时候隐藏）是在模拟器（iPhone Air，iOS 27.2）上量的。画面上的样子（转圈的形状、颜色、是否在转）**未在模拟器验证**。

## 新建的转圈为什么看不见

新建的转圈是隐藏的，而且没有大小。

- **它是隐藏的。** 转圈默认在没转的时候隐藏自己。新建的转圈还没开始转，所以它的 `isHidden` 是 `true`。调 `startAnimating()` 之后它显示出来。
- **它的 `frame` 是 0 × 0。** 转圈有自己想要的大小：`'medium'` 样式是 20 × 20 pt，`'large'` 样式是 37 × 37 pt。用 [Auto Layout](auto-layout.md) 定位时它自动取这个大小，只需要约束位置。用 `frame` 定位时要调一次 `sizeToFit()`，见[用 `frame` 定位](#用-frame-定位)。
- **它要加到页面上。** 和其他视图一样，调 `addSubview()`。

## 显示和隐藏由谁管

转圈自己管自己的 `isHidden`。开始转时它把 `isHidden` 改成 `false`，停下时改成 `true`。所以用转圈时不需要写 `isHidden`，只调 `startAnimating()` 和 `stopAnimating()`。

停下之后还想让它留在屏幕上，把 `hidesWhenStopped` 设成 `false`，见[停下之后留在屏幕上](#停下之后留在屏幕上)。

## 转圈不会挡住界面

转圈只是屏幕上一个 20 pt 或 37 pt 见方的视图。它在转的时候，页面上的按钮照常能点，输入框照常能输入。

要在等待期间不让用户重复操作，由 App 自己做：禁用触发这件事的按钮，见[等待期间禁用按钮](#等待期间禁用按钮)。

## 推荐的做法

**用 Auto Layout 定位，只约束位置。** 转圈按样式给出自己的大小，不需要宽高约束。

**开始之前调 `startAnimating()`，结束时在 `finally` 里调 `stopAnimating()`。** 等待的事情失败时也要停下，否则转圈一直留在屏幕上，用户以为还在加载。

**转圈创建一次，反复用。** 建界面时创建并加到页面上，之后每次等待只调 `startAnimating()` 和 `stopAnimating()`。

**知道进度就不用转圈。** 能算出完成了多少的任务（上传第 3 张，共 10 张）用 [`UIProgressView`](ui-progress-view.md)，用户能看出还要等多久。

## 完整例子

下面的代码从空白 App 开始，在屏幕正中放一个转圈，转三秒后停下。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 创建转圈，用大的那种
  const spinner = new UIActivityIndicatorView();
  spinner.activityIndicatorViewStyle = 'large';

  // 2. 放到页面上，位置定在正中。不用给宽高
  spinner.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(spinner);
  NSLayoutConstraint.activateConstraints([
    spinner.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
    spinner.centerYAnchor.constraintEqualToAnchor(page.view.centerYAnchor),
  ]);

  // 3. 开始转。它同时把自己显示出来
  spinner.startAnimating();

  // 4. 三秒后停下。它同时把自己隐藏
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

四步分别是：创建、放到页面上、开始、停下。后面的每种用法都是在这四步上改。

## 常见用法

以下例子都假设已经有上面的 `spinner` 和 `page`。

### 等一个网络请求

```js
async function load() {
  spinner.startAnimating();
  try {
    const response = await fetch('https://httpbin.org/delay/2');
    console.log('状态码', response.status);
  } catch (err) {
    console.log('请求失败', err instanceof Error ? err.message : err);
  } finally {
    spinner.stopAnimating();
  }
}
load();
```

**效果**：请求发出时转圈出现，请求结束时转圈消失。请求成功和失败都会消失。**这个例子未在模拟器验证。**

`stopAnimating()` 写在 `finally` 里。写在 `try` 的最后一行的话，请求失败时它不会执行。

### 换大小

```js
spinner.activityIndicatorViewStyle = 'medium';
```

**效果**：转圈想要的大小变成 20 × 20 pt。用 Auto Layout 定位的转圈在下一次布局时变成这个大小。

用 `frame` 定位的转圈不会跟着变，换样式之后要再调一次 `sizeToFit()`。

只有 `'medium'` 和 `'large'` 两种大小。

### 换颜色

```js
spinner.color = '#FF3B30';
```

**效果**：转圈变成红色。

颜色的写法见[颜色](ui-color.md)。默认颜色是 `'secondaryLabel'`，一种随深浅色模式变化的灰色。在深色的底上想要白色的转圈，写 `spinner.color = 'white'`。

要恢复默认颜色，写 `null`：

```js
spinner.color = null;
console.log(spinner.color);
```

**效果**：转圈变回默认的灰色，控制台输出 `secondaryLabel`。

### 停下之后留在屏幕上

```js
spinner.hidesWhenStopped = false;
spinner.stopAnimating();
```

**效果**：转圈停止旋转，仍然显示在原处，是一圈不动的短线。

这个属性改了当场生效。一个没在转的转圈，把它设成 `false` 就立刻显示出来，设回 `true` 就立刻隐藏。

### 用 `frame` 定位

```js
const corner = new UIActivityIndicatorView();
corner.sizeToFit();
corner.center = new CGPoint(40, 120);
page.view.addSubview(corner);
corner.startAnimating();
```

**效果**：一个 20 × 20 pt 的转圈，中心在页面的 (40, 120) 处。

`sizeToFit()` 把 `frame` 的大小改成转圈想要的大小。不调它的话 `frame` 是 0 × 0。

### 放在一行文字旁边

把转圈和文字放进一个 [`UIStackView`](ui-stack-view.md)，由它排成一行。

```js
const label = new UILabel();
label.text = '正在保存';

const busy = new UIActivityIndicatorView();
const row = new UIStackView([busy, label]);
row.spacing = 8;
row.alignment = 'center';
row.translatesAutoresizingMaskIntoConstraints = false;
page.view.addSubview(row);
NSLayoutConstraint.activateConstraints([
  row.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
  row.topAnchor.constraintEqualToAnchor(page.view.safeAreaLayoutGuide.topAnchor, { constant: 24 }),
]);

busy.startAnimating();
```

**效果**：页面顶部居中显示一个转圈，右边隔 8 pt 是「正在保存」。调 `busy.stopAnimating()` 之后转圈消失，只剩文字，文字单独居中。**这个例子未在模拟器验证。**

`UIStackView` 不给隐藏的视图留位置，而转圈停下时隐藏自己，所以两者配合时不用另外写代码。

### 等待期间禁用按钮

```js
const submit = UIButton.buttonWithType('system');
submit.setTitle('提交', { forState: ['normal'] });

submit.addEventListener('click', async () => {
  submit.isEnabled = false;
  spinner.startAnimating();
  try {
    await fetch('https://httpbin.org/delay/2');
  } finally {
    spinner.stopAnimating();
    submit.isEnabled = true;
  }
});
```

**效果**：点「提交」之后按钮禁用、转圈出现；请求结束后转圈消失、按钮恢复。等待期间再点按钮没有反应。**这个例子未在模拟器验证。**

按钮怎么放到页面上见 [`UIButton`](ui-button.md)。

## 概念

### `isAnimating`、`hidesWhenStopped` 和 `isHidden`

转圈是否显示，由前两个属性共同决定。转圈在这两个属性变化时写自己的 `isHidden`：

| `hidesWhenStopped` | `isAnimating` | `isHidden` |
| --- | --- | --- |
| `true`（默认） | `false` | `true`，不显示 |
| `true`（默认） | `true` | `false`，显示并旋转 |
| `false` | `false` | `false`，显示但不动 |
| `false` | `true` | `false`，显示并旋转 |

`isHidden` 仍然是一个可以写的属性。在转的时候把 `isHidden` 写成 `true`，转圈被隐藏，`isAnimating` 仍然是 `true`。一般不需要这样做。

### 大小跟着样式走

转圈想要的大小由样式决定，读 `intrinsicContentSize` 可以得到：

| 样式 | `intrinsicContentSize` |
| --- | --- |
| `'medium'`（默认） | 20 × 20 pt |
| `'large'` | 37 × 37 pt |

换样式只改这个值，不改 `frame`。Auto Layout 和 `UIStackView` 按这个值安排转圈的大小；`sizeToFit()` 把 `frame` 改成这个值。

所有尺寸的单位都是[点（pt）](units.md)。

## 成员说明

### 创建

#### `new UIActivityIndicatorView()`

创建一个转圈。没有参数。样式是 `'medium'`，`frame` 是 0 × 0，隐藏，没在转。

`UIActivityIndicatorView` 不能被继承，`class X extends UIActivityIndicatorView` 在 `new X()` 时抛 `TypeError`，见[原生类](native-classes.md)。

### 属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `activityIndicatorViewStyle` | `'medium'` \| `'large'` | 是 | 是 | `'medium'` | 转圈的大小。`'medium'` 是 20 × 20 pt，`'large'` 是 37 × 37 pt。换样式不改 `frame`，也不改颜色 |
| `hidesWhenStopped` | 布尔 | 是 | 是 | `true` | `true`：没在转的时候隐藏。`false`：停下之后仍然显示，是一个不动的转圈。改了当场生效 |
| `color` | [颜色](ui-color.md)字符串 | 是 | 是 | `'secondaryLabel'` | 转圈的颜色。读出来总是字符串，不会是 `null`。写 `null` 是恢复默认颜色 |
| `isAnimating` | 布尔 | 是 | 否 | `false` | 是否在转。只由 `startAnimating()` 和 `stopAnimating()` 改变，没有变化事件：改它的是 App 自己的代码 |

写错时：

- `activityIndicatorViewStyle` 写了别的值，不抛，在控制台输出一条警告 `[Nacre] activityIndicatorViewStyle has no value "small"; expected one of: …, ignored`，原值不变。
- `color` 写了不合法的颜色，不抛，在控制台输出一条警告，原值不变，见[颜色](ui-color.md#写错不抛打警告)。
- 写 `isAnimating` 抛 `TypeError`。
- `hidesWhenStopped` 按 JS 的真假值转成布尔，不会抛。

位置、大小、隐藏、透明度等继承自 [`UIView`](ui-view.md)。

### 方法

#### `startAnimating()`

开始转。`hidesWhenStopped` 是 `true` 时同时把 `isHidden` 改成 `false`。

- **参数**：无。
- **返回**：无。
- 已经在转时调用没有效果。

#### `stopAnimating()`

停下。`hidesWhenStopped` 是 `true` 时同时把 `isHidden` 改成 `true`。

- **参数**：无。
- **返回**：无。
- 没在转时调用没有效果。

## 与 iOS 原生写法的对照

如果你在看 Apple 的文档或 iOS 的示例代码，按这张表换成 JS 的写法。

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

- [`UIProgressView`](ui-progress-view.md)：知道完成了多少时用它
- [`UIView`](ui-view.md)：转圈的父类，位置、大小、隐藏
- [Auto Layout](auto-layout.md)：只约束位置的写法
- [`UIStackView`](ui-stack-view.md)：把转圈和文字排成一行
- [颜色](ui-color.md)
- [单位](units.md)
- [实现原理：转圈和进度条](../internals/indicators.md)
