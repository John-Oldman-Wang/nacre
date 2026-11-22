---
type: reference
native: UITraitChangeEvent
---

# `UITraitChangeEvent`

**`UITraitChangeEvent`** 表示界面所处环境的一组值变了，比如深色模式开关、字号设置。

[`UIView`](ui-view.md)、[`UIViewController`](ui-view-controller.md)、[`UIWindowScene`](ui-window-scene.md) 的 `traitchange` 事件是它。这组值是 [`UITraitCollection`](ui-trait-collection.md)。事件带着变化之前的那组值，现在的值从 `event.target.traitCollection` 读。

**继承关系**：[`Event`](event.md) → `UITraitChangeEvent`

## 构造函数

[`UITraitChangeEvent()`](ui-trait-change-event/constructor.md)

创建一个 `UITraitChangeEvent`。运行时派发下面这些事件时自己创建它；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`Event`](event.md) 的属性，最常用的是 `type` 和 `target`。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`previousTraitCollection`](ui-trait-change-event/previoustraitcollection.md) <small>只读</small> | 变化之前的那组值 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`UIView`](ui-view.md) 和它的子类 | [`traitchange`](ui-view/traitchange-event.md) |
| [`UIViewController`](ui-view-controller.md) 和它的子类 | [`traitchange`](ui-view-controller/traitchange-event.md) |
| [`UIWindowScene`](ui-window-scene.md) | [`traitchange`](ui-window-scene/traitchange-event.md) |

不能取消：`cancelable` 是 `false`，`preventDefault()` 不起作用。

## 示例

```js
const page = new UIViewController();
page.addEventListener('traitchange', (e) => {
  console.log(e instanceof UITraitChangeEvent, e.previousTraitCollection.userInterfaceStyle);
});
```

**效果**：页面的外观特征变了时，输出 `true` 和变化之前的样式。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[view registerForTraitChanges:… withHandler:^(id env, UITraitCollection *previous) { … }]` | `view.addEventListener('traitchange', fn)` |
| `previousCollection` | `event.previousTraitCollection` |

## 参见

- [`UITraitCollection`](ui-trait-collection.md)：这组值
- [适配深色模式](../guides/dark-mode.md)
