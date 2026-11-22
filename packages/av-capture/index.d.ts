// @nacrejs/av-capture 的类型定义。
//
// 相机取景和扫码是一个能力包：**没装这个包，就没有这些类型**，全局上也没有
// AVCaptureSession 这几个类。
//
// 用的时候在入口文件顶上加一行：
//
//     /// <reference types="@nacrejs/av-capture" />
//
// 这里用到的 NSObject、CALayer、CGRect、CGPoint、Event 是 @nacrejs/types 声明的
// 全局类型。这个文件不自己去引它（理由见 @nacrejs/core-location 的 index.d.ts）。
//
// 只做「取景 + 识别元数据（条码、人脸）」：拍照、录像、逐帧的像素、麦克风、
// 多摄像头同时开、AVCaptureConnection 都没有。

/** 媒体类型。这个包只做视频（摄像头）。 */
type AVMediaType = 'video';

/**
 * 用户对「这个 App 能不能用摄像头」的决定。
 *
 * - `'notDetermined'` —— 还没问过用户
 * - `'restricted'` —— 设备上的限制不允许（家长控制一类），用户自己改不了
 * - `'denied'` —— 用户拒绝了
 * - `'authorized'` —— 可以用
 */
type AVAuthorizationStatus = 'notDetermined' | 'restricted' | 'denied' | 'authorized';

/** 摄像头在机身的哪一面。`'unspecified'` 是不分面（查找时表示哪一面都行）。 */
type AVCaptureDevicePosition = 'unspecified' | 'back' | 'front';

/**
 * 摄像头的种类。
 *
 * - `'builtInWideAngleCamera'` —— 广角，每台 iPhone 都有
 * - `'builtInUltraWideCamera'`、`'builtInTelephotoCamera'` —— 超广角、长焦
 * - `'builtInDualCamera'`、`'builtInDualWideCamera'`、`'builtInTripleCamera'` ——
 *   几颗镜头合成的一个设备，按变焦倍数自动切换
 * - `'builtInTrueDepthCamera'`、`'builtInLiDARDepthCamera'` —— 带深度的
 * - `'builtInOuterUltraWideCamera'`、`'builtInInnerUltraWideCamera'` —— iOS 27.1 起才有
 * - `'continuityCamera'`、`'external'` —— 外接的
 */
type AVCaptureDeviceType =
  | 'builtInWideAngleCamera' | 'builtInTelephotoCamera' | 'builtInUltraWideCamera'
  | 'builtInOuterUltraWideCamera' | 'builtInInnerUltraWideCamera'
  | 'builtInDualCamera' | 'builtInDualWideCamera' | 'builtInTripleCamera'
  | 'builtInTrueDepthCamera' | 'builtInLiDARDepthCamera' | 'continuityCamera' | 'external';

/** 手电筒（补光灯）：关、开、按环境光自动。 */
type AVCaptureTorchMode = 'off' | 'on' | 'auto';

/**
 * 对焦方式。
 *
 * - `'locked'` —— 焦点锁住不动
 * - `'autoFocus'` —— 对一次焦，然后锁住
 * - `'continuousAutoFocus'` —— 一直自动对焦
 */
type AVCaptureFocusMode = 'locked' | 'autoFocus' | 'continuousAutoFocus';

/** 自动对焦只在哪个距离范围里找：不限、近处、远处。扫码用 `'near'` 更快。 */
type AVCaptureAutoFocusRangeRestriction = 'none' | 'near' | 'far';

/**
 * 会话的画质档位。
 *
 * - `'high'` —— 默认值
 * - `'photo'`、`'medium'`、`'low'`
 * - `'352x288'`、`'640x480'`、`'1280x720'`、`'1920x1080'`、`'3840x2160'` —— 固定的分辨率
 * - `'iFrame960x540'`、`'iFrame1280x720'`
 * - `'inputPriority'` —— 由摄像头当前的格式决定，不由会话定
 */
type AVCaptureSessionPreset =
  | 'photo' | 'high' | 'medium' | 'low'
  | '352x288' | '640x480' | '1280x720' | '1920x1080' | '3840x2160'
  | 'iFrame960x540' | 'iFrame1280x720' | 'inputPriority';

