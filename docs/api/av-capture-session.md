---
type: reference
native: AVCaptureSession
status: partial
---

# `AVCaptureSession`

**`AVCaptureSession`** 表示一次取景：它把摄像头送来的画面交给加在它上面的输出和取景图层。摄像头通过输入 [`AVCaptureDeviceInput`](av-capture-device-input.md) 接进会话；输出 [`AVCaptureMetadataOutput`](av-capture-metadata-output.md) 从画面里认码和人脸；取景图层 [`AVCaptureVideoPreviewLayer`](av-capture-video-preview-layer.md) 把画面显示在屏幕上。会话开始取景之后，这几样才开始工作。

一个扫码的页面通常是这样一组：一个会话、一个后置摄像头的输入、一个元数据输出、一个取景图层。加进会话的输入和输出由会话拿着，App 不用自己留着它们的引用。

它属于 `@nacrejs/av-capture` 这个包。用摄像头之前要先得到用户的授权，见 [`AVCaptureDevice`](av-capture-device.md#授权)。

**继承关系**：`EventTarget` → `NSObject` → `AVCaptureSession`

怎么搭一个扫码的页面、只认扫描框里的码、打开手电筒，见指南[扫码](../guides/scanning.md)。从一张已有的图片里认码不需要这个包，用核心里的 [`BarcodeDetector`](barcode-detector.md)。

## 先装上

取景和实时识别不在核心里，要先装 `@nacrejs/av-capture` 这个包才有。没装的时候全局上没有 `AVCaptureSession`、`AVCaptureDevice`、`AVCaptureDeviceInput`、`AVCaptureMetadataOutput`、`AVCaptureVideoPreviewLayer` 这几个类，类型检查也会报找不到这些名字。

**1. 装包。**

```bash
npm install @nacrejs/av-capture
```

**效果**：下次生成 `ios/` 时，工程里多嵌一个 `NacreAVCapture.framework`。不装的项目，产物里没有它。

**2. 写一句给用户看的说明。** 在 `nacre.config.json` 里写一句话，说明这个 App 为什么要用摄像头。键名 `NSCameraUsageDescription` 是系统规定的：

```json
{
  "name": "Shop",
  "bundleId": "com.example.app",
  "ios": {
    "infoPlist": {
      "NSCameraUsageDescription": "Scan the QR code on your order"
    }
  }
}
```

**效果**：App 第一次申请用摄像头时，系统弹出提示框问用户是否允许，提示框里显示这句话。要按语言各写一句，见[配置 App](../guides/project-config.md#写权限文案)。

装了包却没写这一句，生成 `ios/` 时报错并停下：

```
nacre: @nacrejs/av-capture needs NSCameraUsageDescription in Info.plist: a sentence shown to the user explaining why the app needs this permission. Put it in ios.infoPlist in nacre.config.json
```

**3. 让类型进来。** 在入口文件顶上加一行：

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/av-capture" />
```

**效果**：编辑器里 `AVCaptureSession` 这几个类有了补全和检查。

## 构造函数

[`AVCaptureSession()`](av-capture-session/constructor.md)

创建一个空的会话：没有输入，没有输出，画质档位是 `'high'`，还没有开始取景。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`inputs`](av-capture-session/inputs.md) <small>只读</small> | 现在加在会话上的输入 |
| [`outputs`](av-capture-session/outputs.md) <small>只读</small> | 现在加在会话上的输出 |
| [`sessionPreset`](av-capture-session/sessionpreset.md) | 画质档位。默认 `'high'` |
| [`isRunning`](av-capture-session/isrunning.md) <small>只读</small> | 在不在取景 |
| [`isInterrupted`](av-capture-session/isinterrupted.md) <small>只读</small> | 是不是被系统打断着，比如来电、App 到了后台 |

## 实例方法

还继承 [`EventTarget`](event-target.md) 的 `addEventListener()`、`removeEventListener()`、`dispatchEvent()`，用来监听下面的事件。

加减输入和输出：

| 方法 | 说明 |
| --- | --- |
| [`canAddInput()`](av-capture-session/canaddinput.md) | 这个输入能不能加进来 |
| [`addInput()`](av-capture-session/addinput.md) | 加一个输入。加不进去时抛 `TypeError` |
| [`removeInput()`](av-capture-session/removeinput.md) | 去掉一个输入 |
| [`canAddOutput()`](av-capture-session/canaddoutput.md) | 这个输出能不能加进来 |
| [`addOutput()`](av-capture-session/addoutput.md) | 加一个输出。加不进去时抛 `TypeError` |
| [`removeOutput()`](av-capture-session/removeoutput.md) | 去掉一个输出 |

画质和成组的改动：

| 方法 | 说明 |
| --- | --- |
| [`canSetSessionPreset()`](av-capture-session/cansetsessionpreset.md) | 某个画质档位现在能不能设 |
| [`beginConfiguration()`](av-capture-session/beginconfiguration.md) | 开始一组改动 |
| [`commitConfiguration()`](av-capture-session/commitconfiguration.md) | 让这一组改动一次生效 |

开始和停止取景：

| 方法 | 说明 |
| --- | --- |
| [`startRunning()`](av-capture-session/startrunning.md) | 开始取景，开好之后兑现 |
| [`stopRunning()`](av-capture-session/stoprunning.md) | 停止取景，停好之后兑现 |

## 事件

用 `addEventListener()` 监听。五个事件都在系统通知之后的下一轮派发，都不能取消。

| 事件 | 什么时候派发 |
| --- | --- |
| [`start`](av-capture-session/start-event.md) | 开始取景了 |
| [`stop`](av-capture-session/stop-event.md) | 停止取景了，包括系统自己停的 |
| [`interrupt`](av-capture-session/interrupt-event.md) | 被系统打断了。事件带着原因 |
| [`interruptend`](av-capture-session/interruptend-event.md) | 打断结束了 |
| [`runtimeerror`](av-capture-session/runtimeerror-event.md) | 取景中出错了。事件对象是 [`AVCaptureSessionRuntimeErrorEvent`](av-capture-session-runtime-error-event.md)，`error` 是系统给的错误 |

监听别的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。

## 示例

### 扫一个二维码

从空白 App 开始，页面上方一块区域显示后置摄像头的画面，认到一个二维码就在控制台输出它的内容，然后停止取景。

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/av-capture" />

application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 显示画面的区域
  const box = new UIView();
  box.frame = new CGRect(20, 120, 320, 320);
  page.view.addSubview(box);

  scan(box);
});

/** @param {UIView} box 显示画面的视图 */
async function scan(box) {
  // 1. 申请授权
  const granted = await AVCaptureDevice.requestAccessForMediaType('video');
  const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
  if (!granted || camera === null) {
    console.log('用不了摄像头');
    return;
  }

  // 2. 接上摄像头，加上认码的输出
  const session = new AVCaptureSession();
  session.addInput(new AVCaptureDeviceInput(camera));
  const output = new AVCaptureMetadataOutput();
  session.addOutput(output);
  output.metadataObjectTypes = ['qrCode'];

  // 3. 把画面铺进视图
  const preview = new AVCaptureVideoPreviewLayer(session);
  preview.videoGravity = 'resizeAspectFill';
  preview.frame = box.bounds;
  box.layer.addSublayer(preview);

  // 4. 认到一个码就停
  output.addEventListener('detect', (event) => {
    const code = event.objects[0];
    if (code instanceof AVMetadataMachineReadableCodeObject) {
      console.log('扫到了：' + code.stringValue);
      session.stopRunning();
    }
  }, { once: true });

  // 5. 开始取景
  await session.startRunning();
}
```

**效果**

- 第一次运行时，系统先弹出提示框，问用户是否允许使用摄像头。用户拒绝时控制台输出 `用不了摄像头`。
- 用户允许之后，页面上方 320 × 320 pt 的区域显示后置摄像头的画面。画面在区域里的样子**未在真机验证**。
- 把一个二维码放到镜头前，控制台输出 `扫到了：` 和码里的内容，会话停止取景。

这段代码没有作为一个整体运行过。其中用到的每个 API 都在真机的验收用例里运行过。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[AVCaptureSession alloc] init]` | `new AVCaptureSession()` |
| `[session addInput:input]` | `session.addInput(input)`。加不进去时抛 `TypeError` |
| `[session addOutput:output]` | `session.addOutput(output)` |
| `session.sessionPreset = AVCaptureSessionPreset1280x720` | `session.sessionPreset = '1280x720'` |
| 在后台队列上调 `[session startRunning]` | `await session.startRunning()` |
| 在后台队列上调 `[session stopRunning]` | `await session.stopRunning()` |
| 观察 `AVCaptureSessionDidStartRunningNotification` | `session.addEventListener('start', …)` |
| 观察 `AVCaptureSessionWasInterruptedNotification`，原因在 `userInfo[AVCaptureSessionInterruptionReasonKey]` | `interrupt` 事件，原因是 `event.reason` |
| 观察 `AVCaptureSessionRuntimeErrorNotification`，错误在 `userInfo[AVCaptureSessionErrorKey]` | `runtimeerror` 事件，`event.error` |

## 参见

- [扫码](../guides/scanning.md)：从申请授权到画扫描框的完整步骤
- [`AVCaptureDevice`](av-capture-device.md)：授权、找摄像头、手电筒、变焦、对焦
- [`AVCaptureMetadataOutput`](av-capture-metadata-output.md)：认码，`detect` 事件
- [`AVCaptureVideoPreviewLayer`](av-capture-video-preview-layer.md)：显示画面，坐标换算
- [`BarcodeDetector`](barcode-detector.md)：从一张图片里认码
- [核心和能力包](capabilities.md)：哪些能力要单独装
