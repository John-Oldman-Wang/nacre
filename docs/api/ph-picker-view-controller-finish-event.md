---
type: reference
native: PHPickerViewControllerFinishEvent
---

# `PHPickerViewControllerFinishEvent`

**`PHPickerViewControllerFinishEvent`** 表示用户在系统的选图界面里选好了，或者点了取消。

[`PHPickerViewController`](photos.md) 的 [`pick`](photos/pick-event.md) 事件是它，[`results`](ph-picker-view-controller-finish-event/results.md) 是选中的那几项；点了取消时是空数组。

它属于 `@nacrejs/photos` 这个包，装法见 [`PHPickerViewController`](photos.md#要先安装)。

**继承关系**：[`Event`](event.md) → `PHPickerViewControllerFinishEvent`

## 构造函数

[`PHPickerViewControllerFinishEvent()`](ph-picker-view-controller-finish-event/constructor.md)

创建一个 `PHPickerViewControllerFinishEvent`。运行时派发下面这些事件时自己创建它；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`Event`](event.md) 的属性，最常用的是 `type` 和 `target`。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`results`](ph-picker-view-controller-finish-event/results.md) <small>只读</small> | 选中的那几项 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`PHPickerViewController`](photos.md) | [`pick`](photos/pick-event.md) |

不能取消：`cancelable` 是 `false`，`preventDefault()` 不起作用。选图界面不会自己关掉，要在监听器里调 `dismissViewController()`。

## 示例

```js
const page = new UIViewController();
const picker = new PHPickerViewController(new PHPickerConfiguration());
picker.addEventListener('pick', (e) => {
  console.log(e instanceof PHPickerViewControllerFinishEvent, e.results.length);
  picker.dismissViewController({ animated: true });
});
page.presentViewController(picker, { animated: true });
```

**效果**：用户选好或取消后，输出 `true` 和选中的个数，然后关掉选图界面。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `picker:didFinishPicking:` | `pick` 事件 |
| 参数 `results` | `event.results` |

## 参见

- [`PHPickerViewController`](photos.md)：派发这个事件的对象
- [`PHPickerResult`](ph-picker-result.md)
- [从相册选图、把图存进相册](../guides/pick-photos.md)