/**
 * 会话为什么被打断了。
 *
 * - `'videoDeviceNotAvailableInBackground'` —— App 到后台了
 * - `'audioDeviceInUseByAnotherClient'` —— 麦克风被别的 App 占着
 * - `'videoDeviceInUseByAnotherClient'` —— 摄像头被别的 App 占着
 * - `'videoDeviceNotAvailableWithMultipleForegroundApps'` —— 分屏一类，前台不止一个 App
 * - `'videoDeviceNotAvailableDueToSystemPressure'` —— 设备太热之类，系统收回了摄像头
 * - `'sensitiveContentMitigationActivated'` —— 系统的敏感内容保护开始起作用
 */
type AVCaptureSessionInterruptionReason =
  | 'videoDeviceNotAvailableInBackground' | 'audioDeviceInUseByAnotherClient'
  | 'videoDeviceInUseByAnotherClient' | 'videoDeviceNotAvailableWithMultipleForegroundApps'
  | 'videoDeviceNotAvailableDueToSystemPressure' | 'sensitiveContentMitigationActivated';

/**
 * 能识别的元数据的种类。
 *
 * 码：`'qrCode'`、`'microQRCode'`、`'aztecCode'`、`'dataMatrixCode'`、`'pdf417Code'`、
 * `'microPDF417Code'`、`'code128Code'`、`'code39Code'`、`'code39Mod43Code'`、`'code93Code'`、
 * `'codabarCode'`、`'ean13Code'`、`'ean8Code'`、`'upceCode'`、`'interleaved2of5Code'`、
 * `'itf14Code'`、`'gs1DataBarCode'`、`'gs1DataBarExpandedCode'`、`'gs1DataBarLimitedCode'`。
 *
 * 别的：`'face'`（人脸）、`'humanBody'`、`'humanFullBody'`、`'catHead'`、`'catBody'`、
 * `'dogHead'`、`'dogBody'`、`'salientObject'`（画面里最显眼的东西），以及 iOS 27 起的
 * `'focusTrackedObject'`、`'cinematicVideoMetadata'`。
 */
type AVMetadataObjectType =
  | 'qrCode' | 'microQRCode' | 'aztecCode' | 'dataMatrixCode' | 'pdf417Code' | 'microPDF417Code'
  | 'code128Code' | 'code39Code' | 'code39Mod43Code' | 'code93Code' | 'codabarCode'
  | 'ean13Code' | 'ean8Code' | 'upceCode' | 'interleaved2of5Code' | 'itf14Code'
  | 'gs1DataBarCode' | 'gs1DataBarExpandedCode' | 'gs1DataBarLimitedCode'
  | 'face' | 'humanBody' | 'humanFullBody' | 'catHead' | 'catBody' | 'dogHead' | 'dogBody'
  | 'salientObject' | 'focusTrackedObject' | 'cinematicVideoMetadata';

/**
 * 取景画面怎么填进图层。
 *
 * - `'resizeAspect'` —— 保持比例，整个画面放得下，可能留边。默认值
 * - `'resizeAspectFill'` —— 保持比例，铺满图层，多出来的裁掉
 * - `'resize'` —— 拉伸到和图层一样大
 */
type AVLayerVideoGravity = 'resize' | 'resizeAspect' | 'resizeAspectFill';

/**
 * 一个摄像头。不能 `new`，从 `defaultDeviceWithMediaType()` 或
 * `defaultDeviceWithDeviceType()` 拿。
 *
 * 写属性（手电筒、变焦、对焦）之前要先 `lockForConfiguration()`，改完
 * `unlockForConfiguration()`。没锁就写，抛 `TypeError`；设备不支持那个值，也抛
 * `TypeError`。
 */
declare class AVCaptureDevice extends NSObject {
  private constructor();

