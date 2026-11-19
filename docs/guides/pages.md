# 做一个页面

这一篇讲怎么用 [`UIViewController`](../api/ui-view-controller.md) 做一屏内容：往页面上放东西、设标题、在页面出现和消失时做事、把另一个页面嵌进来。页面怎么弹出和关闭，见[弹出一个模态页](modal-pages.md)。

## 推荐的做法

- **写一个函数造页面。** 页面不能继承。在函数里 `new UIViewController()`，往它的 [`view`](../api/ui-view-controller/view.md) 里放内容，再返回它。
- **不保存页面。** 显示着的页面由放它的那一方保管：窗口、导航栈、呈现者、父控制器。需要的时候新建，离开之后让它被回收；下一次要显示同样的内容，按数据重新建一个。只有重建代价大的页面才保存在变量里反复使用，代价是它和它的全部视图一直占着内存。见[页面由谁保管](../api/ui-view-controller.md#页面由谁保管)。
- **不要把页面保存到 `sceneconnect` 的回调外面。** 场景被系统销毁时，没有被保存的窗口、页面和视图一起被回收；保存在外面的不会。见 [`UIWindowScene`](../api/ui-window-scene.md)。
- **根视图要设底色。** 页面的根视图默认是透明的。根页面不设底色时屏幕是黑的；模态页不设底色时能透过它看到下面的内容。**两条都未在模拟器验证。**

## 第一个页面

从空白 App 开始，做一个页面，左上角显示一行字。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);

  // 1. 造页面，设底色
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';

  // 2. 往根视图里放内容，贴着安全区定位
  const label = new UILabel();
  label.text = '你好';
  label.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(label);
  const safe = page.view.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    label.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 16 }),
    label.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
  ]);

  // 3. 设成窗口的根页面，显示出来
  win.rootViewController = page;
  win.makeKeyAndVisible();
});
```

**效果**

- 页面底色在浅色模式下是白色，在深色模式下是黑色。
- 页面左上角出现「你好」两个字，距离安全区的上边和左边各 16 [pt](../api/units.md)。

「安全区」是屏幕上不被刘海、状态栏、底部横条遮挡的区域。`safeAreaLayoutGuide` 代表这块区域，用法见 [Auto Layout](../api/auto-layout.md)。颜色的写法见[颜色](../api/ui-color.md)。

下面的例子沿用这里的 `page`。单独试某一节时，先写这几行：

```js
const page = new UIViewController();
```

## 设标题

```js
page.title = '设置';
```

**效果**：页面在[导航栈](../api/ui-navigation-controller.md)里时，屏幕顶部的导航条正中显示「设置」。从它进入下一页后，下一页的返回按钮上也显示「设置」。

页面不在导航栈里时没有导航条，标题不显示在任何地方。导航条上的按钮、副标题等通过 [`page.navigationItem`](../api/ui-view-controller/navigationitem.md) 设置，见[在导航条上放按钮和标题](bar-buttons.md)。

## 每次回到页面时刷新内容

```js
/** 你自己的函数 */
function reloadOrders() {}

page.addEventListener('beforeappear', () => {
  reloadOrders();
});
```

**效果**：页面第一次显示时执行一次 `reloadOrders()`。从下一页返回、盖在上面的全屏页面关闭、切回这个标签时，各再执行一次。

[`beforeappear`](../api/ui-view-controller/beforeappear-event.md) 表示「视图即将出现在屏幕上」，不只是第一次。哪些情况会派发见[页面的出现和消失](../api/ui-view-controller.md#页面的出现和消失)。

## 页面显示出来之后让输入框自动聚焦

```js
const field = new UITextField();
page.view.addSubview(field);

page.addEventListener('appear', () => {
  field.becomeFirstResponder();
}, { once: true });
```

**效果**：页面的转场动画结束后，输入框开始输入，键盘弹出。实测在这个回调里调 `becomeFirstResponder()` 返回 `true`。

`{ once: true }` 让它只在第一次出现时聚焦。不写的话，每次回到这个页面都会聚焦一次。

## 页面看不见时停掉定时器

```js
/** 你自己的函数 */
function refreshPrice() {}

