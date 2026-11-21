// @nacrejs/keychain 的类型定义。
//
// 这个文件原来是 @nacrejs/types 里的 ios/keychain.d.ts。Keychain 从核心里拆
// 出去之后类型也跟着走：**没装这个包，就没有这些类型**——`application.keychain`
// 在编辑器里不存在，写了 tsc 会报，和运行时的事实（属性不存在）对得上。
//
// 用的时候在入口文件顶上加一行：
//
//     /// <reference types="@nacrejs/keychain" />
//
// 这里用到的 NSObject、Application 是 @nacrejs/types 声明的全局类型。**这个
// 文件不自己去引它**：用 Nacre 的入口文件本来就引了 @nacrejs/types，全局类型
// 都在同一个程序里；而在这里再写一行三斜线引用，TypeScript 会从这个文件的
// 真实路径往上找 node_modules——包是用 file: 或 workspace 链接进来的时候
// 就找不到了（实测报 TS2688）。两个包的关系写在 peerDependencies 里。

// Keychain：令牌和密码的安全存放。
//
// 和 storage 的形状一样，但全是 Promise——Keychain 读写走 securityd 的 XPC，
// 设备锁着时还会阻塞，而 JS 在主线程。

/**
 * 存的东西什么时候能读到、换了新设备还在不在。
 *
 * **存进去就改不了**，要改得先 `remove` 再重新 `set`。
 *
 * `kSecAttrAccessibleAlways` 和 `AlwaysThisDeviceOnly` 不在这里：
 * iOS 12 起已废弃。
 */
type KeychainAccessible =
  /** 设备解锁时能读。会跟着备份迁移到新设备。 */
  | 'whenUnlocked'
  /** 同上，但**不迁移**。不写 accessible 时就是它。 */
  | 'whenUnlockedThisDeviceOnly'
  /** 开机后第一次解锁之后一直能读，锁屏也能。后台任务要这个。会迁移。 */
  | 'afterFirstUnlock'
  /** 同上，但不迁移。 */
  | 'afterFirstUnlockThisDeviceOnly'
  /** 要求设备设了密码，没设就存不进去。不迁移。 */
  | 'whenPasscodeSetThisDeviceOnly';

interface KeychainWriteOptions {
  /** 默认 `'whenUnlockedThisDeviceOnly'`。 */
  accessible?: KeychainAccessible;
}

/** 出错时 reject 的 `Error`。`code` 是 `OSStatus` 的原值。 */
interface KeychainError extends Error {
  name: 'NotAllowedError' | 'SecurityError' | 'TypeMismatchError'
      | 'InvalidModificationError' | 'KeychainError';
  code: number;
  domain: string;
}

declare class Keychain {
  /** 只能由运行时给出，用 `application.keychain`。 */
  private constructor();

  /** 没有这个键给 `null`，不 reject。 */
  get(key: string): Promise<string | null>;
  /** 没有这个键给 `null`。 */
  getBytes(key: string): Promise<ArrayBuffer | null>;
  set(key: string, value: string, options?: KeychainWriteOptions): Promise<void>;
  setBytes(key: string, blob: Blob, options?: KeychainWriteOptions): Promise<void>;
  /** 本来就没有也算成功。 */
  remove(key: string): Promise<void>;
  has(key: string): Promise<boolean>;
  keys(): Promise<string[]>;
  /** 删掉这个 App 存的全部条目。 */
  clear(): Promise<void>;
}

// application.keychain。
//
// 这个属性跟着 Keychain 这个能力走：**装了能力包才有**，没装的时候
// `'keychain' in application` 是 false。所以它声明在这里、和 Keychain 类
// 放在一起，用 TypeScript 的声明合并加到 Application 上，而不是写在
// nacre.d.ts 的 Application 类里——那样核心的类型就认识 Keychain 了。
interface Application {
  /** 令牌和密码的安全存放。全是 Promise。 */
  readonly keychain: Keychain;
}
