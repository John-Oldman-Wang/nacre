---
type: reference
native: UIViewController.childViewControllers
---

# `UIViewController`：`childViewControllers` 属性

**`childViewControllers`** 属性是这个页面的子控制器，按加入的顺序排。

## 值

`UIViewController` 的数组。

- 只读。给它赋值抛 `TypeError`。加入用 [`addChildViewController()`](addchildviewcontroller.md)，移除用 [`removeFromParentViewController()`](removefromparentviewcontroller.md)。
- 默认值是空数组。
- 导航控制器、标签栏控制器管着的页面也在它们的这个数组里。
- 读到的每个元素和当初加进去的是同一个对象，可以用 `===` 比较。
- 父子关系变了没有事件：它只会被 App 自己的代码改变。

## 示例

```js
const page = new UIViewController();
const panel = new UIViewController();
page.addChildViewController(panel);
page.view.addSubview(panel.view);
panel.didMoveToParentViewController(page);

console.log(page.childViewControllers.length);
console.log(page.childViewControllers[0] === panel);
```

**结果**：控制台输出 `1` 和 `true`。

## 对应的 iOS API

`UIViewController.childViewControllers`。

## 参见

- [父子控制器](../ui-view-controller.md#父子控制器)
