---
type: reference
native: UINavigationControllerEvent.viewController
---

# `UINavigationControllerEvent`：`viewController` 属性

**`viewController`** 属性是即将显示或已经显示的那一页。

## 值

[`UIViewController`](../ui-view-controller.md)。

- 只读。给它赋值抛 `TypeError`。
- `beforeshow` 里判断「即将显示哪一页」用它，不要用 `nav.topViewController`。
- `show` 里它和 `nav.topViewController` 是同一个对象（实测）。
- 用 [`new`](constructor.md) 创建时没给，是 `null`。

## 示例

```js
const home = new UIViewController();
const nav = new UINavigationController(home);
nav.addEventListener('show', (e) => {
  console.log(e.viewController === home ? '回到了首页' : '进入了下一页');
});
```

**效果**：每次切换完成，输出现在显示的是首页还是别的页。

## 对应的 iOS API

`navigationController:willShowViewController:animated:`、`navigationController:didShowViewController:animated:` 的参数 `viewController`。

## 参见

- [`UINavigationControllerEvent`](../ui-navigation-controller-event.md)
