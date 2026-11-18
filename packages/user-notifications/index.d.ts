// @nacrejs/user-notifications 的类型定义。
//
// 通知是一个能力包：**没装这个包，就没有这些类型**，全局上也没有
// UNUserNotificationCenter 这几个类——编辑器里不存在，写了 tsc 会报，和运行时的
// 事实对得上。
//
// 用的时候在入口文件顶上加一行：
//
//     /// <reference types="@nacrejs/user-notifications" />
//
// 这里用到的 NSObject、Event、EventListener 是 @nacrejs/types 声明的全局类型。
// **这个文件不自己去引它**：用 Nacre 的入口文件本来就引了 @nacrejs/types；在
// 这里再写一行三斜线引用，包是用 file: 或 workspace 链接进来的时候 TypeScript
// 找不到它（实测报 TS2688）。两个包的关系写在 peerDependencies 里。

// 通知：发本地通知，App 在前台时收到通知、用户点了通知的事件。
//
// 没做的：向苹果注册远程推送和设备令牌、通知上的自定义按钮和分类、附件、
// 按位置触发、自定义声音。类上没有那些成员。

/**
 * 申请授权时要哪几样。
 *
 * - `'alert'` —— 显示通知（横幅、锁屏、通知中心）
 * - `'sound'` —— 播放声音
 * - `'badge'` —— 改 App 图标上的数字
 * - `'carPlay'` —— 在 CarPlay 上显示
 * - `'provisional'` —— 临时授权：不弹提示框，直接得到授权，但通知只安静地进
 *   通知中心，由用户在那里决定留不留
 * - `'criticalAlert'` —— 紧急通知（无视静音和勿扰）。要苹果单独批准的
 *   entitlement，没有的话这一项不生效
 * - `'providesAppNotificationSettings'` —— 告诉系统「这个 App 自己有通知设置页」，
 *   系统会在通知设置里加一个按钮。按钮被点的回调这个包还没有接
 */
type UNAuthorizationOptions =
  | 'badge' | 'sound' | 'alert' | 'carPlay' | 'criticalAlert'
  | 'providesAppNotificationSettings' | 'provisional';

/**
 * App 在前台时收到通知，要怎么显示。
 *
 * - `'banner'` —— 从屏幕顶上滑下来一条横幅
 * - `'list'` —— 留在通知中心（从屏幕顶部下拉看到的列表）里
 * - `'sound'` —— 播放通知带的声音
 * - `'badge'` —— 按通知带的数改图标上的数字
 */
type UNNotificationPresentationOptions = 'badge' | 'sound' | 'list' | 'banner';

/**
 * 用户对「这个 App 能不能发通知」的决定。
 *
 * - `'notDetermined'` —— 还没问过用户
 * - `'denied'` —— 用户拒绝了
 * - `'authorized'` —— 用户同意了
 * - `'provisional'` —— 临时授权：通知只安静地进通知中心
 * - `'ephemeral'` —— 只给轻 App（App Clip）的限时授权
 */
type UNAuthorizationStatus =
  | 'notDetermined' | 'denied' | 'authorized' | 'provisional' | 'ephemeral';

/**
 * 通知设置里的一项现在是什么状态。
 *
 * - `'notSupported'` —— 这个 App 没有这一项（没申请过，或者设备不支持）
 * - `'disabled'` —— 关着
 * - `'enabled'` —— 开着
 */
type UNNotificationSetting = 'notSupported' | 'disabled' | 'enabled';

/**
 * 手机没锁时通知怎么出现。
 *
 * - `'none'` —— 不出现
 * - `'banner'` —— 横幅，过几秒自己消失
 * - `'alert'` —— 一直留在屏幕上，直到用户处理
 */
type UNAlertStyle = 'none' | 'banner' | 'alert';

/**
 * 通知的内容预览什么时候显示。
 *
 * - `'always'` —— 总是显示
 * - `'whenAuthenticated'` —— 手机解锁之后才显示
 * - `'never'` —— 从不显示，只显示「通知」两个字
 */
