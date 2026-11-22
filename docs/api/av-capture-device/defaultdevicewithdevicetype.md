---
type: reference
native: "+[AVCaptureDevice defaultDeviceWithDeviceType:mediaType:position:]"
---

# `AVCaptureDevice.defaultDeviceWithDeviceType()` 静态方法

**`AVCaptureDevice.defaultDeviceWithDeviceType()`** 静态方法按摄像头的种类和在机身的哪一面找一个摄像头。

## 语法

```
AVCaptureDevice.defaultDeviceWithDeviceType(deviceType)
AVCaptureDevice.defaultDeviceWithDeviceType(deviceType, { mediaType, position })
```

### 参数

**`deviceType`**

摄像头的种类，下面几个字符串之一：

| 取值 | 是什么 |
| --- | --- |
| `'builtInWideAngleCamera'` | 广角摄像头。每台 iPhone 都有 |
| `'builtInUltraWideCamera'` | 超广角摄像头 |
| `'builtInTelephotoCamera'` | 长焦摄像头 |
| `'builtInDualCamera'`、`'builtInDualWideCamera'`、`'builtInTripleCamera'` | 几颗镜头合成的一个摄像头，按变焦倍数自动切换镜头 |
| `'builtInTrueDepthCamera'`、`'builtInLiDARDepthCamera'` | 带深度信息的摄像头 |
| `'builtInOuterUltraWideCamera'`、`'builtInInnerUltraWideCamera'` | iOS 27.1 起才有。更早的系统上写它们抛 `TypeError` |
| `'continuityCamera'`、`'external'` | 外接的摄像头 |

**`options.mediaType`**

只能是 `'video'`，或者不写。不写或者写 `null` 是不限媒体类型。

**`options.position`**

在机身的哪一面：`'back'`（背面）、`'front'`（屏幕这一面）、`'unspecified'`（哪一面都行）。不写是 `'unspecified'`。

### 返回值

找到的 `AVCaptureDevice`，这台设备上没有时是 `null`。

- 写 `'builtInWideAngleCamera'` 和 `{ mediaType: 'video', position: 'front' }` 找到前置摄像头，它和 [`defaultDeviceWithMediaType('video')`](defaultdevicewithmediatype.md) 给的不是同一个（实测）。
- 只写种类也找得到（实测）。
- 各种机型上哪些种类找得到、哪些是 `null`，**未在真机验证**。

### 异常

**`TypeError`**

- `deviceType` 不是表里的值：`defaultDeviceWithDeviceType has no value "wide"; expected one of: …`，后面列出全部种类。
- `options.position` 写错：`defaultDeviceWithDeviceType position has no value "up"; expected one of: …`。
- `options.mediaType` 不是 `'video'`：`defaultDeviceWithDeviceType mediaType has no value "audio"; expected one of: video`。

## 示例

```js
const front = AVCaptureDevice.defaultDeviceWithDeviceType('builtInWideAngleCamera', {
  mediaType: 'video',
  position: 'front',
});
console.log(front === null ? '没有前置摄像头' : front.position);
```

**效果**：iPhone 上输出 `front`。

## 对应的 iOS API

`+[AVCaptureDevice defaultDeviceWithDeviceType:mediaType:position:]`。后两段参数放进 options 对象，都可以不写；`mediaType:nil` 是不写 `mediaType`。`AVCaptureDeviceTypeBuiltInWideAngleCamera` 写成 `'builtInWideAngleCamera'`，`AVCaptureDevicePositionFront` 写成 `'front'`，其余同理。

## 参见

- [`defaultDeviceWithMediaType()`](defaultdevicewithmediatype.md)：默认的摄像头
- [`position`](position.md)：摄像头在哪一面
