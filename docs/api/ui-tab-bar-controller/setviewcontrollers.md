---
type: reference
native: "-[UITabBarController setViewControllers:animated:]"
---

# `UITabBarController`：`setViewControllers()` 方法

**`setViewControllers()`** 方法换掉标签控制器的全部页面，可以带动画。

## 语法

```
setViewControllers(viewControllers)
setViewControllers(viewControllers, { animated })
```

### 参数

**`viewControllers`**

`UIViewController` 的数组，顺序是标签从左到右的顺序。

**`options.animated`**

布尔值，可选，默认 `false`。动画的样子**未在模拟器验证**。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

数组里有不是页面的原生对象。报错和原来的页面是否保持不变**未在模拟器验证**。

## 说明

被换掉的页面不再属于这个标签控制器，它们的 [`tabBarController`](../ui-view-controller/tabbarcontroller.md) 变回 `null`。没有别的变量保存时被回收。

## 示例

```js
const home = new UIViewController();
const market = new UIViewController();
const tabs = new UITabBarController();
tabs.viewControllers = [home, market];

const settings = new UIViewController();
settings.tabBarItem = new UITabBarItem({ title: '设置', image: UIImage.systemImageNamed('gearshape') });
tabs.setViewControllers([home, settings], { animated: true });
console.log(tabs.viewControllers.length);
console.log(market.tabBarController);
```

**结果**：标签栏变成两个标签。控制台输出 `2` 和 `null`。

## 对应的 iOS API

`-[UITabBarController setViewControllers:animated:]`。

## 参见

- [`viewControllers`](viewcontrollers.md)
