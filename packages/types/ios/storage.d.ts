// 本地存储：NSUserDefaults。
//
// 存的是 plist 值：字符串、有限数字、布尔、数组、纯对象。写 null 等于删除。
// 存不下的东西当场抛，不会静默丢。

/** 能存进 UserDefaults 的值。 */
type StorageValue =
  | string
  | number
  | boolean
  | readonly StorageValue[]
  | { readonly [key: string]: StorageValue };

/** 本地存储上每个事件名对应的事件对象。 */
interface NSUserDefaultsEventMap {
  'change': Event;
}

declare class NSUserDefaults extends NSObject {
  /** 只能由运行时给出，用 `application.storage`。 */
  private constructor();

  /** 没有这个键时给 `null`。`registerDefaults` 注册过的键给注册值。 */
  get(key: string): StorageValue | null;
  /** 传 `null` 删除这个键；传 `undefined` 抛。 */
  set(key: string, value: StorageValue | null): void;
  remove(key: string): void;
  has(key: string): boolean;
  /** 注册「没写过时读到什么」。只影响读、不写盘，每次启动都要重新注册。 */
  registerDefaults(table: { readonly [key: string]: StorageValue }): void;

  /**
   * 带类型的取值器。和 `get` **行为不同**——做 plist 的类型强制：
   * 存进去的是字符串 `'42'`，`integerForKey` 给 `42` 而 `get` 给 `'42'`。
   */
  stringForKey(key: string): string | null;
  /** 没有这个键或转不出数字时给 `0`，不是 `null`。 */
  integerForKey(key: string): number;
  /** 同上，给 `0`。 */
  doubleForKey(key: string): number;
  /** 同上，给 `false`。 */
  boolForKey(key: string): boolean;
  /** 存的不是数组时给 `null`。 */
  arrayForKey(key: string): readonly StorageValue[] | null;
  dictionaryForKey(key: string): { readonly [key: string]: StorageValue } | null;
  /** 存的不是「全是字符串的数组」时给 `null`。 */
  stringArrayForKey(key: string): readonly string[] | null;

  /**
   * `change`：本进程改了任何一个键。**不带是哪个键**——iOS 的通知就不带。
   *
   * 边界：外部进程和 iCloud 的改动收不到。和 Web 的 `storage` 事件正好
   * 相反——那个只在**别的 tab** 改时发，自己改不发。
   */
  addEventListener<K extends keyof NSUserDefaultsEventMap>(
    type: K,
    callback: ((event: NSUserDefaultsEventMap[K]) => void) | null,
    options?: AddEventListenerOptions,
  ): void;
  /** 别的名字当自定义事件：`dispatchEvent` 是公开 API，JS 可以派发自己的事件。 */
  addEventListener(type: string, callback: EventListener | null, options?: AddEventListenerOptions): void;
  removeEventListener<K extends keyof NSUserDefaultsEventMap>(
    type: K,
    callback: ((event: NSUserDefaultsEventMap[K]) => void) | null,
  ): void;
  removeEventListener(type: string, callback: EventListener | null): void;
}
