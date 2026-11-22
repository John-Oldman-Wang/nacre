---
type: reference
native: UINavigationControllerEvent
---

# `UINavigationControllerEvent`

**`UINavigationControllerEvent`** 表示导航控制器即将显示、或者已经显示了某一页。

[`UINavigationController`](ui-navigation-controller.md) 的 [`beforeshow`](ui-navigation-controller/beforeshow-event.md) 和 [`show`](ui-navigation-controller/show-event.md) 是它，[`viewController`](ui-navigation-controller-event/viewcontroller.md) 是那一页。推入和返回都派发，事件上没有字段区分是哪一种。

**继承关系**：[`Event`](event.md) → `UINavigationControllerEvent`

## 构造函数

[`UINavigationControllerEvent()`](ui-navigation-controller-event/constructor.md)

创建一个 `UINavigationControllerEvent`。运行时派发下面这些事件时自己创建它；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`Event`](event.md) 的属性，最常用的是 `type` 和 `target`。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`viewController`](ui-navigation-controller-event/viewcontroller.md) <small>只读</small> | 即将显示或已经显示的那一页 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`UINavigationController`](ui-navigation-controller.md) | [`beforeshow`](ui-navigation-controller/beforeshow-event.md)、[`show`](ui-navigation-controller/show-event.md) |

不能取消：`cancelable` 是 `false`，`preventDefault()` 不起作用，不能用它阻止用户返回。

## 示例

```js
const nav = new UINavigationController(new UIViewController());
nav.addEventListener('show', (e) => {
  console.log(e instanceof UINavigationControllerEvent, e.viewController === nav.topViewController);
});
nav.pushViewController(new UIViewController(), { animated: true });
```

**效果**：推入的页面显示出来之后，输出 `true true`。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `navigationController:willShowViewController:animated:` | `beforeshow` |
| `navigationController:didShowViewController:animated:` | `show` |
| 参数 `viewController` | `event.viewController` |

## 参见

- [`UINavigationController`](ui-navigation-controller.md)：派发这些事件的对象
