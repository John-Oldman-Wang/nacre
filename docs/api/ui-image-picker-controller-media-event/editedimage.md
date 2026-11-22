---
type: reference
native: UIImagePickerControllerMediaEvent.editedImage
---

# `UIImagePickerControllerMediaEvent`：`editedImage` 属性

**`editedImage`** 属性是用户裁剪之后的照片。

## 值

[`UIImage`](../ui-image.md) 或 `null`。没开 [`allowsEditing`](../ui-image-picker-controller/allowsediting.md) 时是 `null`。

- 只读。给它赋值抛 `TypeError`。
- 用 [`new`](constructor.md) 创建时没给，是 `null`。

## 示例

```js
const picker = new UIImagePickerController();
picker.allowsEditing = true;
picker.addEventListener('pick', (e) => {
  const photo = e.editedImage ?? e.originalImage;
  console.log(photo.size.width);
  picker.dismissViewController({ animated: true });
});
```

**效果**：拍好并裁剪之后，输出裁剪后照片的宽度。**未验证。**

## 对应的 iOS API

`info[UIImagePickerControllerEditedImage]`。

## 参见

- [`UIImagePickerControllerMediaEvent`](../ui-image-picker-controller-media-event.md)
