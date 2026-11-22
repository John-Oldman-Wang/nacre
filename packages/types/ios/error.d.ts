/**
 * iOS 的错误（`NSError`）。不能 `new`，只由运行时给出，两种情况：
 *
 * - 出错的含义是 iOS 特有的（比如面容 ID 被锁定）：直接抛它，`name` 是分类的名字，
 *   比如 `'BiometryLockoutError'`；映射不到分类时是 `'NSError'`。
 * - 出错的含义 Web 上有的：抛的是 `DOMException`，它挂在那个错误的 `cause` 上，
 *   这时它的 `name` 是 `'NSError'`。
 */
declare class NSError extends Error {
  private constructor();
  readonly name: string;
  /** 系统的错误域，比如 `'NSCocoaErrorDomain'`、`'kCLErrorDomain'`。 */
  readonly domain: string;
  /** 这个错误域里的编号。 */
  readonly code: number;
}
