---
type: reference
native: "+[AVCaptureDevice authorizationStatusForMediaType:]"
---

# `AVCaptureDevice.authorizationStatusForMediaType()` 静态方法

**`AVCaptureDevice.authorizationStatusForMediaType()`** 静态方法返回用户对「这个 App 能不能用摄像头」的决定。读它不会弹出任何东西。

## 语法

```
AVCaptureDevice.authorizationStatusForMediaType(mediaType)
```

### 参数

**`mediaType`**

媒体类型，只能是 `'video'`（摄像头）。

### 返回值

字符串，下面四个之一：

| 取值 | 含义 | 能用摄像头吗 |
| --- | --- | --- |
| `'notDetermined'` | 还没问过用户 | 不能。用 [`requestAccessForMediaType()`](requestaccessformediatype.md) 申请 |
| `'authorized'` | 用户同意了 | 能 |
| `'denied'` | 用户拒绝了 | 不能 |
| `'restricted'` | 设备上的限制不允许（家长控制一类），用户自己改不了 | 不能 |

用户在系统设置里改了之后，这个值跟着变。变的时候没有事件，要用摄像头之前再读一次。用户在系统设置里改动之后读到的值**未在真机验证**。

### 异常

**`TypeError`**

`mediaType` 不是 `'video'`：`authorizationStatusForMediaType has no value "audio"; expected one of: video`。

## 示例

```js
const status = AVCaptureDevice.authorizationStatusForMediaType('video');
if (status === 'authorized') {
  console.log('可以用摄像头');
} else if (status === 'notDetermined') {
  console.log('还没问过');
} else {
  console.log('不能用摄像头');
}
```

**效果**：控制台输出三行里的一行。不弹提示框。

## 对应的 iOS API

`+[AVCaptureDevice authorizationStatusForMediaType:]`。`AVMediaTypeVideo` 写成 `'video'`，`AVAuthorizationStatusAuthorized` 写成 `'authorized'`，其余同理。

## 参见

- [`requestAccessForMediaType()`](requestaccessformediatype.md)：向用户申请
- [授权](../av-capture-device.md#授权)
- [先申请授权](../../guides/scanning.md#先申请授权)
