---
type: reference
native: "-[AVCaptureSession canSetSessionPreset:]"
---

# `AVCaptureSession`：`canSetSessionPreset()` 方法

**`canSetSessionPreset()`** 方法问一个画质档位现在能不能设给这个会话。答案取决于会话里接的摄像头和输出。

## 语法

```
canSetSessionPreset(preset)
```

### 参数

**`preset`**

档位的名字，[`sessionPreset`](sessionpreset.md) 表里的十二个之一。

### 返回值

布尔值。`true` 表示把 `sessionPreset` 写成这个档位不会抛异常。新建的会话问 `'high'` 是 `true`（实测）。

### 异常

**`TypeError`**

- `preset` 不是表里的名字：`canSetSessionPreset has no value "hd"; expected one of: …`，后面列出全部档位名。

## 示例

```js
const session = new AVCaptureSession();
const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (camera !== null) {
  session.addInput(new AVCaptureDeviceInput(camera));
  console.log(session.canSetSessionPreset('3840x2160'));
}
```

**效果**：用户已经同意 App 使用摄像头时，输出这台手机的后置摄像头能不能送出 3840 × 2160 像素的画面。各机型上的答案**未在真机验证**。

## 对应的 iOS API

`-[AVCaptureSession canSetSessionPreset:]`。`AVCaptureSessionPreset3840x2160` 写成 `'3840x2160'`，其余同理。

## 参见

- [`sessionPreset`](sessionpreset.md)：全部档位
