---
type: reference
native: UIViewController.presentedViewController
---

# `UIViewController`：`presentedViewController` 属性

**`presentedViewController`** 属性是这个页面弹出的模态页。

## 值

`UIViewController`，或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 默认值是 `null`：没有弹出任何页面。
- 调 [`presentViewController()`](presentviewcontroller.md) 之后立刻变成被弹出的页面；调 [`dismissViewController()`](dismissviewcontroller.md) 关闭、动画结束后变回 `null`。
- 没有专门的变化事件。代码引起的变化由代码自己掌握；用户拖走模态页时，用被弹出页面上的 [`dismiss`](dismiss-event.md) 得知。

## 示例

```js
const page = new UIViewController();
const alert = UIAlertController.alertControllerWithTitle('正在同步…', {
  preferredStyle: 'alert',
});

async function show() {
  await page.presentViewController(alert, { animated: true });
  console.log(page.presentedViewController === alert);
}
```

**效果**：`page` 在屏幕上时调 `show()`，弹出提示框，控制台输出 `true`。

## 对应的 iOS API

`UIViewController.presentedViewController`。

## 参见

- [`presentingViewController`](presentingviewcontroller.md)
