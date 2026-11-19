---
type: reference
native: "+[UIImagePickerController isSourceTypeAvailable:]"
---

# `UIImagePickerController.isSourceTypeAvailable()` 静态方法

**`UIImagePickerController.isSourceTypeAvailable()`** 静态方法查询某种来源在这台设备上可不可用。

## 语法

```
UIImagePickerController.isSourceTypeAvailable(sourceType)
```

### 参数

**`sourceType`**

来源，下面三个字符串之一：

| 取值 | 含义 |
| --- | --- |
| `'camera'` | 相机 |
| `'photoLibrary'`、`'savedPhotosAlbum'` | 相册，两种列法 |

### 返回值

布尔。`true`：这种来源可用。`false`：不可用。

`'camera'` 可用不等于有摄像头。实测模拟器（iPhone Air，iOS 27.2）上 `isSourceTypeAvailable('camera')` 是 `true`，而 [`isCameraDeviceAvailable()`](iscameradeviceavailable.md) 对两个摄像头都是 `false`。拍照之前两个都要问。

### 异常

**`TypeError`**

`sourceType` 不是上表里的值。报错里列出能写的值：

```
isSourceTypeAvailable has no value "video"; expected one of: photoLibrary / camera / savedPhotosAlbum
```

## 示例

```js
console.log(UIImagePickerController.isSourceTypeAvailable('camera'));
```

**结果**：模拟器上输出 `true`。

## 对应的 iOS API

`+[UIImagePickerController isSourceTypeAvailable:]`。`UIImagePickerControllerSourceTypeCamera` 写成 `'camera'`，其余同理。

## 参见

- [`isCameraDeviceAvailable()`](iscameradeviceavailable.md)：有没有摄像头
- [拍一张照片](../../guides/take-photo.md#先问这台设备能不能拍照)：两件事一起问的写法
- [安装 `@nacrejs/camera`](../ui-image-picker-controller.md#先装上)
