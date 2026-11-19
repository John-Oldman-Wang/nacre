---
type: reference
native: UINavigationController.viewControllers
---

# `UINavigationController`：`viewControllers` 属性

**`viewControllers`** 属性是栈里的全部页面，栈底在前，栈顶在最后。

## 值

`UIViewController` 的数组。

- 可读，可写。赋值等于不带动画地换掉整个栈；要动画用 [`setViewControllers()`](setviewcontrollers.md)。
- 默认值是空数组，或只有构造时给的那一页。
- 读出来的是当时的一份快照。往这个数组里 `push` 不会改变栈，要整个赋值，或者用推入、弹出的方法。
- 读到的每个元素和当初放进去的是同一个对象，可以用 `===` 比较。
- 不在新数组里的页面等于被弹出：没有变量保存它时被回收。
- 栈变了的通知是 [`beforeshow`](beforeshow-event.md) 和 [`show`](show-event.md) 事件。用户点返回、左滑返回之后，在 `show` 的回调里读到的已经是返回之后的栈（实测）。

### 写错时

赋值的数组里有不是页面的东西：抛 `TypeError: viewControllers only accepts UIViewController`。原来的栈不变。

## 示例

```js
const home = new UIViewController();
const nav = new UINavigationController(home);
nav.pushViewController(new UIViewController(), { animated: false });
console.log(nav.viewControllers.length);

nav.viewControllers = [home];
console.log(nav.viewControllers.length, nav.topViewController === home);
```

**结果**：先输出 `2`，再输出 `1 true`。屏幕上的栈只剩首页，立刻显示首页。

## 对应的 iOS API

`UINavigationController.viewControllers`。

## 参见

- [`setViewControllers()`](setviewcontrollers.md)
- [`topViewController`](topviewcontroller.md)
