---
type: reference
native: "-[UINavigationControllerDelegate navigationController:didShowViewController:animated:]"
---

# `UINavigationController`：`show` 事件

**`show`** 事件在导航控制器已经显示某个页面、转场动画结束时派发。

## 语法

```
nav.addEventListener('show', (event) => { })
```

## 事件对象

[`UINavigationControllerEvent`](../ui-navigation-controller-event.md)，多一个只读字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| [`viewController`](../ui-navigation-controller-event/viewcontroller.md) | `UIViewController` | 已经显示的页面 |

不能取消。

## 什么时候派发

- 代码推入页面时派发；用户点返回按钮、左滑返回时也派发，两种情况收到的事件相同（实测）。需要区分推入还是弹出时，比较切换前后 `nav.viewControllers.length` 的变化。
- 派发时 `nav.viewControllers` 已经是切换之后的栈（实测）。所以代码里另外记的「当前路径」「第几层」，在这里按 `nav.viewControllers` 重新对齐。
- 代码调用 `popViewController()` 一组方法时是否派发，**未在模拟器验证**。
- App 启动后栈底页面第一次显示时是否派发，**未在模拟器验证**。
- 回调不是在切换发生的那一刻同步执行，而是稍后执行，见[运行时怎么工作](../how-it-works.md)。

## 示例

```js
const nav = new UINavigationController(new UIViewController());
nav.addEventListener('show', (event) => {
  console.log(event.type, event.target === nav, event.viewController === nav.topViewController);
});
```

**效果**：每次页面切换完成，输出 `show true true`。

## 对应的 iOS API

`UINavigationControllerDelegate` 的 `navigationController:didShowViewController:animated:`。

## 参见

- [`beforeshow`](beforeshow-event.md)
- [用户自己也能返回](../ui-navigation-controller.md#用户自己也能返回)
