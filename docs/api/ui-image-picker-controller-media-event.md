---
type: reference
native: UIImagePickerControllerMediaEvent
---

# `UIImagePickerControllerMediaEvent`

**`UIImagePickerControllerMediaEvent`** 表示用户在系统的拍照界面里拍好了一张照片。

[`UIImagePickerController`](ui-image-picker-controller.md) 的 [`pick`](ui-image-picker-controller/pick-event.md) 事件是它，带着拍到的照片；开了 [`allowsEditing`](ui-image-picker-controller/allowsediting.md) 时还带着用户裁剪的结果。

它属于 `@nacrejs/camera` 这个包，装法见 [`UIImagePickerController`](ui-image-picker-controller.md#先装上)。

**继承关系**：[`Event`](event.md) → `UIImagePickerControllerMediaEvent`

## 构造函数

[`UIImagePickerControllerMediaEvent()`](ui-image-picker-controller-media-event/constructor.md)

创建一个 `UIImagePickerControllerMediaEvent`。运行时派发下面这些事件时自己创建它；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`Event`](event.md) 的属性，最常用的是 `type` 和 `target`。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`originalImage`](ui-image-picker-controller-media-event/originalimage.md) <small>只读</small> | 拍到的照片，没有裁剪过 |
| [`editedImage`](ui-image-picker-controller-media-event/editedimage.md) <small>只读</small> | 用户裁剪之后的照片 |
| [`cropRect`](ui-image-picker-controller-media-event/croprect.md) <small>只读</small> | 用户裁的是原图上的哪一块 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`UIImagePickerController`](ui-image-picker-controller.md) | [`pick`](ui-image-picker-controller/pick-event.md) |

不能取消：`cancelable` 是 `false`，`preventDefault()` 不起作用。派发之后拍照界面还在屏幕上，要在监听器里关掉它。

## 示例

```js
const picker = new UIImagePickerController();
picker.addEventListener('pick', (e) => {
  console.log(e instanceof UIImagePickerControllerMediaEvent, e.editedImage);
  picker.dismissViewController({ animated: true });
});
```

**效果**：拍好照片后输出 `true null`，然后关掉拍照界面。**未验证**：模拟器拍不了照。

## 对应的 iOS API

委托方法 `imagePickerController:didFinishPickingMediaWithInfo:` 的 `info` 字典里的三项，是事件对象的三个字段。

| ObjC | JS |
| --- | --- |
| `info[UIImagePickerControllerOriginalImage]` | `event.originalImage` |
| `info[UIImagePickerControllerEditedImage]` | `event.editedImage` |
| `info[UIImagePickerControllerCropRect]` | `event.cropRect` |

## 参见

- [`UIImagePickerController`](ui-image-picker-controller.md)：派发这个事件的对象
- [拍一张照片](../guides/take-photo.md)
