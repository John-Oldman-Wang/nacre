---
type: reference
native: "-[UINavigationController initWithRootViewController:]"
---

# `UINavigationController()` 构造函数

**`UINavigationController()`** 构造函数创建一个导航控制器。

## 语法

```
new UINavigationController()
new UINavigationController(rootViewController)
```

### 参数

**`rootViewController`**

可选，一个 `UIViewController`，做栈底。不给时是空栈，之后用 [`pushViewController()`](pushviewcontroller.md) 或 [`viewControllers`](viewcontrollers.md) 放入页面。

### 返回值

新建的 `UINavigationController`。

### 异常

**`TypeError`**

- `rootViewController` 正在做某个窗口的根页面：`cannot construct UINavigationController with these arguments`。窗口保持原样。做法见指南的[把已经显示的页面放进导航栈](../../guides/navigation.md#把已经显示的页面放进导航栈)。
- 继承它再构造：`class MyNav extends UINavigationController {}` 在 `new` 时抛，见[原生类](../native-classes.md)。

## 示例

```js
const empty = new UINavigationController();
const withRoot = new UINavigationController(new UIViewController());
console.log(empty.viewControllers.length, withRoot.viewControllers.length);
```

**结果**：控制台输出 `0 1`。

## 对应的 iOS API

`-[UINavigationController initWithRootViewController:]`；不给参数时是 `init`。

## 参见

- [`viewControllers`](viewcontrollers.md)
