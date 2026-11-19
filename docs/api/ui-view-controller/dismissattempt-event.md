---
type: reference
native: "-[UIAdaptivePresentationControllerDelegate presentationControllerDidAttemptToDismiss:]"
---

# `UIViewController`：`dismissattempt` 事件

**`dismissattempt`** 事件在用户想向下拖走模态卡片、但 [`isModalInPresentation`](ismodalinpresentation.md) 是 `true`、卡片没有关闭时派发，派发在**被弹出的页面**上。

## 语法

```
sheet.addEventListener('dismissattempt', (event) => { })
```

## 事件对象

`Event`。只有 `type` 和 `target` 两个字段，`target` 是被弹出的那个页面。

不能取消。

## 什么时候派发

- `isModalInPresentation` 是 `true` 时，用户每向下拖一次派发一次。[`beforedismiss`](beforedismiss-event.md) 和 [`dismiss`](dismiss-event.md) 都不派发。
- 被弹出的页面是 `UINavigationController` 时不派发；[`UIAlertController`](../ui-alert-controller.md) 上也不派发。

可以在这时提示「有未保存的内容」。

## 示例

```js
const sheet = new UIViewController();
sheet.isModalInPresentation = true;
sheet.addEventListener('dismissattempt', () => {
  console.log('用户想关闭，但被拦住了');
});
```

**效果**：`sheet` 被弹出后，用户每向下拖一次，控制台输出一行。

## 对应的 iOS API

`UIAdaptivePresentationControllerDelegate` 的 `presentationControllerDidAttemptToDismiss:`。

## 参见

- [`isModalInPresentation`](ismodalinpresentation.md)
