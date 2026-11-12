// iOS 原生符号。规则见 types/ios.d.ts 的说明。
//
// 剪贴板。

/**
 * 系统剪贴板。不能 `new`，用 `UIPasteboard.generalPasteboard`。
 *
 * 现在只能读写字符串。
 *
 * ```js
 * UIPasteboard.generalPasteboard.string = '订单号 20261112';
 * ```
 */
declare class UIPasteboard extends NSObject {
  private constructor();
  /** 整个系统共用的那个剪贴板。 */
  static readonly generalPasteboard: UIPasteboard;

  addEventListener(
    type: 'change',
    callback: EventListener | null,
    options?: AddEventListenerOptions,
  ): void;
  removeEventListener(type: 'change', callback: EventListener | null): void;

  /**
   * 剪贴板里的文字。没有文字时是 `null`。
   *
   * **读它是真的去取内容**：内容来自别的 App 时，系统可能先弹出提示让用户
   * 决定是否允许。只想知道有没有文字，用 `hasStrings`。
   */
  get string(): string | null;
  set string(value: string | null);
  /** 剪贴板里有没有文字。只是查询，不取内容，不会引出系统提示。 */
  readonly hasStrings: boolean;
  /**
   * 内容每变一次加一的计数。两次读到的值不同，说明中间内容变过——包括
   * App 在后台期间别的 App 改的。
   */
  readonly changeCount: number;
}
