---
type: reference
native: "-[UIImagePickerControllerDelegate imagePickerController:didFinishPickingMediaWithInfo:]"
---

# `UIImagePickerController`：`pick` 事件

**`pick`** 事件在用户拍了一张照片、并且点了「使用照片」时派发。事件带着照片。

## 语法

```
picker.addEventListener('pick', (event) => { })
```

## 事件对象

`UIImagePickerControllerMediaEvent`，多出三个字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `originalImage` | [`UIImage`](../ui-image.md) | 拍到的照片，没有裁剪过 |
| `editedImage` | `UIImage` 或 `null` | 用户裁剪之后的照片。没开 [`allowsEditing`](allowsediting.md) 时是 `null` |
| `cropRect` | [`CGRect`](../structs.md) 或 `null` | 用户裁的是原图上的哪一块。没开 `allowsEditing` 时是 `null`。数值的单位**未验证** |

- `target` 是这个拍照界面。
- 不能取消，`preventDefault()` 不起作用。
- 回调参数的类型是 `Event`，要转成 `UIImagePickerControllerMediaEvent` 才能读到这三个字段，写法见示例。

## 什么时候派发

- 用户按下快门、点了「使用照片」之后。一次弹出只会收到 `pick` 和 [`cancel`](cancel-event.md) 中的一个。
- 用户在「重拍」和取景之间来回时派不派发**未验证**；按系统头文件的说明，事件在用户确认时才来。
- 派发之后拍照界面还在屏幕上。系统不会自己关掉它，要在监听器里调 `dismissViewController()`。
- 拍到的照片是相机的完整分辨率，具体尺寸**未验证**。

这个事件的实际派发**未验证**：模拟器拍不了照，真机上也还没有验证。

## 示例

```js
const picker = new UIImagePickerController();
picker.addEventListener('pick', (event) => {
  const { originalImage } = /** @type {UIImagePickerControllerMediaEvent} */ (event);
  console.log('拍到了 ' + originalImage.size.width + ' × ' + originalImage.size.height);
  picker.dismissViewController({ animated: true });
});
```

**效果**（**未验证**）：用户点了「使用照片」之后，控制台输出照片的宽和高，拍照界面降下去。

## 对应的 iOS API

委托方法 `imagePickerController:didFinishPickingMediaWithInfo:`。`info[UIImagePickerControllerOriginalImage]`、`info[UIImagePickerControllerEditedImage]`、`info[UIImagePickerControllerCropRect]` 分别是 `e.originalImage`、`e.editedImage`、`e.cropRect`。

## 参见

- [`cancel`](cancel-event.md)：用户取消
- [拍照界面由 App 关掉](../ui-image-picker-controller.md#拍照界面由-app-关掉)
- [安装 `@nacrejs/camera`](../ui-image-picker-controller.md#先装上)
