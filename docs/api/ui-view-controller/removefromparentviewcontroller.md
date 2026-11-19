---
type: reference
native: "-[UIViewController removeFromParentViewController]"
---

# `UIViewController`：`removeFromParentViewController()` 方法

**`removeFromParentViewController()`** 方法让这个页面离开它的父控制器。它只解除父子关系，不动视图。

## 语法

```
removeFromParentViewController()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

无。没有父控制器时调用没有效果。

## 说明

完整的移除也是三句，顺序和加入相反：

1. `child.willMoveToParentViewController(null)`：告诉它要离开了。
2. `child.view.removeFromSuperview()`：把视图摘掉。
3. `child.removeFromParentViewController()`：解除父子关系。这一句会自动调 `child.didMoveToParentViewController(null)`。

移除之后没有变量保存它时，它被回收（实测）。

## 示例

```js
const page = new UIViewController();
const panel = new UIViewController();
page.addChildViewController(panel);
page.view.addSubview(panel.view);
panel.didMoveToParentViewController(page);

panel.willMoveToParentViewController(null);
panel.view.removeFromSuperview();
panel.removeFromParentViewController();

console.log(page.childViewControllers.length);
console.log(panel.parentViewController);
```

**结果**：控制台输出 `0` 和 `null`。

## 对应的 iOS API

`-[UIViewController removeFromParentViewController]`。

## 参见

- [`addChildViewController()`](addchildviewcontroller.md)
- [`willMoveToParentViewController()`](willmovetoparentviewcontroller.md)
