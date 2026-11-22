# 在页面之间跳转

这一篇讲怎么用导航控制器 [`UINavigationController`](../api/ui-navigation-controller.md) 做「列表 → 详情 → 再下一层」这种一层层进入、再一层层返回的界面：推入、返回、知道现在在哪一页、页面离开时清理、按路径跳转。导航条上的标题和按钮见[在导航条上放按钮和标题](bar-buttons.md)。

## 推荐的做法

- **每次进入时新建页面，不保存页面对象。** 把「造一个页面」写成函数，每次推入时调一次。要保存的是数据（当前看的是哪条记录、表单里填了什么），不是页面。这样有两个好处：用户返回之后，离开的页面占用的内存还给系统；同一种页面可以在栈里出现多次，「详情 → 相关推荐 → 另一个详情」时两个详情页是两个对象，互不影响。重建一个页面的代价很大时（页面里有一张加载好的网页、填到一半的长表单），可以把页面对象保存在变量里，下次进入时推入同一个对象，代价是它一直占着内存。
- **任何时候都以 `nav.viewControllers` 为准。** 用户点返回、左滑返回不经过你的代码。另外记的「当前路径」要在 [`show`](../api/ui-navigation-controller/show-event.md) 里按真实的栈对齐。
- **页面看不见时要停的东西，写在页面自己的 [`disappear`](../api/ui-view-controller/disappear-event.md) 里；页面离开栈时才做的清理，写在 `show` 里。** 页面被下一页盖住和被弹出栈，都会让它派发 `disappear`，这个事件分不出是哪一种。写法见[页面离开栈时做清理](#页面离开栈时做清理)。

```js
/** @param {number} id */
function makeDetail(id) {
  const page = new UIViewController();
  page.title = '订单 ' + id;
  page.view.backgroundColor = 'systemBackground';
  return page;
}

/**
 * @param {UINavigationController} stack
 * @param {number} id
 */
function openDetail(stack, id) {
  stack.pushViewController(makeDetail(id), { animated: true });
}
```

**效果**：每调一次 `openDetail()`，一个新的详情页被推入。用户返回后，这个页面被回收。

## 第一个导航栈

从空白 App 开始：建一个导航控制器，首页上放一个按钮，点按钮进入详情页，并在每次页面切换完成时在控制台输出一行。

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

  button.addEventListener('click', () => {
    const detail = new UIViewController();
    detail.title = '详情';
    detail.view.backgroundColor = 'systemTeal';
    nav.pushViewController(detail, { animated: true });
  });

  // 4. 每次页面切换完成时得到通知。用户点返回、左滑返回也会走到这里
  nav.addEventListener('show', (event) => {
    console.log('现在显示', event.viewController.title, '，栈里有', nav.viewControllers.length, '页');
  });
});
```

**效果**

- 屏幕顶部有一条导航条，正中是「首页」。页面正中是蓝色的「看详情」。
- 点「看详情」，带着动画切换到青色的详情页。导航条的标题变成「详情」，左侧出现返回按钮，上面的字是「首页」。控制台输出 `现在显示 详情 ，栈里有 2 页`。
- 点返回按钮，或者从页面左边缘往右滑，回到首页。控制台输出 `现在显示 首页 ，栈里有 1 页`。

推入、点返回、左滑返回时 `show` 的派发和栈的页数是实测的。这段代码没有作为一个整体在模拟器运行过，其中用到的每个 API 都在验收用例里运行过。

下面的例子沿用这里的 `nav` 和 `home`。单独试某一节时，先写这几行：

```js
const home = new UIViewController();
const nav = new UINavigationController(home);
```

## 进入下一页

```js
const detail = new UIViewController();
detail.title = '详情';
nav.pushViewController(detail, { animated: true });
```

**效果**：屏幕带着动画切换到 `detail`。

`animated` 不写时是 `false`，页面直接换过去，没有动画。推入之后不用保存 `detail`，见[栈里的页面由谁保管](../api/ui-navigation-controller.md#栈里的页面由谁保管)。

## 用代码返回

```js
const popped = nav.popViewController({ animated: true });
console.log(popped === null ? '已经在栈底' : popped.title);
```

**效果**：栈里不止一页时，屏幕回到上一页，控制台输出被弹出页面的标题。栈里只有一页时什么都不发生，控制台输出 `已经在栈底`。

一次返回多层有两个方法：

```js
// 回到栈底
nav.popToRootViewController({ animated: true });

