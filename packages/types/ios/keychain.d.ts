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

declare class Keychain extends NSObject {
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
