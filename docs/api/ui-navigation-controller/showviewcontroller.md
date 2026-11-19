---
type: reference
native: "-[UINavigationController showViewController:sender:]"
---

# `UINavigationController`：`showViewController()` 方法

**`showViewController()`** 方法显示一个页面。在导航控制器上，它等同于带动画的 [`pushViewController()`](pushviewcontroller.md)：把页面推入栈顶。

## 语法

```
showViewController(viewController)
showViewController(viewController, { sender })
```

### 参数

**`viewController`**

要显示的 [`UIViewController`](../ui-view-controller.md)。

**`options.sender`**

可选。发起这次显示的对象，比如被点的那个按钮，原样交给系统。可以是任何原生对象，也可以是 `null` 或不写。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- `viewController` 不是页面：`showViewController: expects a UIViewController`。
- 页面在别处已经有位置（比如它正当着窗口的根页面），系统拒绝放进栈里：报错以 `showViewController: ` 开头，后面是系统给的原因。

抛异常时栈不变。

## 说明

和 `pushViewController()` 不同，它不收 `{ animated }`，系统总是带动画推入。要控制动画用 `pushViewController()`。

## 示例

```js
const nav = new UINavigationController(new UIViewController());
const detail = new UIViewController();
nav.showViewController(detail);
console.log(nav.viewControllers.length, nav.topViewController === detail);
```

**结果**：输出 `2 true`。屏幕上带动画切到 `detail`，**动画未在模拟器验证。**

## 对应的 iOS API

`-[UINavigationController showViewController:sender:]`。头文件写明它在导航控制器上被当成 `pushViewController:animated:`。

## 参见

- [`pushViewController()`](pushviewcontroller.md)
