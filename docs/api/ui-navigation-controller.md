# `UINavigationController`

页面栈。push 进去、pop 出来，导航条、返回按钮、边缘返回手势都是系统给的。

```js
const home = new UIViewController();
home.title = '首页';
home.view.backgroundColor = UIColor.systemTealColor;

const nav = new UINavigationController(home);
win.rootViewController = nav;
win.makeKeyAndVisible();

const detail = new UIViewController();
detail.title = '详情';
nav.pushViewController(detail, { animated: true });
```

推进去之后导航条上自动出现一个写着「首页」的返回按钮——**只靠 `title` 这一个属性**，不用自己造按钮。

## 继承关系

```
EventTarget → NSObject → UIResponder → UIViewController → UINavigationController
```

## 创建

```js
new UINavigationController()        // 空栈
new UINavigationController(home)    // = initWithRootViewController:
```

**不用自己保持引用**：栈持有栈里的页面，而栈由窗口持有，窗口由场景持有。

## 栈

| 成员 | 效果 |
| --- | --- |
| `viewControllers` 读写 | 当前的栈，**栈底在前**。赋值等于整栈替换（不带动画） |
| `topViewController` 只读 | 栈顶那一个。空栈时 `null` |
| `visibleViewController` 只读 | 有模态页就是模态页，否则同 `topViewController` |
| `pushViewController(vc, { animated })` | 压栈。**已经在栈上的页面不会被重复压入** |
| `popViewController({ animated })` | 出栈，返回被弹出的那一个；**栈底弹不动时返回 `null`** |
| `popToViewController(vc, { animated })` | 一直弹到这一页在栈顶，返回被弹掉的那些（栈底在前） |
| `popToRootViewController({ animated })` | 弹到只剩栈底 |
| `setViewControllers([...], { animated })` | 整栈替换。`animated` 时系统按新栈顶在不在旧栈里，自己决定演 push 还是 pop |

```js
nav.viewControllers.length;                       // 1
nav.pushViewController(detail, { animated: true });
nav.viewControllers.length;                       // 2
nav.popViewController({ animated: true });        // → detail
nav.popViewController({ animated: true });        // → null（栈底弹不动）
```

> 往栈里放非 `UIViewController` 的东西会抛 `TypeError`，**不会被当成 nil 悄悄吞掉**，而且被拒时栈不会被改坏。

## 页面上的关系属性

这三个在 [`UIViewController`](README.md) 上：

| 成员 | 效果 |
| --- | --- |
| `title` 读写 | 导航条上的标题。**下一页的返回按钮默认显示这个** |
| `navigationController` 只读 | 它所在的导航控制器；不在栈上就是 `null` |
| `parentViewController` 只读 | 容器父控制器——在栈上时就是那个导航控制器 |

```js
home.navigationController === nav;    // true
nav.popViewController({});
detail.navigationController;          // null ——弹出来就不属于它了
```

## 导航条

这一步只做藏和显：

```js
nav.isNavigationBarHidden = true;                        // 立刻
nav.setNavigationBarHidden(false, { animated: true });   // 带动画
```

导航条上的标题、返回按钮、左右按钮属于 [`UINavigationItem`](#还没做)，还没做。

## 事件

```js
nav.addEventListener('didshow', (e) => {
  console.log('现在显示', e.viewController.title);
});
```

| 事件 | 什么时候 |
| --- | --- |
| `willshow` | 某个页面将要显示 |
| `didshow` | 某个页面已经显示 |

**这两条带数据**：`e.viewController` 是那个页面。

> 和 [`scroll`](ui-scroll-view.md#事件) 不带数据不矛盾。判据是**那个信息在对象上读不读得到**：滚动的位置在 `contentOffset` 上读得到，所以 `scroll` 不带（不带才能无损合并）；导航的「哪个页面」在 `willshow` 那一刻从 `nav` 上读不到——`topViewController` 还没换过去——所以带上。

真实的点击返回会走完整条链：

```
didshow：现在显示「详情」，栈深 2
（点返回按钮）
didshow：现在显示「首页」，栈深 1
```

## 属性一览

| 属性 | 类型 | 读写 |
| --- | --- | --- |
| `viewControllers` | `UIViewController[]` | 读写 |
| `topViewController` | `UIViewController \| null` | 只读 |
| `visibleViewController` | `UIViewController \| null` | 只读 |
| `isNavigationBarHidden` | `boolean` | 读写 |

## 和原生的对照

| ObjC | JS |
| --- | --- |
| `[[UINavigationController alloc] initWithRootViewController:home]` | `new UINavigationController(home)` |
| `[nav pushViewController:vc animated:YES]` | `nav.pushViewController(vc, { animated: true })` |
| `[nav popViewControllerAnimated:YES]` | `nav.popViewController({ animated: true })` |
| `[nav popToViewController:vc animated:YES]` | `nav.popToViewController(vc, { animated: true })` |
| `[nav popToRootViewControllerAnimated:YES]` | `nav.popToRootViewController({ animated: true })` |
| `[nav setViewControllers:@[a, b] animated:YES]` | `nav.setViewControllers([a, b], { animated: true })` |
| `nav.viewControllers = @[a, b]` | `nav.viewControllers = [a, b]` |
| `[nav setNavigationBarHidden:YES animated:YES]` | `nav.setNavigationBarHidden(true, { animated: true })` |
| `vc.navigationController` | `vc.navigationController` |
| `- navigationController:didShowViewController:animated:` | `nav.addEventListener('didshow', …)` |
| `nav.delegate` | **不暴露**——它是运行时自己设的，JS 改它会把事件源掐断 |

## 还没做

| | |
| --- | --- |
| `UINavigationItem` / `UIBarButtonItem` | 导航条上的标题、返回按钮、左右按钮，是一整个子系统（光 `UINavigationItem` 就 20+ 个属性，还牵着 `UIMenu`、`UIAction`）。单独一步 |
| 模态呈现 `present` / `dismiss` | 单独一步。`completion` 是 block，会做成 Promise |
| **页面生命周期** | `viewDidLoad`、`viewWillAppear`、`viewDidAppear` 等**全是覆写点不是 delegate**，要能用 JS 子类化原生类才拿得到。`willshow` / `didshow` 是它在导航这一层的替代品 |
| `ES class` 继承 `UIViewController` | 同上。现在 `class MyPage extends UIViewController {}` **建不出原生对象**，见[项目说明](../project.md)的 TODO |
| `toolbar` 一组 | `isToolbarHidden`、`setToolbarHidden:animated:` |
| `hidesBarsOnSwipe` / `hidesBarsOnTap` 一组 | 要和手势那一步一起看 |
| 自定义转场 | `UIViewControllerAnimatedTransitioning`，要先有协议实现的能力 |
| `interactivePopGestureRecognizer` | 边缘返回手势**默认就能用**，但手势对象本身还没暴露 |

---

← 返回 [API 文档](README.md) ・ [实现原理](../internals/navigation.md)
