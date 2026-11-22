---
type: reference
native: "+[AVCaptureDevice requestAccessForMediaType:completionHandler:]"
---

# `AVCaptureDevice.requestAccessForMediaType()` 静态方法

**`AVCaptureDevice.requestAccessForMediaType()`** 静态方法向用户申请使用摄像头，结果是用户给没给。

## 语法

```
AVCaptureDevice.requestAccessForMediaType(mediaType)
```

### 参数

**`mediaType`**

媒体类型，只能是 `'video'`（摄像头）。

### 返回值

`Promise`，兑现成布尔值：`true` 是可以用摄像头，`false` 是不能。

- 还没问过用户时，系统弹出提示框，提示框里显示 `nacre.config.json` 里写的 `NSCameraUsageDescription`。用户选完之后兑现。申请之后 [`authorizationStatusForMediaType('video')`](authorizationstatusformediatype.md) 读到 `'authorized'`（实测）。
- 已经问过时，不弹提示框，当场兑现成上次的结果（实测）。用户拒绝过的，兑现成 `false`；想改，只能由用户去系统设置里改。
- 用户拒绝、设备有限制时兑现成 `false` 的这两种情况**未在真机验证**。

### 异常

不同步抛。参数不对时 Promise 被拒绝：

**`TypeError`**

`mediaType` 不是 `'video'`：`requestAccessForMediaType has no value "audio"; expected one of: video`。

## 说明

不先申请也可以：还没问过用户时，[`new AVCaptureDeviceInput(device)`](../av-capture-device-input/constructor.md) 那一下也会弹出同一个提示框。先调这个方法的好处是能在接摄像头之前知道结果，用户拒绝时换一个界面告诉他。

## 示例

```js
AVCaptureDevice.requestAccessForMediaType('video').then((granted) => {
  console.log(granted ? '可以用摄像头' : '用户没有同意');
});
```

**效果**：第一次运行时弹出系统的提示框，用户点了之后输出一行。之后再运行，不弹框，直接输出上次的结果。

## 对应的 iOS API

`+[AVCaptureDevice requestAccessForMediaType:completionHandler:]`。`completionHandler` 的参数 `granted` 是 Promise 兑现的值。

## 参见

- [`authorizationStatusForMediaType()`](authorizationstatusformediatype.md)：只读状态，不弹框
- [授权](../av-capture-device.md#授权)
- [先申请授权](../../guides/scanning.md#先申请授权)
- [安装 `@nacrejs/av-capture`](../av-capture-session.md#先装上)：`NSCameraUsageDescription` 写在哪
