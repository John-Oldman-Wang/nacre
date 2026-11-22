---
type: reference
native: UITabBarControllerEvent
---

# `UITabBarControllerEvent`

**`UITabBarControllerEvent`** 表示用户在标签栏上点中了一页。

[`UITabBarController`](ui-tab-bar-controller.md) 的 [`tabselect`](ui-tab-bar-controller/tabselect-event.md) 事件是它，[`viewController`](ui-tab-bar-controller-event/viewcontroller.md) 是被点中的那一页。代码改选中的页时不派发。

**继承关系**：[`Event`](event.md) → `UITabBarControllerEvent`

## 构造函数

[`UITabBarControllerEvent()`](ui-tab-bar-controller-event/constructor.md)

创建一个 `UITabBarControllerEvent`。运行时派发下面这些事件时自己创建它；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`Event`](event.md) 的属性，最常用的是 `type` 和 `target`。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`viewController`](ui-tab-bar-controller-event/viewcontroller.md) <small>只读</small> | 用户点中的那一页 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`UITabBarController`](ui-tab-bar-controller.md) | [`tabselect`](ui-tab-bar-controller/tabselect-event.md) |

不能取消：`cancelable` 是 `false`。派发时切换已经完成，不能用它阻止用户切换。

## 示例

```js
const tabs = new UITabBarController();
tabs.addEventListener('tabselect', (e) => {
  console.log(e instanceof UITabBarControllerEvent, e.viewController === tabs.selectedViewController);
});
```

**效果**：用户点标签切换时，输出 `true true`。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `tabBarController:didSelectViewController:` | `tabselect` 事件 |
| 参数 `viewController` | `event.viewController` |

## 参见

- [`UITabBarController`](ui-tab-bar-controller.md)：派发这个事件的对象
- [`tabselect`](ui-tab-bar-controller/tabselect-event.md)：什么时候派发
