---
type: reference
native: UIViewController.navigationController
---

# `UIViewController`：`navigationController` 属性

**`navigationController`** 属性是这个页面所在的导航控制器。「导航栈」是一叠页面，由 [`UINavigationController`](../ui-navigation-controller.md) 管理：推入一个页面，它从右边滑入；返回时弹出。

## 值

[`UINavigationController`](../ui-navigation-controller.md)，或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 默认值是 `null`：页面不在任何导航栈里。
- 页面被推入导航栈后指向那个导航控制器；被弹出之后变回 `null`。
- 变化时不派发自己的事件。变化的时刻通过导航控制器的 [`beforeshow`](../ui-navigation-controller/beforeshow-event.md)、[`show`](../ui-navigation-controller/show-event.md) 事件得知。

## 示例

```js
const detail = new UIViewController();
console.log(detail.navigationController);

const nav = new UINavigationController(detail);
console.log(detail.navigationController === nav);
console.log(detail.parentViewController === nav);
```

**结果**：控制台依次输出 `null`、`true`、`true`。屏幕上没有变化，因为 `nav` 没有被显示出来。

类型是「可能为 `null`」，使用前要判断：

```js
const page = new UIViewController();
const stack = page.navigationController;
if (stack) {
  stack.popViewController({ animated: true });
}
```

**效果**：`page` 在导航栈里时返回上一页。不在时什么都不做。

## 对应的 iOS API

`UIViewController.navigationController`。

## 参见

- [`parentViewController`](parentviewcontroller.md)
- [`UINavigationController`](../ui-navigation-controller.md)：推入、弹出、返回按钮
