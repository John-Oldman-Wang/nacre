// 地区：NSLocale。系统的首选语言、用户的地区设置，以及一个地区的格式（货币、
// 小数点、引号……）。地区设置变了，application 上派发 localechange。

/** 文字或行的书写方向。 */
type NSLocaleLanguageDirection = 'unknown' | 'leftToRight' | 'rightToLeft' | 'topToBottom' | 'bottomToTop';

/**
 * 一个地区：语言、文字、国家或地区，以及跟着它走的格式。
 *
 * ```js
 * const locale = NSLocale.currentLocale;
 * console.log(locale.regionCode, locale.currencyCode, locale.decimalSeparator);
 * ```
 */
declare class NSLocale extends NSObject {
  /** 按地区标识建一个地区，比如 `'de_DE'`、`'zh_Hans_CN'`。`'en-US'` 这种写法也认。 */
  constructor(localeIdentifier: string);

  /** 和 `new NSLocale(localeIdentifier)` 一样。 */
  static localeWithLocaleIdentifier(localeIdentifier: string): NSLocale;

  /** 用户在系统设置里排好序的语言，形如 `['zh-Hans-CN', 'en-US']`。不是 App 实际在用的语言。 */
  static readonly preferredLanguages: readonly string[];
  /** 用户此刻的地区设置。读的那一刻的值，之后用户改了设置它不跟着变。 */
  static readonly currentLocale: NSLocale;
  /** 用户的地区设置，用户改了设置它跟着变。 */
  static readonly autoupdatingCurrentLocale: NSLocale;
  /** 不属于任何语言和地区的通用地区。 */
  static readonly systemLocale: NSLocale;
  /** 系统认得的全部地区标识。 */
  static readonly availableLocaleIdentifiers: readonly string[];
  /** ISO 639 的语言代码。 */
  static readonly ISOLanguageCodes: readonly string[];
  /** ISO 3166 的国家和地区代码。 */
  static readonly ISOCountryCodes: readonly string[];
  /** ISO 4217 的货币代码。 */
  static readonly ISOCurrencyCodes: readonly string[];
  /** 常用的货币代码。 */
  static readonly commonISOCurrencyCodes: readonly string[];

  /** 把地区标识改成标准写法。 */
  static canonicalLocaleIdentifierFromString(string: string): string;
  /** 把语言标识改成标准写法：`'en_US'` → `'en-US'`。 */
  static canonicalLanguageIdentifierFromString(string: string): string;
  /** 一种语言的文字在一行里朝哪个方向写。 */
  static characterDirectionForLanguage(isoLangCode: string): NSLocaleLanguageDirection;
  /** 一种语言的行朝哪个方向排。 */
  static lineDirectionForLanguage(isoLangCode: string): NSLocaleLanguageDirection;

  /** 地区标识，形如 `'de_DE'`。 */
  readonly localeIdentifier: string;
  /** 语言代码，形如 `'de'`。 */
  readonly languageCode: string;
  /** 语言标识。 */
  readonly languageIdentifier: string;
  /** 国家或地区代码，形如 `'DE'`。标识里没有地区时是 `null`。 */
  readonly regionCode: string | null;
  /** 文字代码，形如 `'Hant'`。标识里没写、或者写的是这种语言的默认文字（比如中文的 `Hans`）时是 `null`。 */
  readonly scriptCode: string | null;
  /** 变体代码，形如 `'POSIX'`。没有时是 `null`。 */
  readonly variantCode: string | null;
  /** 日历，形如 `'gregorian'`。 */
  readonly calendarIdentifier: string;
  /** 排序规则，形如 `'phonebook'`。标识里没指定时实测是 `'standard'`。 */
  readonly collationIdentifier: string | null;
  /** 排序用的标识。 */
  readonly collatorIdentifier: string;
  /** 用公制。 */
  readonly usesMetricSystem: boolean;
  /** 小数点。 */
  readonly decimalSeparator: string;
  /** 千分位分隔符。 */
  readonly groupingSeparator: string;
  /** 货币符号，形如 `'€'`。 */
  readonly currencySymbol: string;
  /** 货币代码，形如 `'EUR'`。没有时是 `null`。 */
  readonly currencyCode: string | null;
  readonly quotationBeginDelimiter: string;
  readonly quotationEndDelimiter: string;
  readonly alternateQuotationBeginDelimiter: string;
  readonly alternateQuotationEndDelimiter: string;

  /** 用这个地区的语言说出一个地区标识的名字：`'fr_FR'` → `'French (France)'`。 */
  localizedStringForLocaleIdentifier(localeIdentifier: string): string;
  localizedStringForLanguageCode(languageCode: string): string | null;
  localizedStringForCountryCode(countryCode: string): string | null;
  localizedStringForScriptCode(scriptCode: string): string | null;
  localizedStringForVariantCode(variantCode: string): string | null;
  localizedStringForCalendarIdentifier(calendarIdentifier: string): string | null;
  localizedStringForCollationIdentifier(collationIdentifier: string): string | null;
  localizedStringForCurrencyCode(currencyCode: string): string | null;
  localizedStringForCollatorIdentifier(collatorIdentifier: string): string | null;
}
