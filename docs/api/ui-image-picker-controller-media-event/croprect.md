---
type: reference
native: UIImagePickerControllerMediaEvent.cropRect
---

# `UIImagePickerControllerMediaEvent`：`cropRect` 属性

**`cropRect`** 属性是用户裁的是原图上的哪一块。

## 值

[`CGRect`](../cg-rect.md) 或 `null`。没开 [`allowsEditing`](../ui-image-picker-controller/allowsediting.md) 时是 `null`。数值的单位**未验证**。

- 只读。给它赋值抛 `TypeError`。
- 用 [`new`](constructor.md) 创建时没给，是 `null`。

## 示例

```js
const picker = new UIImagePickerController();
picker.allowsEditing = true;
picker.addEventListener('pick', (e) => {
  if (e.cropRect !== null) console.log(e.cropRect.width, e.cropRect.height);
  picker.dismissViewController({ animated: true });
});
```

**效果**：拍好并裁剪之后，输出裁剪框的宽和高。**未验证。**

## 对应的 iOS API

`info[UIImagePickerControllerCropRect]`。

## 参见

- [`UIImagePickerControllerMediaEvent`](../ui-image-picker-controller-media-event.md)
