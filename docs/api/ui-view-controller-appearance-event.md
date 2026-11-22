---
type: reference
native: UIViewControllerAppearanceEvent
---

# `UIViewControllerAppearanceEvent`

**`UIViewControllerAppearanceEvent`** 表示页面即将出现、已经出现、即将消失、已经消失。

[`UIViewController`](ui-view-controller.md) 的四个出现和消失事件是它，[`animated`](ui-view-controller-appearance-event/animated.md) 说明这一次带不带转场动画。

**继承关系**：[`Event`](event.md) → `UIViewControllerAppearanceEvent`

## 构造函数

[`UIViewControllerAppearanceEvent()`](ui-view-controller-appearance-event/constructor.md)

创建一个 `UIViewControllerAppearanceEvent`。运行时派发下面这些事件时自己创建它；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`Event`](event.md) 的属性，最常用的是 `type` 和 `target`。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`animated`](ui-view-controller-appearance-event/animated.md) <small>只读</small> | 这一次出现或消失带不带转场动画 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`UIViewController`](ui-view-controller.md) 和它的子类 | [`beforeappear`](ui-view-controller/beforeappear-event.md)、[`appear`](ui-view-controller/appear-event.md)、[`beforedisappear`](ui-view-controller/beforedisappear-event.md)、[`disappear`](ui-view-controller/disappear-event.md) |

不能取消：`cancelable` 是 `false`，`preventDefault()` 不起作用。

## 示例

```js
const page = new UIViewController();
page.addEventListener('appear', (e) => {
  console.log(e instanceof UIViewControllerAppearanceEvent, e.animated);
});
```

**效果**：页面每次出现之后，输出 `true` 和这一次带不带动画。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `viewWillAppear:` | `beforeappear` |
| `viewDidAppear:` | `appear` |
| `viewWillDisappear:` | `beforedisappear` |
| `viewDidDisappear:` | `disappear` |
| 参数 `animated` | `event.animated` |

## 参见

- [`UIViewController`](ui-view-controller.md)：派发这些事件的对象
