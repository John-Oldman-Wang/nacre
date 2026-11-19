// NSLocale：系统的首选语言、用户的地区设置，以及一个地区的格式。
//
// 一个域一个文件。手写的：bindgen 写不出（这个类没有无参的 init，成员多是
// 类属性和类方法）。地区设置变了的通知不在这里，是 application 上的
// localechange（NacreRuntime.mm 的通知表），和 significanttimechange 一类。
//
// 没接的：countryCode（Apple 打算废弃，值和 regionCode 一样）、
// exemplarCharacterSet（NSCharacterSet 没接）、objectForKey: 和
// displayNameForKey:value:（按 NSLocaleKey 常量取值，和属性、localizedStringFor…
// 重复）、componentsFromLocaleIdentifier: 一对（拆用 new NSLocale(id) 的属性，
// 拼用 canonicalLocaleIdentifierFromString:）、Windows 区域代码的一对、initWithCoder:。

#import "NacreBridge.h"

namespace nacre_bridge {

NACRE_ENUM_MAP(LocaleLanguageDirection, NSLocaleLanguageDirection,
               @"unknown": @(NSLocaleLanguageDirectionUnknown),
               @"leftToRight": @(NSLocaleLanguageDirectionLeftToRight),
               @"rightToLeft": @(NSLocaleLanguageDirectionRightToLeft),
               @"topToBottom": @(NSLocaleLanguageDirectionTopToBottom),
               @"bottomToTop": @(NSLocaleLanguageDirectionBottomToTop))

// 可空的字符串：nil 给 NSNull（过桥是 JS 的 null）；直接返回 nil 会被当成「不认领」
static id OrNull(id value) { return value != nil ? value : (id)NSNull.null; }

// 字符串参数。JS 一侧已经照字符串转换过，这里只校验
static NSString* StringArg(const NacreArgs& args, NSUInteger i, const char* what,
                           std::string* error) {
  id given = args.value(i);
  if ([given isKindOfClass:NSString.class]) return given;
  *error = std::string(what) + " needs a string";
  return nil;
}

static id ReadLocaleProperty(id object, NSString* key) {
  if (![object isKindOfClass:NSLocale.class]) return nil;
  NSLocale* l = (NSLocale*)object;
  if ([key isEqualToString:@"localeIdentifier"]) return l.localeIdentifier;
  if ([key isEqualToString:@"languageCode"]) return l.languageCode;
  if ([key isEqualToString:@"languageIdentifier"]) return l.languageIdentifier;
  if ([key isEqualToString:@"regionCode"]) return OrNull(l.regionCode);
  if ([key isEqualToString:@"scriptCode"]) return OrNull(l.scriptCode);
  if ([key isEqualToString:@"variantCode"]) return OrNull(l.variantCode);
  if ([key isEqualToString:@"calendarIdentifier"]) return l.calendarIdentifier;
  if ([key isEqualToString:@"collationIdentifier"]) return OrNull(l.collationIdentifier);
  if ([key isEqualToString:@"collatorIdentifier"]) return l.collatorIdentifier;
  if ([key isEqualToString:@"usesMetricSystem"]) return @(l.usesMetricSystem);
  if ([key isEqualToString:@"decimalSeparator"]) return l.decimalSeparator;
  if ([key isEqualToString:@"groupingSeparator"]) return l.groupingSeparator;
  if ([key isEqualToString:@"currencySymbol"]) return l.currencySymbol;
  if ([key isEqualToString:@"currencyCode"]) return OrNull(l.currencyCode);
  if ([key isEqualToString:@"quotationBeginDelimiter"]) return l.quotationBeginDelimiter;
  if ([key isEqualToString:@"quotationEndDelimiter"]) return l.quotationEndDelimiter;
  if ([key isEqualToString:@"alternateQuotationBeginDelimiter"]) {
    return l.alternateQuotationBeginDelimiter;
  }
  if ([key isEqualToString:@"alternateQuotationEndDelimiter"]) {
    return l.alternateQuotationEndDelimiter;
  }
  return nil;
}

// ---- 实例方法：把一个代码翻译成这个地区的语言里的名字 ----
static bool CallLocale(id object, NSString* sel, const NacreArgs& args, std::string* out,
                       std::string* error) {
  if (![object isKindOfClass:NSLocale.class]) return false;
  NSLocale* l = (NSLocale*)object;
  static NSArray<NSString*>* selectors = @[
    @"localizedStringForLocaleIdentifier:", @"localizedStringForLanguageCode:",
    @"localizedStringForCountryCode:", @"localizedStringForScriptCode:",
    @"localizedStringForVariantCode:", @"localizedStringForCalendarIdentifier:",
    @"localizedStringForCollationIdentifier:", @"localizedStringForCurrencyCode:",
    @"localizedStringForCollatorIdentifier:",
  ];
  if (![selectors containsObject:sel]) return false;
  *out = "null";
  NSString* code = StringArg(args, 0, sel.UTF8String, error);
  if (code == nil) return true;
  NSString* result = nil;
  if ([sel isEqualToString:@"localizedStringForLocaleIdentifier:"]) {
    result = [l localizedStringForLocaleIdentifier:code];
  } else if ([sel isEqualToString:@"localizedStringForLanguageCode:"]) {
    result = [l localizedStringForLanguageCode:code];
  } else if ([sel isEqualToString:@"localizedStringForCountryCode:"]) {
    result = [l localizedStringForCountryCode:code];
  } else if ([sel isEqualToString:@"localizedStringForScriptCode:"]) {
    result = [l localizedStringForScriptCode:code];
  } else if ([sel isEqualToString:@"localizedStringForVariantCode:"]) {
    result = [l localizedStringForVariantCode:code];
  } else if ([sel isEqualToString:@"localizedStringForCalendarIdentifier:"]) {
    result = [l localizedStringForCalendarIdentifier:code];
  } else if ([sel isEqualToString:@"localizedStringForCollationIdentifier:"]) {
    result = [l localizedStringForCollationIdentifier:code];
  } else if ([sel isEqualToString:@"localizedStringForCurrencyCode:"]) {
    result = [l localizedStringForCurrencyCode:code];
  } else {
    result = [l localizedStringForCollatorIdentifier:code];
  }
  *out = EncodeJSON(result);
  return true;
}

// ---- 类属性（对象）：三个系统的地区 ----
static nacre::NativeObjectRef LocaleClassObject(const std::string& className,
                                                const std::string& name) {
  if (className != "NSLocale") return {};
  if (name == "currentLocale") return {NacreKeep(NSLocale.currentLocale), "NSLocale"};
  if (name == "autoupdatingCurrentLocale") {
    return {NacreKeep(NSLocale.autoupdatingCurrentLocale), "NSLocale"};
  }
  if (name == "systemLocale") return {NacreKeep(NSLocale.systemLocale), "NSLocale"};
  return {};
}

// ---- 类方法和类属性（值） ----
static bool LocaleClassCall(const std::string& className, NSString* sel, const NacreArgs& args,
                            std::string* out, std::string* error) {
  if (className != "NSLocale") return false;
  // 字符串数组的类属性，按没有参数的类方法走
  if ([sel isEqualToString:@"preferredLanguages"]) {
    *out = EncodeJSON(NSLocale.preferredLanguages);
    return true;
  }
  if ([sel isEqualToString:@"availableLocaleIdentifiers"]) {
    *out = EncodeJSON(NSLocale.availableLocaleIdentifiers);
    return true;
  }
  if ([sel isEqualToString:@"ISOLanguageCodes"]) {
    *out = EncodeJSON(NSLocale.ISOLanguageCodes);
    return true;
  }
  if ([sel isEqualToString:@"ISOCountryCodes"]) {
    *out = EncodeJSON(NSLocale.ISOCountryCodes);
    return true;
  }
  if ([sel isEqualToString:@"ISOCurrencyCodes"]) {
    *out = EncodeJSON(NSLocale.ISOCurrencyCodes);
    return true;
  }
  if ([sel isEqualToString:@"commonISOCurrencyCodes"]) {
    *out = EncodeJSON(NSLocale.commonISOCurrencyCodes);
    return true;
  }
  if ([sel isEqualToString:@"canonicalLocaleIdentifierFromString:"]) {
    *out = "null";
    NSString* s = StringArg(args, 0, "canonicalLocaleIdentifierFromString", error);
    if (s != nil) *out = EncodeJSON([NSLocale canonicalLocaleIdentifierFromString:s]);
    return true;
  }
  if ([sel isEqualToString:@"canonicalLanguageIdentifierFromString:"]) {
    *out = "null";
    NSString* s = StringArg(args, 0, "canonicalLanguageIdentifierFromString", error);
    if (s != nil) *out = EncodeJSON([NSLocale canonicalLanguageIdentifierFromString:s]);
    return true;
  }
  if ([sel isEqualToString:@"characterDirectionForLanguage:"]) {
    *out = "null";
    NSString* s = StringArg(args, 0, "characterDirectionForLanguage", error);
    if (s != nil) {
      *out = EncodeJSON(NameForLocaleLanguageDirection([NSLocale characterDirectionForLanguage:s]));
    }
    return true;
  }
  if ([sel isEqualToString:@"lineDirectionForLanguage:"]) {
    *out = "null";
    NSString* s = StringArg(args, 0, "lineDirectionForLanguage", error);
    if (s != nil) {
      *out = EncodeJSON(NameForLocaleLanguageDirection([NSLocale lineDirectionForLanguage:s]));
    }
    return true;
  }
  return false;
}

static bool LocaleClassCallObject(const std::string& className, NSString* sel,
                                  const NacreArgs& args, nacre::NativeObjectRef* out,
                                  std::string* error) {
  if (className != "NSLocale" || ![sel isEqualToString:@"localeWithLocaleIdentifier:"]) {
    return false;
  }
  NSString* s = StringArg(args, 0, "localeWithLocaleIdentifier", error);
  if (s != nil) *out = {NacreKeep([NSLocale localeWithLocaleIdentifier:s]), "NSLocale"};
  return true;
}

// ---- 构造：new NSLocale(localeIdentifier) ----
static bool LocaleConstruct(const std::string& className, const NacreArgs& args,
                            nacre::NativeObjectRef* out, std::string* error) {
  if (className != "NSLocale") return false;
  NSString* s = StringArg(args, 0, "NSLocale", error);
  if (s != nil) *out = {NacreKeep([[NSLocale alloc] initWithLocaleIdentifier:s]), className};
  return true;
}

}  // namespace nacre_bridge

@interface NacreLocaleDomain : NSObject
@end
@implementation NacreLocaleDomain
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "locale";
  d.classes = {NSLocale.class};
  d.read = nacre_bridge::ReadLocaleProperty;
  d.call = nacre_bridge::CallLocale;
  d.classObject = nacre_bridge::LocaleClassObject;
  d.classCall = nacre_bridge::LocaleClassCall;
  d.classCallObject = nacre_bridge::LocaleClassCallObject;
  d.construct = nacre_bridge::LocaleConstruct;
  nacre_bridge::NacreRegisterDomain(d);
}
@end
