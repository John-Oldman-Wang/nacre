---
type: reference
native: UINavigationController
status: partial
---

# `UINavigationController`

**`UINavigationController`** 表示一个页面栈，称为导航控制器。它自己是一个页面（[`UIViewController`](ui-view-controller.md)），但不显示自己的内容，而是管理一组页面：栈顶的那个页面显示在屏幕上，其余的页面留在栈里不显示。

对栈有两种操作。**推入**（push）把一个新页面放到栈顶，屏幕切换到新页面。**弹出**（pop）拿走栈顶的页面，屏幕回到它下面的那一页。「列表 → 详情 → 再下一层」这种一层层进入、再一层层返回的界面，用的就是它。

导航控制器在屏幕顶部画一条**导航条**。导航条正中显示栈顶页面的标题；栈里不止一页时，导航条左侧有一个**返回按钮**，上面的字是上一页的标题。导航条、返回按钮和切换页面时的动画都由系统提供，不需要自己建。

导航条上显示什么由栈顶的页面决定，不由导航控制器决定：标题读页面的 `title`，按钮读页面的 `navigationItem`，见[导航条上的东西](ui-bar-button-item.md)。

## 用户自己也能返回

栈不只由代码改变。用户有两种不经过代码的返回方式：

- **点返回按钮。** 导航条左侧的那个按钮。
- **左滑返回。** 手指从页面的左边缘往右滑，栈顶页面跟着手指滑走，露出上一页。详见[左滑返回：默认就有](#左滑返回默认就有)。

这两种操作都由系统直接完成弹出，代码没有调用任何方法。弹出完成后，导航控制器派发 `didshow` 事件，事件对象的 `viewController` 是此刻显示的页面，`nav.viewControllers` 已经是弹出之后的栈。

所以任何时候都以 `nav.viewControllers` 为准。代码里如果另外记了一份「现在在第几层」「当前路径是什么」，要在 `didshow` 的回调里按 `nav.viewControllers` 重新对齐，否则用户一点返回，这份记录就和屏幕上的不一致。写法见[按路径跳转页面](#按路径跳转页面)。

## 栈里的页面由谁保管

**推入之后不需要自己保存页面。** 导航控制器保管栈里的每一个页面，窗口保管导航控制器。页面在栈里期间不会被回收，挂在页面上的数据、加在页面上的事件监听器都一直有效。验收用例验证过：推入之后丢掉对页面的引用，再从 `nav.topViewController` 读回来，得到的是同一个对象，上面的数据还在。

**弹出之后，导航控制器不再保管这个页面。** 这时：

- 代码里没有别的地方保存它，它连同它的视图、视图上的按钮和监听器一起被回收。用户点返回按钮或左滑返回弹出的页面也一样（实测：点返回后，被弹出的页面在几秒内被回收）。
- 代码里保存了它（比如 `popViewController()` 的返回值），它就一直留在内存里，可以再次推入。

页面被回收不需要代码做任何事，也没有事件通知。

## 推荐的做法

**每次进入时新建页面，不保存页面对象。** 把「造一个页面」写成函数，每次推入时调一次。要保存的是数据（当前看的是哪条记录、表单里填了什么），不是页面。

```js
/** @param {number} id */
function makeDetail(id) {
  const page = new UIViewController();
  page.title = '订单 ' + id;
  page.view.backgroundColor = 'systemBackground';
  return page;
}

/**
 * @param {UINavigationController} nav
 * @param {number} id
 */
function openDetail(nav, id) {
  nav.pushViewController(makeDetail(id), { animated: true });
}
```

**效果**：每调一次 `openDetail()`，一个新的详情页被推入。用户返回后，这个页面被回收。

这样写有两个好处：

- **内存能被回收。** 用户返回之后，离开的页面占用的内存还给系统。
- **同一种页面可以在栈里出现多次。** 「详情 → 相关推荐 → 另一个详情」时，两个详情页是两个对象，互不影响。同一个页面对象不能在栈里出现两次。

重建一个页面的代价很大时（页面里有一张加载好的网页、填到一半的长表单），可以把页面对象保存在变量里，下次进入时推入同一个对象。代价是这个页面和它的所有视图一直占着内存，直到变量不再指向它。

**页面离开栈时要做的清理，写在 `didshow` 里。** 页面自己不知道什么时候出现、什么时候离开：页面的生命周期回调目前没有开放，见[还不能做的](#还不能做的)。定时器、网络轮询这类需要在页面离开时停掉的东西，由导航控制器的 `didshow` 事件统一处理，写法见[页面离开栈时做清理](#页面离开栈时做清理)。

## 完整例子

下面的代码从空白 App 开始：建一个导航控制器，首页上放一个按钮，点按钮进入详情页，并在每次页面切换完成时在控制台输出一行。

```js
application.addEventListener('sceneconnect', (e) => {
  // 1. 建窗口和首页
  const win = new UIWindow(e.scene);
  const home = new UIViewController();
  home.title = '首页';
  home.view.backgroundColor = 'systemBackground';

  // 2. 建导航控制器，首页作为栈底。让导航控制器做窗口的根页面
  const nav = new UINavigationController(home);
  win.rootViewController = nav;
  win.makeKeyAndVisible();

  // 3. 首页正中放一个按钮，点了推入详情页
  const button = UIButton.buttonWithType('system');
  button.setTitle('看详情', { forState: ['normal'] });
  button.translatesAutoresizingMaskIntoConstraints = false;
  home.view.addSubview(button);
  NSLayoutConstraint.activateConstraints([
    button.centerXAnchor.constraintEqualToAnchor(home.view.centerXAnchor),
    button.centerYAnchor.constraintEqualToAnchor(home.view.centerYAnchor),
  ]);

  button.addEventListener('primaryActionTriggered', () => {
    const detail = new UIViewController();
    detail.title = '详情';
    detail.view.backgroundColor = 'systemTeal';
    nav.pushViewController(detail, { animated: true });
  });

  // 4. 每次页面切换完成时得到通知。用户点返回、左滑返回也会走到这里
  nav.addEventListener('didshow', (ev) => {
    const event = /** @type {Event & { viewController: UIViewController }} */ (ev);
    console.log('现在显示', event.viewController.title, '，栈里有', nav.viewControllers.length, '页');
  });
});
```

**效果**

- 屏幕顶部有一条导航条，正中是「首页」。页面正中是蓝色的「看详情」。
- 点「看详情」，带着动画切换到青色的详情页。导航条的标题变成「详情」，左侧出现返回按钮，上面的字是「首页」。控制台输出 `现在显示 详情 ，栈里有 2 页`。
- 点返回按钮，或者从页面左边缘往右滑，回到首页。控制台输出 `现在显示 首页 ，栈里有 1 页`。

推入、点返回、左滑返回时 `didshow` 的派发和栈的页数是实测的。App 启动后首页第一次显示时是否也输出一行，**未在模拟器验证**。

这段代码没有作为一个整体在模拟器运行过。其中用到的每个 API 都在验收用例里运行过。

## 常见用法

以下例子都沿用上面的 `win`、`nav` 和 `home`。

### 进入下一页

```js
const detail = new UIViewController();
detail.title = '详情';
nav.pushViewController(detail, { animated: true });

console.log(nav.topViewController === detail);
console.log(detail.navigationController === nav);
```

**效果**：屏幕带着动画切换到 `detail`。控制台输出 `true` 和 `true`。

`animated` 不写时是 `false`，页面直接换过去，没有动画。

推入之后不用保存 `detail`，见[栈里的页面由谁保管](#栈里的页面由谁保管)。

### 用代码返回

```js
const popped = nav.popViewController({ animated: true });
console.log(popped === null ? '已经在栈底' : popped.title);
```

**效果**：栈里不止一页时，屏幕回到上一页，控制台输出被弹出页面的标题。栈里只有一页时什么都不发生，返回 `null`，控制台输出 `已经在栈底`。

栈底的页面弹不出去。这不是错误，不抛异常。

一次返回多层有两个方法：

```js
// 回到栈底
nav.popToRootViewController({ animated: true });

// 回到指定的那一页
nav.popToViewController(home, { animated: true });
```

**效果**：屏幕回到栈底的页面（上面两句在这个例子里效果相同，因为 `home` 就是栈底）。中间的页面一次全部弹出。两个方法都返回被弹出的页面组成的数组，靠近栈底的在前。

### 知道现在显示的是哪一页

```js
nav.addEventListener('didshow', (ev) => {
  const event = /** @type {Event & { viewController: UIViewController }} */ (ev);
  console.log('已经显示', event.viewController.title);
});
```

**效果**：每次页面切换完成，控制台输出此刻显示的页面的标题。代码推入、用户点返回按钮、用户左滑返回都会派发（实测）。

要在切换开始之前做事，监听 `willshow`，见[首页藏起导航条，其余页面显示](#首页藏起导航条其余页面显示)。

> **注意**：类型定义里还没有这两个事件的事件对象类型，所以要像上面这样自己标注 `viewController` 字段。

### 页面离开栈时做清理

页面上启动了定时器或轮询时，要在页面离开栈之后停掉。做法是登记一张「页面 → 清理函数」的表，每次 `didshow` 时检查表里哪些页面已经不在栈里。

```js
/** @type {Map<UIViewController, () => void>} */
const cleanups = new Map();

nav.addEventListener('didshow', () => {
  const stack = nav.viewControllers;
  for (const [page, cleanup] of cleanups) {
    if (!stack.includes(page)) {
      cleanups.delete(page);
      cleanup();
    }
  }
});

function openTicker() {
  const page = new UIViewController();
  page.title = '行情';
  page.view.backgroundColor = 'systemBackground';
  const timer = setInterval(() => console.log('刷新行情'), 1000);
  cleanups.set(page, () => clearInterval(timer));
  nav.pushViewController(page, { animated: true });
}

openTicker();
```

**效果**：进入「行情」页后，控制台每秒输出一行 `刷新行情`。用户点返回、左滑返回，或者代码把它弹出之后，输出停止。

- 表里保存了页面对象，所以页面在清理函数执行之前不会被回收。清理之后表里不再有它，它才能被回收。
- 这个写法只处理「离开栈」。页面被新推入的页面盖住时，它还在栈里，清理函数不会执行。要在被盖住时暂停，在 `didshow` 里比较 `event.viewController` 和这个页面。

这段代码没有作为一个整体在模拟器运行过。它依赖的两点是实测的：用户返回时派发 `didshow`；回调里读到的 `nav.viewControllers` 是返回之后的栈。

### 按路径跳转页面

把「路径 → 造页面的函数」记成一张表，跳转时按路径查表。路径的记录跟着 `nav.viewControllers` 走。

```js
/** @type {Record<string, () => UIViewController>} */
const routes = {
  '/settings': () => {
    const page = new UIViewController();
    page.title = '设置';
    page.view.backgroundColor = 'systemBackground';
    return page;
  },
  '/about': () => {
    const page = new UIViewController();
    page.title = '关于';
    page.view.backgroundColor = 'systemBackground';
    return page;
  },
};

// 栈里每一页对应的路径。栈底是 '/'
const paths = ['/'];

/** @param {string} path */
function go(path) {
  const make = routes[path];
  if (!make) throw new Error('no route matches ' + path);
  paths.push(path);
  nav.pushViewController(make(), { animated: true });
}

// 用户点返回、左滑返回不经过 go()，所以在这里按真实的栈对齐
nav.addEventListener('didshow', () => {
  while (paths.length > nav.viewControllers.length) paths.pop();
  console.log('当前路径', paths[paths.length - 1]);
});

go('/settings');
```

**效果**：屏幕进入「设置」页，控制台输出 `当前路径 /settings`。用户返回后输出 `当前路径 /`。

验收用例里有一个同样结构、带路径参数的版本（`acceptance/src/router.js`），用真实的点击和左滑走过「进入列表 → 打开详情 → 左滑返回」，路径和栈的页数始终一致。

### 把已经显示的页面放进导航栈

正在做窗口根页面的页面，不能直接交给导航控制器。要先让一个空的导航控制器做根页面，再把原来的页面推入。

```js
const page = new UIViewController();
page.view.backgroundColor = 'systemBackground';
win.rootViewController = page;

// 之后想给它套上导航栈
const stack = new UINavigationController();
win.rootViewController = stack;
stack.pushViewController(page, { animated: false });

console.log(stack.topViewController === page);
```

**效果**：`page` 成为导航栈的第一页，屏幕顶部多出导航条。控制台输出 `true`。两步在同一段代码里执行完，屏幕上不会出现空白的一帧。

> **注意**：顺序反过来会抛异常。`page` 还是窗口的根页面时，`new UINavigationController(page)` 抛 `TypeError: cannot construct UINavigationController with these arguments`，`pushViewController(page)` 抛以 `pushViewController: ` 开头的 `TypeError`。两种情况下窗口和栈都保持原样。

### 藏起导航条

```js
nav.isNavigationBarHidden = true;
console.log(nav.isNavigationBarHidden);
```

**效果**：导航条立刻消失，页面的内容占满原来导航条的位置。控制台输出 `true`。

带动画地藏起或显示：

```js
nav.setNavigationBarHidden(false, { animated: true });
```

**效果**：导航条带着动画回来。**动画未在模拟器验证。**

导航条藏起之后没有返回按钮。这时左滑返回是否还能用，**未在模拟器验证**。

### 首页藏起导航条，其余页面显示

`willshow` 在切换开始时派发，事件对象的 `viewController` 是即将显示的页面。

```js
nav.addEventListener('willshow', (ev) => {
  const event = /** @type {Event & { viewController: UIViewController }} */ (ev);
  nav.setNavigationBarHidden(event.viewController === home, { animated: true });
});
```

**效果**：显示首页时没有导航条；进入其他页面时导航条出现，返回首页时又消失。验收用例的界面就是这样做的。

> **注意**：判断「即将显示哪一页」用 `event.viewController`，不要用 `nav.topViewController`。

### 一次换掉整个栈

```js
const a = new UIViewController();
const b = new UIViewController();
a.title = 'A';
b.title = 'B';

nav.setViewControllers([home, a, b], { animated: true });
console.log(nav.viewControllers.length, nav.topViewController === b);
```

**效果**：栈变成首页、A、B 三页，屏幕显示 B。控制台输出 `3 true`。带动画时系统播放的是推入还是弹出的动画，由系统按新的栈顶是否在原来的栈里决定，**动画未在模拟器验证**。

不要动画时也可以直接给属性赋值：

```js
nav.viewControllers = [home];
```

**效果**：栈只剩首页，屏幕立刻显示首页。

不在新数组里的页面等于被弹出，见[栈里的页面由谁保管](#栈里的页面由谁保管)。

## 左滑返回：默认就有

左滑返回是系统提供的手势：手指从页面的左边缘按下，往右滑，栈顶的页面跟着手指移动；滑过一定距离后松手，页面被弹出。不需要写任何代码。

它和点返回按钮的结果相同：页面被弹出，导航控制器派发 `willshow` 和 `didshow`。实测：栈里有 2 页时，从导航控制器视图的左边缘往右滑 144 pt，`didshow` 的 `viewController` 是上一页，栈变成 1 页。

手势起作用需要满足四个条件。这四条是 iOS 的规则，除第一条和第四条外**未在模拟器验证**：

| 条件 | 说明 |
| --- | --- |
| 栈里不止一页 | 栈底的页面没有上一页可以返回 |
| 栈顶的页面用的是系统的返回按钮 | 页面设了 `navigationItem.leftBarButtonItems`，或者把 `navigationItem.hidesBackButton` 设成 `true`，手势就不起作用，见[导航条上的东西](ui-bar-button-item.md) |
| 手势没有被禁用 | 目前没有禁用它的接口 |
| 从导航控制器自己的视图的左边缘开始滑 | 导航控制器没有占满屏幕时，起点是它的视图的左边缘，不是屏幕的左边缘 |

手指滑到一半又滑回去松手时，页面不会被弹出。这时是否派发事件，**未在模拟器验证**。

这个手势目前只能用，不能调整：不能禁用，也不能设置它和页面里其他手势谁优先，见[还不能做的](#还不能做的)。

## 成员说明

### 继承关系

```
EventTarget
  └─ NSObject
       └─ UIResponder
            └─ UIViewController
                 └─ UINavigationController
```

它是一个页面，所以 [`UIViewController`](ui-view-controller.md) 的成员它都有：可以做窗口的根页面，可以被模态呈现，也可以放进 [`UITabBarController`](ui-tab-bar-controller.md) 的一个标签里。

### 创建

```js
const empty = new UINavigationController();
const withRoot = new UINavigationController(new UIViewController());
console.log(empty.viewControllers.length, withRoot.viewControllers.length);
```

**结果**：控制台输出 `0 1`。

| 写法 | 得到什么 |
| --- | --- |
| `new UINavigationController()` | 空栈。之后用 `pushViewController()` 或 `viewControllers` 放入页面 |
| `new UINavigationController(page)` | 栈里有一页，`page` 是栈底 |

- **出错**：`page` 正在做某个窗口的根页面时，抛 `TypeError: cannot construct UINavigationController with these arguments`。做法见[把已经显示的页面放进导航栈](#把已经显示的页面放进导航栈)。
- 不能继承：`class MyNav extends UINavigationController {}` 在 `new` 时抛 `TypeError`，见[原生类](native-classes.md)。

### 栈

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `viewControllers` | `UIViewController` 的数组 | 是 | 是 | 空数组，或只有构造时给的那一页 | 栈里的全部页面，栈底在前，栈顶在最后。赋值等于不带动画地换掉整个栈 |
| `topViewController` | `UIViewController` 或 `null` | 是 | 否 | 栈顶的页面 | 栈顶的页面。空栈时是 `null` |
| `visibleViewController` | `UIViewController` 或 `null` | 是 | 否 | 同 `topViewController` | 此刻用户看到的页面。栈顶的页面模态呈现了另一个页面时，是被呈现的那个；否则和 `topViewController` 相同。前一种情况**未在模拟器验证** |

- `viewControllers` 读出来的是当时的一份快照。往这个数组里 `push` 不会改变栈，要整个赋值，或者用下面的方法。
- 读到的每个元素和当初放进去的是同一个对象，可以用 `===` 比较。
- 栈变了的通知是 `willshow` 和 `didshow` 事件。
- **出错**：`viewControllers` 赋值的数组里有不是页面的东西，抛 `TypeError: viewControllers only accepts UIViewController`。这时原来的栈不变。

### 栈的方法

每个方法的最后一个参数是 `{ animated }`。`animated` 是布尔，不写时是 `false`：`true` 带转场动画，`false` 直接切换。整个参数可以不写。

| 方法 | 作用 | 返回 |
| --- | --- | --- |
| `pushViewController(page, { animated })` | 把 `page` 推入栈顶 | 无 |
| `popViewController({ animated })` | 弹出栈顶的页面 | 被弹出的页面。栈里只有一页时不弹出，返回 `null` |
| `popToViewController(page, { animated })` | 弹出 `page` 上面的所有页面，让 `page` 成为栈顶 | 被弹出的页面组成的数组，靠近栈底的在前 |
| `popToRootViewController({ animated })` | 弹出栈底以外的所有页面 | 被弹出的页面组成的数组，靠近栈底的在前。已经在栈底时是空数组 |
| `setViewControllers(pages, { animated })` | 换掉整个栈，`pages` 的最后一个成为栈顶 | 无 |

```js
const a = new UIViewController();
const b = new UIViewController();
nav.pushViewController(a, { animated: false });
nav.pushViewController(b, { animated: false });

const gone = nav.popToRootViewController({ animated: false });
console.log(gone.length, gone[0] === a, gone[1] === b);
```

**结果**：控制台输出 `2 true true`。

- 同一个页面对象不能在栈里出现两次。把已经在栈里的页面再推入一次的结果**未在模拟器验证**。要显示两个内容相同的页面，建两个页面对象。
- `popToViewController(page)` 的 `page` 不在栈里时的结果**未在模拟器验证**。
- **出错**：
  - `pushViewController()` 的参数不是页面：`TypeError: pushViewController: expects a UIViewController`
  - `popToViewController()` 的参数不是页面：`TypeError: popToViewController: expects a UIViewController`
  - `setViewControllers()` 的数组里有不是页面的原生对象：`TypeError: setViewControllers: only accepts UIViewController`
  - 推入的页面正在做窗口的根页面：`TypeError`，信息以 `pushViewController: ` 开头，后面是系统给出的原因

### 导航条

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `isNavigationBarHidden` | 布尔 | 是 | 是 | `false` | `true`：导航条藏起来。`false`：显示。写入时没有动画 |

| 方法 | 作用 | 返回 |
| --- | --- | --- |
| `setNavigationBarHidden(hidden, { animated })` | 藏起或显示导航条。`hidden` 是布尔；`animated` 是布尔，不写时是 `false` | 无 |

导航条藏起或显示没有事件：它只会被代码改变。

导航条上的标题、返回按钮上的字、左右两侧的按钮，都设在页面的 `navigationItem` 上，见[导航条上的东西](ui-bar-button-item.md)。

### 事件

| 事件 | 什么时候派发 | 事件对象 |
| --- | --- | --- |
| `willshow` | 导航控制器即将显示某个页面 | 多一个字段 `viewController`：即将显示的页面 |
| `didshow` | 导航控制器已经显示某个页面，转场动画结束 | 多一个字段 `viewController`：已经显示的页面 |

```js
nav.addEventListener('didshow', (ev) => {
  const event = /** @type {Event & { viewController: UIViewController }} */ (ev);
  console.log(event.type, event.target === nav, event.viewController === nav.topViewController);
});
```

**效果**：每次页面切换完成，输出 `didshow true true`。

- 代码调用 `pushViewController()` 时派发，用户点返回按钮、左滑返回时也派发，两种情况收到的事件相同（实测）。事件对象上没有字段区分「是代码还是用户」「是推入还是弹出」；需要区分时，比较切换前后 `nav.viewControllers.length` 的变化。
- 代码调用 `popViewController()` 一组方法时是否派发，没有单独的记录，**未在模拟器验证**。
- 事件不能取消，不能用它阻止用户返回。
- 回调不是在切换发生的那一刻同步执行，而是稍后执行，见[运行时怎么工作](how-it-works.md)。
- [`traitchange`](ui-trait-collection.md) 事件也能在它上面监听。
- **出错**：监听其他事件名抛 `TypeError`：

  ```
  addEventListener has no value "viewdidappear"; expected one of: willshow / didshow / traitchange
  ```

### 页面上的相关属性

这几个属性在 [`UIViewController`](ui-view-controller.md) 上，所有页面都有。

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `title` | 字符串或 `null` | 是 | 是 | `null` | 页面的标题。这个页面在栈顶时显示在导航条正中；它的下一页在栈顶时，显示在返回按钮上 |
| `navigationItem` | [`UINavigationItem`](ui-bar-button-item.md) | 是 | 否 | 系统自动创建 | 这个页面在导航条上的配置 |
| `navigationController` | `UINavigationController` 或 `null` | 是 | 否 | `null` | 这个页面所在的导航控制器。不在任何栈里时是 `null` |
| `parentViewController` | `UIViewController` 或 `null` | 是 | 否 | `null` | 这个页面的父控制器。页面在栈里时就是那个导航控制器 |

```js
const page = new UIViewController();
console.log(page.navigationController);

nav.pushViewController(page, { animated: false });
console.log(page.navigationController === nav);

nav.popViewController({ animated: false });
console.log(page.navigationController);
```

**结果**：控制台依次输出 `null`、`true`、`null`。页面被弹出之后就不再属于这个导航控制器。

## 与 iOS 原生写法的对照

| ObjC | JS |
| --- | --- |
| `[[UINavigationController alloc] initWithRootViewController:home]` | `new UINavigationController(home)` |
| `[nav pushViewController:vc animated:YES]` | `nav.pushViewController(vc, { animated: true })` |
| `[nav popViewControllerAnimated:YES]` | `nav.popViewController({ animated: true })` |
| `[nav popToViewController:vc animated:YES]` | `nav.popToViewController(vc, { animated: true })` |
| `[nav popToRootViewControllerAnimated:YES]` | `nav.popToRootViewController({ animated: true })` |
| `[nav setViewControllers:@[a, b] animated:YES]` | `nav.setViewControllers([a, b], { animated: true })` |
| `nav.viewControllers = @[a, b]` | `nav.viewControllers = [a, b]` |
| `nav.navigationBarHidden = YES` | `nav.isNavigationBarHidden = true` |
| `[nav setNavigationBarHidden:YES animated:YES]` | `nav.setNavigationBarHidden(true, { animated: true })` |
| `vc.navigationController` | `vc.navigationController` |
| `- navigationController:willShowViewController:animated:` | `nav.addEventListener('willshow', …)` |
| `- navigationController:didShowViewController:animated:` | `nav.addEventListener('didshow', …)` |
| `nav.delegate` | 不开放。事件用 `addEventListener()` 监听 |

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 页面自己知道「即将出现」「已经消失」 | `viewWillAppear:`、`viewDidAppear:`、`viewWillDisappear:`、`viewDidDisappear:`、`viewDidLoad` | 未实现。目前用导航控制器的 `willshow`、`didshow` 代替，见[页面离开栈时做清理](#页面离开栈时做清理) |
| 用 `class` 继承 `UIViewController` 写自己的页面类 | 子类化 | 未实现。`new` 时抛 `TypeError`，见[原生类](native-classes.md) |
| 阻止用户返回，或者在返回前弹确认框 | `navigationItem.backAction`、`UINavigationBarDelegate` | 未实现 |
| 禁用左滑返回，或者设置它和其他手势谁优先 | `interactivePopGestureRecognizer` | 未实现。手势本身默认可用 |
| 导航控制器被模态呈现时，在它上面监听关闭事件 | `willdismiss`、`diddismiss`、`dismissattempted` | 未实现。在导航控制器上监听这三个事件名会抛 `TypeError` |
| 屏幕底部的工具条 | `toolbar`、`isToolbarHidden`、`setToolbarHidden:animated:` | 未实现 |
| 滑动或点击内容时自动藏起导航条 | `hidesBarsOnSwipe`、`hidesBarsOnTap` | 未实现 |
| 定制导航条的背景、字体、颜色 | `navigationBar`、`UINavigationBarAppearance` | 未实现 |
| 自己写切换页面的动画 | `UIViewControllerAnimatedTransitioning` | 未实现 |

## 参见

- [导航条上的东西](ui-bar-button-item.md)：导航条上的标题、返回按钮上的字、左右按钮
- [`UIViewController`](ui-view-controller.md)：页面。`title`、`navigationItem`、`navigationController` 在它上面；模态呈现是另一种显示页面的方式
- [`UITabBarController`](ui-tab-bar-controller.md)：底部标签栏。每个标签里常放一个导航控制器
- [`UIWindow`](ui-window.md)：`rootViewController` 在这里设
- [原生类](native-classes.md)：为什么不能继承
- [运行时怎么工作](how-it-works.md)：事件什么时候执行、对象什么时候被回收
- [实现原理：导航](../internals/navigation.md)
