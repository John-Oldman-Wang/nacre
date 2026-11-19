---
type: reference
native: "-[UINavigationController setViewControllers:animated:]"
---

# `UINavigationController`：`setViewControllers()` 方法

**`setViewControllers()`** 方法换掉整个栈，数组的最后一个成为栈顶。

## 语法

```
setViewControllers(viewControllers)
setViewControllers(viewControllers, { animated })
```

### 参数

**`viewControllers`**

`UIViewController` 的数组，栈底在前。

**`options.animated`**

布尔值，可选。带动画时系统播放的是推入还是弹出的动画，由系统按新的栈顶是否在原来的栈里决定，**动画未在模拟器验证**。不写时直接切换。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

数组里有不是页面的原生对象：`setViewControllers: only accepts UIViewController`。

## 说明

不在新数组里的页面等于被弹出，见[栈里的页面由谁保管](../ui-navigation-controller.md#栈里的页面由谁保管)。不要动画时也可以直接给 [`viewControllers`](viewcontrollers.md) 赋值。

## 示例

```js
const home = new UIViewController();
const nav = new UINavigationController(home);
const a = new UIViewController();
const b = new UIViewController();
a.title = 'A';
b.title = 'B';

nav.setViewControllers([home, a, b], { animated: true });
console.log(nav.viewControllers.length, nav.topViewController === b);
```

**结果**：栈变成首页、A、B 三页，屏幕显示 B。控制台输出 `3 true`。

## 对应的 iOS API

`-[UINavigationController setViewControllers:animated:]`。

## 参见

- [`viewControllers`](viewcontrollers.md)
