---
type: reference
native: UITabBarController.viewControllers
---

# `UITabBarController`：`viewControllers` 属性

**`viewControllers`** 属性是标签控制器管理的各个页面，顺序是标签从左到右的顺序。

## 值

`UIViewController` 的数组。

- 可读，可写。不要动画时直接赋值；要动画用 [`setViewControllers()`](setviewcontrollers.md)。
- 默认值是空数组。写 `null` 等于写空数组。
- 读出来的是当时的一份快照。往这个数组里 `push` 不会改变界面，要整个赋值。读到的每个元素和当初放进去的是同一个对象。
- 数组里的页面由标签控制器保管，不用自己保存。被换掉、没有别的变量保存的页面被回收（验收用例验证过）。
- 每个标签的样子来自对应页面的 [`tabBarItem`](../ui-view-controller/tabbaritem.md)。
- 变化时不派发事件：它只会被代码改变。

### 写错时

数组里有不是页面的东西：抛 `TypeError: viewControllers only accepts UIViewController`。原来的页面不变。

## 示例

```js
const home = new UIViewController();
const market = new UIViewController();
const tabs = new UITabBarController();
tabs.viewControllers = [home, market];
console.log(tabs.viewControllers.length, tabs.viewControllers[1] === market);
```

**结果**：控制台输出 `2 true`。

## 对应的 iOS API

`UITabBarController.viewControllers`。

## 参见

- [`setViewControllers()`](setviewcontrollers.md)
- [`selectedIndex`](selectedindex.md)