type UNShowPreviewsSetting = 'always' | 'whenAuthenticated' | 'never';

/** 通知中心的两个事件。 */
type UNUserNotificationCenterEventType =
  | 'notification' | 'notificationclick';

/**
 * 这个 App 的通知设置在某一刻的样子。
 *
 * 只能由 `getNotificationSettings()` 给，不能 `new`。字段只读。它是一份快照：
 * 用户之后去系统设置里改了，这个对象不会跟着变，要再取一次。
 */
declare class UNNotificationSettings {
  private constructor();
  /** 用户同不同意这个 App 发通知。 */
  readonly authorizationStatus: UNAuthorizationStatus;
  /** 声音。 */
  readonly soundSetting: UNNotificationSetting;
  /** 图标上的数字。 */
  readonly badgeSetting: UNNotificationSetting;
  /** 显示通知（横幅、锁屏、通知中心合在一起的总开关）。 */
  readonly alertSetting: UNNotificationSetting;
  /** 进通知中心。 */
  readonly notificationCenterSetting: UNNotificationSetting;
  /** 在锁屏上显示。 */
  readonly lockScreenSetting: UNNotificationSetting;
  /** 在 CarPlay 上显示。 */
  readonly carPlaySetting: UNNotificationSetting;
  /** 紧急通知。 */
  readonly criticalAlertSetting: UNNotificationSetting;
  /** 由 Siri 念出来。 */
  readonly announcementSetting: UNNotificationSetting;
  /** 时效性通知（可以穿过专注模式）。 */
  readonly timeSensitiveSetting: UNNotificationSetting;
  /** 定时摘要（系统把通知攒到固定时间一起给）。 */
  readonly scheduledDeliverySetting: UNNotificationSetting;
  /** 作为「直接消息」穿过专注模式。 */
  readonly directMessagesSetting: UNNotificationSetting;
  /** 手机没锁时通知怎么出现。 */
  readonly alertStyle: UNAlertStyle;
  /** 内容预览什么时候显示。 */
  readonly showPreviewsSetting: UNShowPreviewsSetting;
  /** App 申请授权时有没有带 `'providesAppNotificationSettings'`。 */
  readonly providesAppNotificationSettings: boolean;
}

/**
 * 通知到的时候播放的声音。
 *
 * 现在只有系统默认的那一个：`UNNotificationSound.defaultSound`。不要声音就把
 * 内容的 `sound` 留成 `null`。
 */
declare class UNNotificationSound {
  private constructor();
  /** 只在类型里：让别的值（字符串、普通对象）赋不进要声音的地方。运行时没有这个字段。 */
  private readonly soundBrand: never;
  /** 系统默认的通知声音。每次读是同一个对象。 */
  static readonly defaultSound: UNNotificationSound;
}

/**
 * 通知带的数据：键是字符串，值是字符串、数、布尔、数组或者这样的对象。
 * 读出来的对象是冻结的，不能改。
 */
type UNNotificationUserInfo = { readonly [key: string]: unknown };

/**
 * 一条通知显示什么。
 *
 * 这个类的字段只读：它是从请求或者已经送达的通知里读出来的。要自己写内容，
 * 用 {@link UNMutableNotificationContent}。
 */
declare class UNNotificationContent {
  protected constructor();
  /** 标题，粗体的那一行。没有是空串。 */
  readonly title: string;
  /** 副标题，标题下面的一行。没有是空串。 */
  readonly subtitle: string;
  /** 正文。没有是空串。 */
  readonly body: string;
  /**
   * 通知到的时候把 App 图标上的数字改成几。`0` 是去掉数字，`null` 是不动它。
   */
  readonly badge: number | null;
  /** 通知到的时候播放的声音。`null` 是不响。 */
  readonly sound: UNNotificationSound | null;
  /**
   * 分组用的标识：通知中心把标识相同的通知叠在一起。空串是不指定，
   * 系统按 App 分组。
   */
  readonly threadIdentifier: string;
  /**
   * 跟着通知走的数据，用户看不到。通知被点了之后从事件里原样拿回来。
   * 远程推送的通知，这里是推送的整个负载。
   */
  readonly userInfo: UNNotificationUserInfo;
}

