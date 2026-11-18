// Intl 的桥：把 JS 的调用转给 Swift 那一半（NacreIntlNumber.swift）。
//
// Intl 的类都写在内置脚本里（Builtin/parts/26-intl.js），它们不是原生对象，
// 所以这里没有属性、没有实例方法，只有类级的几个调用。类名 NacreIntl 只是
// 桥上的一个地址，JS 的全局里没有它。
#import "NacreBridge.h"

// Swift 那个类的声明。它在 Swift 里是内部可见的，不进自动生成的头文件
// （framework 里那个头只收 public 的），所以这里手写一份——名字和选择子
// 要和 NacreIntlNumber.swift 里的 @objc 对上，对不上链接时就会报
@interface NacreIntlNumberFormat : NSObject
+ (NSInteger)create:(NSString*)key options:(NSDictionary<NSString*, id>*)options;
+ (nullable NSString*)format:(NSInteger)formatter value:(NSString*)value;
+ (NSInteger)currencyDigits:(NSString*)code;
+ (NSString*)defaultLocale;
+ (NSArray<NSString*>*)availableLocales;
+ (NSArray<NSString*>*)numberingSystems;
+ (NSString*)numberingSystem:(NSString*)locale;
@end

namespace nacre_bridge {

bool IntlCallClassMethod(const std::string& className, NSString* sel, const NacreArgs& args,
                         std::string* out, std::string* error) {
  if (className != "NacreIntl") return false;

  // 格式化一个数。最常走的一条，放最前面。
  // 参数：格式化器的编号，值（"d:<数>" 或 "n:<十进制数字串>"）
  if ([sel isEqualToString:@"formatNumber:"]) {
    id formatter = args.value(0);
    id value = args.value(1);
    if (![formatter isKindOfClass:NSNumber.class] || ![value isKindOfClass:NSString.class]) {
      *error = "formatNumber needs a formatter id and an encoded value";
      return true;
    }
    NSString* text = [NacreIntlNumberFormat format:(NSInteger)SafeNumber(formatter) value:value];
    if (text == nil) {
      *error = "this value cannot be formatted with these options";
      return true;
    }
    *out = EncodeJSON(text);
    return true;
  }
  // 按一组解析好的选项建一个格式化器，返回编号。同一组选项只建一次
  // （key 是那组选项的 JSON 文本，拿来认是不是同一组）
  if ([sel isEqualToString:@"numberFormat:"]) {
    id key = args.value(0);
    id options = args.value(1);
    if (![key isKindOfClass:NSString.class] || ![options isKindOfClass:NSDictionary.class]) {
      *error = "numberFormat needs a key and resolved options";
      return true;
    }
    NSInteger formatter = [NacreIntlNumberFormat create:key options:options];
    if (formatter < 0) {
      // JS 那边已经把做不了的选项挡掉并且点名了；走到这里说明两边的清单
      // 对不上，是运行时自己的问题
      *error = "these number format options are not supported by this runtime";
      return true;
    }
    *out = EncodeJSON(@(formatter));
    return true;
  }
  if ([sel isEqualToString:@"currencyDigits:"]) {
    id code = args.value(0);
    if (![code isKindOfClass:NSString.class]) {
      *error = "currencyDigits needs a currency code";
      return true;
    }
    *out = EncodeJSON(@([NacreIntlNumberFormat currencyDigits:code]));
    return true;
  }
  // 系统有哪些地区和数字系统、默认地区是什么。JS 第一次用到 Intl 时问一次
  if ([sel isEqualToString:@"localeInfo"]) {
    *out = EncodeJSON(@{
      @"defaultLocale": [NacreIntlNumberFormat defaultLocale],
      @"availableLocales": [NacreIntlNumberFormat availableLocales],
      @"numberingSystems": [NacreIntlNumberFormat numberingSystems],
    });
    return true;
  }
  if ([sel isEqualToString:@"numberingSystem:"]) {
    id locale = args.value(0);
    if (![locale isKindOfClass:NSString.class]) {
      *error = "numberingSystem needs a locale";
      return true;
    }
    *out = EncodeJSON([NacreIntlNumberFormat numberingSystem:locale]);
    return true;
  }
  // String.prototype.normalize。参数：字符串、形式。形式已经在 JS 那边验过，
  // 落单的代理项和 U+FEFF 也在那边切开了，不会到这里。
  //
  // 用的是 ICU 的变换（CFStringTransform 的文档写明可以传 ICU 的变换名），
  // 不是 NSString 那四个 precomposed… / decomposed… 方法：那四个是
  // CoreFoundation 自己的实现，和网页里的 ICU 对不上——谚文音节加终声不合成、
  // 半角假名加浊点在 NFKC 下不合成、新版 Unicode 加的字不认。实测见
  // docs/internals/intl.md
  if ([sel isEqualToString:@"normalize:"]) {
    id text = args.value(0);
    id form = args.value(1);
    if (![text isKindOfClass:NSString.class] || ![form isKindOfClass:NSString.class]) {
      *error = "normalize needs a string and a normalization form";
      return true;
    }
    // 只放行这四个名字：变换名是个开放的集合，别的名字（转写、大小写……）不该从这里进来
    if (![@[@"NFC", @"NFD", @"NFKC", @"NFKD"] containsObject:form]) {
      *error = "normalize needs one of NFC, NFD, NFKC, NFKD";
      return true;
    }
    NSMutableString* result = [text mutableCopy];
    if (!CFStringTransform((__bridge CFMutableStringRef)result, NULL, (__bridge CFStringRef)form, false)) {
      *error = "the system could not normalize this string";
      return true;
    }
    *out = EncodeJSON(result);
    return true;
  }
  // 日期那一组在另一个文件里
  if (IntlDateCallClassMethod(sel, args, out, error)) return true;
  *error = [NSString stringWithFormat:@"NacreIntl has no class method %@", sel].UTF8String;
  return true;
}

}  // namespace nacre_bridge
