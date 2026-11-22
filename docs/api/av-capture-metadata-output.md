---
type: reference
native: AVCaptureMetadataOutput
status: partial
---

# `AVCaptureMetadataOutput`

**`AVCaptureMetadataOutput`** 表示从取景画面里识别码、人脸这类东西的输出。它加在 [`AVCaptureSession`](av-capture-session.md) 上；会话在取景、画面里出现了要找的种类时，它派发 [`detect`](av-capture-metadata-output/detect-event.md) 事件，事件带着这一帧里认到的全部。

能认哪些种类取决于接进会话的摄像头，所以顺序是：先把摄像头的输入加进会话，再加这个输出，最后从 [`availableMetadataObjectTypes`](av-capture-metadata-output/availablemetadataobjecttypes.md) 里挑出要认的，写进 [`metadataObjectTypes`](av-capture-metadata-output/metadataobjecttypes.md)。加进有摄像头的会话之前，能认的种类是空的，这时写 `metadataObjectTypes` 抛 `TypeError`（实测）。

它属于 `@nacrejs/av-capture` 这个包，安装见 [`AVCaptureSession`](av-capture-session.md#先装上)。

**继承关系**：`EventTarget` → `NSObject` → [`AVCaptureOutput`](av-capture-output.md) → `AVCaptureMetadataOutput`

怎么认码、只认扫描框里的码、把认到的码框出来，见指南[扫码](../guides/scanning.md)。

## 构造函数

[`AVCaptureMetadataOutput()`](av-capture-metadata-output/constructor.md)

创建一个元数据输出。新建的输出一种都不认，范围是整个画面。

## 实例属性

还继承 `NSObject` 的属性。

| 属性 | 说明 |
| --- | --- |
| [`availableMetadataObjectTypes`](av-capture-metadata-output/availablemetadataobjecttypes.md) <small>只读</small> | 现在能认哪些种类 |
| [`metadataObjectTypes`](av-capture-metadata-output/metadataobjecttypes.md) | 要认哪些种类。默认空数组 |
| [`rectOfInterest`](av-capture-metadata-output/rectofinterest.md) | 只在画面的哪一块里找。默认整个画面 |

## 实例方法

没有自己的方法。还继承 [`EventTarget`](event-target.md) 的 `addEventListener()`、`removeEventListener()`、`dispatchEvent()`。

## 事件

| 事件 | 什么时候派发 |
| --- | --- |
| [`detect`](av-capture-metadata-output/detect-event.md) | 这一帧里认到了要找的东西。码一直在镜头前，就一帧接一帧地来。不可取消 |

监听别的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发（实测）。

## 画面里的坐标

[`rectOfInterest`](av-capture-metadata-output/rectofinterest.md)、`detect` 事件里认到的对象的 [`bounds`](av-metadata-object/bounds.md) 和 [`corners`](av-metadata-machine-readable-code-object/corners.md)、摄像头的 [`focusPointOfInterest`](av-capture-device/focuspointofinterest.md)，用的都是画面里的比例坐标：

- 数值是 0 到 1 的比例，没有单位。(0, 0) 是画面的左上角，(1, 1) 是右下角。
- 方向以摄像头的画面为准：手机逆时针转 90 度横过来、原来的底边在右手边时，看到的画面的左上角是 (0, 0)。所以竖着拿手机时，(0, 0) 在画面的右上角。
- 它和屏幕上的点不是同一套坐标，取景图层怎么填画面（[`videoGravity`](av-capture-video-preview-layer/videogravity.md)）也会影响对应关系。

**不要自己换算。** 用取景图层 [`AVCaptureVideoPreviewLayer`](av-capture-video-preview-layer.md) 的方法，它按图层的大小和 `videoGravity` 算好：

| 要做的事 | 用哪个方法 |
| --- | --- |
| 屏幕上的扫描框 → `rectOfInterest` | [`metadataOutputRectOfInterestForRect()`](av-capture-video-preview-layer/metadataoutputrectofinterestforrect.md) |
| `detect` 认到的对象 → 图层里的点，用来画框 | [`transformedMetadataObjectForMetadataObject()`](av-capture-video-preview-layer/transformedmetadataobjectformetadataobject.md) |
| 用户点的位置 → `focusPointOfInterest` | [`captureDevicePointOfInterestForPoint()`](av-capture-video-preview-layer/capturedevicepointofinterestforpoint.md) |
| 比例坐标 → 图层里的点 | [`pointForCaptureDevicePointOfInterest()`](av-capture-video-preview-layer/pointforcapturedevicepointofinterest.md) |

实测：取景图层是 180 × 240 pt、会话在取景时，图层的正中 (90, 120) 换算成 (0.5, 0.5)，(0.5, 0.5) 换算回来是图层的正中。

## 示例

### 认二维码和商品条码

```js
const session = new AVCaptureSession();
const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (camera !== null) {
  session.addInput(new AVCaptureDeviceInput(camera));

  const output = new AVCaptureMetadataOutput();
  session.addOutput(output);
  output.metadataObjectTypes = ['qrCode', 'ean13Code'];
  output.addEventListener('detect', (e) => {
    for (const found of e.objects) {
      if (found instanceof AVMetadataMachineReadableCodeObject) {
        console.log(found.type + '：' + found.stringValue);
      }
    }
  });

  session.startRunning();
}
```

**效果**：用户已经同意 App 使用摄像头时，把二维码或商品条码放到后置摄像头前，控制台一帧接一帧地输出 `qrCode：` 或 `ean13Code：` 和码里的内容。实测对着二维码输出了内容；商品条码**未在真机验证**。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[AVCaptureMetadataOutput alloc] init]` | `new AVCaptureMetadataOutput()` |
| `output.metadataObjectTypes = @[AVMetadataObjectTypeQRCode]` | `output.metadataObjectTypes = ['qrCode']` |
| `output.rectOfInterest = CGRectMake(0, 0, 1, 1)` | `output.rectOfInterest = { x: 0, y: 0, width: 1, height: 1 }` |
| `[output setMetadataObjectsDelegate:self queue:dispatch_get_main_queue()]` 加委托方法 `captureOutput:didOutputMetadataObjects:fromConnection:` | `output.addEventListener('detect', …)` |

## 参见

- [扫码](../guides/scanning.md)：完整的扫码页面
- [`AVMetadataMachineReadableCodeObject`](av-metadata-machine-readable-code-object.md)：认到的码
- [`AVMetadataObject`](av-metadata-object.md)：认到的人脸这类东西
- [`AVCaptureVideoPreviewLayer`](av-capture-video-preview-layer.md)：坐标换算
