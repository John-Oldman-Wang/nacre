// @nacrejs/photos 的类型定义：从相册选图、把图片存进相册。
//
// **没装这个包，就没有这些类型**——`PHPickerViewController` 在编辑器里不存在，
// 写了 tsc 会报，和运行时的事实（全局上没有这个类）对得上。
//
// 用的时候在入口文件顶上加一行：
//
//     /// <reference types="@nacrejs/photos" />
//
// 这里用到的 NSObject、UIViewController、UIImage 是 @nacrejs/types 声明的全局
// 类型。**这个文件不自己去引它**：用 Nacre 的入口文件本来就引了 @nacrejs/types；
// 而在这里再写一行三斜线引用，包是用 file: 或 workspace 链接进来的时候
// TypeScript 找不到它（实测报 TS2688）。两个包的关系写在 peerDependencies 里。

// ---------- 选图 ----------

/**
 * 一项有几种格式时，选图界面给哪一种。
 */
type PHPickerConfigurationAssetRepresentationMode =
  /** 系统决定。默认值。 */
  | 'automatic'
  /** 尽量给原来的格式，不转码（HEIC 的照片给的就是 HEIC）。 */
  | 'current'
  /** 尽量给最通用的格式，需要的话转码（HEIC 转成 JPEG）。转码要时间。 */
  | 'compatible';

/**
 * 选中的方式。
 */
type PHPickerConfigurationSelection =
  /** 默认：选中的项上打一个勾。 */
  | 'default'
  /** 按选的先后编号，结果也按这个顺序给。 */
  | 'ordered'
  /** 每选中或取消一项就派发一次 `pick`，不等用户点「添加」。 */
  | 'continuous'
  /** `continuous` 加上编号。 */
  | 'continuousAndOrdered';

/** 选图界面的样子。 */
type PHPickerMode =
  /** 完整的界面。默认值。 */
  | 'default'
  /** 只有一行缩略图，给嵌在页面里的选择器用。 */
  | 'compact';

/**
 * 选图界面里显示哪些类型。
 *
 * 没有 `new`。现成的十二个从类上拿，要组合用三个类方法：
 *
 * ```js
 * config.filter = PHPickerFilter.imagesFilter;                 // 只要图片
 * config.filter = PHPickerFilter.anyFilterMatchingSubfilters(  // 图片和视频
 *   [PHPickerFilter.imagesFilter, PHPickerFilter.videosFilter]);
 * ```
 *
 * 现成的十二个每次读是同一个对象，可以用 `===` 比。组合出来的、从
 * `config.filter` 读回来的是各自的对象，比较用 `isEqual()`。
 */
declare class PHPickerFilter extends NSObject {
  /** 没有公开的构造函数。 */
  private constructor();

  /** 图片，包括实况照片。 */
  static readonly imagesFilter: PHPickerFilter;
  /** 视频。 */
  static readonly videosFilter: PHPickerFilter;
  /** 实况照片。 */
  static readonly livePhotosFilter: PHPickerFilter;
  /** 带景深效果的照片（人像模式）。 */
  static readonly depthEffectPhotosFilter: PHPickerFilter;
  /** 连拍。 */
  static readonly burstsFilter: PHPickerFilter;
  /** 全景照片。 */
  static readonly panoramasFilter: PHPickerFilter;
  /** 截屏。 */
  static readonly screenshotsFilter: PHPickerFilter;
  /** 屏幕录制。 */
  static readonly screenRecordingsFilter: PHPickerFilter;
  /** 电影效果的视频。 */
  static readonly cinematicVideosFilter: PHPickerFilter;
  /** 慢动作视频。 */
  static readonly slomoVideosFilter: PHPickerFilter;
  /** 延时摄影。 */
  static readonly timelapseVideosFilter: PHPickerFilter;
  /** 空间照片和空间视频。 */
  static readonly spatialMediaFilter: PHPickerFilter;

  /** 符合其中任何一个。空数组抛 `TypeError`。 */
  static anyFilterMatchingSubfilters(subfilters: Iterable<PHPickerFilter>): PHPickerFilter;
  /** 每一个都符合。空数组抛 `TypeError`。 */
  static allFilterMatchingSubfilters(subfilters: Iterable<PHPickerFilter>): PHPickerFilter;
  /** 不符合这一个。 */
  static notFilterOfSubfilter(subfilter: PHPickerFilter): PHPickerFilter;

