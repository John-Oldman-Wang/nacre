---
type: reference
native: "-[UIAdaptivePresentationControllerDelegate presentationControllerWillDismiss:]"
---

# `UIViewController`：`beforedismiss` 事件

**`beforedismiss`** 事件在用户向下拖动模态卡片、卡片即将关闭时派发，派发在**被弹出的页面**上。

## 语法

```
sheet.addEventListener('beforedismiss', (event) => { })
```

## 事件对象

`Event`。只有 `type` 和 `target` 两个字段，`target` 是被弹出的那个页面。

不能取消，`preventDefault()` 不起作用。要阻止用户关闭，用 [`isModalInPresentation`](ismodalinpresentation.md)。

## 什么时候派发

- 用户向下拖走卡片时派发，然后派发 [`dismiss`](dismiss-event.md)（实测顺序）。
- 代码调 [`dismissViewController()`](dismissviewcontroller.md) 时不派发。
- `isModalInPresentation` 是 `true` 时不派发，改派发 [`dismissattempt`](dismissattempt-event.md)。
- 用户拖到一半又放回去时是否派发，**未在模拟器验证**。所以收尾工作写在 `dismiss` 里，不写在这里。
- 被弹出的页面是 `UINavigationController` 时不派发；[`UIAlertController`](../ui-alert-controller.md) 上也不派发。
- 监听可以在页面弹出之前注册。

## 示例

```js
const sheet = new UIViewController();
sheet.addEventListener('beforedismiss', () => {
  console.log('即将关闭');
});
sheet.addEventListener('dismiss', () => {
  console.log('已经关闭');
});
```

**效果**：`sheet` 被弹出后，用户把卡片向下拖走，控制台依次输出 `即将关闭`、`已经关闭`。

## 对应的 iOS API

`UIAdaptivePresentationControllerDelegate` 的 `presentationControllerWillDismiss:`。原生在 `vc.presentationController.delegate` 上，这里是被弹出页面自己的事件。

## 参见

- [关闭事件](../ui-view-controller.md#关闭事件)