// 回到指定的那一页
nav.popToViewController(home, { animated: true });
```

**效果**：屏幕回到栈底的页面（上面两句在这个例子里效果相同，因为 `home` 就是栈底）。中间的页面一次全部弹出。

## 页面离开栈时做清理

有些清理只在页面离开栈之后做，比如释放页面占着的资源。做法是登记一张「页面 → 清理函数」的表，每次 `show` 时检查表里哪些页面已经不在栈里。只是想在页面看不见时暂停定时器，用页面自己的 [`disappear`](../api/ui-view-controller/disappear-event.md) 更简单。

```js
/** @type {Map<UIViewController, () => void>} */
const cleanups = new Map();

nav.addEventListener('show', () => {
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
- 这个写法只处理「离开栈」。页面被新推入的页面盖住时，它还在栈里，清理函数不会执行。要在被盖住时暂停，在 `show` 里比较 `event.viewController` 和这个页面。

这段代码没有作为一个整体在模拟器运行过。它依赖的两点是实测的：用户返回时派发 `show`；回调里读到的 `nav.viewControllers` 是返回之后的栈。

## 按路径跳转页面

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
nav.addEventListener('show', () => {
  while (paths.length > nav.viewControllers.length) paths.pop();
  console.log('当前路径', paths[paths.length - 1]);
});

go('/settings');
```

**效果**：屏幕进入「设置」页，控制台输出 `当前路径 /settings`。用户返回后输出 `当前路径 /`。

验收用例里有一个同样结构、带路径参数的版本（`acceptance/src/router.js`），用真实的点击和左滑走过「进入列表 → 打开详情 → 左滑返回」，路径和栈的页数始终一致。

## 把已经显示的页面放进导航栈

正在做窗口根页面的页面，不能直接交给导航控制器。要先让一个空的导航控制器做根页面，再把原来的页面推入。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const shown = new UIViewController();
  shown.view.backgroundColor = 'systemBackground';
  win.rootViewController = shown;
  win.makeKeyAndVisible();

  // 之后想给它套上导航栈
  const wrapper = new UINavigationController();
  win.rootViewController = wrapper;
  wrapper.pushViewController(shown, { animated: false });

  console.log(wrapper.topViewController === shown);
});
```

**效果**：`shown` 成为导航栈的第一页，屏幕顶部多出导航条。控制台输出 `true`。两步在同一段代码里执行完，屏幕上不会出现空白的一帧。

> **注意**：顺序反过来会抛异常。`shown` 还是窗口的根页面时，`new UINavigationController(shown)` 抛 `TypeError: cannot construct UINavigationController with these arguments`，`pushViewController(shown)` 抛以 `pushViewController: ` 开头的 `TypeError`。两种情况下窗口和栈都保持原样。

## 藏起导航条

```js
nav.isNavigationBarHidden = true;
```

**效果**：导航条立刻消失，页面的内容占满原来导航条的位置。

带动画地藏起或显示：

```js
nav.setNavigationBarHidden(false, { animated: true });
```

**效果**：导航条带着动画回来。**动画未在模拟器验证。**

导航条藏起之后没有返回按钮。这时左滑返回是否还能用，**未在模拟器验证**。

## 首页藏起导航条，其余页面显示

[`beforeshow`](../api/ui-navigation-controller/beforeshow-event.md) 在切换开始时派发，事件对象的 `viewController` 是即将显示的页面。

```js
nav.addEventListener('beforeshow', (event) => {
  nav.setNavigationBarHidden(event.viewController === home, { animated: true });
});
```

**效果**：显示首页时没有导航条；进入其他页面时导航条出现，返回首页时又消失。验收用例的界面就是这样做的。

> **注意**：判断「即将显示哪一页」用 `event.viewController`，不要用 `nav.topViewController`。

## 一次换掉整个栈

```js
const pageA = new UIViewController();
const pageB = new UIViewController();
pageA.title = 'A';
pageB.title = 'B';

nav.setViewControllers([home, pageA, pageB], { animated: true });
console.log(nav.viewControllers.length, nav.topViewController === pageB);
```

**效果**：栈变成首页、A、B 三页，屏幕显示 B。控制台输出 `3 true`。

不要动画时也可以直接给属性赋值：

```js
nav.viewControllers = [home];
```

**效果**：栈只剩首页，屏幕立刻显示首页。

## 参见

- [`UINavigationController`](../api/ui-navigation-controller.md)：导航控制器的全部成员、左滑返回的条件
- [在导航条上放按钮和标题](bar-buttons.md)
- [做一个页面](pages.md)：页面的出现和消失事件
- [`UITabBarController`](../api/ui-tab-bar-controller.md)：每个标签里常放一个导航控制器
