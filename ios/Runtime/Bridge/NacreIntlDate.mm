// Intl.DateTimeFormat 的原生那一半：格式串从哪来、怎么格式化、时区认不认。
//
// 流程照的是 WebKit（见 Builtin/parts/27-intl-date.js 开头）。这里只做系统
// 才做得了的几件事，全部用 NSDateFormatter 一家的公开接口：
//
//   datePattern:      dateStyle / timeStyle 对应的格式串
//   dateTemplate:     骨架串 → 这个地区最合适的格式串
//   hourDigits:       小时写一位还是两位（问 Swift，见 NacreIntlDate.swift）
//   dateFormatter:    按（地区、格式串、时区）建一个格式化器，返回编号
//   formatDate:       格式化一个时刻
//   formatDateParts:  同上，但一段一段给
//   formatDateRange:  一段时间
//   timeZone: / defaultTimeZone / calendar:
//
// 格式串怎么改写、resolvedOptions 报什么，是字符串处理，在 JS 那一侧。
#import "NacreBridge.h"

// Swift 那个类的声明（它是内部可见的，不进自动生成的头）。名字和选择子要和
// NacreIntlDate.swift 里的 @objc 对上
@interface NacreIntlHourDigits : NSObject
+ (NSInteger)digits:(NSString*)skeleton locale:(NSString*)locale;
@end

// 一个建好的日期格式化器。分段和区间用到的东西第一次用才建
@interface NacreDateFormat : NSObject
@property(nonatomic, strong) NSDateFormatter* formatter;
@property(nonatomic, strong) NSLocale* locale;
@property(nonatomic, strong) NSTimeZone* timeZone;
/// 格式串切成的段：@[@"MMM", 只格式化这一个字段的格式化器] 或 @[@"", @"文字"]
@property(nonatomic, strong) NSArray<NSArray*>* pieces;
@property(nonatomic, strong) NSMutableDictionary<NSString*, NSDateIntervalFormatter*>* intervals;
@end
@implementation NacreDateFormat
@end

namespace nacre_bridge {

// JS 的 Date 用的是「往前一直推到头」的公历。系统的公历默认在 1582 年换成
// 儒略历，不改的话那之前的日期会差十来天。把换历的时刻推到 JS 能表示的最早
// 时刻之前（-8.64e15 毫秒）
static NSDate* GregorianStart() {
  static NSDate* start = [NSDate dateWithTimeIntervalSince1970:-8.64e12];
  return start;
}

static NSDateFormatter* MakeFormatter(NSLocale* locale, NSTimeZone* zone, NSString* pattern) {
  NSDateFormatter* f = [[NSDateFormatter alloc] init];
  f.locale = locale;
  f.timeZone = zone;
  f.gregorianStartDate = GregorianStart();
  f.dateFormat = pattern;
  return f;
}

// 系统新一些的数据在时间和「上午/下午」之间用窄的不换行空格（U+202F）、有的
// 地方用细空格（U+2009）。一大批现成的代码按普通空格去解析，所以三家浏览器
// 都把它们换成了普通空格，我们照做
static NSString* PlainSpaces(NSString* text) {
  if (text == nil) return @"";
  if ([text rangeOfString:@" "].location != NSNotFound) {
    text = [text stringByReplacingOccurrencesOfString:@" " withString:@" "];
  }
  if ([text rangeOfString:@" "].location != NSNotFound) {
    text = [text stringByReplacingOccurrencesOfString:@" " withString:@" "];
  }
  return text;
}

// 把格式串切成字段和文字。规则是 ICU 的：A-Z a-z 连着的同一个字母是一个字段；
// 单引号里的是文字；连着两个单引号是一个字面的引号
static NSArray<NSArray*>* Tokenize(NSString* pattern) {
  NSMutableArray<NSArray*>* out = [NSMutableArray array];
  NSMutableString* literal = [NSMutableString string];
  NSUInteger n = pattern.length, i = 0;
  void (^flush)(void) = ^{
    if (literal.length > 0) {
      [out addObject:@[@"", [literal copy]]];
      [literal setString:@""];
    }
  };
  while (i < n) {
    unichar c = [pattern characterAtIndex:i];
    if (c == '\'') {
      if (i + 1 < n && [pattern characterAtIndex:i + 1] == '\'') {
        [literal appendString:@"'"];
        i += 2;
        continue;
      }
      i++;
      while (i < n) {
        unichar d = [pattern characterAtIndex:i];
        if (d == '\'') {
          if (i + 1 < n && [pattern characterAtIndex:i + 1] == '\'') {
            [literal appendString:@"'"];
            i += 2;
            continue;
          }
          i++;
          break;
        }
        [literal appendFormat:@"%C", d];
        i++;
      }
      continue;
    }
    if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) {
      NSUInteger j = i;
      while (j < n && [pattern characterAtIndex:j] == c) j++;
      flush();
      [out addObject:@[[pattern substringWithRange:NSMakeRange(i, j - i)], @""]];
      i = j;
      continue;
    }
    [literal appendFormat:@"%C", c];
    i++;
  }
  flush();
  return out;
}

