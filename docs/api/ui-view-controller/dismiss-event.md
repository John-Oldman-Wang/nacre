---
type: reference
native: "-[UIAdaptivePresentationControllerDelegate presentationControllerDidDismiss:]"
---

# `UIViewController`：`dismiss` 事件

**`dismiss`** 事件在用户拖走模态卡片、关闭完成时派发，派发在**被弹出的页面**上。

## 语法

```
sheet.addEventListener('dismiss', (event) => { })
```

## 事件对象

`Event`。只有 `type` 和 `target` 两个字段，`target` 是被弹出的那个页面。

不能取消。

## 什么时候派发

- 用户向下拖走卡片，关闭完成后派发，排在 [`beforedismiss`](beforedismiss-event.md) 后面。
- **代码调 [`dismissViewController()`](dismissviewcontroller.md) 时不派发**（实测：三个关闭事件一个都没有收到）。代码关闭的收尾写在等它返回的 Promise 后面。
- 用户拖到一半又放回去时，卡片没有关闭，不派发。
- 被弹出的页面是 `UINavigationController` 时不派发；[`UIAlertController`](../ui-alert-controller.md) 上也不派发。
- 监听可以在页面弹出之前注册。

## 示例

```js
const sheet = new UIViewController();
sheet.addEventListener('dismiss', (event) => {
  console.log(event.type, event.target === sheet);
});
```

**效果**：`sheet` 被弹出后，用户把卡片向下拖走，控制台输出 `dismiss true`。

两条关闭途径共用一段收尾的写法，见指南[弹出一个模态页](../../guides/modal-pages.md#模态页的打开和关闭怎么组织)。

## 对应的 iOS API

`UIAdaptivePresentationControllerDelegate` 的 `presentationControllerDidDismiss:`。

## 参见

- [关闭事件](../ui-view-controller.md#关闭事件)
