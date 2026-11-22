// @nacrejs/core-location 的类型定义。
//
// 定位是一个能力包：**没装这个包，就没有这些类型**，全局上也没有
// CLLocationManager 这几个类——编辑器里不存在，写了 tsc 会报，和运行时的
// 事实对得上。
//
// 用的时候在入口文件顶上加一行：
//
//     /// <reference types="@nacrejs/core-location" />
//
// 这里用到的 NSObject、Event、EventListener 是 @nacrejs/types 声明的全局类型。
// **这个文件不自己去引它**：用 Nacre 的入口文件本来就引了 @nacrejs/types；在
// 这里再写一行三斜线引用，包是用 file: 或 workspace 链接进来的时候 TypeScript
// 找不到它（实测报 TS2688）。两个包的关系写在 peerDependencies 里。

// 定位：CLLocationManager，只做「使用 App 期间」的定位。
//
// 始终定位、后台定位、地理围栏、指南针都没做，类上没有那些成员。

/**
 * 用户对「这个 App 能不能用定位」的决定。
 *
 * - `'notDetermined'` —— 还没问过用户
 * - `'restricted'` —— 设备上的限制不允许（家长控制一类），用户自己改不了
 * - `'denied'` —— 用户拒绝了，或者整个系统的定位服务关着
 * - `'authorizedWhenInUse'` —— 使用 App 期间可以定位
 * - `'authorizedAlways'` —— 任何时候都可以。这个包不申请它，但用户在系统
 *   设置里改成了「始终」时读得到
 */
type CLAuthorizationStatus =
  | 'notDetermined' | 'restricted' | 'denied' | 'authorizedAlways' | 'authorizedWhenInUse';

/**
 * 用户给的是精确位置还是大概位置。
 *
 * - `'fullAccuracy'` —— 精确位置
 * - `'reducedAccuracy'` —— 大概位置：误差几公里，更新也慢
 */
type CLAccuracyAuthorization = 'fullAccuracy' | 'reducedAccuracy';

/**
 * 想要多准。单位是米，或者三个名字之一：
 *
 * - `'best'` —— 设备能给的最好的精度。默认值
 * - `'bestForNavigation'` —— 比 `'best'` 更准，为导航准备的，更费电
 * - `'reduced'` —— 只要大概位置
 *
 * 常用的几档直接写数：`10`、`100`、`1000`、`3000`。
 */
type CLLocationAccuracy = number | 'best' | 'bestForNavigation' | 'reduced';

/** 移动多远报一次。单位是米；`'none'` 是每次移动都报，默认值。 */
type CLLocationDistanceFilter = number | 'none';

/** 定位的三个事件。 */
type CLLocationManagerEventType = 'locationupdate' | 'locationerror' | 'authorizationchange';

/** 定位上每个事件名对应的事件对象。 */
interface CLLocationManagerEventMap {
  'locationupdate': CLLocationUpdateEvent;
  'locationerror': CLLocationErrorEvent;
  'authorizationchange': Event;
}

/**
 * 经纬度，单位是度。北纬和东经是正数，南纬和西经是负数。
 *
 * 字段只读，写入即抛。
 */
declare class CLLocationCoordinate2D {
  constructor(latitude: number, longitude: number);
  /** 纬度，度。 */
  readonly latitude: number;
  /** 经度，度。 */
  readonly longitude: number;
}

/** 一个位置是怎么来的。 */
interface CLLocationSourceInformation {
  /** 这个位置是软件模拟出来的（模拟器里设的位置、开发者工具改的位置）。 */
  readonly isSimulatedBySoftware: boolean;
  /** 这个位置来自外接的配件（车机、外接的定位器）。 */
  readonly isProducedByAccessory: boolean;
}

/**
 * 一个位置：在哪、多准、什么时候量的。
 *
 * 只能由系统给，不能 `new`：从 `manager.location`、`requestLocation()` 和
 * `locationupdate` 事件里来。字段只读，写入即抛。
 *
 * 精度、速度、方向这六个量，系统量不出来时是 `null`；海拔量不出来时，两个
 * 海拔和 `verticalAccuracy` 一起是 `null`。
 */
declare class CLLocation {
  private constructor();
  /** 经纬度。 */
  readonly coordinate: CLLocationCoordinate2D;
  /** 海拔，米，相对平均海平面。系统量不出海拔时是 `null`。 */
  readonly altitude: number | null;
  /** 海拔，米，相对 WGS 84 椭球面。系统量不出海拔时是 `null`。 */
  readonly ellipsoidalAltitude: number | null;
  /**
   * 经纬度的误差半径，米：真实位置在以 `coordinate` 为圆心、这个数为半径的
   * 圆里。`null` 表示这个位置的经纬度无效。
   */
  readonly horizontalAccuracy: number | null;
  /** 海拔的误差，米。`null` 表示海拔无效，这时两个海拔也是 `null`。 */
  readonly verticalAccuracy: number | null;
  /** 速度，米每秒。量不出来时是 `null`。 */
  readonly speed: number | null;
  /** 速度的误差，米每秒。`null` 表示速度无效。 */
  readonly speedAccuracy: number | null;
  /** 移动的方向，度：正北是 0，顺时针增加，范围 0 到 359.9。没在移动时是 `null`。 */
  readonly course: number | null;
  /** 方向的误差，度。`null` 表示方向无效。 */
  readonly courseAccuracy: number | null;
  /** 这个位置是什么时候量的。每次读得到一个新的 `Date`。 */
  readonly timestamp: Date;
  /** 这个位置是怎么来的。系统没给时是 `null`。 */
  readonly sourceInformation: CLLocationSourceInformation | null;
}

