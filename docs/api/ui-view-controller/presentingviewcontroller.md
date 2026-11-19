---
type: reference
native: UIViewController.presentingViewController
---

# `UIViewController`：`presentingViewController` 属性

**`presentingViewController`** 属性是弹出这个页面的页面。

## 值

`UIViewController`，或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 默认值是 `null`：没有被模态呈现。
- 弹出时变成呈现者，关闭后变回 `null`。没有专门的变化事件，见 [`presentedViewController`](presentedviewcontroller.md)。

> **注意**：`a.presentViewController(b)` 之后，`b.presentingViewController` 不一定是 `a`。`a` 在导航栈里时，它是 `a` 所在的那个 `UINavigationController`：系统把呈现交给了最近的容器。`a` 不在任何容器里时它是不是 `a`，**未在模拟器验证**。

## 示例

```js
const host = new UIViewController();
const nav = new UINavigationController(host);
const modal = new UIViewController();

async function show() {
  await host.presentViewController(modal, { animated: false });
  console.log(host.presentedViewController === modal);
  console.log(modal.presentingViewController === host);
  console.log(modal.presentingViewController === nav);
}
```

**结果**：`nav` 是窗口的根页面时调 `show()`，控制台依次输出 `true`、`false`、`true`。

判断一个页面是不是被模态弹出的：

```js
const sheet = new UIViewController();
if (sheet.presentingViewController) {
  console.log('sheet 正在被模态呈现');
} else {
  console.log('sheet 没有被模态呈现');
}
```

**结果**：`sheet` 还没弹出时输出 `sheet 没有被模态呈现`。弹出之后输出 `sheet 正在被模态呈现`。

## 对应的 iOS API

`UIViewController.presentingViewController`。

## 参见

- [谁呈现了谁](../ui-view-controller.md#谁呈现了谁)
