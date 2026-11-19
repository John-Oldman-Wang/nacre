---
type: reference
native: UIViewController.preferredInterfaceOrientationForPresentation
---

# `UIViewController`：`preferredInterfaceOrientationForPresentation` 属性

**`preferredInterfaceOrientationForPresentation`** 属性是这个页面被全屏弹出时，一出来是什么方向。

## 值

方向名：`'portrait'`、`'portraitUpsideDown'`、`'landscapeLeft'`、`'landscapeRight'`。

- 可读，可写。在 iPhone Air 模拟器（iOS 27.2）上默认是 `'portrait'`。
- 只在这个页面被全屏弹出（`modalPresentationStyle` 是 `'fullScreen'`）时起作用。弹出后的效果**未在模拟器验证**。
- 要和这个页面的 [`supportedInterfaceOrientations`](supportedinterfaceorientations.md) 一致，否则系统按允许的方向来。

只有用 `new UIViewController()`、`new UINavigationController()`、`new UITabBarController()` 建的页面能写。系统的页面（弹窗、分享面板、选图、拍照）不能写，写了抛 `TypeError`：原生开发时也改不了它们的这一项。

### 写错时

不认识的名字：不生效，打一条警告，列出四个可选的名字。

## 示例

```js
const page = new UIViewController();
page.preferredInterfaceOrientationForPresentation = 'landscapeRight';
console.log(page.preferredInterfaceOrientationForPresentation);
```

**结果**：输出 `landscapeRight`。

## 对应的 iOS API

`UIViewController.preferredInterfaceOrientationForPresentation`。原生里它是只读的，要在子类里覆写；这里直接写。

## 参见

- [`supportedInterfaceOrientations`](supportedinterfaceorientations.md)
- [`presentViewController()`](presentviewcontroller.md)
