---
type: reference
native: "-[UIViewController dismissViewControllerAnimated:completion:]"
---

# `UIViewController`：`dismissViewController()` 方法

**`dismissViewController()`** 方法关闭模态页。

## 语法

```
dismissViewController()
dismissViewController({ animated })
```

### 参数

**`options.animated`**

布尔值，可选。`true`：有退出动画。`false` 或省略：直接消失。

### 返回值

`Promise<boolean>`。退出动画结束后兑现为 `true`。

### 异常

无。

## 说明

- 在被弹出的页面上调用（`sheet.dismissViewController()`），关闭的是它自己。
- 在发起呈现的页面上调用（`page.dismissViewController()`），关闭的是它弹出的那个页面。**这种写法未在模拟器验证。**
- 对没有被模态呈现、也没有弹出任何页面的页面调用的结果，**未在模拟器验证**。
- **不派发 [`beforedismiss`](beforedismiss-event.md)、[`dismiss`](dismiss-event.md) 等任何事件。** 关闭之后要做的事写在调用的地方，等 Promise 兑现之后执行。
- 关闭之后，没有变量保存被关闭的页面时，它在动画结束后被回收（实测）。

## 示例

```js
const page = new UIViewController();
const sheet = new UIViewController();

async function closeSheet() {
  await sheet.dismissViewController({ animated: true });
  console.log(page.presentedViewController);
}
```

**效果**：`sheet` 正被 `page` 弹出时调 `closeSheet()`，`sheet` 向下滑出屏幕，露出 `page`。动画结束后控制台输出 `null`。

## 对应的 iOS API

`-[UIViewController dismissViewControllerAnimated:completion:]`。`completion` 回调换成返回的 Promise。

## 参见

- [`presentViewController()`](presentviewcontroller.md)
- [关闭事件](../ui-view-controller.md#关闭事件)
