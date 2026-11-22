// @nacrejs/camera 的类型定义。
//
// 拍照是一个能力包：**没装这个包，就没有这些类型**——`UIImagePickerController`
// 在编辑器里不存在，写了 tsc 会报，和运行时的事实（全局没有这个类）对得上。
//
// 用的时候在入口文件顶上加一行：
//
//     /// <reference types="@nacrejs/camera" />
//
// 这里用到的 UIViewController、UIImage、CGRect 是 @nacrejs/types 声明的全局
// 类型。**这个文件不自己去引它**：用 Nacre 的入口文件本来就引了
// @nacrejs/types；在这里再写一行三斜线引用，包是用 file: 或 workspace 链接
// 进来的时候 TypeScript 找不到（TS2688）。两个包的关系写在 peerDependencies 里。

/**
 * 拍照界面的图片从哪来。
 *
 * - `camera`：相机。**这个包只支持这一种**，`sourceType` 只能写它
 * - `photoLibrary`、`savedPhotosAlbum`：相册。刚建好的 `UIImagePickerController`
 *   读出来是 `photoLibrary`（系统的默认值），但写这两个值抛 `TypeError`：
 *   从相册选图是另一个包 `@nacrejs/photos`
 */
type UIImagePickerControllerSourceType = 'photoLibrary' | 'camera' | 'savedPhotosAlbum';

/** 用哪个摄像头。`rear` 是背面的，`front` 是屏幕这一面的。 */
type UIImagePickerControllerCameraDevice = 'rear' | 'front';

/** 闪光灯。`auto` 是由系统按环境的亮度决定闪不闪。 */
type UIImagePickerControllerCameraFlashMode = 'off' | 'auto' | 'on';

/**
 * 拍照界面自己的两个事件。
 *
 * - `'pick'` —— 用户拍了一张，并且点了「使用照片」
 * - `'cancel'` —— 用户点了取消
 *
 * 一次呈现只会来其中一个。两种情况系统都**不会自己关掉拍照界面**，要在
 * 监听器里调 `dismissViewController()`。
 */
type UIImagePickerControllerEventType = 'pick' | 'cancel';

/**
 * `pick` 事件带的数据。
 */
declare class UIImagePickerControllerMediaEvent extends Event {
  constructor(type: string, init?: EventInit & Partial<Pick<UIImagePickerControllerMediaEvent, 'originalImage' | 'editedImage' | 'cropRect'>>);
  /** 拍到的照片，没有裁剪过。 */
  readonly originalImage: UIImage;
  /** 用户裁剪之后的照片。没开 `allowsEditing` 时是 `null`。 */
  readonly editedImage: UIImage | null;
  /** 用户裁的是原图上的哪一块。没开 `allowsEditing` 时是 `null`。 */
  readonly cropRect: CGRect | null;
}

/**
 * 拍照界面上每个事件名对应的事件对象：自己的两个，加上页面出现和消失的四个、
 * 外观变化的 `traitchange`。没有模态的那三个。
 */
interface UIImagePickerControllerEventMap
  extends Omit<UIViewControllerEventMap, UIPresentationEventType> {
  'pick': UIImagePickerControllerMediaEvent;
  'cancel': Event;
}

/**
 * 系统的拍照界面：取景、快门、切换前后摄像头、闪光灯，拍完之后的「重拍」和
 * 「使用照片」，都是系统画的。
 *
 * 它是一个页面，用 `presentViewController()` 弹出来。先把 `sourceType` 写成
 * `'camera'`；拍完或者取消各派发一个事件，在监听器里把它关掉。
 *
 * ```js
 * const picker = new UIImagePickerController();
 * picker.sourceType = 'camera';
 * picker.addEventListener('pick', (e) => {
 *   imageView.image = e.originalImage;
 *   picker.dismissViewController({ animated: true });
 * });
 * picker.addEventListener('cancel', () => {
 *   picker.dismissViewController({ animated: true });
 * });
 * vc.presentViewController(picker, { animated: true });
 * ```
 *
 * App 的 `nacre.config.json` 里要有 `NSCameraUsageDescription`（给用户看的
 * 那句「为什么要用相机」），没有的话生成工程时报错。
 *
 * 在 ObjC 里它继承自 `UINavigationController`；这里继承的是
 * `UIViewController`，没有导航栈的那一组成员。
 */
declare class UIImagePickerController extends UIViewController {
  /** 和硬件无关，哪台设备上都建得出来。新建时 `sourceType` 是 `'photoLibrary'`。 */
  constructor();

  /**
   * 这台设备上这种来源可不可用。写错值抛 `TypeError`。
   *
   * `'camera'` 可用不等于有摄像头：实测模拟器上它是 `true`，而
   * `isCameraDeviceAvailable()` 对两个摄像头都是 `false`。拍照之前两个都问。
   */
  static isSourceTypeAvailable(sourceType: UIImagePickerControllerSourceType): boolean;
  /** 这台设备有没有这个摄像头。写错值抛 `TypeError`。 */
  static isCameraDeviceAvailable(cameraDevice: UIImagePickerControllerCameraDevice): boolean;
  /** 这个摄像头有没有闪光灯。写错值抛 `TypeError`。 */
  static isFlashAvailableForCameraDevice(
    cameraDevice: UIImagePickerControllerCameraDevice,
  ): boolean;

  /**
   * 拍照界面的两个事件，加上页面出现和消失的四个、外观变化的 `traitchange`。
   *
   * 页面的 `beforedismiss` / `dismiss` / `dismissattempt` 在这里不能用，
   * 监听它们抛 `TypeError`：拍照界面关不关由 `pick` 和
   * `cancel` 的监听器决定。
   */
  addEventListener<K extends keyof UIImagePickerControllerEventMap>(
    type: K,
    callback: ((event: UIImagePickerControllerEventMap[K]) => void) | null,
    options?: AddEventListenerOptions,
  ): void;
  removeEventListener<K extends keyof UIImagePickerControllerEventMap>(
    type: K,
    callback: ((event: UIImagePickerControllerEventMap[K]) => void) | null,
  ): void;

  /**
   * 图片从哪来。刚建好时读出来是 `'photoLibrary'`。
   *
   * 只能写 `'camera'`。抛 `TypeError`：写 `'photoLibrary'` 或
   * `'savedPhotosAlbum'`（用 `@nacrejs/photos`）；相机这种来源在这台设备上不可用。
   */
  get sourceType(): UIImagePickerControllerSourceType;
  set sourceType(value: 'camera');

  /**
   * 默认 `false`。`true` 时用户拍完可以移动和缩放照片来裁剪，事件里多出
   * `editedImage` 和 `cropRect`。
   */
  allowsEditing: boolean;

  /**
   * 打开时用哪个摄像头，默认 `'rear'`。用户在拍照界面上还可以自己切换。
   *
   * 只在 `sourceType` 是 `'camera'` 时能读写，否则抛 `TypeError`。写一个
   * 这台设备没有的摄像头也抛。
   */
  cameraDevice: UIImagePickerControllerCameraDevice;

  /**
   * 闪光灯，默认 `'auto'`。用户在拍照界面上还可以自己改。
   *
   * 只在 `sourceType` 是 `'camera'` 时能读写，否则抛 `TypeError`。
   */
  cameraFlashMode: UIImagePickerControllerCameraFlashMode;
}
