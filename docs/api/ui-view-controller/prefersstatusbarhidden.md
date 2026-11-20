---
type: reference
native: UIViewController.prefersStatusBarHidden
---

# `UIViewController`：`prefersStatusBarHidden` 属性

**`prefersStatusBarHidden`** 属性表示这个页面在屏幕上时，状态栏藏不藏。状态栏是屏幕最上面显示时间、信号、电量的那一条。

## 值

布尔值，照布尔转换。

- 可读，可写。默认 `false`。
- `true`：藏起来。全屏弹出的页面设 `true` 之后，状态栏藏起来了（实测：[`statusBarManager.isStatusBarHidden`](../ui-status-bar-manager/isstatusbarhidden.md) 变成 `true`）。
- `false`：显示。
- 写入后运行时马上通知系统重新来问，不用自己调 [`setNeedsStatusBarAppearanceUpdate()`](setneedsstatusbarappearanceupdate.md)。
- 系统问的是最上面那个全屏的页面：窗口的根页面，或者它全屏弹出的页面。
- 页面在导航控制器里时，导航控制器自己设了这个值就以它为准；没设，就听导航控制器当前显示的那个页面（两种都实测过）。所以每个页面可以各自设，推入、返回时状态栏跟着变。标签控制器的情况**未在模拟器验证**。

只有用 `new UIViewController()`、`new UINavigationController()`、`new UITabBarController()` 建的页面能写。系统的页面（弹窗、分享面板、选图、拍照）不能写，写了抛 `TypeError`：原生开发时也改不了它们的这一项。

## 示例

```js
const page = new UIViewController();
page.prefersStatusBarHidden = true;
console.log(page.prefersStatusBarHidden);
```

**结果**：输出 `true`。这个页面是窗口的根页面时，状态栏藏起来。

## 对应的 iOS API

`UIViewController.prefersStatusBarHidden`。原生里它是只读的，要在子类里覆写；这里直接写。

## 参见

- [`preferredStatusBarStyle`](preferredstatusbarstyle.md)
- [`UIStatusBarManager`](../ui-status-bar-manager.md)：状态栏此刻的样子
