---
type: reference
native: "-[UIViewController viewWillDisappear:]"
---

# `UIViewController`：`beforedisappear` 事件

**`beforedisappear`** 事件在页面的视图即将离开屏幕时派发。

## 语法

```
page.addEventListener('beforedisappear', (event) => { })
```

## 事件对象

`UIViewControllerAppearanceEvent`。除了 `type` 和 `target`（这个页面），多一个只读字段 `animated`（`boolean`）：这一次消失带不带转场动画。读它的写法见 [`beforeappear`](beforeappear-event.md)。

不能取消。

## 什么时候派发

页面的视图每次即将离开屏幕都派发：被下一页盖住、模态页被关闭、切到别的标签、被全屏的模态页盖住。被卡片样式的模态页盖住时不派发，它的视图还在屏幕上。离开屏幕不等于页面没了：被下一页盖住的页面还在导航栈里，返回时会再出现。见[页面的出现和消失](../ui-view-controller.md#页面的出现和消失)。

同一个页面上，`beforedisappear` 排在 [`disappear`](disappear-event.md) 前面。

## 示例

```js
const page = new UIViewController();
page.addEventListener('beforedisappear', () => {
  console.log('即将离开屏幕');
});
```

**效果**：页面每次即将离开屏幕时输出一行。

## 对应的 iOS API

覆写 `-[UIViewController viewWillDisappear:]`。

## 参见

- [`disappear`](disappear-event.md)
