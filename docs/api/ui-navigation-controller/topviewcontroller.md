---
type: reference
native: UINavigationController.topViewController
---

# `UINavigationController`：`topViewController` 属性

**`topViewController`** 属性是栈顶的页面。

## 值

`UIViewController`，或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 空栈时是 `null`。
- 等于 `viewControllers` 的最后一个。`pushViewController()` 之后立刻就是新推入的页面。
- 在 [`beforeshow`](beforeshow-event.md) 的回调里判断「即将显示哪一页」，用事件对象的 `viewController`，不要用 `topViewController`。

## 示例

```js
const nav = new UINavigationController(new UIViewController());
const detail = new UIViewController();
nav.pushViewController(detail, { animated: false });
console.log(nav.topViewController === detail);
console.log(detail.navigationController === nav);
```

**结果**：控制台输出 `true` 和 `true`。

## 对应的 iOS API

`UINavigationController.topViewController`。

## 参见

- [`visibleViewController`](visibleviewcontroller.md)