static NSMutableArray<NacreDateFormat*>* Formats() {
  static NSMutableArray<NacreDateFormat*>* list = [NSMutableArray array];
  return list;
}
static NSMutableDictionary<NSString*, NSNumber*>* FormatIds() {
  static NSMutableDictionary<NSString*, NSNumber*>* ids = [NSMutableDictionary dictionary];
  return ids;
}
static NacreDateFormat* FormatAt(id value) {
  if (![value isKindOfClass:NSNumber.class]) return nil;
  NSInteger index = (NSInteger)SafeNumber(value);
  return index >= 0 && index < (NSInteger)Formats().count ? Formats()[index] : nil;
}
static NSDate* DateFromMillis(id value) {
  return [value isKindOfClass:NSNumber.class]
             ? [NSDate dateWithTimeIntervalSince1970:SafeNumber(value) / 1000.0]
             : nil;
}

// 系统日历的名字 → 标准里的名字。不一样的只有这几个
static NSString* StandardCalendarName(NSString* identifier) {
  static NSDictionary<NSString*, NSString*>* map = @{
    @"gregorian": @"gregory",
    @"ethiopic-amete-mihret": @"ethiopic",
    @"ethiopic-amete-alem": @"ethioaa",
    @"republic-of-china": @"roc",
  };
  return map[identifier] ?: identifier;
}

// 时区的名字认不认。返回规范写法的名字，不认返回 nil。
//
// 标准要的是 IANA 的名字，大小写不敏感。系统的 +timeZoneWithName: 比它宽：
// 缩写（PST）和 GMT+8 这种它也收，而网页不收，所以这两类先挡掉
static NSString* CanonicalTimeZoneName(NSString* name) {
  static NSDictionary<NSString*, NSString*>* known;
  static NSSet<NSString*>* realAbbreviations;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    NSMutableDictionary<NSString*, NSString*>* map = [NSMutableDictionary dictionary];
    for (NSString* id in NSTimeZone.knownTimeZoneNames) map[id.lowercaseString] = id;
    // 不在上面那张表里、但确实是 IANA 名字的那些（别名和老名字）
    for (NSString* id in @[@"UTC", @"GMT", @"UCT", @"Etc/UTC", @"Etc/GMT", @"Etc/UCT",
                           @"Etc/Universal", @"Etc/Zulu", @"Universal", @"Zulu",
                           @"EST", @"MST", @"HST", @"EST5EDT", @"CST6CDT", @"MST7MDT",
                           @"PST8PDT", @"WET", @"CET", @"MET", @"EET", @"PRC", @"ROC", @"ROK"]) {
      map[id.lowercaseString] = id;
    }
    known = map;
    // 既是系统的缩写、又是真的 IANA 名字的
    realAbbreviations = [NSSet setWithArray:@[@"CET", @"EET", @"EST", @"GMT", @"HST", @"MST",
                                               @"UTC", @"WET"]];
  });
  NSString* hit = known[name.lowercaseString];
  if (hit != nil) return hit;
  if (NSTimeZone.abbreviationDictionary[name] != nil && ![realAbbreviations containsObject:name]) {
    return nil;
  }
  NSString* upper = name.uppercaseString;
  if (([upper hasPrefix:@"GMT"] || [upper hasPrefix:@"UTC"]) && name.length > 3) return nil;
  NSTimeZone* zone = [NSTimeZone timeZoneWithName:name];
  return zone != nil ? name : nil;
}

// 名字或者偏移的秒数 → NSTimeZone
static NSTimeZone* ZoneFrom(id value) {
  if ([value isKindOfClass:NSNumber.class]) {
    return [NSTimeZone timeZoneForSecondsFromGMT:(NSInteger)SafeNumber(value)];
  }
  if (![value isKindOfClass:NSString.class]) return nil;
  // 系统把 "UTC" 当成 GMT 的别名，写出来是 GMT / Greenwich Mean Time。
  // 网页写的是 UTC / Coordinated Universal Time，Etc/UTC 才是这个结果
  if ([value isEqualToString:@"UTC"]) return [NSTimeZone timeZoneWithName:@"Etc/UTC"];
  return [NSTimeZone timeZoneWithName:value];
}