/**
 * 自己写一条通知的内容。
 *
 * ```js
 * const content = new UNMutableNotificationContent();
 * content.title = '订单已发货';
 * content.body = '预计明天送达';
 * content.sound = UNNotificationSound.defaultSound;
 * content.userInfo = { orderId: 'A1024' };
 * ```
 */
declare class UNMutableNotificationContent extends UNNotificationContent {
  constructor();
  title: string;
  subtitle: string;
  body: string;
  /** 整数，不能是负数。写小数向零取整。 */
  badge: number | null;
  /** 只能写 `UNNotificationSound.defaultSound` 或者 `null`。 */
  sound: UNNotificationSound | null;
  threadIdentifier: string;
  /**
   * 写进去的是一份副本，之后改原来的对象不影响通知。值只能是字符串、有限的
   * 数、布尔、数组和普通对象；里面有 `null`、`NaN`、函数、`Date` 这些会抛
   * `TypeError`。写 `null` 等于写 `{}`。
   */
  userInfo: UNNotificationUserInfo;
}

/**
 * 日期的各个分量。只写要匹配的那几个，没写的不参与匹配：`{ hour: 8, minute: 30 }`
 * 是「每一天的 8 点 30 分」里最近的那一次。
 *
 * 值是整数。写 `null` 或 `undefined` 等于没写这个分量。用的是用户手机上现在的
 * 日历和时区。
 */
interface UNDateComponents {
  /** 纪元。公历的公元后是 1。 */
  readonly era?: number;
  /** 年。 */
  readonly year?: number;
  /** 月，1 到 12。 */
  readonly month?: number;
  /** 日，1 到 31。 */
  readonly day?: number;
  /** 时，0 到 23。 */
  readonly hour?: number;
  /** 分，0 到 59。 */
  readonly minute?: number;
  /** 秒，0 到 59。 */
  readonly second?: number;
  /** 纳秒。 */
  readonly nanosecond?: number;
  /** 星期几：1 是星期日，2 是星期一，7 是星期六。 */
  readonly weekday?: number;
  /** 这个月的第几个「星期几」：和 `weekday` 一起用，2 是「第二个星期一」。 */
  readonly weekdayOrdinal?: number;
  /** 季度，1 到 4。 */
  readonly quarter?: number;
  /** 这个月的第几周。 */
  readonly weekOfMonth?: number;
  /** 这一年的第几周。 */
  readonly weekOfYear?: number;
  /** 按周算的年份，和 `weekOfYear` 一起用。 */
  readonly yearForWeekOfYear?: number;
  /** 这一年的第几天，1 到 366。 */
  readonly dayOfYear?: number;
}

/** 写日期分量时可以带 `null`，等于没写。 */
type UNDateComponentsInit = { readonly [K in keyof UNDateComponents]?: number | null };

/**
 * 通知什么时候送达。这是三种触发方式共同的父类，不能直接创建。
 */
declare class UNNotificationTrigger {
  protected constructor();
  /** 送达之后是不是重新计时、再来一次。 */
  readonly repeats: boolean;
}

/** 过多少秒之后送达。 */
declare class UNTimeIntervalNotificationTrigger extends UNNotificationTrigger {
  private constructor();
  /**
   * @param timeInterval 秒，必须大于 0。
   * @param options `repeats`：到了之后重新计时再来。重复的间隔至少 60 秒。
   *   不带就是不重复。
   */
  static triggerWithTimeInterval(
    timeInterval: number,
    options?: { repeats?: boolean },
  ): UNTimeIntervalNotificationTrigger;
  /** 间隔，秒。 */
  readonly timeInterval: number;
}

