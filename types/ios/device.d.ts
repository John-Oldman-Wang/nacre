// iOS 原生符号。规则见 types/ios.d.ts 的说明。
//
// 设备信息。

/** 界面的类型。iPhone 上是 `'phone'`。 */
type UIUserInterfaceIdiom =
  | 'unspecified' | 'phone' | 'pad' | 'tv' | 'carPlay' | 'mac' | 'vision';

/**
 * 这台设备。不能 `new`，用 `UIDevice.currentDevice`。
 *
 * 现在只有不会变的几项信息，全部只读。电量、设备朝向、距离感应还没有。
 */
declare class UIDevice extends NSObject {
  private constructor();
  static readonly currentDevice: UIDevice;

  /**
   * 设备的名字。**拿不到用户在设置里起的名字**（iOS 16 起）。模拟器上
   * 读到的是模拟器的名字，比如 `'iPhone Air'`。
   */
  readonly name: string;
  /** 设备的种类，比如 `'iPhone'`。不是具体型号。 */
  readonly model: string;
  /** `model` 的本地化写法。 */
  readonly localizedModel: string;
  /** 操作系统的名字，比如 `'iOS'`。 */
  readonly systemName: string;
  /**
   * 操作系统的版本，字符串，比如 `'26.1'`。
   *
   * 比大小之前先拆开转成数：按字符串比，`'9.0' > '26.0'`。
   */
  readonly systemVersion: string;
  readonly userInterfaceIdiom: UIUserInterfaceIdiom;
  /**
   * 同一个开发者的所有 App 在这台设备上共用的标识，UUID 字符串。
   *
   * 这个开发者的 App 全部卸载后再安装，它会变。设备重启后第一次解锁之前
   * 读到的是 `null`。
   */
  readonly identifierForVendor: string | null;
}