  /** 现在的授权状态。读它不会弹提示框。媒体类型只能是 `'video'`，别的抛 `TypeError`。 */
  static authorizationStatusForMediaType(mediaType: AVMediaType): AVAuthorizationStatus;
  /**
   * 申请用摄像头。还没问过用户时系统弹提示框，用户选完兑现成「给没给」；
   * 已经问过就当场兑现成上次的结果。媒体类型不是 `'video'` 时以 `TypeError` 拒绝。
   */
  static requestAccessForMediaType(mediaType: AVMediaType): Promise<boolean>;
  /** 这台设备默认的摄像头（后置广角）。没有时是 `null`。 */
  static defaultDeviceWithMediaType(mediaType: AVMediaType): AVCaptureDevice | null;
  /**
   * 按种类和朝向找一个摄像头，没有时是 `null`。`mediaType` 不写是不限，
   * `position` 不写是 `'unspecified'`（哪一面都行）。
   */
  static defaultDeviceWithDeviceType(
    deviceType: AVCaptureDeviceType,
    options?: { mediaType?: AVMediaType | null; position?: AVCaptureDevicePosition } | null,
  ): AVCaptureDevice | null;

  /** 这个摄像头的唯一标识，重启也不变。 */
  readonly uniqueID: string;
  /** 给人看的名字，按系统语言。 */
  readonly localizedName: string;
  /** 在机身的哪一面。 */
  readonly position: AVCaptureDevicePosition;

  /** 拿到改设置的权利。拿不到（被别的 App 占着一类）抛 `Error`。 */
  lockForConfiguration(): void;
  /** 交还改设置的权利。 */
  unlockForConfiguration(): void;

  /** 有没有手电筒。 */
  readonly hasTorch: boolean;
  /** 手电筒现在能不能用（太热时系统会暂时关掉）。 */
  readonly isTorchAvailable: boolean;
  /** 手电筒。默认 `'off'`。 */
  torchMode: AVCaptureTorchMode;

  /** 变焦倍数。1 是不变焦，范围是下面两个数之间。 */
  videoZoomFactor: number;
  /** 现在能用的最小变焦倍数。 */
  readonly minAvailableVideoZoomFactor: number;
  /** 现在能用的最大变焦倍数。 */
  readonly maxAvailableVideoZoomFactor: number;
  /**
   * 平滑地变焦到 `factor`。`withRate` 是速度：每秒放大到 2 的 `withRate` 次方倍。
   * 要先锁。
   */
  rampToVideoZoomFactor(factor: number, options: { withRate: number }): void;
  /** 停下正在进行的平滑变焦。要先锁。 */
  cancelVideoZoomRamp(): void;

  /** 对焦方式。 */
  focusMode: AVCaptureFocusMode;
  /** 支不支持这种对焦方式。写错名字抛 `TypeError`。 */
  isFocusModeSupported(focusMode: AVCaptureFocusMode): boolean;
  /** 支不支持指定对焦点。 */
  readonly isFocusPointOfInterestSupported: boolean;
  /**
   * 对焦点，0 到 1 的比例：(0, 0) 是画面左上角，(1, 1) 是右下角，坐标是横屏、
   * Home 键在右时的方向。设了之后要再写一次 `focusMode` 才生效。
   */
  get focusPointOfInterest(): CGPoint;
  set focusPointOfInterest(value: CGPointLike);
  /** 自动对焦只在哪个距离范围里找。默认 `'none'`。 */
  autoFocusRangeRestriction: AVCaptureAutoFocusRangeRestriction;
}

/** 会话的输入。只有 `AVCaptureDeviceInput` 一种，这个类不能 `new`。 */
declare class AVCaptureInput extends NSObject {
  protected constructor();
}

/** 把一个摄像头接进会话的输入。 */
declare class AVCaptureDeviceInput extends AVCaptureInput {
  /**
   * 还没问过用户时，系统会在这一刻弹出授权的提示框。建不出来（没有授权、摄像头
   * 被占着一类）抛 `Error`；`device` 不是 `AVCaptureDevice`，抛 `TypeError`。
   */
  constructor(device: AVCaptureDevice);
  /** 接的是哪个摄像头。 */
  readonly device: AVCaptureDevice;
}

/** 会话的输出。只有 `AVCaptureMetadataOutput` 一种，这个类不能 `new`。 */
declare class AVCaptureOutput extends NSObject {
  protected constructor();
}

/**
 * 识别出的一个元数据（人脸、人体一类）。只能由系统给，不能 `new`，从
 * `detect` 事件里来。字段只读，写入即抛。
 */
