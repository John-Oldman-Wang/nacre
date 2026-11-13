---
type: reference
native: UIViewController
status: partial
---

# `UIViewController`

**`UIViewController`** 表示一屏内容的管理者，下文称为页面。页面自己不是视图，不显示在屏幕上。它持有一个根视图 `view`，这一屏的界面内容都放在这个视图里。页面负责的是这一屏内容怎样进入屏幕、怎样离开屏幕、和别的页面是什么关系。

系统按页面组织界面，所以即使 App 只有一屏内容，也要有一个页面：

- 窗口不直接接受视图。窗口的内容入口是 `rootViewController`，它的类型是页面。
- 页面之间的切换以页面为单位：[导航栈](ui-navigation-controller.md)里推入和返回的是页面，[标签栏](ui-tab-bar-controller.md)里切换的是页面，[模态呈现](#模态呈现)盖上来的也是页面。切换的动画、返回按钮、返回手势、向下拖动关闭都由系统提供，不用自己写。
- 安全区按页面计算。页面的根视图由系统摆放，父页面可以给子页面多让出一段安全区（`additionalSafeAreaInsets`）。

页面由 App 的代码用 `new UIViewController()` 创建，创建不需要场景或窗口。新建的页面不会自己显示，要用下面的一种方式放到屏幕上：

| 方式 | 写法 | 用在什么时候 |
| --- | --- | --- |
| 窗口的根页面 | `win.rootViewController = page` | 每个窗口有一个，是界面的起点。见 [`UIWindow`](ui-window.md) |
| 推入导航栈 | `nav.pushViewController(page, …)` | 同一件事的下一层，比如「列表 → 详情」。见 [`UINavigationController`](ui-navigation-controller.md) |
| 标签栏的一页 | `tabs.viewControllers = […]` | 几个并列的主界面。见 [`UITabBarController`](ui-tab-bar-controller.md) |
| 模态呈现 | `page.presentViewController(other, …)` | 临时打断当前的事，比如「登录」「新建」。见[模态呈现](#模态呈现) |
| 嵌进另一个页面 | `parent.addChildViewController(child)` 等三句 | 自己写容器。见[父子控制器](#父子控制器) |

页面不是视图，不能把页面 `addSubview()` 到别的视图里。

页面不能继承：`class MyPage extends UIViewController {}` 在 `new MyPage()` 时抛错。做一个自己的页面的写法是写一个函数，在里面 `new UIViewController()`，往它的 `view` 里放内容，再返回它。

## 页面由谁保管

**显示着的页面不需要保存在变量里。** 页面一旦通过上面的任何一种方式放到屏幕上，就由放它的那一方保管：窗口保管根页面，导航栈保管栈里的每个页面，呈现者保管它弹出的模态页，父控制器保管子控制器。保管期间页面不会被回收，它的视图、挂在它上面的事件监听和自定义属性都保留。

页面离开之后是否还存在，取决于 App 的代码有没有保存它：

| 页面怎样离开 | 没有变量保存它时 |
| --- | --- |
| 模态页被代码关闭（`dismissViewController()`） | 关闭动画结束后被回收（实测） |
| 模态页被用户向下拖走 | 被回收（实测） |
| 从导航栈返回（代码弹出，或用户点返回按钮） | 被回收（实测） |
| 子控制器调了 `removeFromParentViewController()` | 被回收（实测） |
| 根页面被另一个页面换掉 | 被回收。**未在模拟器验证** |

回收的时候，页面的视图和视图上的事件监听一起被回收，不需要先逐个移除监听。

推荐的做法是不保存页面：需要的时候新建，离开之后让它被回收。下一次要显示同样的内容，按数据重新建一个。只有重建代价大的页面才保存在变量里反复使用，代价是它和它的全部视图一直占着内存。

不要把页面保存到 `sceneconnect` 的回调外面。场景被系统销毁时，没有被保存的窗口、页面和视图一起被回收；保存在外面的不会。见 [`UIWindowScene`](ui-window-scene.md#推荐的做法)。

## 页面的出现和消失

**页面目前不能得知自己什么时候出现在屏幕上、什么时候从屏幕上消失。** iOS 原生用一组可以覆写的方法通知页面（`viewWillAppear:` 等），而运行时还不支持用 JS 覆写原生方法，见[还不能做的](#还不能做的)。

可以得知的只有下面几件事，它们都来自发起切换的那一方：

| 想知道的事 | 怎么得知 |
| --- | --- |
| 模态页弹出完成 | `presentViewController()` 返回的 Promise 兑现 |
| 模态页被代码关闭完成 | `dismissViewController()` 返回的 Promise 兑现 |
| 模态页被用户拖走 | 被弹出页面上的 `diddismiss` 事件 |
| 导航栈显示了哪个页面 | 导航控制器的 `willshow`、`didshow` 事件，见 [`UINavigationController`](ui-navigation-controller.md) |
| 标签栏切到了哪一页 | 标签栏控制器的 `didselect` 事件，见 [`UITabBarController`](ui-tab-bar-controller.md) |

所以「离开页面时停掉定时器」这类收尾工作，要写在发起离开的地方，或者写在上面这些事件的回调里。

## 完整例子

下面的代码从空白 App 开始，做两个页面。第一个页面上有一个「打开」按钮，点了以后第二个页面从底部弹出。第二个页面上有一个「关闭」按钮。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 创建第二个页面。这时它还没有显示
  const sheet = new UIViewController();
  sheet.view.backgroundColor = 'systemBackground';
  sheet.modalPresentationStyle = 'pageSheet';

  // 2. 在第二个页面正中放一个「关闭」按钮
  const close = UIButton.buttonWithType('system');
  close.setTitle('关闭', { forState: ['normal'] });
  close.translatesAutoresizingMaskIntoConstraints = false;
  sheet.view.addSubview(close);
  NSLayoutConstraint.activateConstraints([
    close.centerXAnchor.constraintEqualToAnchor(sheet.view.centerXAnchor),
    close.centerYAnchor.constraintEqualToAnchor(sheet.view.centerYAnchor),
  ]);

  // 3. 点「关闭」时，关掉第二个页面
  close.addEventListener('primaryActionTriggered', () => {
    sheet.dismissViewController({ animated: true });
  });

  // 4. 在第一个页面正中放一个「打开」按钮
  const open = UIButton.buttonWithType('system');
  open.setTitle('打开', { forState: ['normal'] });
  open.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(open);
  NSLayoutConstraint.activateConstraints([
    open.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
    open.centerYAnchor.constraintEqualToAnchor(page.view.centerYAnchor),
  ]);

  // 5. 点「打开」时，把第二个页面弹出来
  open.addEventListener('primaryActionTriggered', async () => {
    await page.presentViewController(sheet, { animated: true });
    console.log('第二个页面已经完全显示');
  });
});
```

**效果**

- 启动后屏幕正中是蓝色的「打开」两个字。
- 点「打开」，第二个页面从屏幕底部向上滑入，以卡片的形式盖在第一个页面上面。
- 滑入动画结束后，控制台输出 `第二个页面已经完全显示`。
- 点「关闭」，卡片向下滑出，回到第一个页面。
- 不点「关闭」，按住卡片向下拖，也能把它关掉。

这段代码没有作为一个整体在模拟器运行过。其中用到的每个 API 都在验收用例里运行过。

「把一个页面盖在当前页面上面」在 iOS 里叫**模态呈现**（present）。关掉它叫 dismiss。详见[模态呈现](#模态呈现)。

这个例子在一开始就建好 `sheet`，并在两个按钮的回调里一直引用它，所以它关闭之后不会被回收，再点「打开」弹出的是同一个页面。每次打开都新建一个模态页的写法见[模态页的打开和关闭怎么组织](#模态页的打开和关闭怎么组织)。

## 常见用法

以下例子都假设已经有上面的 `page`（屏幕上的第一个页面）和 `sheet`（第二个页面，还没有显示）。

### 往页面上放内容

页面的内容放在它的根视图 `view` 里。`view` 是一个普通的 [`UIView`](ui-view.md)。

```js
const label = new UILabel();
label.text = '你好';
label.translatesAutoresizingMaskIntoConstraints = false;
page.view.addSubview(label);

const safe = page.view.safeAreaLayoutGuide;
NSLayoutConstraint.activateConstraints([
  label.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 16 }),
  label.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
]);
```

**效果**：页面左上角出现「你好」两个字。它距离安全区的上边和左边各 16 [pt](units.md)。

「安全区」是屏幕上不被刘海、状态栏、底部横条遮挡的区域。`safeAreaLayoutGuide` 代表这块区域，用法见 [Auto Layout](auto-layout.md)。

### 设置页面的底色

```js
page.view.backgroundColor = 'systemBackground';
```

**效果**：页面底色在浅色模式下是白色，在深色模式下是黑色。

> **注意**：页面的根视图默认没有底色，是透明的。根页面不设底色时屏幕是黑的；模态页不设底色时能透过它看到下面的内容。**两条都未在模拟器验证。**

颜色的写法见[颜色](ui-color.md)。

### 设标题

```js
page.title = '设置';
```

**效果**：页面在[导航栈](ui-navigation-controller.md)里时，屏幕顶部的导航条正中显示「设置」。从它进入下一页后，下一页的返回按钮上也显示「设置」。

页面不在导航栈里时没有导航条，标题不显示在任何地方。完整例子里的 `page` 就是这种情况。

导航条上的按钮、副标题等通过 `page.navigationItem` 设置，见[导航条上的东西](ui-bar-button-item.md)。

### 模态弹出一个页面并等它弹完

`presentViewController()` 返回 Promise。弹出动画结束后 Promise 兑现。

```js
async function openSheet() {
  await page.presentViewController(sheet, { animated: true });
  console.log(page.presentedViewController === sheet);
}
openSheet();
```

**效果**

- `sheet` 从屏幕底部向上滑入，盖在 `page` 上面。
- 动画结束后控制台输出 `true`。

`animated` 省略时是 `false`：页面直接出现，没有滑入动画。

弹出期间 `sheet` 由 `page` 保管，不需要为了让它存活而保存变量。

同一个页面同一时刻只能弹出一个模态页。`page` 已经弹出了一个，还没关闭就再弹一个的结果，**未在模拟器验证**。要在模态页上面再盖一层，在那个模态页上调 `presentViewController()`。**这种写法未在模拟器验证。**

### 关闭模态页

在被弹出的那个页面上调 `dismissViewController()`。它也返回 Promise，关闭动画结束后兑现。

```js
async function closeSheet() {
  await sheet.dismissViewController({ animated: true });
  console.log(page.presentedViewController);
}
closeSheet();
```

**效果**

- `sheet` 向下滑出屏幕，露出 `page`。
- 动画结束后控制台输出 `null`。

> **注意**：用代码关闭时，不派发 `willdismiss`、`diddismiss` 等任何事件。清理工作要写在调 `dismissViewController()` 的地方。见[关闭事件](#关闭事件)。

对没有被模态呈现、也没有弹出任何页面的页面调 `dismissViewController()` 的结果，**未在模拟器验证**。

### 不让用户下拉关闭

卡片式的模态页默认可以被用户向下拖走。填了一半的表单不希望这样被关掉时，设 `isModalInPresentation`。

```js
sheet.isModalInPresentation = true;
```

**效果**：用户向下拖卡片，卡片不会关闭。只能通过页面上的按钮（调 `dismissViewController()`）关闭。

这个属性可以在页面弹出之后随时改，比如表单被修改后设成 `true`，保存后设回 `false`（实测：弹出之后改成 `true`，再拖只收到 `dismissattempted`）。

用户尝试拖动时，页面会收到 `dismissattempted` 事件。可以在这时提示「有未保存的内容」：

```js
sheet.addEventListener('dismissattempted', () => {
  console.log('用户想关闭，但被拦住了');
});
```

**效果**：`isModalInPresentation` 是 `true` 时，用户每向下拖一次，控制台输出一行。`willdismiss` 和 `diddismiss` 都不派发。

### 知道模态页被用户拖走了

用户向下拖走卡片时，App 的代码没有调过 `dismissViewController()`，所以没有 Promise 可以等。要得知这件事，监听被弹出页面上的 `diddismiss`。

```js
sheet.addEventListener('willdismiss', () => {
  console.log('即将关闭');
});
sheet.addEventListener('diddismiss', () => {
  console.log('已经关闭');
});
```

**效果**：用户把卡片向下拖走，控制台依次输出 `即将关闭`、`已经关闭`。

监听可以在页面弹出之前注册。

用户拖到一半又放回去时，卡片没有关闭，`diddismiss` 不派发。这种情况下 `willdismiss` 是否派发，**未在模拟器验证**。所以收尾工作写在 `diddismiss` 里，不写在 `willdismiss` 里。

代码关闭和用户拖走是两条途径，只有后一条派发事件。两条途径共用一段收尾代码的写法见下一节。

### 模态页的打开和关闭怎么组织

推荐的写法是把「打开一个模态页」写成一个函数：每次调用新建一个页面，关闭之后的收尾写成一个只执行一次的函数，代码关闭和用户拖走都调它。

```js
/**
 * @param {UIViewController} host
 * @param {() => void} onClosed
 */
function openEditor(host, onClosed) {
  const editor = new UIViewController();
  editor.view.backgroundColor = 'systemBackground';
  editor.modalPresentationStyle = 'pageSheet';

  // 收尾只执行一次，不管页面是怎样关闭的
  let closed = false;
  function finish() {
    if (closed) return;
    closed = true;
    onClosed();
  }

  // 途径一：用户向下拖走
  editor.addEventListener('diddismiss', finish);

  // 途径二：点「完成」，由代码关闭
  const done = UIButton.buttonWithType('system');
  done.setTitle('完成', { forState: ['normal'] });
  done.translatesAutoresizingMaskIntoConstraints = false;
  editor.view.addSubview(done);
  NSLayoutConstraint.activateConstraints([
    done.centerXAnchor.constraintEqualToAnchor(editor.view.centerXAnchor),
    done.centerYAnchor.constraintEqualToAnchor(editor.view.centerYAnchor),
  ]);
  done.addEventListener('primaryActionTriggered', async () => {
    await editor.dismissViewController({ animated: true });
    finish();
  });

  return host.presentViewController(editor, { animated: true });
}

openEditor(page, () => {
  console.log('编辑页关闭了');
});
```

**效果**：一张卡片从底部滑入，正中有「完成」两个字。点「完成」或者把卡片向下拖走，卡片关闭，控制台都输出一行 `编辑页关闭了`。**这段代码没有作为一个整体在模拟器运行过。**

这样写的理由：

- **两条关闭途径走同一段收尾。** 代码关闭不派发 `diddismiss`，用户拖走不经过「完成」按钮的回调。只写其中一处，另一条途径就没有收尾。
- **不保存模态页。** `editor` 是函数里的局部变量。弹出期间它由 `host` 保管；关闭之后没有变量保存它，它和它的视图、按钮、监听一起被回收。下一次打开是一个新的页面，不会带着上一次的输入内容。
- **结果用数据传回。** 模态页要把结果交给外面时，把值作为 `onClosed` 的参数传出去，不让外面去读模态页上的视图。

另一种写法是完整例子里那样：建一个模态页，保存起来反复弹出。它适用于重建代价大、或者要保留上一次状态的页面。代价是这个页面关闭之后仍然占着内存。

### 全屏呈现

默认的呈现方式是卡片。要让模态页占满整个屏幕，在弹出之前设 `modalPresentationStyle`。

```js
sheet.modalPresentationStyle = 'fullScreen';
page.presentViewController(sheet, { animated: true });
```

**效果**：`sheet` 从底部滑入，占满整个屏幕，完全盖住 `page`。用户不能向下拖走它，所以页面上必须有一个关闭按钮，否则用户没有办法离开这个页面。**这条效果未在模拟器验证。**

各种取值的效果见 [`modalPresentationStyle`](#modalpresentationstyle)。

### 卡片式呈现

```js
sheet.modalPresentationStyle = 'pageSheet';
page.presentViewController(sheet, { animated: true });
```

**效果**：`sheet` 从底部滑入，显示成一张卡片。用户可以向下拖走它。

### 换一种进出动画

```js
sheet.modalTransitionStyle = 'crossDissolve';
page.presentViewController(sheet, { animated: true });
```

**效果**：`sheet` 不从底部滑入，而是原地淡入。关闭时淡出。**这条效果未在模拟器验证。**

各种取值见 [`modalTransitionStyle`](#modaltransitionstyle)。

### 知道自己在不在导航栈里

「导航栈」是一叠页面，由 [`UINavigationController`](ui-navigation-controller.md) 管理。推入（push）一个页面，它从右边滑入；返回时弹出（pop）。页面的 `navigationController` 属性指向它所在的导航栈，不在任何导航栈里时是 `null`。

```js
const detail = new UIViewController();
console.log(detail.navigationController);          // null

const nav = new UINavigationController(detail);
console.log(detail.navigationController === nav);  // true
console.log(detail.parentViewController === nav);  // true
```

**效果**：控制台依次输出 `null`、`true`、`true`。屏幕上没有变化，因为 `nav` 没有被显示出来。

页面从导航栈里弹出之后，`navigationController` 变回 `null`。

`navigationController` 的类型是「可能为 `null`」，使用前要判断：

```js
const stack = page.navigationController;
if (stack) {
  stack.popViewController({ animated: true });
}
```

**效果**：`page` 在导航栈里时返回上一页。不在时什么都不做。

推入、弹出、返回按钮的说明都在 [`UINavigationController`](ui-navigation-controller.md)。

### 知道自己是不是被模态弹出的

```js
if (sheet.presentingViewController) {
  console.log('sheet 正在被模态呈现');
} else {
  console.log('sheet 没有被模态呈现');
}
```

**效果**：`sheet` 还没弹出时输出 `sheet 没有被模态呈现`。弹出之后输出 `sheet 正在被模态呈现`。

### 把另一个页面嵌进这个页面

要在一个页面里的某一块区域显示另一个页面的内容，把它加成**子控制器**。一共三句，顺序固定：

```js
const panel = new UIViewController();
panel.view.backgroundColor = 'systemTeal';

page.addChildViewController(panel);                 // 1. 建立父子关系
panel.view.frame = new CGRect(20, 120, 280, 160);
page.view.addSubview(panel.view);                   // 2. 把它的视图放进来
panel.didMoveToParentViewController(page);          // 3. 告诉它已经放好了

console.log(page.childViewControllers.length);
console.log(panel.parentViewController === page);
```

**效果**：`page` 上出现一块青色的矩形，宽 280 pt、高 160 pt。控制台输出 `1` 和 `true`。

只做第 2 句（把 `panel.view` 加成子视图）屏幕上看起来一样，但 `panel` 不知道自己属于谁：它的 `parentViewController` 是 `null`，也没有被 `page` 保管。没有变量保存 `panel` 时，页面对象会被回收，而它的视图还留在屏幕上。所以三句都要写。**只做第 2 句的后果未在模拟器验证。**

拿掉它的时候反过来，也是三句：

```js
panel.willMoveToParentViewController(null);   // 1. 告诉它要离开了
panel.view.removeFromSuperview();             // 2. 把视图摘掉
panel.removeFromParentViewController();       // 3. 解除父子关系

console.log(page.childViewControllers.length);
console.log(panel.parentViewController);
```

**效果**：青色矩形消失。控制台输出 `0` 和 `null`。

### 给子页面让出一截安全区

父页面在子页面上面盖了东西（比如自己画的一排标签按钮）时，用 `additionalSafeAreaInsets` 告诉子页面这一截不能放内容：

```js
panel.additionalSafeAreaInsets = new UIEdgeInsets(0, 0, 44, 0);

const label = new UILabel();
label.text = '贴着安全区的底边';
label.translatesAutoresizingMaskIntoConstraints = false;
panel.view.addSubview(label);
const safe = panel.view.safeAreaLayoutGuide;
NSLayoutConstraint.activateConstraints([
  label.centerXAnchor.constraintEqualToAnchor(safe.centerXAnchor),
  label.bottomAnchor.constraintEqualToAnchor(safe.bottomAnchor, { constant: -8 }),
]);
```

**效果**：`panel` 的安全区底边比它的视图底边高 44 pt。那行字的底边离 `panel` 的视图底边 52 pt（44 加上约束里的 8），下面空出来的 44 pt 留给父页面盖东西。

> **注意**：页面还没显示到屏幕上时，`panel.view.safeAreaInsets` 读到的四边都是 0，写了 `additionalSafeAreaInsets` 也一样。页面显示出来、布局过一次之后才是对的（实测）。约束到 `safeAreaLayoutGuide` 的内容不受影响，它会在布局时自动到位。

## 页面和视图

页面和视图是两种对象，分工不同：

| | 页面（`UIViewController`） | 视图（[`UIView`](ui-view.md)） |
| --- | --- | --- |
| 是什么 | 一屏内容的管理者 | 屏幕上的一块矩形 |
| 能不能画到屏幕上 | 不能，它没有位置和大小 | 能 |
| 怎么组织 | 窗口的根页面、导航栈、模态呈现 | 视图树（`addSubview`） |

每个页面有且只有一个根视图 `view`。有两点要知道：

- **`view` 在第一次读取时才创建。** `new UIViewController()` 之后还没有视图，第一次读 `page.view` 时系统才创建它。之后每次读到的是同一个对象。这个过程对使用没有影响：`page.view` 永远有值，任何时候都可以往里加内容，包括页面显示之前。
- **`view` 的大小由系统决定。** 页面是窗口的根页面时，`view` 占满整个窗口；在导航栈里、被模态呈现时，由导航控制器和系统设定。不需要自己设 `frame`。只有自己加的子控制器，它的 `view` 的位置和大小由 App 的代码给出。
- **`view` 不能换成别的视图。** `view` 是只读属性。要用滚动视图做一屏的内容，把滚动视图加成 `page.view` 的子视图并让它铺满。
- **页面还没显示时，`view` 的大小和安全区不是最终值。** 实测：还没进窗口的页面，`view.safeAreaInsets` 四边都是 0 pt。用约束定位的内容不受影响，布局时自动到位。

界面内容加在 `page.view` 上，页面之间的关系设在页面上。两边不能混：视图不能当页面用，页面也不能当视图加进视图树。

## 父子控制器

一个页面可以包含别的页面，包含别人的叫父控制器，被包含的叫子控制器。导航栈和底部标签栏就是系统写好的两种父控制器，要这两种界面时直接用它们。系统没有提供的容器（比如自己画的标签条、左右分栏）才需要自己写，见[把另一个页面嵌进这个页面](#把另一个页面嵌进这个页面)。

只是把一屏拆成几块来写时，不需要子控制器：写几个返回视图的函数，把视图加到 `page.view` 上。子控制器用在这一块本身是一个完整的页面的时候，比如它里面有导航栈。

父子关系和视图树是两件事，各管各的：

| | 父子控制器 | 视图树 |
| --- | --- | --- |
| 建立 | `parent.addChildViewController(child)` | `parent.view.addSubview(child.view)` |
| 作用 | 子页面知道自己属于谁，安全区、`navigationController` 这些从父页面传下来 | 子页面的内容显示在屏幕上 |
| 解除 | `child.removeFromParentViewController()` | `child.view.removeFromSuperview()` |

两边都要做，系统不会自动同步。

父控制器保管它的子控制器：加进去之后不需要保存 `child` 变量；移除之后没有变量保存它时，它被回收（实测）。

父子关系不能成环。把页面加成它自己的子控制器，或者把它的祖先加成它的子控制器，抛 `TypeError`，原来的关系不变。

加入和移除时各有两个通知要发给子页面。系统发一半，另一半要由代码调：

| 时机 | 通知 | 谁来调 |
| --- | --- | --- |
| 加入之前 | `child.willMoveToParentViewController(parent)` | `addChildViewController` 自动调 |
| 加入之后 | `child.didMoveToParentViewController(parent)` | **自己调** |
| 移除之前 | `child.willMoveToParentViewController(null)` | **自己调** |
| 移除之后 | `child.didMoveToParentViewController(null)` | `removeFromParentViewController` 自动调 |

这两个通知是发给系统的，JS 里收不到它们：子页面上没有对应的事件。漏掉「自己调」的那两句时的后果，**未在模拟器验证**。

## 模态呈现

显示一个新页面有两种方式。它们的含义不同：

| | 推入导航栈（push） | 模态呈现（present） |
| --- | --- | --- |
| 从哪里进入 | 从右边滑入 | 从底部滑入 |
| 含义 | 同一件事的下一层，比如「列表 → 详情」 | 打断当前的事，比如「登录」「新建」 |
| 用户怎么退出 | 点返回按钮，或从屏幕左边缘向右滑 | 向下拖（卡片式时），或点页面上的关闭按钮 |
| 系统给不给返回按钮 | 给 | 不给，要自己放关闭按钮 |
| 写法 | [`nav.pushViewController()`](ui-navigation-controller.md) | [`page.presentViewController()`](#presentviewcontroller) |

模态呈现时新页面盖在上面，下面的页面不能操作，关掉以后回到原处。下面的页面没有被移除，它的内容和状态都保留。

推荐的选择：新页面是当前内容的下一层、用户会想「返回」时用导航栈；新页面是一件独立的事、做完或取消后回到原处时用模态呈现。

模态页的保管和回收：弹出期间由呈现它的页面保管；关闭之后，没有变量保存它时被回收，见[页面由谁保管](#页面由谁保管)。

### 谁呈现了谁

`a.presentViewController(b)` 之后，两个页面之间有一对互相指向的属性：

- `a.presentedViewController` 是 `b`：`a` 弹出的那个页面。
- `b.presentingViewController`：弹出 `b` 的那个页面。

> **注意**：`b.presentingViewController` 不一定是 `a`。`a` 在导航栈里时，它是 `a` 所在的那个 `UINavigationController`。系统把呈现交给了最近的容器。

```js
const host = new UIViewController();
const nav = new UINavigationController(host);
const modal = new UIViewController();

async function show() {
  await host.presentViewController(modal, { animated: false });
  console.log(host.presentedViewController === modal);    // true
  console.log(modal.presentingViewController === host);   // false
  console.log(modal.presentingViewController === nav);    // true
}
```

**效果**：`nav` 是窗口的根页面时调 `show()`，控制台依次输出 `true`、`false`、`true`。

`a` 不在任何容器里时（比如完整例子里的 `page`），`b.presentingViewController` 是不是 `a`，**未在模拟器验证**。

### 关闭事件

模态页被关闭有两条途径，只有一条派发事件：

| 途径 | 派发事件 |
| --- | --- |
| 用户向下拖走卡片 | 派发 `willdismiss`，然后 `diddismiss` |
| 代码调 `dismissViewController()` | **不派发任何事件**（实测：三个事件一个都没有收到） |

代码关闭不派发事件，是因为这三个事件对应的系统通知只在用户发起关闭时发出。代码关闭的时刻由代码自己掌握：`dismissViewController()` 返回的 Promise 在关闭动画结束后兑现，收尾写在它后面。

两条途径共用一段收尾的写法见[模态页的打开和关闭怎么组织](#模态页的打开和关闭怎么组织)。

事件派发在**被弹出的那个页面**上。完整的事件表见[事件](#事件)。

## 成员说明

### 创建

#### `new UIViewController()`

创建一个页面。没有参数。

```js
const page = new UIViewController();
```

- 新建的页面不会自己显示。要把它设成窗口的 [`rootViewController`](ui-window.md)、推入导航栈、放进标签栏、模态呈现，或者加成子控制器。
- 创建页面不需要场景或窗口。
- 新建的页面没有被任何对象保管。在把它显示出来之前，要有变量保存它。
- **出错**：继承它再构造会抛 `TypeError`：

  ```
  Illegal constructor: MyPage extends UIViewController, but subclassing native classes is not supported yet
  ```

  替代写法见[原生类](native-classes.md)。

### 内容和标题

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `view` | [`UIView`](ui-view.md) | 是 | 否 | 第一次读取时由系统创建 | 页面的根视图。页面的内容都放在它里面。永远有值 |
| `title` | 字符串或 `null` | 是 | 是 | `null`（**未在模拟器验证**） | 页面标题。页面在导航栈里时显示在导航条正中，也是下一页返回按钮的文字 |
| `navigationItem` | [`UINavigationItem`](ui-bar-button-item.md) | 是 | 否 | 系统自动创建 | 这个页面在导航条上的配置：标题、副标题、左右两侧的按钮。永远有值 |

`title` 没有变化通知。它只能被 App 的代码修改。

`title` 写入时按 `String()` 转换，`5` 得到 `'5'`。写 `null` 或 `undefined` 得到 `null`。

> **注意**：写 `page.title` 会同时改 `page.navigationItem.title`。反过来不会：写 `page.navigationItem.title` 之后，`page.title` 不变。两个属性只用其中一个。详见[导航条上的东西](ui-bar-button-item.md)。

### 模态呈现的方法

#### `presentViewController()`

把另一个页面模态呈现出来，盖在当前页面上面。

```js
page.presentViewController(sheet, { animated: true }).then((shown) => {
  console.log(shown);   // true
});
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `viewController` | `UIViewController` | 要弹出的页面 |
| `options.animated` | 布尔，可省略 | `true`：有进入动画。`false` 或省略：直接出现 |

- **返回**：`Promise<boolean>`。进入动画结束后兑现为 `true`。
- 调用之后 `page.presentedViewController` 立刻就是 `sheet`，不用等 Promise 兑现。
- 呈现的样式和动画由**被弹出的页面**上的 `modalPresentationStyle` 和 `modalTransitionStyle` 决定，要在调用之前设好。
- 弹出期间被弹出的页面由调用者保管，不需要另外保存。
- `options.animated` 按 `Boolean()` 转换。
- **出错**：
  - 第一个参数必须是页面。传别的值（`null`、数字、普通对象、不是页面的原生对象）时的行为**未在模拟器验证**，不要依赖它。
  - 第一个参数是还没有绑定场景的窗口（`new UIWindow()` 不传参数得到的对象）：抛 `TypeError: presentViewController: UIWindow has no native object yet, so it cannot be passed as an argument`。
  - 被弹出的页面已经显示在别处（比如它是窗口的根页面，或者已经被弹出）时的结果，**未在模拟器验证**。

#### `dismissViewController()`

关闭模态页。

```js
sheet.dismissViewController({ animated: true }).then((closed) => {
  console.log(closed);   // true
});
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `options.animated` | 布尔，可省略 | `true`：有退出动画。`false` 或省略：直接消失 |

- **返回**：`Promise<boolean>`。退出动画结束后兑现为 `true`。
- 在被弹出的页面上调用（`sheet.dismissViewController()`），关闭的是它自己。
- 在发起呈现的页面上调用（`page.dismissViewController()`），关闭的是它弹出的那个页面。**这种写法未在模拟器验证。**
- 不派发 `willdismiss`、`diddismiss`。

### 模态呈现的属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `presentedViewController` | `UIViewController` 或 `null` | 是 | 否 | `null` | 这个页面弹出的模态页。没有弹出任何页面时是 `null` |
| `presentingViewController` | `UIViewController` 或 `null` | 是 | 否 | `null` | 弹出这个页面的页面。没有被模态呈现时是 `null`。它可能是一个导航控制器，见[谁呈现了谁](#谁呈现了谁) |
| `modalPresentationStyle` | 字符串枚举 | 是 | 是 | 读出来是 `'formSheet'`，见下 | 这个页面被模态呈现时的样式 |
| `modalTransitionStyle` | 字符串枚举 | 是 | 是 | `'coverVertical'` | 这个页面被模态呈现时的进出动画 |
| `isModalInPresentation` | 布尔 | 是 | 是 | `false` | `false`：用户可以向下拖走这个模态页。`true`：用户拖不走，只能由代码关闭；用户尝试拖动时派发 `dismissattempted` |

`presentedViewController` 和 `presentingViewController` 没有专门的变化事件。它们在调 `presentViewController()` 和 `dismissViewController()` 时变化；用户拖走模态页时，用 `diddismiss` 得知。

其余三个属性只能被 App 的代码修改，没有变化通知。`isModalInPresentation` 写入时按 `Boolean()` 转换。

#### `modalPresentationStyle`

这个属性设在**被弹出的页面**上，在弹出之前设。

| 取值 | 效果 |
| --- | --- |
| `'automatic'` | 由系统选一种样式。这是 iOS 的默认值 |
| `'pageSheet'` | 卡片。从底部滑入，用户可以向下拖走 |
| `'formSheet'` | 卡片。在 iPhone 上的样子和 `'pageSheet'` 的差别**未在模拟器验证** |
| `'fullScreen'` | 占满整个屏幕，完全盖住下面的页面。用户不能向下拖走。**未在模拟器验证** |
| `'overFullScreen'` | 占满整个屏幕，但下面的页面仍然保留在屏幕上。模态页的底色是半透明时，能透出下面的页面。**未在模拟器验证** |
| `'currentContext'` | 只盖住「定义了呈现范围」的那个页面。定义呈现范围的属性（`definesPresentationContext`）还没有暴露。**未在模拟器验证** |
| `'overCurrentContext'` | 同 `'currentContext'`，并且下面的页面仍然保留。**未在模拟器验证** |
| `'popover'` | 气泡。需要的配置对象还没有暴露，见[还不能做的](#还不能做的)。**未在模拟器验证** |
| `'custom'` | 自定义转场。需要的能力还没有暴露，见[还不能做的](#还不能做的)。**未在模拟器验证** |
| `'none'` | 表示「不呈现」。不用于弹出页面。**设成它再弹出的结果未在模拟器验证** |

> **注意**：读这个属性得不到 `'automatic'`。新建的页面读出来是 `'formSheet'`：系统返回的是它选定的具体样式。不要拿读出的值和 `'automatic'` 比较。

- **出错**：写入表里没有的值抛 `TypeError`，报错信息里列出所有可用的值：

  ```
  modalPresentationStyle has no value "modal"; expected one of: …
  ```

#### `modalTransitionStyle`

这个属性设在**被弹出的页面**上，在弹出之前设。

| 取值 | 效果 |
| --- | --- |
| `'coverVertical'` | 从屏幕底部向上滑入，关闭时向下滑出 |
| `'crossDissolve'` | 原地淡入，关闭时淡出。**未在模拟器验证** |
| `'flipHorizontal'` | 像翻牌一样水平翻转到新页面。**未在模拟器验证** |
| `'partialCurl'` | 翻页的卷角效果。**未在模拟器验证** |

- **出错**：写入表里没有的值抛 `TypeError`：`modalTransitionStyle has no value "…"; expected one of: …`

### 外观特征

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `traitCollection` | [`UITraitCollection`](ui-trait-collection.md) | 是 | 否 | — | 这个页面所处环境的外观特征：深色还是浅色、屏幕几倍、文字多大 |
| `overrideUserInterfaceStyle` | `'unspecified'` \| `'light'` \| `'dark'` | 是 | 是 | `'unspecified'` | 强制这个页面和它里面的一切用浅色或深色 |

外观特征变了会派发 `traitchange` 事件。用法、取值和要注意的地方都在[外观特征](ui-trait-collection.md)。

### 和导航栈的关系

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `navigationController` | [`UINavigationController`](ui-navigation-controller.md) 或 `null` | 是 | 否 | `null` | 这个页面所在的导航栈。不在任何导航栈里时是 `null` |
| `parentViewController` | `UIViewController` 或 `null` | 是 | 否 | `null` | 包含这个页面的父控制器。页面在导航栈里时，它就是那个导航控制器。见[父子控制器](#父子控制器) |

`tabBarItem` 和 `tabBarController` 这两个和底部标签栏有关的属性，见 [`UITabBarController`](ui-tab-bar-controller.md)。

这两个属性在页面被推入、弹出导航栈时变化。变化的时刻通过导航控制器的 `willshow`、`didshow` 事件得知，见 [`UINavigationController`](ui-navigation-controller.md)。`parentViewController` 也会被 `addChildViewController()` 和 `removeFromParentViewController()` 改变。

### 父子控制器

| 属性 | 类型 | 可读 | 可写 | 默认值 | 说明 |
| --- | --- | --- | --- | --- | --- |
| `childViewControllers` | `UIViewController` 的数组 | 是 | 否 | 空数组 | 子控制器，按加入的顺序。导航控制器管着的页面也在它的这个数组里 |
| `additionalSafeAreaInsets` | [`UIEdgeInsets`](structs.md) | 是 | 是 | 四边都是 0 | 在系统的安全区之外再让出的边距，单位 [pt](units.md)。写入之后这个页面的 `view.safeAreaInsets` 和 `safeAreaLayoutGuide` 跟着变 |

- `childViewControllers` 读到的每个元素和当初加进去的是同一个对象，可以用 `===` 比较。
- 父子关系变了没有事件。它只会被 App 自己的代码改变。
- **出错**：
  - `additionalSafeAreaInsets` 给的不是对象：`TypeError: additionalSafeAreaInsets needs an object with all of: top, left, bottom, right`
  - 缺字段，或字段转不出有限的数：`TypeError: additionalSafeAreaInsets is missing bottom, or it is not a finite number`

| 方法 | 参数 | 作用 |
| --- | --- | --- |
| `addChildViewController(child)` | 一个 `UIViewController` | 把 `child` 收成子控制器。`child` 已经有父控制器时，先从那边移除 |
| `removeFromParentViewController()` | 无 | 离开父控制器。没有父控制器时调用没有效果 |
| `willMoveToParentViewController(parent)` | 一个 `UIViewController` 或 `null` | 通知「即将换父控制器」。`null` 表示即将离开 |
| `didMoveToParentViewController(parent)` | 一个 `UIViewController` 或 `null` | 通知「已经换好父控制器」 |

四个方法都没有返回值。

- **出错**：
  - `addChildViewController` 给的不是页面：`TypeError: addChildViewController needs a UIViewController`
  - 把页面加成它自己的子控制器，或者把它的祖先加成它的子控制器：`TypeError: addChildViewController: a view controller cannot be added as a child of itself or of one of its own descendants`
  - 后两个方法给的既不是页面也不是 `null`：`TypeError: didMoveToParentViewController needs a UIViewController or null`

### 事件

用 `addEventListener()` 在**被弹出的页面**上监听。

| 事件 | 什么时候派发 |
| --- | --- |
| `willdismiss` | 用户向下拖动卡片，卡片即将关闭。实测顺序是先 `willdismiss` 后 `diddismiss`。拖到一半又放回去时是否派发，**未在模拟器验证** |
| `diddismiss` | 用户拖走卡片，关闭完成 |
| `dismissattempted` | 用户想向下拖走卡片，但 `isModalInPresentation` 是 `true`，没有关闭 |

```js
sheet.addEventListener('diddismiss', (event) => {
  console.log(event.type, event.target === sheet);   // 'diddismiss' true
});
```

- 事件对象只有 `type` 和 `target` 两个字段。`target` 是被弹出的那个页面。
- 事件不能取消，`preventDefault()` 不起作用。要阻止用户关闭，用 `isModalInPresentation`。
- 页面还派发 `traitchange`，在外观特征变化时派发，见[外观特征](ui-trait-collection.md)。
- 页面上只能监听这四个事件名。自定义名字的事件不能在页面上监听。
- 回调不是在事情发生的那一刻同步执行，而是稍后执行，见[运行时怎么工作](how-it-works.md)。
- 代码调 `dismissViewController()` 时这三个事件都不派发。
- 监听可以在页面弹出之前注册。
- **出错**：监听不认识的事件名抛 `TypeError`：

  ```
  addEventListener has no value "dismiss"; expected one of: willdismiss / diddismiss / dismissattempted / traitchange
  ```

> **注意**：被弹出的页面是一个 `UINavigationController` 时，收不到这三个事件。在它上面监听这三个事件名会抛错，因为导航控制器只接受自己的 `willshow` 和 `didshow`。

## 与 iOS 原生写法的对照

如果你在看 Apple 的文档或 iOS 的示例代码，按这张表换成 JS 的写法。

| ObjC | JS |
| --- | --- |
| `[[UIViewController alloc] init]` | `new UIViewController()` |
| `vc.view` | `vc.view` |
| `vc.title = @"设置"` | `vc.title = '设置'` |
| `vc.navigationItem` | `vc.navigationItem` |
| `vc.navigationController` | `vc.navigationController` |
| `[host presentViewController:m animated:YES completion:^{…}]` | `await host.presentViewController(m, { animated: true })` |
| `[vc dismissViewControllerAnimated:YES completion:^{…}]` | `await vc.dismissViewController({ animated: true })` |
| `vc.modalPresentationStyle = UIModalPresentationPageSheet` | `vc.modalPresentationStyle = 'pageSheet'` |
| `vc.modalTransitionStyle = UIModalTransitionStyleCrossDissolve` | `vc.modalTransitionStyle = 'crossDissolve'` |
| `vc.modalInPresentation = YES` | `vc.isModalInPresentation = true` |
| `- presentationControllerWillDismiss:` | `vc.addEventListener('willdismiss', …)` |
| `- presentationControllerDidDismiss:` | `vc.addEventListener('diddismiss', …)` |
| `- presentationControllerDidAttemptToDismiss:` | `vc.addEventListener('dismissattempted', …)` |
| `- presentationControllerShouldDismiss:` | 用 `vc.isModalInPresentation` 代替 |
| `[parent addChildViewController:child]` | `parent.addChildViewController(child)` |
| `[child didMoveToParentViewController:parent]` | `child.didMoveToParentViewController(parent)` |
| `[child willMoveToParentViewController:nil]` | `child.willMoveToParentViewController(null)` |
| `[child removeFromParentViewController]` | `child.removeFromParentViewController()` |
| `parent.childViewControllers` | `parent.childViewControllers` |
| `vc.additionalSafeAreaInsets = UIEdgeInsetsMake(0, 0, 44, 0)` | `vc.additionalSafeAreaInsets = new UIEdgeInsets(0, 0, 44, 0)` |
| `vc.tabBarItem`、`vc.tabBarController` | 相同，见 [`UITabBarController`](ui-tab-bar-controller.md) |

有三处和原生不同：

- 原生的 `completion` 回调在 JS 里是 Promise。
- 把页面加成它自己或它后代的子控制器，原生不检查，之后会崩溃。JS 里当场抛 `TypeError`。
- 原生的三个关闭通知在 `vc.presentationController.delegate` 上。JS 里它们是被弹出页面自己的事件，`UIPresentationController` 没有暴露。

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 知道页面什么时候出现、什么时候消失 | `viewDidLoad`、`viewWillAppear:`、`viewDidAppear:`、`viewWillDisappear:`、`viewDidDisappear:` | 未实现。这些是要覆写的方法，需要先支持用 JS 继承原生类 |
| 在页面的视图重新布局时执行代码 | `viewDidLayoutSubviews` | 未实现，原因同上 |
| 继承 `UIViewController` 写自己的页面类 | 子类化 | 未实现。替代写法见[原生类](native-classes.md) |
| 半屏高度的卡片、卡片顶部的抓手 | `UISheetPresentationController` 的 `detents` | 未实现 |
| 气泡式的弹出 | `UIPopoverPresentationController` | 未实现 |
| 自己写页面切换的动画 | `UIViewControllerAnimatedTransitioning` | 未实现 |
| 两个子页面之间带动画地切换 | `transitionFromViewController:toViewController:duration:options:animations:completion:` | 未实现 |
| 子页面知道自己什么时候出现、什么时候消失 | `viewWillAppear:` 一组、`beginAppearanceTransition:animated:` | 未实现，原因同第一行 |
| 弹系统样式的提示框和确认框 | `UIAlertController` | 未实现 |
| 被模态呈现的导航控制器收到关闭事件 | 同 [事件](#事件) | 未实现。导航控制器只接受导航事件。标签栏控制器上可以监听这三个事件名 |
| 在页面上监听自定义名字的事件 | — | 未实现。页面只接受它认识的事件名 |
| 用代码关闭模态页时也收到事件 | — | 系统不发这个通知。在调 `dismissViewController()` 的地方自己处理 |
| 在回调里同步决定「这次让不让用户关闭」 | `presentationControllerShouldDismiss:` | 不做。用 `isModalInPresentation` 预先声明 |
| 每个页面单独控制屏幕方向、状态栏样式 | `supportedInterfaceOrientations`、`preferredStatusBarStyle` | 未实现 |

## 参见

- [`UINavigationController`](ui-navigation-controller.md)：显示页面的另一种方式，推入和弹出导航栈
- [`UITabBarController`](ui-tab-bar-controller.md)：系统写好的底部标签栏
- [导航条上的东西](ui-bar-button-item.md)：`navigationItem` 的类型，导航条的标题和按钮
- [`UIWindow`](ui-window.md)：`rootViewController` 在这里设
- [`UIView`](ui-view.md)：`view` 的类型
- [`UIButton`](ui-button.md)：例子里的「打开」「关闭」按钮
- [Auto Layout](auto-layout.md)：例子里定位按钮用的约束
- [原生类](native-classes.md)：为什么不能继承，以及替代写法
- [颜色](ui-color.md)
- [单位](units.md)
- [`UIWindowScene`](ui-window-scene.md)：场景被销毁后页面怎样被回收，界面的状态存在哪里
- [外观特征](ui-trait-collection.md)：`traitCollection`、`overrideUserInterfaceStyle` 和 `traitchange` 事件
- [实现原理：导航和模态呈现](../internals/navigation.md)
