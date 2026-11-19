---
type: reference
native: "-[UIViewController viewDidAppear:]"
---

# `UIViewController`：`appear` 事件

**`appear`** 事件在页面的视图已经出现在屏幕上、转场动画结束时派发。

## 语法

```
page.addEventListener('appear', (event) => { })
```

## 事件对象

`UIViewControllerAppearanceEvent`。除了 `type` 和 `target`（这个页面），多一个只读字段 `animated`（`boolean`）：这一次出现带不带转场动画。读它要先把事件对象标成 `UIViewControllerAppearanceEvent`，写法见 [`beforeappear`](beforeappear-event.md)。

不能取消。

## 什么时候派发

在 [`beforeappear`](beforeappear-event.md) 之后、转场动画结束时派发。派发的情况和 `beforeappear` 相同，见[页面的出现和消失](../ui-view-controller.md#页面的出现和消失)。

页面显示出来之后才能做的事写在这里，比如让输入框自动聚焦。

## 示例

```js
const page = new UIViewController();
const field = new UITextField();
page.view.addSubview(field);

page.addEventListener('appear', () => {
  field.becomeFirstResponder();
}, { once: true });
```

**效果**：页面第一次显示、转场动画结束后，输入框开始输入，键盘弹出。实测在这个回调里调 `becomeFirstResponder()` 返回 `true`。`{ once: true }` 让它只在第一次出现时聚焦；不写的话，每次回到这个页面都会聚焦一次。

## 对应的 iOS API

覆写 `-[UIViewController viewDidAppear:]`。

## 参见

- [`beforeappear`](beforeappear-event.md)
