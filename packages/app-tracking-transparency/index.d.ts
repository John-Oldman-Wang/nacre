// @nacrejs/app-tracking-transparency 的类型定义。
//
// 跟踪授权（ATTrackingManager）和广告标识（ASIdentifierManager）。这两个类
// 不在核心里：**没装这个包，就没有这些类型**，运行时的全局上也没有这两个类。
//
// 用的时候在入口文件顶上加一行：
//
//     /// <reference types="@nacrejs/app-tracking-transparency" />
//
// 这里用到的 NSObject 是 @nacrejs/types 声明的全局类型。这个文件不自己去引它：
// 用 Nacre 的入口文件本来就引了 @nacrejs/types，全局类型都在同一个程序里；
// 在这里再写一行三斜线引用，包是用 file: 或 workspace 链接进来的时候
// TypeScript 找不到它（TS2688）。两个包的关系写在 peerDependencies 里。

/**
 * 用户对「允许这个 App 跟踪」的答复。
 *
 * 「跟踪」指把这个 App 收集的用户或设备数据，和别的公司的 App、网站收集的
 * 数据关联起来用于广告，或者把这些数据交给数据中间商。
 */
type ATTrackingManagerAuthorizationStatus =
  /** 还没问过用户。这时调 `requestTrackingAuthorization()` 会弹出系统的提示框。 */
  | 'notDetermined'
  /** 设备受限（比如家长控制、设备管理），系统不允许 App 申请，也不会弹提示框。 */
  | 'restricted'
  /** 用户拒绝了，或者在系统设置里关掉了「允许 App 请求跟踪」。 */
  | 'denied'
  /** 用户同意了。这时 `advertisingIdentifier` 才是真实的值。 */
  | 'authorized';

/**
 * 跟踪授权。全是类上的成员，不能 `new`。
 *
 * 用它之前，项目的 `nacre.config.json` 里要写 `NSUserTrackingUsageDescription`
 * （显示在系统提示框里的那句话），没写的话生成工程时会报错。
 *
 * ```js
 * const status = await ATTrackingManager.requestTrackingAuthorization();
 * if (status === 'authorized') {
 *   console.log(ASIdentifierManager.sharedManager().advertisingIdentifier);
 * }
 * ```
 */
declare class ATTrackingManager extends NSObject {
  /** 没有实例，成员都在类上。 */
  private constructor();

  /** 现在的授权状态。读它不会弹出提示框。 */
  static readonly trackingAuthorizationStatus: ATTrackingManagerAuthorizationStatus;

  /**
   * 向用户申请跟踪授权。兑现成用户答复之后的授权状态。
   *
   * 状态是 `'notDetermined'` 时系统弹出提示框，用户点了之后兑现；状态已经
   * 定了就不再弹，直接兑现成现在的状态。一个 App 只有一次弹框的机会。
   *
   * 要在 App 处于前台、界面已经显示出来之后调。
   *
   * 对应 ObjC 的 `+requestTrackingAuthorizationWithCompletionHandler:`。
   */
  static requestTrackingAuthorization(): Promise<ATTrackingManagerAuthorizationStatus>;
}

/**
 * 广告标识的入口。不能 `new`，用 `ASIdentifierManager.sharedManager()`。
 */
declare class ASIdentifierManager extends NSObject {
  private constructor();

  /** 系统的那一个实例。每次调得到同一个对象。 */
  static sharedManager(): ASIdentifierManager;

  /**
   * 广告标识：大写的 UUID 字符串，形如 `'6D92078A-8246-4BA4-AE5B-76104861E7DC'`。
   * 同一台设备上所有 App 读到的是同一个值。
   *
   * **用户没有授权跟踪时，它是全零的 `'00000000-0000-0000-0000-000000000000'`**，
   * 不是 `null`。拿它当标识之前先比一下。
   */
  readonly advertisingIdentifier: string;
}
