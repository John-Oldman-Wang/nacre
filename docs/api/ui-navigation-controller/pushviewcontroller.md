---
type: reference
native: "-[UINavigationController pushViewController:animated:]"
---

# `UINavigationController`：`pushViewController()` 方法

**`pushViewController()`** 方法把一个页面推入栈顶，屏幕切换到这个页面。

## 语法

```
pushViewController(viewController)
pushViewController(viewController, { animated })
```

### 参数

**`viewController`**

要推入的页面，`UIViewController`。

**`options.animated`**

布尔值，可选。`true`：从右边滑入。`false` 或不写：直接换过去，没有动画。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- 参数不是页面：`pushViewController: expects a UIViewController`。
- 推入的页面正在做窗口的根页面：信息以 `pushViewController: ` 开头，后面是系统给出的原因。窗口和栈都保持原样。

## 说明

- 推入之后不用保存页面：导航控制器保管它，见[栈里的页面由谁保管](../ui-navigation-controller.md#栈里的页面由谁保管)。
- 同一个页面对象不能在栈里出现两次。把已经在栈里的页面再推入一次的结果**未在模拟器验证**。要显示两个内容相同的页面，建两个页面对象。
- 推入时派发 [`beforeshow`](beforeshow-event.md) 和 [`show`](show-event.md)（实测）。

## 示例

```js
const nav = new UINavigationController(new UIViewController());
const detail = new UIViewController();
detail.title = '详情';
nav.pushViewController(detail, { animated: true });

console.log(nav.topViewController === detail);
console.log(detail.navigationController === nav);
```

**效果**：`nav` 在屏幕上时，屏幕带着动画切换到 `detail`。控制台输出 `true` 和 `true`。

## 对应的 iOS API

`-[UINavigationController pushViewController:animated:]`。

## 参见

- [`popViewController()`](popviewcontroller.md)
- [在页面之间跳转](../../guides/navigation.md)