  /** 两个筛选条件是不是同一个意思。`other` 不是筛选条件时是 `false`。 */
  isEqual(other: unknown): boolean;
}

/**
 * 选图界面的配置。建选择器时被**复制一份**，之后再改它不影响已经建好的
 * 选择器。
 *
 * ```js
 * const config = new PHPickerConfiguration();
 * config.selectionLimit = 3;
 * config.filter = PHPickerFilter.imagesFilter;
 * ```
 */
declare class PHPickerConfiguration extends NSObject {
  constructor();

  /**
   * 最多选几项。默认 1；0 是不限。负数抛 `TypeError`。
   */
  selectionLimit: number;
  /**
   * 显示哪些类型。默认 `null`：全部。
   *
   * 系统存的是副本：读回来的不是写进去的那个对象，比较用 `isEqual()`。
   */
  filter: PHPickerFilter | null;
  /** 一项有几种格式时给哪一种。默认 `'automatic'`。 */
  preferredAssetRepresentationMode: PHPickerConfigurationAssetRepresentationMode;
  /** 选中的方式。默认 `'default'`。 */
  selection: PHPickerConfigurationSelection;
  /** 界面的样子。默认 `'default'`。 */
  mode: PHPickerMode;
}

/**
 * 用户在选图界面里选中的一项。只有 `pick` 事件给得出来。
 *
 * 它自己不是图片，图片从 `itemProvider` 上取。
 */
declare class PHPickerResult extends NSObject {
  /** 只能由选图界面给出。 */
  private constructor();

  /** 这一项的内容从它身上取。 */
  readonly itemProvider: NSItemProvider;
}

/**
 * 一项内容的提供者。选图的每个结果带一个，图片从它身上取：
 *
 * ```js
 * if (provider.canLoadObjectOfClass(UIImage)) {
 *   const image = await provider.loadObjectOfClass(UIImage);
 * }
 * ```
 *
 * 现在只接了取图片要用的这几样，而且只认 `UIImage`。
 */
declare class NSItemProvider extends NSObject {
  /**
   * 用一个对象建一个提供者（`initWithObject:`）。现在只收 `UIImage`，别的抛
   * `TypeError`。
   */
  constructor(object: UIImage);

  /**
   * 这一项有哪些格式，值是统一类型标识符：`'public.jpeg'`、`'public.heic'`、
   * `'com.apple.quicktime-movie'`……
   */
  readonly registeredTypeIdentifiers: string[];
  /** 系统建议的文件名，不带扩展名。没有是 `null`。 */
  readonly suggestedName: string | null;

  /**
   * 是不是某一类内容。`'public.image'` 是图片，`'public.movie'` 是视频。
   */
  hasItemConformingToTypeIdentifier(typeIdentifier: string): boolean;
  /**
   * 取不取得出这个类的对象。现在只认 `UIImage`，传别的类抛 `TypeError`。
   * 选中的是视频时是 `false`。
   */
  canLoadObjectOfClass(aClass: typeof UIImage): boolean;
  /**
   * 取出这个类的对象。现在只认 `UIImage`，传别的类抛 `TypeError`。
   *
   * 取不出来时 reject：这一项不是图片是 `NotSupportedError`，读的过程出错是
   * `NotReadableError`（带 `code` 和 `domain`）。照片在 iCloud 上时系统会先
   * 下载，所以可能要等几秒。
   */
  loadObjectOfClass(aClass: typeof UIImage): Promise<UIImage>;
}

/** 选图界面自己的事件名。只有一个：用户选完了，或者取消了。 */
type PHPickerViewControllerEventType = 'pick';

/**
 * `pick` 事件带的数据。
 *
 * 回调参数的类型没有窄化（`EventTarget` 的基类签名不允许），要拿就转一下型：
 *
 * ```js
 * picker.addEventListener('pick', (e) => {
 *   const { results } = /** @type {PHPickerViewControllerFinishEvent} *\/ (e);
 * });
 * ```
 */
declare interface PHPickerViewControllerFinishEvent extends Event {
  /** 选中的那几项。用户点了取消时是空数组。 */
  readonly results: readonly PHPickerResult[];
}

