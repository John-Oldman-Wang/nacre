---
type: reference
native: UIImagePickerController.cameraFlashMode
---

# `UIImagePickerController`：`cameraFlashMode` 属性

**`cameraFlashMode`** 属性表示拍照界面打开时闪光灯的模式。用户在拍照界面上还可以自己改。

## 值

字符串，下面三个之一：

| 取值 | 效果 |
| --- | --- |
| `'off'` | 不闪 |
| `'on'` | 每次都闪 |
| `'auto'` | 由系统按环境的亮度决定闪不闪 |

- 可读，可写。只在 [`sourceType`](sourcetype.md) 是 `'camera'` 时能读写。三个取值写进去读回来不变。
- 默认值是 `'auto'`。
- 各取值拍照时的效果**未验证**。
- 打开之后用户改了闪光灯，读出来跟不跟着变**未验证**。没有变化通知。

### 写错时

- `sourceType` 不是 `'camera'` 时，读和写都抛 `TypeError`：

  ```
  cameraFlashMode is only available when sourceType is "camera"; set sourceType first
  ```

- 写了表里没有的值：不抛异常，控制台输出一条警告，属性保持原来的值：

  ```
  [Nacre] cameraFlashMode has no value "torch"; expected one of: off / auto / on, ignored
  ```

- 系统自己拒绝了这次读写：抛 `TypeError`，`message` 以属性名开头，后面是系统给的原因。什么情况下会这样**未验证**。

## 示例

```js
const picker = new UIImagePickerController();
if (UIImagePickerController.isSourceTypeAvailable('camera')) {
  picker.sourceType = 'camera';
  picker.cameraFlashMode = 'off';
  console.log(picker.cameraFlashMode);
}
```

**结果**：输出 `off`。拍照界面打开时闪光灯是关的（**未验证**）。

## 对应的 iOS API

`UIImagePickerController.cameraFlashMode`。`UIImagePickerControllerCameraFlashModeOff` 写成 `'off'`，其余同理。

## 参见

- [`isFlashAvailableForCameraDevice()`](isflashavailableforcameradevice.md)：有没有闪光灯
- [安装 `@nacrejs/camera`](../ui-image-picker-controller.md#先装上)