declare class AVMetadataObject {
  protected constructor();
  /** 是什么。 */
  readonly type: AVMetadataObjectType;
  /**
   * 在画面里的位置。从 `detect` 事件拿到的是 0 到 1 的比例（横屏、Home 键在右的
   * 方向）；经过 `AVCaptureVideoPreviewLayer.transformedMetadataObjectForMetadataObject()`
   * 换算之后是图层里的点。
   */
  readonly bounds: CGRect;
}

/** 识别出的一个码。 */
declare class AVMetadataMachineReadableCodeObject extends AVMetadataObject {
  protected constructor();
  /** 码里的文字。内容不是文字时是 `null`。 */
  readonly stringValue: string | null;
  /** 码的四个角，坐标系和 `bounds` 一样。 */
  readonly corners: readonly CGPoint[];
}

/** `detect` 的事件对象。 */
declare interface AVCaptureMetadataOutputDetectEvent extends Event {
  /** 这一帧里识别出的全部，至少一个。 */
  readonly objects: readonly AVMetadataObject[];
}

/**
 * 识别画面里的码、人脸这类元数据。加进会话、设好 `metadataObjectTypes`、会话在跑时，
 * 画面里有要找的东西就派发 `detect`。
 *
 * ```js
 * const output = new AVCaptureMetadataOutput();
 * session.addOutput(output);
 * output.metadataObjectTypes = ['qrCode'];
 * output.addEventListener('detect', (e) => console.log(e.objects[0].stringValue));
 * ```
 */
declare class AVCaptureMetadataOutput extends AVCaptureOutput {
  constructor();
  /**
   * 现在能识别的种类。**加进一个有摄像头输入的会话之前是空数组**。
   */
  readonly availableMetadataObjectTypes: AVMetadataObjectType[];
  /**
   * 要识别的种类。默认是空数组（什么都不识别）。写了 `availableMetadataObjectTypes`
   * 里没有的种类抛 `TypeError`。
   */
  metadataObjectTypes: AVMetadataObjectType[];
  /**
   * 只在画面的这一块里找，0 到 1 的比例（横屏、Home 键在右的方向）。默认整个画面
   * `(0, 0, 1, 1)`。从图层的坐标换算用
   * `AVCaptureVideoPreviewLayer.metadataOutputRectOfInterestForRect()`。
   */
  get rectOfInterest(): CGRect;
  set rectOfInterest(value: CGRectLike);

  /** `detect`：画面里有要找的东西。每一帧都会来，延后一轮派发，不可取消。 */
  addEventListener(type: 'detect', callback: EventListener<AVCaptureMetadataOutputDetectEvent> | null,
                   options?: AddEventListenerOptions): void;
  addEventListener(type: string, callback: EventListener | null, options?: AddEventListenerOptions): void;
  removeEventListener(type: 'detect', callback: EventListener<AVCaptureMetadataOutputDetectEvent> | null): void;
  removeEventListener(type: string, callback: EventListener | null): void;
}

/** `interrupt` 的事件对象。 */
declare interface AVCaptureSessionInterruptEvent extends Event {
  /** 为什么被打断。系统没说时是 `null`。 */
  readonly reason: AVCaptureSessionInterruptionReason | null;
}

/** `runtimeerror` 的事件对象。 */
declare interface AVCaptureSessionRuntimeErrorEvent extends Event {
  /** 系统给的说明。 */
  readonly message: string;
  /** `NSError.code` 的原值。 */
  readonly code: number;
}

/**
 * 一次取景：把输入（摄像头）接到输出（识别元数据、取景图层）上。
 *
 * 加进去的输入和输出由会话拿着，不用自己留引用。
 */
declare class AVCaptureSession extends NSObject {
  constructor();

  /** 能不能加这个输入（同一个摄像头不能加两次一类）。 */
  canAddInput(input: AVCaptureInput): boolean;
  /** 加一个输入。加不进去（`canAddInput()` 是 `false`）时抛 `TypeError`。 */
  addInput(input: AVCaptureInput): void;
  removeInput(input: AVCaptureInput): void;
  /** 能不能加这个输出。 */
  canAddOutput(output: AVCaptureOutput): boolean;
  /** 加一个输出。加不进去（`canAddOutput()` 是 `false`）时抛 `TypeError`。 */
  addOutput(output: AVCaptureOutput): void;
  removeOutput(output: AVCaptureOutput): void;
  /** 现在的输入。每次读得到一个新数组。 */
  readonly inputs: AVCaptureInput[];
  /** 现在的输出。每次读得到一个新数组。 */
  readonly outputs: AVCaptureOutput[];

