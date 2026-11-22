---
type: reference
native: UIImagePickerController.allowsEditing
---

# `UIImagePickerController`：`allowsEditing` 属性

**`allowsEditing`** 属性决定用户拍完之后能不能裁剪照片。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 用户按下快门之后多一步，可以移动和缩放照片来选一块区域。[`pick`](pick-event.md) 事件里多出 `editedImage` 和 `cropRect` |
| `false` | 没有裁剪这一步。`pick` 事件里 `editedImage` 和 `cropRect` 是 `null` |

- 可读，可写。
- 默认值是 `false`。
- 写别的类型时按 JS 的真假值转成布尔：`0` 是 `false`，非空字符串是 `true`（`'false'` 也是 `true`）。
- 只有 App 自己能改，所以没有变化通知。
- 裁剪界面在屏幕上的样子**未验证**。

## 示例

```js
const picker = new UIImagePickerController();
picker.allowsEditing = true;
picker.addEventListener('pick', (shot) => {
  const image = shot.editedImage ?? shot.originalImage;
  console.log(image.size.width + ' × ' + image.size.height);
});
```

**效果**（**未验证**）：用户裁剪之后点「使用照片」，输出裁出来的那一块的宽和高。

## 对应的 iOS API

`UIImagePickerController.allowsEditing`。

## 参见

- [`pick`](pick-event.md)：`editedImage` 和 `cropRect`
- [安装 `@nacrejs/camera`](../ui-image-picker-controller.md#先装上)
