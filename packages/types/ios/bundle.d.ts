// App 包：NSBundle。包的路径、按名字找资源、Info.plist、App 支持和在用的语言。
// 读包里项目自己的 assets/，更直接的是 application.fileSystem.assets。

/**
 * 一个包：磁盘上一个装着程序和资源的目录。App 自己的包从 `NSBundle.mainBundle` 拿。
 *
 * ```js
 * const path = NSBundle.mainBundle.pathForResource('data', { ofType: 'json', inDirectory: 'JS/assets' });
 * ```
 */
declare class NSBundle extends NSObject {
  private constructor();

  /** App 自己的包。每次读得到同一个对象。 */
  static readonly mainBundle: NSBundle;
  /** 按目录的路径拿一个包。路径上不是包时是 `null`。 */
  static bundleWithPath(path: string): NSBundle | null;
  /** 按包名拿一个已经加载的包。没有时是 `null`。 */
  static bundleWithIdentifier(identifier: string): NSBundle | null;
  /** 从一组语言里挑出最合用户偏好的那几种，最合的在前。`forPreferences` 不给时按用户在系统设置里的偏好。 */
  static preferredLocalizationsFromArray(
    localizationsArray: readonly string[],
    options?: { forPreferences?: readonly string[] | null },
  ): string[];

  /** 包的绝对路径。 */
  readonly bundlePath: string;
  /** 资源目录的绝对路径。App 的包里和 `bundlePath` 相同。 */
  readonly resourcePath: string | null;
  /** 包名，形如 `com.example.shop`。 */
  readonly bundleIdentifier: string | null;
  /** 包的 Info.plist。 */
  readonly infoDictionary: Record<string, unknown> | null;
  /** Info.plist 里按 App 在用的语言翻译过的那几项。 */
  readonly localizedInfoDictionary: Record<string, unknown> | null;
  /** 包支持的全部语言。 */
  readonly localizations: readonly string[];
  /** 包里的语言中，这一次实际在用的，最合用户偏好的在前。 */
  readonly preferredLocalizations: readonly string[];
  /** 开发时用的语言。 */
  readonly developmentLocalization: string | null;

  /** Info.plist 里一个键的值，按 App 在用的语言翻译过的优先。没有这个键是 `null`。 */
  objectForInfoDictionaryKey(key: string): unknown;

  /**
   * 按名字找一个资源的绝对路径，找不到是 `null`。`inDirectory` 相对包的根。
   * 名字可以带扩展名，这时不用给 `ofType`。
   */
  pathForResource(
    name: string | null,
    options?: { ofType?: string | null; inDirectory?: string | null; forLocalization?: string | null },
  ): string | null;
  /** 一种扩展名的全部资源的绝对路径。 */
  pathsForResourcesOfType(
    ext: string | null,
    options?: { inDirectory?: string | null; forLocalization?: string | null },
  ): string[];

  /**
   * 包里 `.strings` 表中一个键的译文。没有这个键时给 `value`；`value` 不给或者是空串时给键本身。
   * `table` 是表的名字，不给时是 `Localizable`。`localizations` 指定按哪几种语言找。
   */
  localizedStringForKey(
    key: string,
    options?: { value?: string | null; table?: string | null; localizations?: readonly string[] },
  ): string;
  /** 和 `localizedStringForKey` 一样，但译文里的 Markdown 变成富文本。 */
  localizedAttributedStringForKey(
    key: string,
    options?: { value?: string | null; table?: string | null },
  ): NSAttributedString;
}
