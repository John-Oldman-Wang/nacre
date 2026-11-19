// 初稿是 bindgen 生成的（docs/internals/bindgen.md）。之后它是普通的手写文件：直接改，bindgen 不会再碰它。
//
// 屏幕：UIScreen 和它的显示模式 UIScreenMode。屏幕从场景拿：`scene.screen`。

/** 参考显示模式（专业显示器那种按标准色彩显示）的状态。iPhone 上一般是 `'notSupported'`。 */
type UIScreenReferenceDisplayModeStatus = 'notSupported' | 'notEnabled' | 'limited' | 'enabled';

/** 屏幕的事件。都是系统的通知，延后一轮派发，不能取消。 */
type UIScreenEventType =
  | 'brightnesschange'
  | 'modechange'
  | 'capturedchange'
  | 'referencedisplaymodestatuschange';

/**
 * 一块屏幕。不能 `new`，从场景拿：
 *
 * ```js
 * const screen = scene.screen;
 * console.log(screen.bounds.width, screen.scale);
 * ```
 */
declare class UIScreen extends NSObject {
  private constructor();

  /** 整块屏幕的范围，单位 pt，原点在左上角。 */
  readonly bounds: CGRect;
  /** 一个 pt 对应几个像素。 */
  readonly scale: number;
  /** 物理屏幕的范围，单位是像素，永远按竖屏给。 */
  readonly nativeBounds: CGRect;
  /** 物理屏幕上一个 pt 对应几个像素。 */
  readonly nativeScale: number;
  /** 屏幕亮度，0 到 1。写 0 到 1 以外的值抛 `TypeError`。 */
  brightness: number;
  /** 亮度调到硬件能做到的最低之下时，用软件再压暗。默认 `false`。 */
  wantsSoftwareDimming: boolean;
  /** 这块屏幕每秒最多刷新几帧。 */
  readonly maximumFramesPerSecond: number;
  /** 显示硬件的延迟，单位秒。用户没校准过时是 `0`。 */
  readonly calibratedLatency: number;
  readonly referenceDisplayModeStatus: UIScreenReferenceDisplayModeStatus;
  /** 此刻能显示的最亮白色是普通白色的几倍。 */
  readonly currentEDRHeadroom: number;
  /** 这块屏幕最多能显示的最亮白色是普通白色的几倍。 */
  readonly potentialEDRHeadroom: number;
  /** 屏幕正在被录制、投屏或者镜像。 */
  readonly isCaptured: boolean;
  /** 这块屏幕支持的显示模式。 */
  readonly availableModes: readonly UIScreenMode[];
  readonly preferredMode: UIScreenMode | null;
  /** 此刻的显示模式。写入只对外接显示器有意义。 */
  get currentMode(): UIScreenMode | null;
  set currentMode(value: UIScreenMode | null);
  /** 这块屏幕在镜像哪块屏幕；没有镜像时是 `null`。 */
  readonly mirroredScreen: UIScreen | null;
  /** 屏幕的外观特征。每次读给当时的那一份。 */
  readonly traitCollection: UITraitCollection;

  /** 把屏幕此刻的内容拍成一个视图。 */
  snapshotViewAfterScreenUpdates(afterUpdates: boolean): UIView;

  addEventListener(
    type: UIScreenEventType | (string & {}),
    callback: EventListener | null,
    options?: AddEventListenerOptions | boolean,
  ): void;
  removeEventListener(type: UIScreenEventType | (string & {}), callback: EventListener | null): void;
}

/** 屏幕的一种显示模式。不能 `new`，从屏幕的 `availableModes`、`currentMode` 拿。 */
declare class UIScreenMode extends NSObject {
  private constructor();

  /** 这种模式的大小，单位是像素。 */
  readonly size: CGSize;
  /** 像素的宽高比，一般是 1。 */
  readonly pixelAspectRatio: number;
}

interface UIWindowScene {
  /** 这个场景显示在哪块屏幕上。 */
  readonly screen: UIScreen;
}
