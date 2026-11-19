# 显示加载和进度

这一篇讲怎么告诉用户「有一件事正在进行」：不知道要多久时用转圈 [`UIActivityIndicatorView`](../api/ui-activity-indicator-view.md)，知道完成了多少时用进度条 [`UIProgressView`](../api/ui-progress-view.md)。每个属性和方法的细节在这两个类的参考页。

## 推荐的做法

- **知道进度就用进度条，不知道才用转圈。** 能算出完成了多少的任务（上传第 3 张，共 10 张）用进度条，用户能看出还要等多久。
- **用 Auto Layout 定位。** 转圈只约束位置，它按样式给出自己的大小。进度条约束左右两边，屏幕宽度变化时它跟着变宽；高度不用约束。
- **转圈创建一次，反复用。** 建界面时创建并加到页面上，之后每次等待只调 [`startAnimating()`](../api/ui-activity-indicator-view/startanimating.md) 和 [`stopAnimating()`](../api/ui-activity-indicator-view/stopanimating.md)。转圈自己管显示和隐藏，不用写 `isHidden`。
- **`stopAnimating()` 写在 `finally` 里。** 等待的事情失败时也要停下，否则转圈一直留在屏幕上，用户以为还在加载。
- **进度前进时用 `setProgress(value, { animated: true })`，回到 0 时不带动画。** 从 1 回到 0 如果带动画，用户会看到进度条倒着走。
- **自己保存完成了多少，进度条只负责显示。** 完成的个数、总数放在自己的变量里，每次更新时算出比例写给进度条。不要从 `bar.progress` 读回来再加，读回来的值有 32 位浮点数的误差。
- **任务完成后把进度条隐藏或移除。** 进度条不会在到达 1 时自己消失。

转圈和进度条都不挡住界面：它们显示的时候，页面上的按钮照常能点，输入框照常能输入。要在等待期间不让用户重复操作，由 App 自己禁用按钮，见[等待期间禁用按钮](#等待期间禁用按钮)。

## 第一个例子

从空白 App 开始，在屏幕正中放一个转圈，上方放一条进度条。进度条每半秒前进一格，走满后转圈停下。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 创建转圈，用大的那种，放在正中。不用给宽高
  const spinner = new UIActivityIndicatorView();
  spinner.activityIndicatorViewStyle = 'large';
  spinner.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(spinner);

  // 2. 创建进度条，左右各留 24 pt，离安全区顶部 40 pt。高度不用给
  const bar = new UIProgressView();
  const safe = page.view.safeAreaLayoutGuide;
  bar.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(bar);

  NSLayoutConstraint.activateConstraints([
    spinner.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
    spinner.centerYAnchor.constraintEqualToAnchor(page.view.centerYAnchor),
    bar.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 24 }),
    bar.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -24 }),
    bar.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 40 }),
  ]);

  // 3. 开始转。它同时把自己显示出来
  spinner.startAnimating();

  // 4. 每半秒完成一步，一共 10 步；走满后转圈停下，同时隐藏
  const total = 10;
  let done = 0;
  const timer = setInterval(() => {
    done += 1;
    bar.setProgress(done / total, { animated: true });
    if (done === total) {
      clearInterval(timer);
      spinner.stopAnimating();
      console.log('完成');
    }
  }, 500);
});
```

**效果**

- 屏幕正中出现一个 37 × 37 pt 的灰色转圈，不停旋转。
- 页面上方是一条 4 pt 高的浅色横线，每半秒左边蓝色的那一段变长一格。
- 五秒后进度条走满，转圈消失，控制台输出 `完成`。

这段代码没有作为一个整体在模拟器运行过。

下面的小节沿用这里的 `page`、`spinner` 和 `bar`。单独试某一节时，先写这几行：

```js
const page = new UIViewController();
const spinner = new UIActivityIndicatorView();
page.view.addSubview(spinner);
const bar = new UIProgressView();
page.view.addSubview(bar);
```

## 新建的转圈为什么看不见

新建的转圈是隐藏的，而且没有大小。

- **它是隐藏的。** 转圈默认在没转的时候隐藏自己，新建的转圈还没开始转。调 `startAnimating()` 之后它显示出来。
- **它的 `frame` 是 0 × 0。** 转圈有自己想要的大小：`'medium'` 是 20 × 20 pt，`'large'` 是 37 × 37 pt。用 Auto Layout 定位时它自动取这个大小；用 `frame` 定位时要调一次 `sizeToFit()`，见[用 `frame` 放转圈](#用-frame-放转圈)。
- **它要加到页面上。** 和其他视图一样，调 `addSubview()`。

## 新建的进度条为什么看不见

新建的进度条 `frame` 宽 0、高 4 pt，要给它宽度：用 Auto Layout 时约束左右两边或宽度，用 `frame` 时写 `frame` 给出位置和宽度。

新建的进度条 `progress` 是 0，填满的那一段长度为 0，屏幕上只有一条浅色的底。

## 等一个网络请求

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

## 等待期间禁用按钮

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

按钮怎么放到页面上见[做一个按钮](buttons.md)。

## 换转圈的大小和颜色

```js
spinner.activityIndicatorViewStyle = 'medium';
spinner.color = '#FF3B30';
```

**效果**：转圈想要的大小变成 20 × 20 pt，颜色变成红色。用 Auto Layout 定位的转圈在下一次布局时变成这个大小。

只有 `'medium'` 和 `'large'` 两种大小。用 `frame` 定位的转圈不会跟着变，换样式之后要再调一次 `sizeToFit()`。

默认颜色是 `'secondaryLabel'`，一种随深浅色模式变化的灰色。在深色的底上想要白色的转圈，写 `'white'`。恢复默认颜色写 `null`：

```js
spinner.color = null;
console.log(spinner.color);
```

**效果**：转圈变回默认的灰色，控制台输出 `secondaryLabel`。

## 转圈停下之后留在屏幕上

```js
spinner.hidesWhenStopped = false;
spinner.stopAnimating();
```

**效果**：转圈停止旋转，仍然显示在原处，是一圈不动的短线。

这个属性改了当场生效。一个没在转的转圈，把它设成 `false` 就立刻显示出来，设回 `true` 就立刻隐藏。

## 用 `frame` 放转圈

```js
const corner = new UIActivityIndicatorView();
corner.sizeToFit();
corner.center = new CGPoint(40, 120);
page.view.addSubview(corner);
corner.startAnimating();
```

**效果**：一个 20 × 20 pt 的转圈，中心在页面的 (40, 120) 处。

`sizeToFit()` 把 `frame` 的大小改成转圈想要的大小。不调它的话 `frame` 是 0 × 0。

## 把转圈放在一行文字旁边

把转圈和文字放进一个 [`UIStackView`](../api/ui-stack-view.md)，由它排成一行。

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

## 直接设进度

```js
bar.progress = 0.5;
```

**效果**：填满的那一段立刻变成整条的一半，没有动画。

带动画用 [`setProgress()`](../api/ui-progress-view/setprogress.md)：

```js
bar.setProgress(0.8, { animated: true });
console.log(bar.progress);
```

**效果**：填满的那一段滑到整条的 80%。控制台输出 `0.800000011920929`：`progress` 当场就是新的值，不是滑到一半的值。

## 把完成了几个换算成进度

```js
const steps = 8;
let finished = 0;

