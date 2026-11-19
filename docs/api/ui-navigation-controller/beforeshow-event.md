---
type: reference
native: "-[UINavigationControllerDelegate navigationController:willShowViewController:animated:]"
---

# `UINavigationController`：`beforeshow` 事件

**`beforeshow`** 事件在导航控制器即将显示某个页面、切换开始时派发。

## 语法

```
nav.addEventListener('beforeshow', (event) => { })
```

## 事件对象

`Event`，多一个字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `viewController` | `UIViewController` | 即将显示的页面 |

类型定义里还没有这个事件对象的类型，要自己标注 `viewController` 字段，写法见示例。

不能取消，不能用它阻止用户返回。

## 什么时候派发

- 代码推入页面时派发；用户点返回按钮、左滑返回时也派发，两种情况收到的事件相同（实测）。事件对象上没有字段区分「是代码还是用户」「是推入还是弹出」；需要区分时，比较切换前后 `nav.viewControllers.length` 的变化。
- 代码调用 `popViewController()` 一组方法时是否派发，**未在模拟器验证**。
- 回调不是在切换发生的那一刻同步执行，而是稍后执行，见[运行时怎么工作](../how-it-works.md)。

判断「即将显示哪一页」用 `event.viewController`，不要用 `nav.topViewController`。

## 示例

```js
const home = new UIViewController();
const nav = new UINavigationController(home);
nav.addEventListener('beforeshow', (ev) => {
  const event = /** @type {Event & { viewController: UIViewController }} */ (ev);
  nav.setNavigationBarHidden(event.viewController === home, { animated: true });
});
```

**效果**：显示首页时没有导航条；进入其他页面时导航条出现，返回首页时又消失。验收用例的界面就是这样做的。

## 对应的 iOS API

`UINavigationControllerDelegate` 的 `navigationController:willShowViewController:animated:`。`nav.delegate` 不开放。

## 参见

- [`show`](show-event.md)