/** 到了和这些日期分量对得上的时刻送达。 */
declare class UNCalendarNotificationTrigger extends UNNotificationTrigger {
  private constructor();
  /**
   * @param dateComponents 要匹配的分量。
   * @param options `repeats`：每次对得上都送达（`{ hour: 8 }` 加 `repeats`
   *   是每天 8 点）。不带就是只送达最近的那一次。
   */
  static triggerWithDateMatchingComponents(
    dateComponents: UNDateComponentsInit,
    options?: { repeats?: boolean },
  ): UNCalendarNotificationTrigger;
  /** 要匹配的分量，只有写了的那几个。冻结的，不能改。 */
  readonly dateComponents: UNDateComponents;
}

/**
 * 这条通知是苹果的推送服务送来的（远程推送）。只会从系统给的通知里读到，
 * 不能创建。
 */
declare class UNPushNotificationTrigger extends UNNotificationTrigger {
  private constructor();
}

/**
 * 一条要发的通知：标识、内容、什么时候送达。
 *
 * ```js
 * const request = UNNotificationRequest.requestWithIdentifier('order-A1024', {
 *   content,
 *   trigger: UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(5),
 * });
 * ```
 */
declare class UNNotificationRequest {
  private constructor();
  /**
   * @param identifier 这条通知的标识。之后按它撤销；再发一条标识相同的，
   *   会替换掉原来那条。
   * @param options `content` 必填。`trigger` 不带或者是 `null`，通知立刻送达。
   */
  static requestWithIdentifier(
    identifier: string,
    options: {
      content: UNNotificationContent;
      trigger?: UNTimeIntervalNotificationTrigger | UNCalendarNotificationTrigger | null;
    },
  ): UNNotificationRequest;
  readonly identifier: string;
  /** 内容在建请求那一刻的副本。之后改原来的内容不影响这里。 */
  readonly content: UNNotificationContent;
  /** `null` 是立刻送达。 */
  readonly trigger: UNNotificationTrigger | null;
}

/** 一条已经送达的通知。只能由系统给。 */
declare class UNNotification {
  private constructor();
  /** 送达的时间。每次读得到一个新的 `Date`。 */
  readonly date: Date;
  /** 它是由哪个请求来的。远程推送的通知也有，`trigger` 是 `UNPushNotificationTrigger`。 */
  readonly request: UNNotificationRequest;
}

/** 用户对一条通知做了什么。只能由系统给。 */
declare class UNNotificationResponse {
  private constructor();
  /** 是哪一条通知。 */
  readonly notification: UNNotification;
  /**
   * 用户做的动作。
   *
   * - `'default'` —— 点了通知，App 被打开
   * - `'dismiss'` —— 把通知划掉了。只有带分类的通知才会报这个，而分类这个包
   *   还没有接，所以现在只有别的原生代码登记过分类时才收得到
   * - 别的字符串 —— 通知上自定义按钮的标识，原样给
   */
  readonly actionIdentifier: 'default' | 'dismiss' | (string & {});
}

/**
 * 通知出错时的 `Error`：这个类上返回 Promise 的方法拒绝时给的。
 *
 * - `'NotAllowedError'` —— 用户没有允许这个 App 发通知
 * - `'UNError'` —— 系统给的别的错误，看 `code`
 */
interface UNError extends Error {
  name: 'NotAllowedError' | 'UNError';
  /** `NSError.code` 的原值。 */
  code: number;
  /** `NSError.domain` 的原值，系统给的通知错误是 `'UNErrorDomain'`。 */
  domain: string;
}

/** `notification` 的事件对象。 */
declare interface UNNotificationPresentEvent extends Event {
  /** 刚到的那一条。 */
  readonly notification: UNNotification;
}

/** `notificationclick` 的事件对象。 */
declare interface UNNotificationResponseEvent extends Event {
  readonly response: UNNotificationResponse;
}

/**
 * 通知的入口：问用户要授权、发本地通知、查和撤、收通知的事件。
 *
 * 整个 App 只有一个，从 `UNUserNotificationCenter.currentNotificationCenter()` 取。
 *
 * ```js
 * const center = UNUserNotificationCenter.currentNotificationCenter();
 * if (await center.requestAuthorizationWithOptions(['alert', 'sound', 'badge'])) {
 *   const content = new UNMutableNotificationContent();
 *   content.title = '该喝水了';
 *   await center.addNotificationRequest(UNNotificationRequest.requestWithIdentifier('water', {
 *     content,
 *     trigger: UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(3600),
 *   }));
 * }
 * ```
 */
