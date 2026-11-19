// 地区：NSLocale。系统的首选语言、用户的地区设置，以及一个地区的格式。
// 地区设置变了的通知是 application 上的 localechange，不在这里。
//
// 这是内置脚本的一个 part：整个文件是一个函数表达式，运行时按文件名顺序执行，用共享的 ctx 调一次。
(function (ctx) {
  'use strict';

  const {
    constructNative,
    defineNativeClass,
    nativeCall,
    nativeClassCall,
    nativeClassCallValue,
    nativeClassObject,
    nativeGet,
    requireNative,
    toText,
  } = ctx;

  defineNativeClass('NSLocale', class NSLocale extends NSObject {
    // 地区标识不可空：undefined 和 null 当空串（照字符串参数的转换规则）
    constructor(localeIdentifier) {
      super();
      constructNative(this, new.target, 'NSLocale', [toText(localeIdentifier)]);
    }

    static localeWithLocaleIdentifier(localeIdentifier) {
      return nativeClassCall('NSLocale', 'localeWithLocaleIdentifier:', [toText(localeIdentifier)]);
    }

    // 用户的设置。currentLocale 是读的那一刻的值；autoupdatingCurrentLocale 跟着设置变
    static get currentLocale() { return nativeClassObject('NSLocale', 'currentLocale'); }
    static get autoupdatingCurrentLocale() { return nativeClassObject('NSLocale', 'autoupdatingCurrentLocale'); }
    static get systemLocale() { return nativeClassObject('NSLocale', 'systemLocale'); }

    // 字符串数组的类属性。每次读给一个新数组
    static get preferredLanguages() { return nativeClassCallValue('NSLocale', 'preferredLanguages', []); }
    static get availableLocaleIdentifiers() { return nativeClassCallValue('NSLocale', 'availableLocaleIdentifiers', []); }
    static get ISOLanguageCodes() { return nativeClassCallValue('NSLocale', 'ISOLanguageCodes', []); }
    static get ISOCountryCodes() { return nativeClassCallValue('NSLocale', 'ISOCountryCodes', []); }
    static get ISOCurrencyCodes() { return nativeClassCallValue('NSLocale', 'ISOCurrencyCodes', []); }
    static get commonISOCurrencyCodes() { return nativeClassCallValue('NSLocale', 'commonISOCurrencyCodes', []); }

    static canonicalLocaleIdentifierFromString(string) {
      return nativeClassCallValue('NSLocale', 'canonicalLocaleIdentifierFromString:', [toText(string)]);
    }
    static canonicalLanguageIdentifierFromString(string) {
      return nativeClassCallValue('NSLocale', 'canonicalLanguageIdentifierFromString:', [toText(string)]);
    }
    static characterDirectionForLanguage(isoLangCode) {
      return nativeClassCallValue('NSLocale', 'characterDirectionForLanguage:', [toText(isoLangCode)]);
    }
    static lineDirectionForLanguage(isoLangCode) {
      return nativeClassCallValue('NSLocale', 'lineDirectionForLanguage:', [toText(isoLangCode)]);
    }

    // 全部只读。可空的几项（regionCode、scriptCode、variantCode、collationIdentifier、
    // currencyCode）没有时是 null
    get localeIdentifier() { requireNative(this, 'localeIdentifier'); return nativeGet(this, 'localeIdentifier'); }
    get languageCode() { requireNative(this, 'languageCode'); return nativeGet(this, 'languageCode'); }
    get languageIdentifier() { requireNative(this, 'languageIdentifier'); return nativeGet(this, 'languageIdentifier'); }
    get regionCode() { requireNative(this, 'regionCode'); return nativeGet(this, 'regionCode'); }
    get scriptCode() { requireNative(this, 'scriptCode'); return nativeGet(this, 'scriptCode'); }
    get variantCode() { requireNative(this, 'variantCode'); return nativeGet(this, 'variantCode'); }
    get calendarIdentifier() { requireNative(this, 'calendarIdentifier'); return nativeGet(this, 'calendarIdentifier'); }
    get collationIdentifier() { requireNative(this, 'collationIdentifier'); return nativeGet(this, 'collationIdentifier'); }
    get collatorIdentifier() { requireNative(this, 'collatorIdentifier'); return nativeGet(this, 'collatorIdentifier'); }
    get usesMetricSystem() { requireNative(this, 'usesMetricSystem'); return nativeGet(this, 'usesMetricSystem'); }
    get decimalSeparator() { requireNative(this, 'decimalSeparator'); return nativeGet(this, 'decimalSeparator'); }
    get groupingSeparator() { requireNative(this, 'groupingSeparator'); return nativeGet(this, 'groupingSeparator'); }
    get currencySymbol() { requireNative(this, 'currencySymbol'); return nativeGet(this, 'currencySymbol'); }
    get currencyCode() { requireNative(this, 'currencyCode'); return nativeGet(this, 'currencyCode'); }
    get quotationBeginDelimiter() { requireNative(this, 'quotationBeginDelimiter'); return nativeGet(this, 'quotationBeginDelimiter'); }
    get quotationEndDelimiter() { requireNative(this, 'quotationEndDelimiter'); return nativeGet(this, 'quotationEndDelimiter'); }
    get alternateQuotationBeginDelimiter() { requireNative(this, 'alternateQuotationBeginDelimiter'); return nativeGet(this, 'alternateQuotationBeginDelimiter'); }
    get alternateQuotationEndDelimiter() { requireNative(this, 'alternateQuotationEndDelimiter'); return nativeGet(this, 'alternateQuotationEndDelimiter'); }

    // 把一个代码翻译成这个地区的语言里的名字。参数照字符串转换
    localizedStringForLocaleIdentifier(localeIdentifier) {
      return nativeCall(this, 'localizedStringForLocaleIdentifier:', [toText(localeIdentifier)]);
    }
    localizedStringForLanguageCode(languageCode) {
      return nativeCall(this, 'localizedStringForLanguageCode:', [toText(languageCode)]);
    }
    localizedStringForCountryCode(countryCode) {
      return nativeCall(this, 'localizedStringForCountryCode:', [toText(countryCode)]);
    }
    localizedStringForScriptCode(scriptCode) {
      return nativeCall(this, 'localizedStringForScriptCode:', [toText(scriptCode)]);
    }
    localizedStringForVariantCode(variantCode) {
      return nativeCall(this, 'localizedStringForVariantCode:', [toText(variantCode)]);
    }
    localizedStringForCalendarIdentifier(calendarIdentifier) {
      return nativeCall(this, 'localizedStringForCalendarIdentifier:', [toText(calendarIdentifier)]);
    }
    localizedStringForCollationIdentifier(collationIdentifier) {
      return nativeCall(this, 'localizedStringForCollationIdentifier:', [toText(collationIdentifier)]);
    }
    localizedStringForCurrencyCode(currencyCode) {
      return nativeCall(this, 'localizedStringForCurrencyCode:', [toText(currencyCode)]);
    }
    localizedStringForCollatorIdentifier(collatorIdentifier) {
      return nativeCall(this, 'localizedStringForCollatorIdentifier:', [toText(collatorIdentifier)]);
    }
  });
})