/**
 * 定位出错时的错误：`requestLocation()` 和 `requestWhenInUseAuthorization()`
 * 拒绝时给的，`locationerror` 事件带的也是它。
 *
 * 含义 Web 上有的是 `DOMException`，系统给的原值在 `cause`（一个 `NSError`，
 * `domain` 是 `'kCLErrorDomain'`）上；运行时自己给的（`AbortError` 和
 * `InvalidStateError`）没有 `cause`：
 *
 * - `'NotAllowedError'` —— 没有授权
 * - `'NetworkError'` —— 网络问题
 * - `'AbortError'` —— `requestLocation()` 被 `startUpdatingLocation()` 或
 *   `stopUpdatingLocation()` 取消了
 * - `'InvalidStateError'` —— 现在不能做这件事（正在连续更新时取一次、App 在
 *   后台时申请授权、Info.plist 里没有那句说明）
 *
 * iOS 特有的是 `NSError`，`domain` 和 `code` 是系统的原值：
 *
 * - `'LocationUnknownError'` —— 这一刻定不出位置。连续更新时系统会接着试
 * - `'NSError'` —— 系统给的别的错误，看 `code`
 */
type CLLocationError =
  | (DOMException & {
      readonly name: 'NotAllowedError' | 'NetworkError' | 'AbortError' | 'InvalidStateError';
      readonly cause?: NSError;
    })
  | (NSError & { readonly name: 'LocationUnknownError' | 'NSError' });

/** `locationupdate` 的事件对象。 */
declare class CLLocationUpdateEvent extends Event {
  constructor(type: string, init?: EventInit & Partial<Pick<CLLocationUpdateEvent, 'locations'>>);
  /**
   * 这一次报上来的位置，至少一个，按时间从早到晚，**最后一个是最新的**。
   * 系统有时把几个位置攒在一起报。
   */
  readonly locations: CLLocation[];
}

/** `locationerror` 的事件对象。 */
declare class CLLocationErrorEvent extends Event {
  constructor(type: string, init?: EventInit & Partial<Pick<CLLocationErrorEvent, 'error'>>);
  readonly error: CLLocationError;
}

/**
 * 定位的入口：问用户要授权、取位置、收位置更新。
 *
 * ```js
 * const manager = new CLLocationManager();
 * const status = await manager.requestWhenInUseAuthorization();
 * if (status === 'authorizedWhenInUse') {
 *   const here = await manager.requestLocation();
 *   console.log(here.coordinate.latitude, here.coordinate.longitude);
 * }
 * ```
 *
 * 用它的 App 要在 `nacre.config.json` 的 `ios.infoPlist` 里写
 * `NSLocationWhenInUseUsageDescription`，没写的话生成工程时报错。
 */
declare class CLLocationManager extends NSObject {
  constructor();

  /**
   * 现在的授权状态。读它不会弹提示框。变了的时候有 `authorizationchange` 事件。
   */
  readonly authorizationStatus: CLAuthorizationStatus;
  /** 用户给的是精确位置还是大概位置。变了的时候同样有 `authorizationchange`。 */
  readonly accuracyAuthorization: CLAccuracyAuthorization;
  /**
   * 申请「使用 App 期间」的定位。
   *
   * 还没问过用户时系统弹出提示框，用户选完之后兑现成新的状态。已经问过
   * （不管结果是什么）就当场兑现成现在的状态，不再弹——系统对每个 App 只问
   * 一次，之后只能由用户去系统设置里改。
   *
   * App 在后台、或者 Info.plist 里没有 `NSLocationWhenInUseUsageDescription`
   * 时拒绝，`name` 是 `'InvalidStateError'`。
   */
  requestWhenInUseAuthorization(): Promise<CLAuthorizationStatus>;

  /** 想要多准。越准越费电，定位也越慢。默认 `'best'`。 */
  desiredAccuracy: CLLocationAccuracy;
  /** 移动多远才报一次新位置。只影响连续更新。默认 `'none'`。 */
  distanceFilter: CLLocationDistanceFilter;

  /**
   * 最近一次的位置。还没定过位、或者没有授权时是 `null`。
   * 每次读得到一个新的 `CLLocation`。
   */
  readonly location: CLLocation | null;
  /**
   * 开始连续更新：位置从 `locationupdate` 事件来，直到 `stopUpdatingLocation()`。
   *
   * 没有授权时不抛，系统从 `locationerror` 事件报 `'NotAllowedError'`。
   * 从开始到停止，运行时替你拿着这个对象，不用自己留引用。
   */
  startUpdatingLocation(): void;
  /** 停止连续更新。还在等的 `requestLocation()` 也被取消。没在更新时调它没有效果。 */
  stopUpdatingLocation(): void;
  /**
   * 取一次位置。系统按 `desiredAccuracy` 去定位，通常要几秒。
   *
   * 拒绝的几种情况：没有授权（`'NotAllowedError'`）、定不出来
   * （`'LocationUnknownError'`）、正在连续更新（`'InvalidStateError'`）、
   * 被 `startUpdatingLocation()` 或 `stopUpdatingLocation()` 取消（`'AbortError'`）。
   */
  requestLocation(): Promise<CLLocation>;

  addEventListener<K extends keyof CLLocationManagerEventMap>(
    type: K,
    callback: ((event: CLLocationManagerEventMap[K]) => void) | null,
    options?: AddEventListenerOptions,
  ): void;
  removeEventListener<K extends keyof CLLocationManagerEventMap>(
    type: K,
    callback: ((event: CLLocationManagerEventMap[K]) => void) | null,
  ): void;
}
