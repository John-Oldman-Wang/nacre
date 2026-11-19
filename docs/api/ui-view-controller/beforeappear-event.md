---
type: reference
native: "-[UIViewController viewWillAppear:]"
---

# `UIViewController`：`beforeappear` 事件

**`beforeappear`** 事件在页面的视图即将出现在屏幕上时派发。

## 语法

```
page.addEventListener('beforeappear', (event) => { })
```

## 事件对象

`UIViewControllerAppearanceEvent`。除了 `type` 和 `target`（这个页面），多一个只读字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `animated` | `boolean` | 这一次出现带不带转场动画 |

类型定义里，回调收到的事件对象是普通的 `Event`。要读 `animated`，把它标成 `UIViewControllerAppearanceEvent`，写法见示例。

不能取消。

## 什么时候派发

页面的视图每次即将出现都派发，不只是第一次：被模态弹出、导航栈返回到它、切回它所在的标签、盖在它上面的全屏页关闭时都会派发。被卡片样式的模态页盖住再露出来时不派发。全部情况和两个页面之间的先后见[页面的出现和消失](../ui-view-controller.md#页面的出现和消失)。

- 同一个页面上，`beforeappear` 排在 [`appear`](appear-event.md) 前面。
- 没有在屏幕上显示过的页面不派发。
- 每次回到页面时要刷新的内容写在这里。

## 示例

```js
const page = new UIViewController();
page.addEventListener('beforeappear', (event) => {
  const { animated } = /** @type {UIViewControllerAppearanceEvent} */ (event);
  console.log('即将出现，带动画：' + animated);
});
```

**效果**：页面每次即将出现时输出一行。带动画地出现时是 `true`，不带动画时是 `false`。

## 对应的 iOS API

覆写 `-[UIViewController viewWillAppear:]`。原生类不能继承，所以这里是事件，回调稍后执行。

## 参见

- [`appear`](appear-event.md)
- [`disappear`](disappear-event.md)
