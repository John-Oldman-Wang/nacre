---
type: reference
native: UIImagePickerControllerMediaEvent.originalImage
---

# `UIImagePickerControllerMediaEvent`：`originalImage` 属性

**`originalImage`** 属性是拍到的照片，没有裁剪过。

## 值

[`UIImage`](../ui-image.md)。

- 只读。给它赋值抛 `TypeError`。
- 用 [`new`](constructor.md) 创建时没给，是 `null`。

## 示例

```js
const picker = new UIImagePickerController();
picker.addEventListener('pick', (e) => {
  console.log('拍到了 ' + e.originalImage.size.width + ' × ' + e.originalImage.size.height);
  picker.dismissViewController({ animated: true });
});
```

**效果**：拍好照片后，输出照片的宽和高，然后关掉拍照界面。**未验证**：模拟器拍不了照。

## 对应的 iOS API

`imagePickerController:didFinishPickingMediaWithInfo:` 的 `info[UIImagePickerControllerOriginalImage]`。

## 参见

- [`UIImagePickerControllerMediaEvent`](../ui-image-picker-controller-media-event.md)