declare class UNUserNotificationCenter extends NSObject {
  private constructor();

  /** 这个 App 的通知中心。每次返回同一个对象。 */
  static currentNotificationCenter(): UNUserNotificationCenter;

  /**
   * 问用户同不同意这个 App 发通知。
   *
   * 第一次调用时系统弹出提示框，用户选完之后兑现：`true` 是同意。之后再调不会
   * 再弹，直接兑现成现在的结果；用户想改只能去系统设置里。
   *
   * @param options 要哪几样，通常是 `['alert', 'sound', 'badge']`。
   */
  requestAuthorizationWithOptions(options: readonly UNAuthorizationOptions[]): Promise<boolean>;

  /** 读现在的通知设置。不弹提示框。 */
  getNotificationSettings(): Promise<UNNotificationSettings>;

  /**
   * 把一条通知交给系统。请求带着触发方式的，到时候送达；不带的立刻送达。
   * 送达不需要 App 在运行。
   *
   * 标识和已有的一条相同时，替换掉那一条。用户没有允许通知时拒绝，`name` 是
   * `'NotAllowedError'`。
   */
  addNotificationRequest(request: UNNotificationRequest): Promise<void>;

  /** 已经交给系统、还没送达的那些。 */
  getPendingNotificationRequests(): Promise<UNNotificationRequest[]>;
  /**
   * 撤掉还没送达的。没有这个标识的不报错。
   *
   * 系统在后台去撤，这个方法马上返回：紧接着查列表可能还看得到。
   */
  removePendingNotificationRequestsWithIdentifiers(identifiers: readonly string[]): void;
  /** 撤掉全部还没送达的。 */
  removeAllPendingNotificationRequests(): void;

  /** 已经送达、还留在通知中心里的那些。 */
  getDeliveredNotifications(): Promise<UNNotification[]>;
  /** 把已经送达的从通知中心里拿掉。同样是系统在后台去做。 */
  removeDeliveredNotificationsWithIdentifiers(identifiers: readonly string[]): void;
  /** 把这个 App 已经送达的通知全部从通知中心里拿掉。 */
  removeAllDeliveredNotifications(): void;

  /**
   * 把 App 图标上的数字改成 `count`。`0` 是去掉数字。
   *
   * @param count 整数，不能是负数。
   */
  setBadgeCount(count: number): Promise<void>;

  /**
   * App 在前台时收到通知，要怎么显示。默认是 `[]`：不显示，只有
   * `notification` 事件。
   *
   * 这是预先设好的：通知到的那一刻系统来问，运行时直接按这里的值回答，不等
   * JS。要按当时的界面决定（聊天页开着就不弹），在界面变的时候改这个属性。
   */
  foregroundPresentationOptions: UNNotificationPresentationOptions[];

  addEventListener(
    type: 'notification',
    callback: EventListener<UNNotificationPresentEvent> | null,
    options?: AddEventListenerOptions,
  ): void;
  addEventListener(
    type: 'notificationclick',
    callback: EventListener<UNNotificationResponseEvent> | null,
    options?: AddEventListenerOptions,
  ): void;
  /** 事件名是一个变量（两个之一）时走这一条，事件对象按最宽的 `Event` 给。 */
  addEventListener(
    type: UNUserNotificationCenterEventType,
    callback: EventListener | null,
    options?: AddEventListenerOptions,
  ): void;
  removeEventListener(
    type: 'notification',
    callback: EventListener<UNNotificationPresentEvent> | null,
  ): void;
  removeEventListener(
    type: 'notificationclick',
    callback: EventListener<UNNotificationResponseEvent> | null,
  ): void;
  removeEventListener(type: UNUserNotificationCenterEventType, callback: EventListener | null): void;
}