  /** 画质档位。默认 `'high'`。现在的输入不支持那一档时抛 `TypeError`。 */
  sessionPreset: AVCaptureSessionPreset;
  /** 这一档现在能不能设：取决于接上的摄像头和输出。名字写错抛 `TypeError`。 */
  canSetSessionPreset(preset: AVCaptureSessionPreset): boolean;

  /** 开始一组改动：到 `commitConfiguration()` 为止的改动一次生效。 */
  beginConfiguration(): void;
  /** 让 `beginConfiguration()` 之后的改动一次生效。 */
  commitConfiguration(): void;

  /**
   * 开始取景。在后台开，开好兑现（要几百毫秒）。开不起来时不拒绝：系统从
   * `runtimeerror` 事件报原因，`isRunning` 还是 `false`。
   */
  startRunning(): Promise<void>;
  /** 停止取景。在后台停，停好兑现。 */
  stopRunning(): Promise<void>;
  /** 在不在取景。 */
  readonly isRunning: boolean;
  /** 是不是被打断着（来电、App 到后台一类）。 */
  readonly isInterrupted: boolean;

  /** `start`：开始取景了。`stop`：停了（包括系统自己停的）。`interruptend`：打断结束了。 */
  addEventListener(type: 'start' | 'stop' | 'interruptend', callback: EventListener | null,
                   options?: AddEventListenerOptions): void;
  /** `interrupt`：被打断了。 */
  addEventListener(type: 'interrupt', callback: EventListener<AVCaptureSessionInterruptEvent> | null,
                   options?: AddEventListenerOptions): void;
  /** `runtimeerror`：取景中出错了。 */
  addEventListener(type: 'runtimeerror', callback: EventListener<AVCaptureSessionRuntimeErrorEvent> | null,
                   options?: AddEventListenerOptions): void;
  addEventListener(type: string, callback: EventListener | null, options?: AddEventListenerOptions): void;
  removeEventListener(type: 'interrupt', callback: EventListener<AVCaptureSessionInterruptEvent> | null): void;
  removeEventListener(type: 'runtimeerror', callback: EventListener<AVCaptureSessionRuntimeErrorEvent> | null): void;
  removeEventListener(type: string, callback: EventListener | null): void;
}

/**
 * 显示取景画面的图层。放进一个视图的图层里，设好 `frame`。
 *
 * ```js
 * const preview = new AVCaptureVideoPreviewLayer(session);
 * preview.videoGravity = 'resizeAspectFill';
 * preview.frame = view.bounds;
 * view.layer.addSublayer(preview);
 * ```
 */
declare class AVCaptureVideoPreviewLayer extends CALayer {
  /** `session` 不是 `AVCaptureSession`，抛 `TypeError`。 */
  constructor(session: AVCaptureSession);
  /** 显示哪个会话的画面。 */
  session: AVCaptureSession | null;
  /** 画面怎么填进图层。默认 `'resizeAspect'`。 */
  videoGravity: AVLayerVideoGravity;
  /**
   * 把 `detect` 事件里的一个对象换算成这个图层里的坐标（`bounds` 和 `corners` 是点），
   * 换算不了时是 `null`。参数不是从 `detect` 事件拿到的，抛 `TypeError`。
   */
  transformedMetadataObjectForMetadataObject(metadataObject: AVMetadataObject): AVMetadataObject | null;
  /** 把图层里的一个矩形换算成 `AVCaptureMetadataOutput.rectOfInterest` 用的比例。 */
  metadataOutputRectOfInterestForRect(rect: CGRectLike): CGRect;
  /** 把图层里的一个点换算成 `focusPointOfInterest` 用的比例。 */
  captureDevicePointOfInterestForPoint(point: CGPointLike): CGPoint;
  /** 反过来：把 `focusPointOfInterest` 用的比例换算成图层里的点。 */
  pointForCaptureDevicePointOfInterest(point: CGPointLike): CGPoint;
}
