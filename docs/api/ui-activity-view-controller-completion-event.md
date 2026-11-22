---
type: reference
native: UIActivityViewControllerCompletionEvent
---

# `UIActivityViewControllerCompletionEvent`

**`UIActivityViewControllerCompletionEvent`** 表示系统的分享面板结束了，带着用户选了什么、做没做完。

[`UIActivityViewController`](ui-activity-view-controller.md) 的 [`complete`](ui-activity-view-controller/complete-event.md) 事件是它。

**继承关系**：[`Event`](event.md) → `UIActivityViewControllerCompletionEvent`

## 构造函数

[`UIActivityViewControllerCompletionEvent()`](ui-activity-view-controller-completion-event/constructor.md)

创建一个 `UIActivityViewControllerCompletionEvent`。运行时派发下面这些事件时自己创建它；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`Event`](event.md) 的属性，最常用的是 `type` 和 `target`。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`activityType`](ui-activity-view-controller-completion-event/activitytype.md) <small>只读</small> | 用户选的去处 |
| [`completed`](ui-activity-view-controller-completion-event/completed.md) <small>只读</small> | 选的动作做完了没有 |
| [`activityError`](ui-activity-view-controller-completion-event/activityerror.md) <small>只读</small> | 动作失败时系统给的错误 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`UIActivityViewController`](ui-activity-view-controller.md) | [`complete`](ui-activity-view-controller/complete-event.md) |

不能取消：`cancelable` 是 `false`，`preventDefault()` 不起作用。

## 示例

```js
const sheet = new UIActivityViewController([new URL('https://example.com')]);
sheet.addEventListener('complete', (e) => {
  console.log(e instanceof UIActivityViewControllerCompletionEvent, e.completed, e.activityType);
});
```

**效果**：面板结束时，输出 `true`、做没做完和用户选的去处。

## 对应的 iOS API

`UIActivityViewController.completionWithItemsHandler` 的四个参数里，三个是事件对象的同名字段。

| ObjC | JS |
| --- | --- |
| `activityType` | `event.activityType` |
| `completed` | `event.completed` |
| `activityError` | `event.activityError` |

## 参见

- [`UIActivityViewController`](ui-activity-view-controller.md)：派发这个事件的对象
- [`complete`](ui-activity-view-controller/complete-event.md)：什么时候派发
