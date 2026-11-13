// 文件读写。
//
// 全是 Promise——JS 跑在主线程，同步读会直接卡住 UI。
// 路径是绝对路径字符串，用四个目录常量当前缀自己拼。

/** `stat` 的结果。 */
interface FileStat {
  /** 字节数。 */
  readonly size: number;
  readonly isDirectory: boolean;
  /** 毫秒时间戳，`new Date(modified)` 就能用。 */
  readonly modified: number;
}

/**
 * 出错时 reject 的 `Error`。
 *
 * `name` 借的是 `DOMException` 的标准名字；映射盖不住的落进 `'FileError'`，
 * 那时用 `code` / `domain` 这两个原值分辨。
 */
interface FileSystemError extends Error {
  name: 'NotFoundError' | 'NotAllowedError' | 'InvalidModificationError'
      | 'QuotaExceededError' | 'NoModificationAllowedError' | 'TypeMismatchError'
      | 'FileError';
  /** `NSError.code` 的原值。 */
  code: number;
  /** 一般是 `'NSCocoaErrorDomain'`。 */
  domain: string;
}

declare class FileSystem extends NSObject {
  /** 只能由运行时给出，用 `application.fileSystem`。 */
  private constructor();

  /** 会被备份，用户数据放这里。 */
  readonly documents: string;
  /** 系统空间紧张时**会被清掉**。 */
  readonly caches: string;
  /** 会被备份，App 自己的数据放这里。 */
  readonly applicationSupport: string;
  /** 系统随时删。 */
  readonly temporary: string;

  readText(path: string): Promise<string>;
  readBytes(path: string): Promise<ArrayBuffer>;
  writeText(path: string, text: string): Promise<void>;
  /** 要写 `ArrayBuffer` 就先 `new Blob([buffer])`。 */
  writeBytes(path: string, blob: Blob): Promise<void>;
  exists(path: string): Promise<boolean>;
  /** 目录连同里面的东西一起删。 */
  remove(path: string): Promise<void>;
  /** 中间层自动建，已经存在不报错。 */
  makeDirectory(path: string): Promise<void>;
  /** 只有名字，不含路径。 */
  readDirectory(path: string): Promise<string[]>;
  stat(path: string): Promise<FileStat>;
  move(from: string, to: string): Promise<void>;
  copy(from: string, to: string): Promise<void>;
}
