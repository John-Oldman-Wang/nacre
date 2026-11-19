---
type: reference
native: UIViewController.prefersInterfaceOrientationLocked
---

# `UIViewController`：`prefersInterfaceOrientationLocked` 属性

**`prefersInterfaceOrientationLocked`** 属性表示这个页面希望锁住方向（iOS 26 起）。

## 值

布尔值。

- 可读，可写。默认 `false`。
- `true`：希望锁住。系统只在场景居中、和屏幕一样大、没被别的场景遮住时才锁，现在锁没锁读 [`effectiveGeometry.isInterfaceOrientationLocked`](../ui-window-scene-geometry/isinterfaceorientationlocked.md)。锁住之后的效果**未在模拟器验证**。
- `false`：不锁。
- 写入后运行时马上通知系统重新来问。

只有用 `new UIViewController()`、`new UINavigationController()`、`new UITabBarController()` 建的页面能写。系统的页面（弹窗、分享面板、选图、拍照）不能写，写了抛 `TypeError`：原生开发时也改不了它们的这一项。

## 示例

```js
const page = new UIViewController();
page.prefersInterfaceOrientationLocked = true;
console.log(page.prefersInterfaceOrientationLocked);
```

**结果**：输出 `true`。

## 对应的 iOS API

`UIViewController.prefersInterfaceOrientationLocked`。原生里它是只读的，要在子类里覆写；这里直接写。

## 参见

- [`UIWindowSceneGeometry`](../ui-window-scene-geometry.md)