bool IntlDateCallClassMethod(NSString* sel, const NacreArgs& args, std::string* out,
                             std::string* error) {
  // 格式化一个时刻。最常走的一条
  if ([sel isEqualToString:@"formatDate:"]) {
    NacreDateFormat* format = FormatAt(args.value(0));
    NSDate* date = DateFromMillis(args.value(1));
    if (format == nil || date == nil) {
      *error = "formatDate needs a formatter id and a time value";
      return true;
    }
    *out = EncodeJSON(PlainSpaces([format.formatter stringFromDate:date]));
    return true;
  }
  // 一段一段给：[[字段, 文字], …]，字段是空串的那些是原样的文字。
  // 每个字段单独格式化再拼——实测拼出来和整串逐字相同
  if ([sel isEqualToString:@"formatDateParts:"]) {
    NacreDateFormat* format = FormatAt(args.value(0));
    NSDate* date = DateFromMillis(args.value(1));
    if (format == nil || date == nil) {
      *error = "formatDateParts needs a formatter id and a time value";
      return true;
    }
    if (format.pieces == nil) {
      NSMutableArray<NSArray*>* pieces = [NSMutableArray array];
      for (NSArray* token in Tokenize(format.formatter.dateFormat)) {
        NSString* field = token[0];
        if (field.length == 0) [pieces addObject:token];
        else [pieces addObject:@[field, MakeFormatter(format.locale, format.timeZone, field)]];
      }
      format.pieces = pieces;
    }
    NSMutableArray<NSArray*>* result = [NSMutableArray arrayWithCapacity:format.pieces.count];
    for (NSArray* piece in format.pieces) {
      NSString* field = piece[0];
      NSString* text = field.length == 0 ? piece[1] : [(NSDateFormatter*)piece[1] stringFromDate:date];
      [result addObject:@[field, PlainSpaces(text)]];
    }
    *out = EncodeJSON(result);
    return true;
  }
  // 一段时间。参数：格式化器编号、骨架串、小时制（没有是 null）、起止的毫秒数
  if ([sel isEqualToString:@"formatDateRange:"]) {
    NacreDateFormat* format = FormatAt(args.value(0));
    id skeleton = args.value(1);
    id hourCycle = args.value(2);
    NSDate* start = DateFromMillis(args.value(3));
    NSDate* end = DateFromMillis(args.value(4));
    if (format == nil || ![skeleton isKindOfClass:NSString.class] || start == nil || end == nil) {
      *error = "formatDateRange needs a formatter id, a skeleton and two time values";
      return true;
    }
    if ([start isEqualToDate:end]) {
      *out = EncodeJSON(PlainSpaces([format.formatter stringFromDate:start]));
      return true;
    }
    if (format.intervals == nil) format.intervals = [NSMutableDictionary dictionary];
    NSDateIntervalFormatter* interval = format.intervals[skeleton];
    if (interval == nil) {
      NSLocale* locale = format.locale;
      if ([hourCycle isKindOfClass:NSString.class]) {
        NSString* id = locale.localeIdentifier;
        locale = [NSLocale localeWithLocaleIdentifier:
                      [id stringByAppendingFormat:@"%@hours=%@",
                                                  [id containsString:@"@"] ? @";" : @"@", hourCycle]];
      }
      interval = [[NSDateIntervalFormatter alloc] init];
      interval.locale = locale;
      interval.timeZone = format.timeZone;
      interval.dateTemplate = skeleton;
      format.intervals[(NSString*)skeleton] = interval;
    }
    NSString* text = [interval stringFromDate:start toDate:end];
    // 两头在这个骨架的粒度上是同一个（同一天、同一个月）时，区间格式化器给的是
    // 单个日期，而且是用骨架自己的格式串写的；网页这时改用我们那个格式串来写。
    // 认法：区间的结果等于「用骨架的格式串写起点」
    NSString* own = [NSDateFormatter dateFormatFromTemplate:skeleton options:0 locale:interval.locale];
    NSString* single = [MakeFormatter(interval.locale, format.timeZone, own) stringFromDate:start];
    if ([text isEqualToString:single]) text = [format.formatter stringFromDate:start];
    *out = EncodeJSON(PlainSpaces(text));
    return true;
  }
  // 按（地区、格式串、时区）建一个格式化器，返回编号。key 是这一组的 JSON 文本
  if ([sel isEqualToString:@"dateFormatter:"]) {
    id key = args.value(0);
    NSDictionary* spec = [args.value(1) isKindOfClass:NSDictionary.class] ? args.value(1) : nil;
    id localeId = spec[@"locale"];
    id pattern = spec[@"pattern"];
    NSTimeZone* zone = ZoneFrom(spec[@"timeZone"]);
    if (![key isKindOfClass:NSString.class] || ![localeId isKindOfClass:NSString.class] ||
        ![pattern isKindOfClass:NSString.class] || zone == nil) {
      *error = "dateFormatter needs a key and { locale, pattern, timeZone }";
      return true;
    }
    NSNumber* existing = FormatIds()[key];
    if (existing == nil) {
      NacreDateFormat* format = [[NacreDateFormat alloc] init];
      format.locale = [NSLocale localeWithLocaleIdentifier:localeId];
      format.timeZone = zone;
      format.formatter = MakeFormatter(format.locale, zone, pattern);
      [Formats() addObject:format];
      existing = @(Formats().count - 1);
      FormatIds()[(NSString*)key] = existing;
    }
    *out = EncodeJSON(existing);
    return true;
  }
  // dateStyle / timeStyle 对应的格式串。参数：地区标识、两个样式（没有是 null）
  if ([sel isEqualToString:@"datePattern:"]) {
    id localeId = args.value(0);
    if (![localeId isKindOfClass:NSString.class]) {
      *error = "datePattern needs a locale";
      return true;
    }
    NSDateFormatterStyle (^style)(id) = ^NSDateFormatterStyle(id value) {
      if (![value isKindOfClass:NSString.class]) return NSDateFormatterNoStyle;
      if ([value isEqualToString:@"full"]) return NSDateFormatterFullStyle;
      if ([value isEqualToString:@"long"]) return NSDateFormatterLongStyle;
      if ([value isEqualToString:@"medium"]) return NSDateFormatterMediumStyle;
      return NSDateFormatterShortStyle;
    };
    NSDateFormatter* f = [[NSDateFormatter alloc] init];
    f.locale = [NSLocale localeWithLocaleIdentifier:localeId];
    f.dateStyle = style(args.value(1));
    f.timeStyle = style(args.value(2));
    *out = EncodeJSON(f.dateFormat ?: @"");
    return true;
  }
  // 骨架串 → 这个地区最合适的格式串
  if ([sel isEqualToString:@"dateTemplate:"]) {
    id localeId = args.value(0);
    id skeleton = args.value(1);
    if (![localeId isKindOfClass:NSString.class] || ![skeleton isKindOfClass:NSString.class]) {
      *error = "dateTemplate needs a locale and a skeleton";
      return true;
    }
    NSString* pattern =
        [NSDateFormatter dateFormatFromTemplate:skeleton
                                        options:0
                                         locale:[NSLocale localeWithLocaleIdentifier:localeId]];
    *out = EncodeJSON(pattern ?: @"");
    return true;
  }
  if ([sel isEqualToString:@"hourDigits:"]) {
    id skeleton = args.value(0);
    id localeId = args.value(1);
    if (![skeleton isKindOfClass:NSString.class] || ![localeId isKindOfClass:NSString.class]) {
      *error = "hourDigits needs a skeleton and a locale";
      return true;
    }
    *out = EncodeJSON(@([NacreIntlHourDigits digits:skeleton locale:localeId]));
    return true;
  }
  if ([sel isEqualToString:@"timeZone:"]) {
    id name = args.value(0);
    NSString* canonical = [name isKindOfClass:NSString.class] ? CanonicalTimeZoneName(name) : nil;
    *out = EncodeJSON(canonical ?: (id)NSNull.null);
    return true;
  }
  if ([sel isEqualToString:@"defaultTimeZone"]) {
    *out = EncodeJSON(NSTimeZone.localTimeZone.name ?: @"UTC");
    return true;
  }
  // 这个地区默认用哪种日历（泰国是佛历，沙特是伊斯兰历）
  if ([sel isEqualToString:@"calendar:"]) {
    id localeId = args.value(0);
    if (![localeId isKindOfClass:NSString.class]) {
      *error = "calendar needs a locale";
      return true;
    }
    NSString* identifier = [NSLocale localeWithLocaleIdentifier:localeId].calendarIdentifier;
    *out = EncodeJSON(StandardCalendarName(identifier ?: @"gregorian"));
    return true;
  }
  return false;
}

}  // namespace nacre_bridge