/**
 * 系统的选图界面。它是一个页面，用 `presentViewController()` 弹出来。
 *
 * 它在系统自己的进程里运行，App 只拿到用户选中的那几项，所以**不需要相册
 * 权限**，不会弹权限提示框。
 *
 * 用户选完或者取消时派发 `pick`。系统**不会自己把它关掉**，
 * 在监听器里调 `dismissViewController()`。
 *
 * ```js
 * const config = new PHPickerConfiguration();
 * config.filter = PHPickerFilter.imagesFilter;
 * const picker = new PHPickerViewController(config);
 * picker.addEventListener('pick', async (e) => {
 *   const { results } = /** @type {PHPickerViewControllerFinishEvent} *\/ (e);
 *   picker.dismissViewController({ animated: true });
 *   if (results.length === 0) return;   // 取消
 *   imageView.image = await results[0].itemProvider.loadObjectOfClass(UIImage);
 * });
 * page.presentViewController(picker, { animated: true });
 * ```
 */
declare class PHPickerViewController extends UIViewController {
  /** 配置在这里被复制一份。不给配置、给的不是 `PHPickerConfiguration` 抛 `TypeError`。 */
  constructor(configuration: PHPickerConfiguration);

  /** 构造时复制的那一份配置。 */
  readonly configuration: PHPickerConfiguration;
}

// ---------- 存图 ----------

/**
 * 相册的访问级别。只有「添加」这一种：往相册里存东西，读不到里面已有的。
 *
 * ObjC 的 `PHAccessLevelReadWrite`（读整个相册）没有接，写了抛 `TypeError`。
 */
type PHAccessLevel = 'addOnly';

/** 相册的授权状态。 */
type PHAuthorizationStatus =
  /** 还没问过用户。 */
  | 'notDetermined'
  /** 被系统限制了（家长控制一类），用户自己也改不了。 */
  | 'restricted'
  /** 用户拒绝了。 */
  | 'denied'
  /** 用户同意了。 */
  | 'authorized'
  /** 用户只给了一部分照片。「添加」这个级别不会出现这个状态。 */
  | 'limited';

/**
 * 存图失败时 reject 的 `Error`。`code` 和 `domain` 是系统那个 `NSError` 的
 * 原值。
 */
interface PHPhotoLibraryError extends Error {
  /**
   * `NotAllowedError`：用户没同意，或者被系统限制了。
   * `InvalidStateError`：工程的 Info.plist 里没有 `NSPhotoLibraryAddUsageDescription`。
   * `PhotosError`：别的失败。
   */
  name: 'NotAllowedError' | 'InvalidStateError' | 'PhotosError';
  code: number;
  domain: string;
}

/** `performChanges()` 要做的修改。现在只有一种。 */
interface PHPhotoLibraryChanges {
  /** 把这张图存成相册里的一张新照片。 */
  creationRequestForAssetFromImage: UIImage;
}

/**
 * 相册。只接了「添加」那条路：把一张图存进去。
 *
 * ```js
 * await PHPhotoLibrary.sharedPhotoLibrary.performChanges({
 *   creationRequestForAssetFromImage: image,
 * });
 * ```
 *
 * 要项目在 `nacre.config.json` 的 `ios.infoPlist` 里写
 * `NSPhotoLibraryAddUsageDescription`。
 */
declare class PHPhotoLibrary extends NSObject {
  /** 只有一个，用 `PHPhotoLibrary.sharedPhotoLibrary`。 */
  private constructor();

  /** 系统的相册。两次读是同一个对象。 */
  static readonly sharedPhotoLibrary: PHPhotoLibrary;

  /** 现在的授权状态。只是读，不会弹提示框。 */
  static authorizationStatusForAccessLevel(accessLevel: PHAccessLevel): PHAuthorizationStatus;
  /**
   * 申请权限，兑现成授权状态。没问过用户时弹系统的提示框；问过了不再弹，
   * 直接给现在的状态。
   *
   * `accessLevel` 写错是同步抛的 `TypeError`，不是 reject。
   */
  static requestAuthorizationForAccessLevel(accessLevel: PHAccessLevel): Promise<PHAuthorizationStatus>;

  /**
   * 修改相册。现在只有一种修改：`{ creationRequestForAssetFromImage: image }`，
   * 把一张图存成一张新照片。
   *
   * 没问过用户时先弹权限提示框。用户没同意时 reject，`name` 是
   * `NotAllowedError`，见 `PHPhotoLibraryError`。
   *
   * 参数不对是同步抛的 `TypeError`，不是 reject。
   */
  performChanges(changes: PHPhotoLibraryChanges): Promise<void>;
}
