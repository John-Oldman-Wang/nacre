# 扫码

这一篇讲怎么用摄像头实时扫码：申请授权，把取景画面显示在页面上，认到二维码，只认扫描框里的码，把认到的码框出来，一帧里有好几个码时让用户选，扫到就停，以及手电筒、对焦和变焦。最后一节讲怎么从一张已有的图片里认码。

用到的类是 [`AVCaptureDevice`](../api/av-capture-device.md)（摄像头）、[`AVCaptureSession`](../api/av-capture-session.md)（取景）、[`AVCaptureDeviceInput`](../api/av-capture-device-input.md)（把摄像头接进取景）、[`AVCaptureMetadataOutput`](../api/av-capture-metadata-output.md)（认码）、[`AVCaptureVideoPreviewLayer`](../api/av-capture-video-preview-layer.md)（显示画面）和 [`AVMetadataMachineReadableCodeObject`](../api/av-metadata-machine-readable-code-object.md)（认到的码）。从图片里认码用 [`BarcodeDetector`](../api/barcode-detector.md)。

开始之前要先装 `@nacrejs/av-capture`，并在 `nacre.config.json` 里写 `NSCameraUsageDescription`，见 [`AVCaptureSession`](../api/av-capture-session.md#先装上)。只从图片里认码时不用装这个包。

## 推荐的做法

- **先申请授权，再接摄像头。** 用 `AVCaptureDevice.requestAccessForMediaType('video')`，用户拒绝时换一个界面告诉他。见[先申请授权](#先申请授权)。
- **按这个顺序搭：** 建会话 → 加摄像头的输入 → 加元数据输出 → 设要认的种类 → 把取景图层放进视图 → 开始取景。输出要先加进接好摄像头的会话，才能设要认的种类。
- **只认要用的种类。** 扫二维码就只写 `['qrCode']`。
- **有扫描框时，用 `rectOfInterest` 只认框里的码。** 框的位置用取景图层换算，不要自己算；在开始取景之后再算。见[只认框里的码](#只认框里的码)。
- **扫到就停。** 认到之后调 `stopRunning()`；离开扫码的页面时也停。摄像头开着一直耗电。见[扫到就停](#扫到就停)。
- **改手电筒、对焦、变焦之前先锁住摄像头，在 `finally` 里交还。** 见[打开手电筒](#打开手电筒)。
- **摄像头的实时画面用这个包，已有的图片用 `BarcodeDetector`。** 见[从一张图里认码](#从一张图里认码)。

## 第一个例子

从空白 App 开始：页面上方一块区域显示后置摄像头的画面，下面一行字显示结果。认到一个二维码，就把码里的内容显示出来，停止取景。

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/av-capture" />

application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 显示画面的区域，和显示结果的一行字
  const box = new UIView();
  box.frame = new CGRect(20, 120, 320, 320);
  box.backgroundColor = 'black';
  page.view.addSubview(box);

  const result = new UILabel();
  result.frame = new CGRect(20, 460, 320, 44);
  result.text = '把二维码对准上面的画面';
  page.view.addSubview(result);

  startScanner(box, result);
});

/**
 * @param {UIView} box 显示画面的视图
 * @param {UILabel} result 显示结果的标签
 */
async function startScanner(box, result) {
  // 1. 申请授权
  const granted = await AVCaptureDevice.requestAccessForMediaType('video');
  const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
  if (!granted || camera === null) {
    result.text = '没有摄像头的授权';
    return;
  }

  // 2. 建会话，接上后置摄像头
  const session = new AVCaptureSession();
  session.addInput(new AVCaptureDeviceInput(camera));

  // 3. 加认码的输出，设要认的种类
  const output = new AVCaptureMetadataOutput();
  session.addOutput(output);
  output.metadataObjectTypes = ['qrCode'];

  // 4. 把取景画面铺进视图
  const preview = new AVCaptureVideoPreviewLayer(session);
  preview.videoGravity = 'resizeAspectFill';
  preview.frame = box.bounds;
  box.layer.addSublayer(preview);

  // 5. 认到一个码：显示出来，停止取景
  output.addEventListener('detect', (event) => {
    const code = event.objects[0];
    if (code instanceof AVMetadataMachineReadableCodeObject) {
      result.text = code.stringValue ?? '码里不是文字';
      session.stopRunning();
    }
  }, { once: true });

  // 6. 开始取景
  await session.startRunning();
}
```

**效果**

- 第一次运行时，系统先弹出提示框，问用户是否允许使用摄像头，提示框里是 `NSCameraUsageDescription` 那句话。用户拒绝时，下面那行字变成 `没有摄像头的授权`。
- 用户允许之后，上方 320 × 320 pt 的黑色区域里出现后置摄像头的画面，铺满区域。画面在区域里的样子**未在真机验证**。
- 把一个二维码对准镜头，下面那行字变成码里的内容，取景停止。

这段代码没有作为一个整体运行过。其中用到的每个 API 都在真机的验收用例里运行过，包括对着二维码认出内容。

六步分别是：申请授权、接摄像头、加认码的输出、铺取景画面、监听 `detect`、开始取景。

下面各节沿用这几个变量。第一个例子里的变量建在函数里，后面各节看不见。单独试某一节时，先写这几行：

```js
const page = new UIViewController();
const box = new UIView();
box.frame = new CGRect(20, 120, 320, 320);
page.view.addSubview(box);

const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
const session = new AVCaptureSession();
const output = new AVCaptureMetadataOutput();
if (camera !== null) {
  session.addInput(new AVCaptureDeviceInput(camera));
  session.addOutput(output);
  output.metadataObjectTypes = ['qrCode'];
}

const preview = new AVCaptureVideoPreviewLayer(session);
preview.videoGravity = 'resizeAspectFill';
preview.frame = box.bounds;
box.layer.addSublayer(preview);
```

**效果**：用户已经同意 App 使用摄像头时，建好一个接着后置摄像头的会话、一个只认二维码的输出和一个铺满 `box` 的取景图层。还没有开始取景。

## 先申请授权

App 用摄像头之前要由用户同意。用户的决定有四种，从 `authorizationStatusForMediaType('video')` 读：

| 取值 | 含义 | 该做什么 |
| --- | --- | --- |
| `'notDetermined'` | 还没问过 | 调 `requestAccessForMediaType('video')`，系统弹出提示框 |
| `'authorized'` | 同意了 | 直接接摄像头 |
| `'denied'` | 拒绝了 | 告诉用户去系统设置里打开。App 再申请也不会弹框 |
| `'restricted'` | 设备上的限制不允许，用户自己改不了 | 告诉用户这台设备不能用摄像头 |

```js
async function cameraAccess() {
  const status = AVCaptureDevice.authorizationStatusForMediaType('video');
  if (status === 'notDetermined') {
    return (await AVCaptureDevice.requestAccessForMediaType('video')) ? 'authorized' : 'denied';
  }
  return status;
}

cameraAccess().then((status) => {
  if (status === 'authorized') {
    console.log('可以用摄像头');
  } else if (status === 'denied') {
    console.log('请在系统设置里允许这个 App 使用相机');
  } else {
    console.log('这台设备不能用摄像头');
  }
});
```

**效果**

- 还没问过用户时，弹出提示框；用户选了之后输出对应的一行。用户同意之后，状态是 `'authorized'`（实测）。
- 问过之后再运行，不弹提示框，直接输出上次的结果（实测）。
- 用户拒绝、设备受限两种情况的输出**未在真机验证**。

两点要知道：

- 不先申请也会弹框：还没问过用户就 `new AVCaptureDeviceInput(camera)`，系统在这一刻弹出同一个提示框（实测）。先申请的好处是在接摄像头之前就知道结果。
- 没有授权时 `new AVCaptureDeviceInput(camera)` 抛 [`NSError`](../api/ns-error.md)（实测）。所以先确认授权，再建输入。

## 只认框里的码

扫码的页面常在画面中间画一个框，让用户把码放进框里。框是叠在取景图层上面的一个普通视图。要让框外的码不算，把框的位置换算成元数据输出的 [`rectOfInterest`](../api/av-capture-metadata-output/rectofinterest.md)：

```js
// 1. 画框：一个带边框的视图，叠在取景图层上面
const scanFrame = new UIView();
scanFrame.frame = new CGRect(50, 50, 220, 220);
scanFrame.layer.borderColor = 'systemYellow';
scanFrame.layer.borderWidth = 2;
scanFrame.layer.cornerRadius = 12;
box.addSubview(scanFrame);

// 2. 开始取景之后，把框的位置换算成 rectOfInterest
session.startRunning().then(() => {
  output.rectOfInterest = preview.metadataOutputRectOfInterestForRect(scanFrame.frame);
  console.log(String(output.rectOfInterest));
});
```

**效果**

- 画面正中出现一个 220 × 220 pt 的黄色圆角框。框在 `box` 里后加，显示在画面上面。框在屏幕上的样子**未在真机验证**。
- 控制台输出换算出来的矩形，四个数都在 0 到 1 之间。
- 之后只有在框里的码才派发 `detect`，框外的不算。这一条**未在真机验证**。

几点说明：

- **框的位置用取景图层换算，不要自己算。** `rectOfInterest` 是画面里的比例坐标，方向以摄像头的画面为准，和屏幕上的点不是同一套，见[画面里的坐标](../api/av-capture-metadata-output.md#画面里的坐标)。`metadataOutputRectOfInterestForRect()` 按图层的大小和 `videoGravity` 算好。
- **在开始取景之后再算。** 实测是在取景时量的：整个图层换算出来是 0 到 1 之内的矩形。开始取景之前算出来的值**未在真机验证**。
- `scanFrame.frame` 是 `box` 里的坐标。取景图层铺满 `box`（`preview.frame = box.bounds`），所以它也是图层里的坐标，可以直接交给图层换算。
- 图层的大小或 `videoGravity` 变了，要重新算一次。

## 把认到的码框出来

`detect` 事件里认到的码，位置是画面里的比例坐标，不能直接画在屏幕上。用取景图层的 [`transformedMetadataObjectForMetadataObject()`](../api/av-capture-video-preview-layer/transformedmetadataobjectformetadataobject.md) 换算一下，换算出来的码的 `bounds` 和 `corners` 是图层里的点。

下面用一个形状图层沿码的四个角画一圈绿线。码会倾斜，四个角连起来比 `bounds` 的矩形贴得更紧：

```js
const outline = new CAShapeLayer();
outline.strokeColor = 'systemGreen';
outline.fillColor = null;
outline.lineWidth = 3;
outline.frame = preview.bounds;
preview.addSublayer(outline);

/** @type {number | undefined} */
let clearOutline;

output.addEventListener('detect', (e) => {
  const path = new UIBezierPath();
  for (const found of e.objects) {
    // 换算到图层上：corners 变成图层里的点
    const moved = preview.transformedMetadataObjectForMetadataObject(found);
    if (!(moved instanceof AVMetadataMachineReadableCodeObject)) continue;
    const [first, ...rest] = moved.corners;
    if (first === undefined) continue;
    path.moveToPoint(first);
    for (const corner of rest) path.addLineToPoint(corner);
    path.closePath();
  }

  // 换路径时不要过渡动画，框才跟得上码
  CATransaction.begin();
  CATransaction.setDisableActions(true);
  outline.path = path;
  CATransaction.commit();

  // 码离开镜头之后不再有 detect：0.3 秒没有新的一帧就清掉
  clearTimeout(clearOutline);
  clearOutline = setTimeout(() => {
    outline.path = null;
  }, 300);
});
```

**效果**：码在镜头前时，画面上沿着码的四条边有一圈 3 pt 的绿线，码移动时线跟着走。码离开镜头 0.3 秒之后线消失。画出来的样子**未在真机验证**；换算之后得到的还是码对象这一点是实测的。

- 码一直在镜头前，`detect` 就一帧接一帧地来，每一帧换一次路径。
- 码离开画面时没有事件通知，所以用一个计时器清掉过时的框。
- 关掉过渡动画的原因见[改属性时的过渡动画](../api/ca-layer.md#改属性时的过渡动画)。

## 一帧里有好几个码

一帧画面里有几个码时，`detect` 事件的 `objects` 里是全部。对着屏幕上并排的两个二维码扫，实测一帧里认到 2 个，两个的内容都对。

这时可以把每个码都框出来，让用户点一个。下面给每个码放一个带边框的按钮，按钮跟着码移动；用户点了哪个就用哪个，然后停止取景：

```js
/** @type {Map<string, { button: UIButton, seenAt: number }>} */
const choices = new Map();

output.addEventListener('detect', (e) => {
  const now = Date.now();
  for (const found of e.objects) {
    const moved = preview.transformedMetadataObjectForMetadataObject(found);
    if (!(moved instanceof AVMetadataMachineReadableCodeObject) || moved.stringValue === null) continue;
    const value = moved.stringValue;

    // 同一个码（按内容认）只放一个按钮，之后每一帧挪它的位置
    let choice = choices.get(value);
    if (choice === undefined) {
      const button = UIButton.buttonWithType('custom');
      button.layer.borderColor = 'systemGreen';
      button.layer.borderWidth = 3;
      button.addEventListener('click', () => {
        console.log('选了 ' + value);
        session.stopRunning();
      });
      box.addSubview(button);
      choice = { button, seenAt: now };
      choices.set(value, choice);
    }
    choice.button.frame = moved.bounds;
    choice.seenAt = now;
  }
});

// 有一阵子没认到的码，去掉它的按钮
setInterval(() => {
  const now = Date.now();
  for (const [value, choice] of choices) {
    if (now - choice.seenAt > 500) {
      choice.button.removeFromSuperview();
      choices.delete(value);
    }
  }
}, 250);
```

**效果**：镜头前有两个码时，画面上两个码各被一个绿框框住，框跟着码移动。点其中一个框，控制台输出 `选了 ` 和那个码里的内容，取景停止。某个码离开镜头半秒之后，它的框消失。这段代码的效果**未在真机验证**。

- 按钮用换算之后的 `bounds` 定位置。取景图层铺满 `box`，图层里的点就是 `box` 里的点。
- 用码里的内容区分是哪个码。两个码的内容一样时，只会有一个按钮。
- 一帧里能认到几个码，实测只量到 2 个。

只想要第一个认到的码时，不用这样做，见[扫到就停](#扫到就停)。

## 扫到就停

`detect` 在码留在镜头前的每一帧都会来。只要一次的话，有两处要做：监听器只收一次，认到之后停止取景。

```js
/** @returns {Promise<string | null>} 码里的文字；码里不是文字时是 null */
function scanOnce() {
  return new Promise((resolve) => {
    output.addEventListener('detect', (e) => {
      const code = e.objects[0];
      session.stopRunning();
      resolve(code instanceof AVMetadataMachineReadableCodeObject ? code.stringValue : null);
    }, { once: true });
    session.startRunning();
  });
}

scanOnce().then((text) => {
  console.log('扫到了：' + text);
});
```

**效果**：开始取景；认到第一个二维码时，控制台输出 `扫到了：` 和码里的内容，取景停止。要再扫一次，再调 `scanOnce()`。

- `{ once: true }` 让监听器收到一次之后自动去掉，停止取景之前多来的几帧不会再触发它。
- [`stopRunning()`](../api/av-capture-session/stoprunning.md) 返回 Promise，停好之后兑现；停好之后 `isRunning` 是 `false`（实测）。

离开扫码的页面时也要停，回来时再开：

```js
page.addEventListener('disappear', () => {
  session.stopRunning();
});
page.addEventListener('appear', () => {
  session.startRunning();
});
```

**效果**：页面离开屏幕时取景停止，回到屏幕时重新开始。再开一次已经在取景的会话也会兑现（实测），所以不用先判断 `isRunning`。

## 打开手电筒

光线暗时扫不出码，可以打开摄像头旁边的手电筒。改手电筒之前要先锁住摄像头：

```js
/** @param {boolean} on */
function setTorch(on) {
  if (camera === null || !camera.hasTorch || !camera.isTorchAvailable) return;
  camera.lockForConfiguration();
  try {
    camera.torchMode = on ? 'on' : 'off';
  } finally {
    camera.unlockForConfiguration();
  }
}

const torchButton = UIButton.buttonWithType('system');
torchButton.setTitle('手电筒', { forState: ['normal'] });
torchButton.frame = new CGRect(20, 460, 100, 44);
page.view.addSubview(torchButton);
torchButton.addEventListener('click', () => {
  setTorch(camera !== null && camera.torchMode !== 'on');
});
```

**效果**：点「手电筒」，手电筒亮起；再点一下，熄灭。手电筒真的亮灭**未在真机验证**；`torchMode` 的读写是实测的。

- [`hasTorch`](../api/av-capture-device/hastorch.md) 是有没有手电筒，iPhone 14 的后置摄像头是 `true`（实测）。[`isTorchAvailable`](../api/av-capture-device/istorchavailable.md) 是现在能不能用。
- 没锁就写 `torchMode`，抛 [`DOMException`](../api/dom-exception.md)，`name` 是 `'InvalidStateError'`，值不变（实测）。
- 锁不住时（比如摄像头被别的 App 占着）`lockForConfiguration()` 抛 [`NSError`](../api/ns-error.md)，这种情况**未在真机验证**。`finally` 保证改的时候出错也会交还。

## 近处的码对焦更快

扫码时码通常离镜头很近。把自动对焦限制在近处，摄像头不用在远处找焦点：

```js
if (camera !== null) {
  camera.lockForConfiguration();
  try {
    camera.autoFocusRangeRestriction = 'near';
    if (camera.isFocusModeSupported('continuousAutoFocus')) {
      camera.focusMode = 'continuousAutoFocus';
    }
  } finally {
    camera.unlockForConfiguration();
  }
  console.log(camera.autoFocusRangeRestriction, camera.focusMode);
}
```

**效果**：控制台输出 `near continuousAutoFocus`（实测在 iPhone 14 的后置摄像头上写得进、读得回）。对焦是不是因此变快**未在真机验证**。

- 对焦默认就是 `'continuousAutoFocus'`（一直自动对焦）（实测）。上面写一次是为了换了别的对焦方式之后能改回来。
- 摄像头不支持限制对焦范围时，写 `autoFocusRangeRestriction` 抛 `DOMException`，`name` 是 `'InvalidStateError'`。这种情况**未在真机验证**。

## 放大画面

码很小、离得远时，可以把画面放大：

```js
if (camera !== null) {
  const factor = Math.min(2, camera.maxAvailableVideoZoomFactor);
  camera.lockForConfiguration();
  try {
    camera.videoZoomFactor = factor;
  } finally {
    camera.unlockForConfiguration();
  }
  console.log(camera.videoZoomFactor);
}
```

**效果**：控制台输出 `2`（实测写得进、读得回）。画面放大到 2 倍**未在真机验证**。

- 倍数要在 [`minAvailableVideoZoomFactor`](../api/av-capture-device/minavailablevideozoomfactor.md) 和 [`maxAvailableVideoZoomFactor`](../api/av-capture-device/maxavailablevideozoomfactor.md) 之间。iPhone 14 的后置摄像头上实测是 1 到 123.75。超出范围抛 `RangeError`（实测）。
- 想让画面慢慢放大而不是一下子跳过去，用 [`rampToVideoZoomFactor()`](../api/av-capture-device/ramptovideozoomfactor.md)。

## 被打断时

来电、App 到了后台、别的 App 占用了摄像头时，系统会打断取景。会话派发 [`interrupt`](../api/av-capture-session/interrupt-event.md)，事件带着原因；打断结束时派发 [`interruptend`](../api/av-capture-session/interruptend-event.md)。取景中出错时派发 [`runtimeerror`](../api/av-capture-session/runtimeerror-event.md)。

```js
const status = new UILabel();
status.frame = new CGRect(20, 510, 320, 44);
page.view.addSubview(status);

session.addEventListener('interrupt', (e) => {
  status.text = e.reason === 'videoDeviceInUseByAnotherClient'
    ? '摄像头被别的 App 占用了'
    : '取景暂停了';
});
session.addEventListener('interruptend', () => {
  status.text = '';
  if (!session.isRunning) session.startRunning();
});
session.addEventListener('runtimeerror', (e) => {
  status.text = '取景出错：' + e.error.message;
});
```

**效果**：取景被打断时，下面一行字说明原因；打断结束后字清掉，会话没在取景就重新开始。这三个事件在真机上什么时候来、打断结束后会话会不会自己接着取景，都**未在真机验证**。

## 从一张图里认码

码已经在一张图片里时（用户拍的照片、从相册选的图、下载的图），用核心里的 [`BarcodeDetector`](../api/barcode-detector.md)。它不用装包，也不用摄像头的授权。

```js
/** @param {UIImage | Blob} image */
async function readCodes(image) {
  const detector = new BarcodeDetector({ formats: ['qr_code'] });
  const codes = await detector.detect(image);
  if (codes.length === 0) {
    console.log('图里没有二维码');
    return;
  }
  for (const code of codes) {
    console.log(code.rawValue);
  }
}

const bundled = UIImage.imageNamed('JS/assets/qr');
if (bundled !== null) readCodes(bundled);
```

**效果**：项目的 `assets/qr.png` 里有一个二维码时，控制台输出码里的内容。实测一张有一个码的图认出一个、内容正确；一张有两个码的图认出两个；没有码的图得到空数组。

图片从别处来时，把拿到的 `UIImage` 交给 `readCodes()`：

| 图片从哪里来 | 怎么拿到 `UIImage` |
| --- | --- |
| 用户用系统界面拍的照片 | `@nacrejs/camera` 的 [`pick`](../api/ui-image-picker-controller/pick-event.md) 事件的 `originalImage`，见[拍一张照片](take-photo.md) |
| 用户从相册选的图 | `@nacrejs/photos` 选中的那一项的 `itemProvider.loadObjectOfClass(UIImage)`，见[从相册选图、把图存进相册](pick-photos.md#从选中的项上取图片) |
| 网上下载的图 | `fetch()` 得到的 `Response` 的 `blob()`，把 `Blob` 直接交给 `readCodes()` |

- 结果里的位置是图片的像素，原点在左上角，见 [`detect()`](../api/barcode-detector/detect.md)。
- 这台设备认得哪些格式，用 [`BarcodeDetector.getSupportedFormats()`](../api/barcode-detector/getsupportedformats.md) 查。

## 参见

- [`AVCaptureSession`](../api/av-capture-session.md)：取景，以及怎么安装 `@nacrejs/av-capture`
- [`AVCaptureDevice`](../api/av-capture-device.md)：授权、手电筒、对焦、变焦
- [`AVCaptureMetadataOutput`](../api/av-capture-metadata-output.md)：要认的种类、范围、`detect` 事件，画面里的坐标
- [`AVCaptureVideoPreviewLayer`](../api/av-capture-video-preview-layer.md)：显示画面，坐标换算
- [`AVMetadataMachineReadableCodeObject`](../api/av-metadata-machine-readable-code-object.md)：认到的码
- [`BarcodeDetector`](../api/barcode-detector.md)：从图片里认码
- [配置 App](project-config.md#写权限文案)：权限文案怎么写、怎么按语言写
