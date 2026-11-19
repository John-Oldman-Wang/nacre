---
type: reference
native: "-[UIViewController addChildViewController:]"
---

# `UIViewController`：`addChildViewController()` 方法

**`addChildViewController()`** 方法把一个页面收成这个页面的子控制器。它只建立父子关系，不动视图。

## 语法

```
addChildViewController(child)
```

### 参数

**`child`**

一个 `UIViewController`。它已经有父控制器时，先从那边移除。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- 给的不是页面：`addChildViewController needs a UIViewController`。
- 把页面加成它自己的子控制器，或者把它的祖先加成它的子控制器：`addChildViewController: a view controller cannot be added as a child of itself or of one of its own descendants`。原来的关系不变。

## 说明

完整的加入是三句，顺序固定：

1. `parent.addChildViewController(child)`：建立父子关系。这一句会自动调 `child.willMoveToParentViewController(parent)`。
2. `parent.view.addSubview(child.view)`：把它的视图放进来。
3. `child.didMoveToParentViewController(parent)`：告诉它已经放好了。

只做第 2 句，屏幕上看起来一样，但 `child` 不知道自己属于谁：它的 `parentViewController` 是 `null`，也没有被父页面保管。没有变量保存 `child` 时，页面对象会被回收，而它的视图还留在屏幕上。所以三句都要写。**只做第 2 句的后果未在模拟器验证。**

加入之后父控制器保管子控制器，不需要另外保存 `child` 变量。

## 示例

```js
const page = new UIViewController();
const panel = new UIViewController();
panel.view.backgroundColor = 'systemTeal';

page.addChildViewController(panel);
panel.view.frame = new CGRect(20, 120, 280, 160);
page.view.addSubview(panel.view);
panel.didMoveToParentViewController(page);

console.log(page.childViewControllers.length);
console.log(panel.parentViewController === page);
```

**效果**：`page` 上出现一块青色的矩形，宽 280 pt、高 160 pt。控制台输出 `1` 和 `true`。

## 对应的 iOS API

`-[UIViewController addChildViewController:]`。原生不检查成环，之后会崩溃；这里当场抛 `TypeError`。

## 参见

- [`removeFromParentViewController()`](removefromparentviewcontroller.md)
- [`didMoveToParentViewController()`](didmovetoparentviewcontroller.md)
- [父子控制器](../ui-view-controller.md#父子控制器)