function finishOne() {
  finished += 1;
  bar.setProgress(finished / steps, { animated: true });
}
finishOne();
finishOne();
```

**效果**：调两次之后，填满的那一段是整条的四分之一。

## 旁边显示百分比

```js
const percent = new UILabel();
percent.text = Math.round(bar.progress * 100) + '%';
```

**效果**：`progress` 是 0.3 时，文字是 `30%`。

`Math.round()` 是必须的。`progress` 存成 32 位浮点数，`0.3` 读回来是 `0.30000001192092896`，直接乘 100 得到 `30.000001192092896`。

文字要在每次改进度之后重新设一遍，进度条不会通知。

## 换进度条的颜色

```js
bar.progressTintColor = 'systemGreen';
bar.trackTintColor = '#E5E5EA';
```

**效果**：填满的那一段是绿色，没填的那一段是浅灰色。

颜色的写法见[颜色](../api/ui-color.md)。写 `null` 恢复系统默认的颜色。

## 改进度条的粗细

进度条的高度由样式决定，**写 `frame` 时高度不生效**。要更粗的进度条，加一条高度约束：

```js
NSLayoutConstraint.activateConstraints([
  bar.heightAnchor.constraintEqualToConstant(10),
]);
```

**效果**：进度条的高度变成 10 pt。

更细的进度条用另一种样式：

```js
bar.progressViewStyle = 'bar';
```

**效果**：进度条变细，高度小于 4 pt。在 3 倍屏上量到的是 2.67 pt。

## 用 `frame` 放进度条

```js
const fixed = new UIProgressView();
fixed.frame = new CGRect(24, 200, 240, 4);
page.view.addSubview(fixed);
fixed.progress = 0.4;
```

**效果**：一条 240 pt 宽、4 pt 高的进度条，左上角在页面的 (24, 200) 处，填满 40%。

`CGRect` 的第四个参数（高度）写多少都不生效，进度条的高度总是样式决定的那个值。

## 完成后隐藏进度条

```js
bar.setProgress(1, { animated: true });
setTimeout(() => {
  bar.isHidden = true;
  bar.progress = 0;
}, 600);
```

**效果**：进度条走满，0.6 秒后消失，进度回到 0。下次用时把 `isHidden` 设回 `false`，从头开始。**这个例子未在模拟器验证。**

等 0.6 秒是为了让用户看到走满的那一下。动画实际持续多久**未在模拟器验证**。

## 用图片代替颜色

```js
const filled = UIImage.imageNamed('progress-filled');
const empty = UIImage.imageNamed('progress-empty');
if (filled && empty) {
  bar.progressImage = filled;
  bar.trackImage = empty;
}
```

**效果**：填满的那一段用 `filled` 这张图，没填的那一段用 `empty` 这张图。**图片怎么拉伸和裁剪未在模拟器验证。**

同一段的颜色和图片只有一个有效：写图片，同一段的颜色变成 `null`，见[颜色和图片二选一](../api/ui-progress-view.md#颜色和图片二选一)。图片从哪里来见 [`UIImage`](../api/ui-image.md)。

## 参见

- [`UIActivityIndicatorView`](../api/ui-activity-indicator-view.md)：转圈的全部属性和方法
- [`UIProgressView`](../api/ui-progress-view.md)：进度条的全部属性和方法
- [`UIStackView`](../api/ui-stack-view.md)：把转圈和文字排成一行
- [Auto Layout](../api/auto-layout.md)：只约束位置、约束左右两边和高度的写法
- [`fetch()`](../api/fetch.md)：等待的那个请求
