---
type: reference
native: "-[UIViewController viewDidDisappear:]"
---

# `UIViewController`：`disappear` 事件

**`disappear`** 事件在页面的视图已经离开屏幕时派发。

## 语法

```
page.addEventListener('disappear', (event) => { })
```

## 事件对象

`UIViewControllerAppearanceEvent`。除了 `type` 和 `target`（这个页面），多一个只读字段 `animated`（`boolean`）：这一次消失带不带转场动画。读它的写法见 [`beforeappear`](beforeappear-event.md)。

不能取消。

## 什么时候派发

在 [`beforedisappear`](beforedisappear-event.md) 之后、视图离开屏幕时派发。派发的情况见[页面的出现和消失](../ui-view-controller.md#页面的出现和消失)。

页面看不见时要停掉的定时器和轮询，在这里停，在 [`beforeappear`](beforeappear-event.md) 里重新开始。

## 示例

```js
const page = new UIViewController();
/** @type {number | undefined} */
let timer;

page.addEventListener('beforeappear', () => {
  timer = setInterval(() => console.log('刷新'), 1000);
});
page.addEventListener('disappear', () => {
  clearInterval(timer);
});
```

**效果**：页面在屏幕上时每秒输出一次 `刷新`。页面被下一页盖住、被关闭、切到别的标签之后停止；回到这个页面时重新开始。

## 对应的 iOS API

覆写 `-[UIViewController viewDidDisappear:]`。

## 参见

- [`beforedisappear`](beforedisappear-event.md)
