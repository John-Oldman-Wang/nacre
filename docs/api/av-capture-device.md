---
type: reference
native: AVCaptureDevice
status: partial
---

# `AVCaptureDevice`

**`AVCaptureDevice`** 表示手机上的一个摄像头。App 通过它问用户给没给使用摄像头的授权、找到某一个摄像头，并改这个摄像头的设置：手电筒、变焦、对焦。

要拿到摄像头的画面，用它建一个 [`AVCaptureDeviceInput`](av-capture-device-input.md)，加进 [`AVCaptureSession`](av-capture-session.md)。

它属于 `@nacrejs/av-capture` 这个包，安装见 [`AVCaptureSession`](av-capture-session.md#先装上)。

**继承关系**：`EventTarget` → `NSObject` → `AVCaptureDevice`

## 构造函数

不能用 `new` 创建：`new AVCaptureDevice()` 抛 `TypeError`，信息是 `Illegal constructor: AVCaptureDevice is created by the runtime, not by new`。摄像头从下面两个静态方法拿到。再找一次默认的摄像头，拿到的是同一个对象（实测）。

## 静态方法

[`AVCaptureDevice.authorizationStatusForMediaType()`](av-capture-device/authorizationstatusformediatype.md)

用户对「这个 App 能不能用摄像头」的决定。读它不弹提示框。

[`AVCaptureDevice.requestAccessForMediaType()`](av-capture-device/requestaccessformediatype.md)

向用户申请使用摄像头，兑现成给没给。

[`AVCaptureDevice.defaultDeviceWithMediaType()`](av-capture-device/defaultdevicewithmediatype.md)

这台设备默认的摄像头，也就是后置的那个。

[`AVCaptureDevice.defaultDeviceWithDeviceType()`](av-capture-device/defaultdevicewithdevicetype.md)

按种类和在机身的哪一面找一个摄像头，比如前置的广角摄像头。

## 实例属性

还继承 `NSObject` 的属性。

是哪个摄像头：

| 属性 | 说明 |
| --- | --- |
| [`uniqueID`](av-capture-device/uniqueid.md) <small>只读</small> | 这个摄像头的唯一标识 |
| [`localizedName`](av-capture-device/localizedname.md) <small>只读</small> | 给人看的名字 |
| [`position`](av-capture-device/position.md) <small>只读</small> | 在机身的哪一面：`'back'`、`'front'` |

手电筒：

| 属性 | 说明 |
| --- | --- |
| [`hasTorch`](av-capture-device/hastorch.md) <small>只读</small> | 有没有手电筒 |
| [`isTorchAvailable`](av-capture-device/istorchavailable.md) <small>只读</small> | 手电筒现在能不能用 |
| [`torchMode`](av-capture-device/torchmode.md) | 手电筒：关、开、自动。写之前要锁住 |

变焦：

| 属性 | 说明 |
| --- | --- |
| [`videoZoomFactor`](av-capture-device/videozoomfactor.md) | 变焦倍数，1 是不变焦。写之前要锁住 |
| [`minAvailableVideoZoomFactor`](av-capture-device/minavailablevideozoomfactor.md) <small>只读</small> | 现在能用的最小变焦倍数 |
| [`maxAvailableVideoZoomFactor`](av-capture-device/maxavailablevideozoomfactor.md) <small>只读</small> | 现在能用的最大变焦倍数 |

对焦：

| 属性 | 说明 |
| --- | --- |
| [`focusMode`](av-capture-device/focusmode.md) | 对焦方式。写之前要锁住 |
| [`isFocusPointOfInterestSupported`](av-capture-device/isfocuspointofinterestsupported.md) <small>只读</small> | 支不支持指定对焦点 |
| [`focusPointOfInterest`](av-capture-device/focuspointofinterest.md) | 对焦点，0 到 1 的比例。写之前要锁住 |
| [`autoFocusRangeRestriction`](av-capture-device/autofocusrangerestriction.md) | 自动对焦只在哪个距离范围里找。写之前要锁住 |

这些属性都没有变化事件。

## 实例方法

| 方法 | 说明 |
| --- | --- |
| [`lockForConfiguration()`](av-capture-device/lockforconfiguration.md) | 拿到改设置的权利。拿不到时抛 [`NSError`](ns-error.md) |
| [`unlockForConfiguration()`](av-capture-device/unlockforconfiguration.md) | 交还改设置的权利 |
| [`rampToVideoZoomFactor()`](av-capture-device/ramptovideozoomfactor.md) | 平滑地变焦到一个倍数 |
| [`cancelVideoZoomRamp()`](av-capture-device/cancelvideozoomramp.md) | 停下正在进行的平滑变焦 |
| [`isFocusModeSupported()`](av-capture-device/isfocusmodesupported.md) | 支不支持某种对焦方式 |

## 事件

没有自己的事件。

## 授权

App 用摄像头之前，要由用户同意。用户的决定从 [`authorizationStatusForMediaType('video')`](av-capture-device/authorizationstatusformediatype.md) 读，是下面四个之一：

| 取值 | 含义 | 能用摄像头吗 |
| --- | --- | --- |
| `'notDetermined'` | 还没问过用户 | 不能，要先申请 |
| `'authorized'` | 用户同意了 | 能 |
| `'denied'` | 用户拒绝了 | 不能 |
| `'restricted'` | 设备上的限制（家长控制一类）不允许，用户自己改不了 | 不能 |

- 申请用 [`requestAccessForMediaType('video')`](av-capture-device/requestaccessformediatype.md)。还没问过用户时，系统弹出提示框，提示框里显示 `nacre.config.json` 里写的 [`NSCameraUsageDescription`](av-capture-session.md#先装上)。用户同意之后状态是 `'authorized'`（实测）。
- 每个 App 只问一次。问过之后再申请，不弹提示框，当场兑现成上次的结果（实测）。用户拒绝之后，只能由他自己去系统设置里改。
- 还没问过用户就 [`new AVCaptureDeviceInput(device)`](av-capture-device-input/constructor.md)，这一下也会弹出提示框（实测）。推荐先调 `requestAccessForMediaType()`：这样在接摄像头之前就知道结果，用户拒绝时可以换一个界面告诉他。
- 没有授权时 `new AVCaptureDeviceInput(device)` 抛 [`NSError`](ns-error.md)（实测）。
- 媒体类型只能写 `'video'`。写别的，`authorizationStatusForMediaType()` 抛 `TypeError`，`requestAccessForMediaType()` 以 `TypeError` 拒绝（实测）。
- 授权变了的时候没有事件。用户在系统设置里改了之后，下次要用时重新读一次。

## 改设置之前先锁住

写 [`torchMode`](av-capture-device/torchmode.md)、[`videoZoomFactor`](av-capture-device/videozoomfactor.md)、[`focusMode`](av-capture-device/focusmode.md)、[`focusPointOfInterest`](av-capture-device/focuspointofinterest.md)、[`autoFocusRangeRestriction`](av-capture-device/autofocusrangerestriction.md) 之前，要先调 [`lockForConfiguration()`](av-capture-device/lockforconfiguration.md) 拿到改设置的权利，改完调 [`unlockForConfiguration()`](av-capture-device/unlockforconfiguration.md) 交还。

- 没锁就写：抛 [`DOMException`](dom-exception.md)，`name` 是 `'InvalidStateError'`，值不变（实测）。信息是 `<属性名>: the system refused (…)`，括号里是系统给的原因。比如没锁就写 `videoZoomFactor`，括号里是 `*** -[AVCaptureDevice setVideoZoomFactor:] May not be called without first successfully gaining exclusive ownership of the device using -lockForConfiguration:`（实测）。
- 交还之后再写，又会抛（实测）。
- 拿不到权利时（比如摄像头被别的 App 占着）`lockForConfiguration()` 抛 [`NSError`](ns-error.md)，`domain` 和 `code` 是系统给的原值。这种情况**未在真机验证**。
- [`rampToVideoZoomFactor()`](av-capture-device/ramptovideozoomfactor.md) 和 [`cancelVideoZoomRamp()`](av-capture-device/cancelvideozoomramp.md) 没锁时调也不抛（实测）。
- 读这些属性不用锁。

推荐的写法是锁住、改、在 `finally` 里交还，这样改的时候抛了异常也不会一直占着：

```js
const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (camera !== null) {
  camera.lockForConfiguration();
  try {
    camera.videoZoomFactor = 2;
    camera.autoFocusRangeRestriction = 'near';
  } finally {
    camera.unlockForConfiguration();
  }
  console.log(camera.videoZoomFactor, camera.autoFocusRangeRestriction);
}
```

**效果**：控制台输出 `2 near`。摄像头正在取景时，画面放大到 2 倍（画面的变化**未在真机验证**）。

## 示例

### 看看默认的摄像头

不涉及界面，这段代码直接写在 `main.js` 顶层就能运行。

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/av-capture" />

const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (camera === null) {
  console.log('没有摄像头');
} else {
  console.log(camera.localizedName, camera.position);
  console.log('变焦 ' + camera.minAvailableVideoZoomFactor + ' 到 ' + camera.maxAvailableVideoZoomFactor);
  console.log('对焦 ' + camera.focusMode + '，手电筒 ' + (camera.hasTorch ? '有' : '没有'));
}
```

**结果**：在 iPhone 14 上输出下面三行（实测）。读这些属性不需要授权，不弹提示框。

```
Back Camera back
变焦 1 到 123.75
对焦 continuousAutoFocus，手电筒 有
```

### 找前置摄像头

```js
const front = AVCaptureDevice.defaultDeviceWithDeviceType('builtInWideAngleCamera', {
  mediaType: 'video',
  position: 'front',
});
console.log(front === null ? '没有前置摄像头' : front.position);
```

**结果**：在 iPhone 14 上输出 `front`（实测）。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[AVCaptureDevice authorizationStatusForMediaType:AVMediaTypeVideo]` | `AVCaptureDevice.authorizationStatusForMediaType('video')` |
| `[AVCaptureDevice requestAccessForMediaType:AVMediaTypeVideo completionHandler:…]` | `await AVCaptureDevice.requestAccessForMediaType('video')` |
| `[AVCaptureDevice defaultDeviceWithMediaType:AVMediaTypeVideo]` | `AVCaptureDevice.defaultDeviceWithMediaType('video')` |
| `[AVCaptureDevice defaultDeviceWithDeviceType:AVCaptureDeviceTypeBuiltInWideAngleCamera mediaType:AVMediaTypeVideo position:AVCaptureDevicePositionFront]` | `AVCaptureDevice.defaultDeviceWithDeviceType('builtInWideAngleCamera', { mediaType: 'video', position: 'front' })` |
| `[device lockForConfiguration:&error]`，失败时返回 `NO` | `device.lockForConfiguration()`，失败时抛 `NSError`，`domain` 和 `code` 是 `error` 的原值 |
| `device.torchMode = AVCaptureTorchModeOn` | `device.torchMode = 'on'` |
| `device.torchAvailable` | `device.isTorchAvailable` |
| `[device rampToVideoZoomFactor:2 withRate:4]` | `device.rampToVideoZoomFactor(2, { withRate: 4 })` |

## 参见

- [扫码](../guides/scanning.md)：申请授权、打开手电筒、近距离对焦、放大画面
- [`AVCaptureDeviceInput`](av-capture-device-input.md)：把摄像头接进会话
- [`AVCaptureSession`](av-capture-session.md)：取景，以及怎么安装这个包
- [`AVCaptureVideoPreviewLayer`](av-capture-video-preview-layer.md)：把图层里的点换算成对焦点