/** @type {number | undefined} */
let timer;

page.addEventListener('beforeappear', () => {
  timer = setInterval(refreshPrice, 1000);
});
page.addEventListener('disappear', () => {
  clearInterval(timer);
});
```

**效果**：页面在屏幕上时每秒执行一次 `refreshPrice()`。页面被下一页盖住、被关闭、切到别的标签之后停止；回到这个页面时重新开始。

## 知道自己在不在导航栈里

```js
const stack = page.navigationController;
if (stack) {
  stack.popViewController({ animated: true });
}
```

**效果**：`page` 在导航栈里时返回上一页。不在时什么都不做。

[`navigationController`](../api/ui-view-controller/navigationcontroller.md) 不在任何导航栈里时是 `null`，使用前要判断。

## 把另一个页面嵌进这个页面

要在一个页面里的某一块区域显示另一个页面的内容，把它加成**子控制器**。只是把一屏拆成几块来写时不需要子控制器：写几个返回视图的函数，把视图加到 `page.view` 上就行。子控制器用在这一块本身是一个完整的页面的时候，比如它里面有导航栈。

加入一共三句，顺序固定：

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

三句都要写。只做第 2 句，`panel` 不知道自己属于谁，也没有被 `page` 保管，见 [`addChildViewController()`](../api/ui-view-controller/addchildviewcontroller.md)。

拿掉它的时候反过来，也是三句：

```js
panel.willMoveToParentViewController(null);   // 1. 告诉它要离开了
panel.view.removeFromSuperview();             // 2. 把视图摘掉
panel.removeFromParentViewController();       // 3. 解除父子关系

console.log(page.childViewControllers.length);
console.log(panel.parentViewController);
```

**效果**：青色矩形消失。控制台输出 `0` 和 `null`。

## 给子页面让出一截安全区

父页面在子页面上面盖了东西（比如自己画的一排标签按钮）时，用 [`additionalSafeAreaInsets`](../api/ui-view-controller/additionalsafeareainsets.md) 告诉子页面这一截不能放内容。`panel` 是上一节嵌进来的子页面：

```js
const panel = new UIViewController();
page.addChildViewController(panel);
page.view.addSubview(panel.view);
panel.didMoveToParentViewController(page);

panel.additionalSafeAreaInsets = new UIEdgeInsets(0, 0, 44, 0);

const note = new UILabel();
note.text = '贴着安全区的底边';
note.translatesAutoresizingMaskIntoConstraints = false;
panel.view.addSubview(note);
const panelSafe = panel.view.safeAreaLayoutGuide;
NSLayoutConstraint.activateConstraints([
  note.centerXAnchor.constraintEqualToAnchor(panelSafe.centerXAnchor),
  note.bottomAnchor.constraintEqualToAnchor(panelSafe.bottomAnchor, { constant: -8 }),
]);
```

**效果**：`panel` 的安全区底边比它的视图底边高 44 pt。那行字的底边离 `panel` 的视图底边 52 pt（44 加上约束里的 8），下面空出来的 44 pt 留给父页面盖东西。

> **注意**：页面还没显示到屏幕上时，`panel.view.safeAreaInsets` 读到的四边都是 0，写了 `additionalSafeAreaInsets` 也一样。页面显示出来、布局过一次之后才是对的（实测）。约束到 `safeAreaLayoutGuide` 的内容不受影响。

## 参见

- [`UIViewController`](../api/ui-view-controller.md)：页面的全部成员
- [弹出一个模态页](modal-pages.md)
- [`UIView`](../api/ui-view.md)：`view` 的类型
- [Auto Layout](../api/auto-layout.md)：定位用的约束
- [`UINavigationController`](../api/ui-navigation-controller.md)、[`UITabBarController`](../api/ui-tab-bar-controller.md)：系统写好的两种父控制器
