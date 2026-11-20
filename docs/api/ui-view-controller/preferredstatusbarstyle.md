---
type: reference
native: UIViewController.preferredStatusBarStyle
---

# `UIViewController`：`preferredStatusBarStyle` 属性

**`preferredStatusBarStyle`** 属性是这个页面在屏幕上时，状态栏用什么样式：字是黑的还是白的。

## 值

字符串：

| 值 | 效果 |
| --- | --- |
| `'default'` | 跟着系统的深色、浅色走：浅色时黑字，深色时白字 |
| `'darkContent'` | 黑字。页面顶部是浅色背景时用 |
| `'lightContent'` | 白字。页面顶部是深色背景时用 |

- 可读，可写。默认 `'default'`。
- 全屏弹出的页面设 `'lightContent'` 之后，状态栏的样式跟着变了（实测：[`statusBarManager.statusBarStyle`](../ui-status-bar-manager/statusbarstyle.md) 变成 `'lightContent'`）。
- 写入后运行时马上通知系统重新来问。系统问哪个页面，和 [`prefersStatusBarHidden`](prefersstatusbarhidden.md) 一样；在导航控制器里的情况**未在模拟器验证**。

只有用 `new UIViewController()`、`new UINavigationController()`、`new UITabBarController()` 建的页面能写。系统的页面（弹窗、分享面板、选图、拍照）不能写，写了抛 `TypeError`：原生开发时也改不了它们的这一项。

### 写错时

不认识的值：不生效，打一条警告，列出三个可选的值。

## 示例

```js
const page = new UIViewController();
page.preferredStatusBarStyle = 'lightContent';
console.log(page.preferredStatusBarStyle);
```

**结果**：输出 `lightContent`。这个页面是窗口的根页面时，状态栏的字变成白的。

## 对应的 iOS API

`UIViewController.preferredStatusBarStyle`。原生里它是只读的，要在子类里覆写；这里直接写。

## 参见

- [`prefersStatusBarHidden`](prefersstatusbarhidden.md)
- [`UIStatusBarManager`](../ui-status-bar-manager.md)
