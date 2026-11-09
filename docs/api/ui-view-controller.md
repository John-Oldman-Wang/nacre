# `UIViewController`

一个页面。它管一个 `view`，以及这个页面怎么被显示出来。

```js
const page = new UIViewController();
page.title = '设置';
page.view.backgroundColor = UIColor.systemBackgroundColor;
```

## 继承关系

```
EventTarget → NSObject → UIResponder → UIViewController
```

## 基本

| 成员 | 类型 | 效果 |
| --- | --- | --- |
| `view` | `UIView` 只读 | 这一页的根视图。**第一次读的时候才创建** |
| `title` | `string` \| `null` | 页面标题。写它会透到 [`navigationItem.title`](ui-bar-button-item.md#title-和-uiviewcontrollertitle-是单向的) |
| `navigationItem` | `UINavigationItem` 只读 | 这一页在导航条上的配置 |
| `navigationController` | `UINavigationController` \| `null` 只读 | 它所在的页面栈 |
| `parentViewController` | `UIViewController` \| `null` 只读 | 容器父控制器 |

> **`class MyPage extends UIViewController {}` 现在建不出原生对象。** 这是已知的洞，见[项目说明](../project.md)的「JS 子类化原生类」。要自定义页面，先 `new UIViewController()` 再往它的 `view` 上挂东西。

## 模态呈现

显示页面的**第二种**方式，和 [push](ui-navigation-controller.md) 并列：

| | push（导航） | present（模态） |
| --- | --- | --- |
| 从哪进来 | 右边滑入 | **底下滑上来** |
| 关系 | 加进栈，「同一件事的更深一层」 | 盖在上面，「**打断**」 |
| 怎么退 | 返回按钮、左滑 | 向下拖、或者你给的出口 |
| 自动给返回按钮 | 给 | **不给** |

```js
const sheet = new UIViewController();
sheet.modalPresentationStyle = 'pageSheet';
await page.presentViewController(sheet, { animated: true });
// …
await sheet.dismissViewController({ animated: true });
```

**两个方法都返回 Promise**——ObjC 侧的 `completion` 是 block，而我们定了[异步一律 Promise](../project.md)。动画跑完才兑现。

| 成员 | 类型 | 默认值 |
| --- | --- | --- |
| `presentViewController(vc, { animated })` | `Promise<boolean>` | |
| `dismissViewController({ animated })` | `Promise<boolean>` | |
| `presentedViewController` | `UIViewController` \| `null` 只读 | |
| `presentingViewController` | `UIViewController` \| `null` 只读 | |
| `modalPresentationStyle` | [枚举字符串](enums.md) | `'automatic'`，但**读出来不是它**（见下） |
| `modalTransitionStyle` | [枚举字符串](enums.md) | `'coverVertical'` |
| `isModalInPresentation` | `boolean` | `false` |

`modalPresentationStyle` 可选：`automatic` `fullScreen` `pageSheet` `formSheet` `currentContext` `overFullScreen` `overCurrentContext` `popover` `custom` `none`。
`modalTransitionStyle` 可选：`coverVertical` `flipHorizontal` `crossDissolve` `partialCurl`。

### 三条实测出来的事

**1. `modalPresentationStyle` 读不出 `'automatic'`。** 头文件写的默认值是 `UIModalPresentationAutomatic`，但 getter 返回的是**系统解析之后的具体样式**——实测一个新建的 `UIViewController` 读出来是 `'formSheet'`。所以**别拿它和 `'automatic'` 比**。

**2. `presentingViewController` 可能不是发起呈现的那一个。** 从导航控制器的子页面呈现时，它是**那个导航控制器**：

```js
await page.presentViewController(sheet, { animated: true });
page.presentedViewController === sheet;                        // true
sheet.presentingViewController === page;                       // false ！
sheet.presentingViewController === page.navigationController;  // true
```

UIKit 把呈现交给了最近的容器。`presentedViewController` 那一侧倒是记在发起者身上。

**3. 程序调用 `dismiss()` 不发任何事件。** 下面那三条通知**只管用户发起的关闭**，实测程序 dismiss 之后收到的事件是 `[]`。所以如果你靠 `diddismiss` 做清理，**程序关闭那条路要自己处理**。

### 关闭事件

```js
sheet.addEventListener('diddismiss', () => cleanup());
```

| 事件 | 什么时候 |
| --- | --- |
| `willdismiss` | 用户的拖拽已经确定会关掉它 |
| `diddismiss` | 关完了 |
| `dismissattempted` | 用户想关，但被 `isModalInPresentation` 挡住了 |

实测一次真实的向下拖：`willdismiss` → `diddismiss`。打开 `isModalInPresentation` 之后再拖：只有 `dismissattempted`，卡片不动。

> ObjC 侧这几条在 `presentationController.delegate` 上，我们**派发到被呈现的那个 VC** 上。`UIPresentationController` 对 JS 没有别的用处，暴露出来只为挂一个 delegate——[底层承诺的是能力对齐，不是形状一致](../project.md)。

### 不许用户拖走

```js
sheet.isModalInPresentation = true;
```

ObjC 侧还有一个 `presentationControllerShouldDismiss:`，要**同步返回 BOOL**。我们没做它——**UIKit 自己已经给了「预先声明的状态」版本，就是这个属性**。这是[那条规则](../project.md)的第二次应用（第一次是屏幕方向）。

## 和原生的对照

| ObjC | JS |
| --- | --- |
| `[[UIViewController alloc] init]` | `new UIViewController()` |
| `vc.view` | `vc.view` |
| `[host presentViewController:m animated:YES completion:^{…}]` | `await host.presentViewController(m, { animated: true })` |
| `[vc dismissViewControllerAnimated:YES completion:^{…}]` | `await vc.dismissViewController({ animated: true })` |
| `vc.modalPresentationStyle = UIModalPresentationPageSheet` | `vc.modalPresentationStyle = 'pageSheet'` |
| `vc.modalInPresentation = YES` | `vc.isModalInPresentation = true` |
| `- presentationControllerDidDismiss:` | `vc.addEventListener('diddismiss', …)` |
| `- presentationControllerShouldDismiss:` | 用 `isModalInPresentation` 代替 |

## 还没做

| | |
| --- | --- |
| **生命周期** | `viewDidLoad`、`viewWillAppear`、`viewDidAppear` 等全是覆写点，要能用 JS 子类化原生类 |
| `UISheetPresentationController` | iOS 15 起的半屏卡片（`detents`、抓手）。一整个子系统 |
| popover | iPad 上的气泡，要 `UIPopoverPresentationController` |
| 自定义转场 | `UIViewControllerAnimatedTransitioning` |
| 容器 API | `addChildViewController:` 一组 |
| 被模态呈现的**导航控制器**收不到关闭事件 | `UINavigationController` 覆写了订阅钩子，它那一侧只认导航事件。要修得让订阅按事件名分流，不按类分流 |

---

← 返回 [API 文档](README.md) ・ [`UINavigationController`](ui-navigation-controller.md) ・ [实现原理](../internals/navigation.md)
