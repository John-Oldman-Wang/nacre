---
type: reference
native: AVCaptureVideoPreviewLayer
status: partial
---

# `AVCaptureVideoPreviewLayer`

**`AVCaptureVideoPreviewLayer`** 表示显示摄像头取景画面的图层，称为取景图层。它显示一个 [`AVCaptureSession`](av-capture-session.md) 的画面；会话在取景时，图层里是摄像头实时的画面。

它是一个 [`CALayer`](ca-layer.md)：用 `frame` 定位置和大小，用 `addSublayer()` 放进一个视图的图层里。和别的子图层一样，它的大小不随视图变化，见[子图层的大小不随视图变化](ca-layer.md#子图层的大小不随视图变化)。

除了显示画面，它还负责在图层里的点和画面里的比例坐标之间换算：把屏幕上的扫描框换成只认框里的码的范围，把认到的码换到图层上画框，把用户点的位置换成对焦点。见[坐标换算](#坐标换算)。

它属于 `@nacrejs/av-capture` 这个包，安装见 [`AVCaptureSession`](av-capture-session.md#先装上)。

**继承关系**：`EventTarget` → `NSObject` → [`CALayer`](ca-layer.md) → `AVCaptureVideoPreviewLayer`

## 构造函数

[`AVCaptureVideoPreviewLayer()`](av-capture-video-preview-layer/constructor.md)

创建一个显示某个会话画面的图层。刚建好时大小是 0 × 0 pt。

## 实例属性

还继承 [`CALayer`](ca-layer.md) 的属性，最常用的是 `frame`、`bounds`、`cornerRadius`。

| 属性 | 说明 |
| --- | --- |
| [`session`](av-capture-video-preview-layer/session.md) | 显示哪个会话的画面。可以是 `null` |
| [`videoGravity`](av-capture-video-preview-layer/videogravity.md) | 画面和图层的长宽比不一样时，画面怎么填进图层。默认 `'resizeAspect'` |

## 实例方法

还继承 [`CALayer`](ca-layer.md) 的方法，比如 `addSublayer()`、`removeFromSuperlayer()`。

| 方法 | 说明 |
| --- | --- |
| [`transformedMetadataObjectForMetadataObject()`](av-capture-video-preview-layer/transformedmetadataobjectformetadataobject.md) | 把 `detect` 事件里认到的对象换算到这个图层上 |
| [`metadataOutputRectOfInterestForRect()`](av-capture-video-preview-layer/metadataoutputrectofinterestforrect.md) | 把图层里的一个矩形换算成 `rectOfInterest` 用的比例 |
| [`captureDevicePointOfInterestForPoint()`](av-capture-video-preview-layer/capturedevicepointofinterestforpoint.md) | 把图层里的一个点换算成对焦点用的比例 |
| [`pointForCaptureDevicePointOfInterest()`](av-capture-video-preview-layer/pointforcapturedevicepointofinterest.md) | 把比例坐标换算成图层里的点 |

## 坐标换算

画面里的位置用 0 到 1 的比例表示，方向以摄像头的画面为准，见[画面里的坐标](av-capture-metadata-output.md#画面里的坐标)。屏幕上的位置是图层里的点（pt）。两者之间的对应关系取决于图层的大小和 `videoGravity`，所以换算交给这个图层做：

- 图层的 `frame` 设好、会话开始取景之后再换算。实测是在这个时候量的：图层 180 × 240 pt 时，正中 (90, 120) 换算成 (0.5, 0.5)，`metadataOutputRectOfInterestForRect(layer.bounds)` 得到 0 到 1 之内的矩形。开始取景之前换算的结果**未在真机验证**。
- 图层的大小或 `videoGravity` 变了之后，之前换算出来的值不再对应，要重新算。

## 示例

### 铺满一个视图

```js
const session = new AVCaptureSession();
const box = new UIView();
box.frame = new CGRect(0, 100, 300, 400);

const preview = new AVCaptureVideoPreviewLayer(session);
preview.videoGravity = 'resizeAspectFill';
preview.frame = box.bounds;
box.layer.addSublayer(preview);
```

**效果**：会话接上摄像头、开始取景之后，画面铺满 300 × 400 pt 的 `box`，长宽比不一样的部分裁掉。画面在屏幕上的样子**未在真机验证**。

### 点哪里对焦哪里

```js
/**
 * @param {AVCaptureVideoPreviewLayer} preview
 * @param {AVCaptureDevice} camera
 * @param {CGPoint} tap 用户点的位置，图层里的点
 */
function focusAt(preview, camera, tap) {
  if (!camera.isFocusPointOfInterestSupported) return;
  const point = preview.captureDevicePointOfInterestForPoint(tap);
  camera.lockForConfiguration();
  try {
    camera.focusPointOfInterest = point;
    camera.focusMode = 'autoFocus';
  } finally {
    camera.unlockForConfiguration();
  }
}
```

**效果**：摄像头对准用户点的那一处对一次焦。对焦的效果**未在真机验证**。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[AVCaptureVideoPreviewLayer layerWithSession:session]` | `new AVCaptureVideoPreviewLayer(session)` |
| `layer.videoGravity = AVLayerVideoGravityResizeAspectFill` | `layer.videoGravity = 'resizeAspectFill'` |
| `[layer metadataOutputRectOfInterestForRect:rect]` | `layer.metadataOutputRectOfInterestForRect(rect)` |
| `[layer transformedMetadataObjectForMetadataObject:object]` | `layer.transformedMetadataObjectForMetadataObject(object)` |

## 参见

- [扫码](../guides/scanning.md)：铺取景画面、画扫描框、把认到的码框出来
- [`CALayer`](ca-layer.md)：位置、大小、圆角
- [`AVCaptureMetadataOutput`](av-capture-metadata-output.md)：画面里的坐标
- [`AVCaptureSession`](av-capture-session.md)
