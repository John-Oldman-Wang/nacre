# 扫码：`@nacrejs/av-capture` 和 `BarcodeDetector`

2026-11-21 做的。两样东西：

| | 是什么 | 放哪 |
| --- | --- | --- |
| 实时扫码 | AVFoundation 的拍摄那一组：`AVCaptureSession`、`AVCaptureDevice`、`AVCaptureDeviceInput`、`AVCaptureMetadataOutput`、`AVCaptureVideoPreviewLayer`，认到的码是 `AVMetadataMachineReadableCodeObject` | 能力包 `@nacrejs/av-capture`（`ios/Capabilities/AVCapture/`） |
| 从一张图里认码 | Web 形状的 `BarcodeDetector`（Shape Detection API），背后是 Vision 的 `VNDetectBarcodesRequest` | iOS 核心（`NacreBarcodeDetector.mm`、`56-barcode-detector.js`） |

## 为什么是这三个原生框架里的这一个

iOS 上扫码有三条路：

| | 是什么 | 结论 |
| --- | --- | --- |
| AVFoundation（`AVCaptureSession` + `AVCaptureMetadataOutput`） | 自己搭相机，取景是一个 `CALayer`，系统认到码通过委托告诉 App。UIKit 的 App 一直以来扫码就是这么做的 | **接**。暴露的是能力：扫描框、遮罩、动画全由 JS 用已有的视图和图层画 |
| VisionKit 的 `DataScannerViewController`（iOS 16 起） | 系统现成的扫码页面 | **不接**（用户定的）：页面定死了，属于「组件不接」那一类。另外它只有 Swift 的接口 |
| Vision 的 `VNDetectBarcodesRequest` | 给一张图，返回图里的码 | **接**，做成上层的 `BarcodeDetector` |

Web 上的做法是 `getUserMedia` 拿画面、再一帧一帧地认：要么用浏览器的 `BarcodeDetector`，要么把每一帧画到 canvas 上交给 jsQR、ZXing 的 wasm 版。后一条在我们这里走不通：V8 是 jitless 的，这种模式下 WebAssembly 也关着，纯 JS 逐帧解码跑不动。所以认码必须交给系统，JS 只拿结果。`getUserMedia` 那一套没照搬，它背后是 `MediaStream` 和 `<video>`，我们没有。

## 包的划分

- **拍摄那一组单独成包**：用户的工程要写 `NSCameraUsageDescription`。包名叫 `av-capture` 不叫 `av-foundation`：AVFoundation 还管播放，以后接视频播放的话，播放不该被要求写相机权限。
- **`BarcodeDetector` 放核心**：不要权限，Vision 链进核心几乎不花钱（「小而无代价的留核心」）。不放 `core/`：Android 上 AOSP 没有现成的认码，到时候怎么做还没定。

## 实现上要知道的

- **开和停在后台串行队列上做。** `startRunning` / `stopRunning` 会卡住调用的线程，Apple 要求放后台。JS 那一侧是 Promise，做完兑现；`start`、`stop` 事件来自系统的通知。
- **`detect` 交给 JS 的是只读的值，换算时要交回原生对象。** `transformedMetadataObjectForMetadataObject` 收的是原生的元数据对象。做法是把一帧识别出的原生对象装进一个内部的批次对象（`NacreMetadataBatch`），随内部事件 `@detect` 交给 JS；每个值暗中记着自己来自哪个批次的第几个，换算时交回去。批次由值拿着，值被回收批次才放开。这个类和 `NacreAVCaptureAccess`（`requestAccessForMediaType` 走异步通道要一个对象）直接登记在 `ctx.nativeClasses` 上，不放到全局。
- **系统会抛 NSException 的地方都接住、转成 JS 的错**：没锁就写设备的属性、加不进会话的输入输出、当前不支持的画质档位、当前不可用的元数据种类、超出范围的变焦倍数。同步的路上原生只能报 `TypeError`，所以超出范围也是 `TypeError`，不是 `RangeError`。
- **报错只写「系统拒绝」加系统给的原因，不替系统猜原因。** 没锁就写、没有手电筒写 `torchMode`、摄像头不支持的对焦方式，系统抛的都是 `NSGenericException`，按异常名分不开；早先把这个异常一律报成「没锁」，其余几种就说错了。系统的原因自己说得清楚：没锁时它说要先 `-lockForConfiguration:`，变焦超出范围它是 `NSRangeException`、带着能写的范围（实测）。
- **iOS 27 才有的符号**（外侧和内侧的超广角摄像头、两种元数据种类）都包了 `#if` 和 `@available` 两层。

## 和设计、头文件对不上的地方（都和用户确认过）

- **没锁就调平滑变焦，系统不拦。** 头文件说 `rampToVideoZoomFactor:withRate:`、`cancelVideoZoomRamp` 没锁会抛 `NSGenericException`，真机上授权前后都量过，都不抛。照系统的事实，我们这边也不拦，没有另外记「锁没锁」。
- **画质档位的名字照规矩是 `'1920x1080'` 这种**（常量 `AVCaptureSessionPreset1920x1080` 去掉前缀），不是 Swift 的 `hd1920x1080`。iOS 上一共 12 个；`320x240`、`960x540` 在 iOS 上不可用，没列。
- **`canSetSessionPreset` 草案漏了**，头文件里有，补上了。
- **`requestAccessForMediaType('audio')`** 草案写的是「抛」，它返回 Promise，照 Web IDL 改成以 `TypeError` 拒绝。

## BarcodeDetector

- 格式名照 Web。Vision 没有 UPC-A：`upc_a` 能写进构造参数，但 `getSupportedFormats()` 里没有它，永远认不出来。Vision 认得、Web 没有名字的几种（GS1 DataBar、MSI Plessey、Micro QR、Micro PDF417）不找，结果里不会出现 `unknown`。
- Vision 的坐标是左下原点的 0–1 比例，换算成图片的像素、左上原点，和 Web 一致。
- 码里的内容不是文字时 `rawValue` 给空串。

## 验证（iPhone 14 真机，iOS 27.2）

- 两个新步骤只跑它们：230 条全过。要授权的那一段在用户点了「允许」之后跑通。
- **对着 Mac 屏幕上一张同时有两个二维码的图扫，`detect` 的一帧里认到了 2 个码**，内容都对。更多没试，不知道上限。
- 量到的：后置摄像头的变焦范围 1 到 123.75 倍，对焦默认 `continuousAutoFocus`；`BarcodeDetector` 在这台手机上支持 12 种格式。
- 没验证的：手电筒真的亮、平滑变焦看得到、画面在图层里的样子；`interrupt`、`interruptend`、`runtimeerror`（要来电或者别的 App 抢摄像头）。
