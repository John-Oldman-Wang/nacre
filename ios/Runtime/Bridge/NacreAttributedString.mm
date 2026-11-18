// 富文本：NSAttributedString / NSMutableAttributedString、段落样式
// NSParagraphStyle / NSMutableParagraphStyle、阴影 NSShadow、附件
// NSTextAttachment，以及显示富文本的那几处——UILabel、UITextField、UITextView
// 的 attributedText（和输入框的 attributedPlaceholder）、UIButton 按状态的
// 富文本标题。
//
// 一个域一个文件，装它在所有通道上的分支；每个入口返回「认不认领」。
// 这个域是**登记进来的**（文件末尾的 +load），核心不认识它，函数全是 static。
// 四个视图类是别的域的，这里把它们列进 classes，只认领自己加的那几个名字，
// 别的名字一律说「不认领」，分发器接着去问原来的域。
//
// ---- 属性字典怎么过桥 ----
//
// 一组属性是「对象和标量混在一起」的字典：字体是对象，颜色在 JS 那一侧是
// 字符串、过桥时已经换成 UIColor 对象，字距是数，下划线是名字的数组。桥上
// 没有「字典」这种参数，但方法通道的参数包本来就是**按下标对齐的两个数组**
// ——标量在 values 里、对象在 ptrs 里（见 NacreArgs）。所以字典摊平成
// 「键、值、键、值…」接在固定参数后面：
//
//     addAttributes:range:   [ range, "font", <UIFont>, "kern", 2, … ]
//
// 键永远是标量位上的字符串；值是对象就在对象位上，否则在标量位上。
// 不需要新的通道。读的方向一次调用回不来（返回值要么是 JSON、要么是对象
// 数组），拆成两次：先要 JSON（标量的值 + 哪些键是对象），再要那几个对象，
// 两次都按 AttributeKeyPairs 的顺序排，JS 那一侧按下标对上。两次调用之间
// JS 没有让出主线程，内容不会变。
//
// ---- 值的语义 ----
//
// 段落样式和阴影是可改的对象。放进富文本时存的是**副本**（copy），读出来
// 给的也是副本：富文本里的值不会因为外面那个对象之后被改而变，读出来的对象
// 改了也不影响富文本。字体和颜色本来就不可变，原样存。附件原样存——它的
// 身份有意义（同一个附件对象读回来还是它）。
//
// 视图上读回来的富文本（label.attributedText 这类）一律给不可变的快照：
// UITextView 底下是一个可改的文字存储，直接交出去的话 JS 改它就是在绕过
// 视图改内容。

#import "NacreBridge.h"

namespace nacre_bridge {

// ---- 属性键 ----
// JS 那一侧的名字 ↔ NS…AttributeName。**顺序有用**：读属性时两次调用都按
// 这个顺序排，对象才能按下标对上
// nacre:enum-type AttributeKey = NSAttributedStringKey
NACRE_STRING_ENUM_MAP(AttributeKey,
                      @[ @"font", NSFontAttributeName ],
                      @[ @"paragraphStyle", NSParagraphStyleAttributeName ],
                      @[ @"foregroundColor", NSForegroundColorAttributeName ],
                      @[ @"backgroundColor", NSBackgroundColorAttributeName ],
                      @[ @"ligature", NSLigatureAttributeName ],
                      @[ @"kern", NSKernAttributeName ],
                      @[ @"tracking", NSTrackingAttributeName ],
                      @[ @"strikethroughStyle", NSStrikethroughStyleAttributeName ],
                      @[ @"underlineStyle", NSUnderlineStyleAttributeName ],
                      @[ @"strokeColor", NSStrokeColorAttributeName ],
                      @[ @"strokeWidth", NSStrokeWidthAttributeName ],
                      @[ @"shadow", NSShadowAttributeName ],
                      @[ @"attachment", NSAttachmentAttributeName ],
                      @[ @"link", NSLinkAttributeName ],
                      @[ @"baselineOffset", NSBaselineOffsetAttributeName ],
                      @[ @"underlineColor", NSUnderlineColorAttributeName ],
                      @[ @"strikethroughColor", NSStrikethroughColorAttributeName ])

// 下划线和删除线。它在头文件里是 NS_OPTIONS，但**不是一位一个名字**：
// double 是 0x09（和 single 的 0x01 重叠），四种虚线是 0x0100 到 0x0400 的
// 一个三位的数（dashDot 是 0x0300，等于 dot | dash）。所以名字 → 数值可以
// 用位掩码的宏（或起来），数值 → 名字不能用它（9 会被拆成 single 和
// double），那一半在下面的 UnderlineNames 里按「线型 / 虚线 / byWord」三段解
NACRE_MASK_MAP(UnderlineStyle, NSUnderlineStyle,
               @"single": @(NSUnderlineStyleSingle),
               @"thick": @(NSUnderlineStyleThick),
               @"double": @(NSUnderlineStyleDouble),
               @"patternDot": @(NSUnderlineStylePatternDot),
               @"patternDash": @(NSUnderlineStylePatternDash),
               @"patternDashDot": @(NSUnderlineStylePatternDashDot),
               @"patternDashDotDot": @(NSUnderlineStylePatternDashDotDot),
               @"byWord": @(NSUnderlineStyleByWord))

NACRE_MASK_MAP(StringDrawingOptions, NSStringDrawingOptions,
               @"usesLineFragmentOrigin": @(NSStringDrawingUsesLineFragmentOrigin),
               @"usesFontLeading": @(NSStringDrawingUsesFontLeading),
               @"usesDeviceMetrics": @(NSStringDrawingUsesDeviceMetrics),
               @"truncatesLastVisibleLine": @(NSStringDrawingTruncatesLastVisibleLine))

NACRE_ENUM_MAP(WritingDirection, NSWritingDirection,
               @"natural": @(NSWritingDirectionNatural),
               @"leftToRight": @(NSWritingDirectionLeftToRight),
               @"rightToLeft": @(NSWritingDirectionRightToLeft))

static const NSInteger kUnderlineLineMask = 0x0F;
static const NSInteger kUnderlinePatternMask = 0x0700;

// 数值 → 名字，顺序固定：线型、虚线、byWord
static NSArray<NSString*>* UnderlineNames(NSInteger value) {
  NSMutableArray<NSString*>* out = [NSMutableArray array];
  switch (value & kUnderlineLineMask) {
    case NSUnderlineStyleSingle: [out addObject:@"single"]; break;
    case NSUnderlineStyleThick: [out addObject:@"thick"]; break;
    case NSUnderlineStyleDouble: [out addObject:@"double"]; break;
    default: break;   // 0，或者系统自己写进去的、头文件里没有名字的组合
  }
  switch (value & kUnderlinePatternMask) {
    case NSUnderlineStylePatternDot: [out addObject:@"patternDot"]; break;
    case NSUnderlineStylePatternDash: [out addObject:@"patternDash"]; break;
    case NSUnderlineStylePatternDashDot: [out addObject:@"patternDashDot"]; break;
    case NSUnderlineStylePatternDashDotDot: [out addObject:@"patternDashDotDot"]; break;
    default: break;
  }
  if (value & NSUnderlineStyleByWord) [out addObject:@"byWord"];
  return out;
}

// 名字的数组 → 数值。线型和虚线各至多一个：两个线型或起来（single | thick
// = 3）是头文件里没有的值，不交给系统去猜。
// 返回 false 表示出错，error 已经填好
static bool UnderlineFromNames(NSString* what, id value, NSInteger* out, std::string* error) {
  NSUnderlineStyle mask = NSUnderlineStyleNone;
  id bad = nil;
  if (!UnderlineStyleFromNames(value, &mask, &bad)) {
    *error = bad != nil
                 ? EnumError(what, bad, NamesForUnderlineStyle())
                 : [NSString stringWithFormat:
                       @"%@ must be an array of style names; expected any of: %@", what,
                       NamesForUnderlineStyle()].UTF8String;
    return false;
  }
  NSUInteger lines = 0;
  NSUInteger patterns = 0;
  for (NSString* name in (NSArray*)value) {
    if ([name isEqualToString:@"single"] || [name isEqualToString:@"thick"] ||
        [name isEqualToString:@"double"]) {
      lines++;
    } else if ([name hasPrefix:@"pattern"]) {
      patterns++;
    }
  }
  if (lines > 1) {
    *error = [NSString stringWithFormat:@"%@ takes at most one of single / thick / double", what]
                 .UTF8String;
    return false;
  }
  if (patterns > 1) {
    *error = [NSString stringWithFormat:
                 @"%@ takes at most one of patternDot / patternDash / patternDashDot / "
                 @"patternDashDotDot", what].UTF8String;
    return false;
  }
  *out = (NSInteger)mask;
  return true;
}

// ---- 取参 ----
// 下面几个函数返回 true 表示**值可用**，所以里面不能用 NACRE_NUM 那几个宏
// （宏失败时让所在函数返回「真」，在这里意思正好反了）

// 非负整数：下标、范围的位置和长度。上限收到 2^53 - 1（JS 里能精确表示的
// 最大整数）：原生是 64 位无符号数，而 JS 给得出 1e300 这样的数，直接转是
// 未定义行为
static bool AttrCount(NSString* what, id value, NSUInteger* out, std::string* error) {
  if (!RequireInteger(value, what, error)) return false;
  double d = SafeNumber(value);
  if (d < 0) {
    *error = [NSString stringWithFormat:@"%@ must be a non-negative integer", what].UTF8String;
    return false;
  }
  static const double kLargest = 9007199254740991.0;
  *out = (NSUInteger)(d > kLargest ? kLargest : d);
  return true;
}

// 下标。allowEnd 为 YES 时可以等于长度（插入的位置），否则必须指着一个码元。
// 越界 Foundation 会抛 NSRangeException；这里先查，报错里带上长度
static bool AttrIndex(NSString* what, id value, NSUInteger length, BOOL allowEnd,
                      NSUInteger* out, std::string* error) {
  if (!AttrCount(what, value, out, error)) return false;
  if (*out > length || (!allowEnd && *out == length)) {
    *error = [NSString stringWithFormat:@"%@ %lu is out of bounds; the string length is %lu",
                                        what, (unsigned long)*out, (unsigned long)length]
                 .UTF8String;
    return false;
  }
  return true;
}

// NSRange，过桥的是 { location, length }，必须整个落在 [0, length] 里
static bool AttrRange(NSString* what, id value, NSUInteger length, NSRange* out,
                      std::string* error) {
  if (![value isKindOfClass:NSDictionary.class]) {
    *error = [NSString stringWithFormat:@"%@ needs an object with location and length", what]
                 .UTF8String;
    return false;
  }
  NSDictionary* dict = (NSDictionary*)value;
  NSUInteger location = 0;
  NSUInteger count = 0;
  if (!AttrCount([what stringByAppendingString:@".location"], dict[@"location"], &location,
                 error)) {
    return false;
  }
  if (!AttrCount([what stringByAppendingString:@".length"], dict[@"length"], &count, error)) {
    return false;
  }
  // 两个数各自不超过 2^53，加起来不会溢出
  if (location + count > length) {
    *error = [NSString stringWithFormat:
                 @"%@ {%lu, %lu} is out of bounds; the string length is %lu", what,
                 (unsigned long)location, (unsigned long)count, (unsigned long)length]
                 .UTF8String;
    return false;
  }
  *out = NSMakeRange(location, count);
  return true;
}

static NSDictionary* AttrRangeToJSON(NSRange range) {
  return @{@"location": @(range.location), @"length": @(range.length)};
}

// 对象参数：对象不转换，必须是要求的那个类。nullable 为 NO 时 nil 也不行。
// scalar 是同一个下标上的标量位：JS 给的是字符串、数这类时对象位是空的，
// 要和「给了 null」分开——前者一律是类型不对
static bool AttrObject(id object, id scalar, Class cls, const char* className, bool nullable,
                       NSString* what, std::string* error) {
  BOOL scalarGiven = scalar != nil && scalar != NSNull.null;
  if (!scalarGiven && object == nil && nullable) return true;
  if (!scalarGiven && [object isKindOfClass:cls]) return true;
  ObjectTypeError(what.UTF8String, className, nullable, error);
  return false;
}

static bool NonNegative(double value, NSString* what, std::string* error) {
  if (value >= 0) return true;
  *error = [NSString stringWithFormat:@"%@ must be a non-negative number", what].UTF8String;
  return false;
}

// ---- 属性字典：JS → 原生 ----

// 一个属性的值。name 是 JS 那一侧的名字。返回 nil 表示出错，error 已经填好。
// 类型都由 JS 那一侧转好了，这里只校验
static id AttributeValue(NSString* name, id object, id scalar, std::string* error) {
  auto typed = [&](Class cls, const char* className) -> id {
    return AttrObject(object, scalar, cls, className, false, name, error) ? object : nil;
  };
  if ([name isEqualToString:@"font"]) return typed(UIFont.class, "UIFont");
  if ([name isEqualToString:@"foregroundColor"] || [name isEqualToString:@"backgroundColor"] ||
      [name isEqualToString:@"strokeColor"] || [name isEqualToString:@"underlineColor"] ||
      [name isEqualToString:@"strikethroughColor"]) {
    return typed(UIColor.class, "UIColor");
  }
  // 可改的对象存副本，见文件开头
  if ([name isEqualToString:@"paragraphStyle"]) {
    return [typed(NSParagraphStyle.class, "NSParagraphStyle") copy];
  }
  if ([name isEqualToString:@"shadow"]) return [typed(NSShadow.class, "NSShadow") copy];
  if ([name isEqualToString:@"attachment"]) {
    return typed(NSTextAttachment.class, "NSTextAttachment");
  }
  if ([name isEqualToString:@"ligature"]) {
    return RequireInteger(scalar, name, error) ? scalar : nil;
  }
  if ([name isEqualToString:@"kern"] || [name isEqualToString:@"tracking"] ||
      [name isEqualToString:@"strokeWidth"] || [name isEqualToString:@"baselineOffset"]) {
    return RequireNumber(scalar, name, error) ? scalar : nil;
  }
  if ([name isEqualToString:@"underlineStyle"] || [name isEqualToString:@"strikethroughStyle"]) {
    NSInteger mask = 0;
    return UnderlineFromNames(name, scalar, &mask, error) ? @(mask) : nil;
  }
  if ([name isEqualToString:@"link"]) {
    if (![scalar isKindOfClass:NSString.class]) {
      *error = "link needs a string";
      return nil;
    }
    // 头文件：NSURL (preferred) or NSString。按严格的规矩解析得出来就存
    // NSURL（它的 absoluteString 和写进来的串相同），解析不出来的原样存
    // 字符串——两种读回来都是写进去的那个串
    NSURL* url = [NSURL URLWithString:(NSString*)scalar encodingInvalidCharacters:NO];
    return url != nil ? (id)url : scalar;
  }
  *error = EnumError(@"attribute", name, NamesForAttributeKey());
  return nil;
}

// 参数包里从 start 开始的「键、值、键、值…」→ 属性字典。
// 返回 false 表示出错，error 已经填好
static bool AttributesFromArgs(const NacreArgs& args, NSUInteger start,
                               NSDictionary<NSAttributedStringKey, id>** out,
                               std::string* error) {
  NSMutableDictionary<NSAttributedStringKey, id>* attrs = [NSMutableDictionary dictionary];
  const NSUInteger count = args.values.count;
  if (count > start && (count - start) % 2 != 0) {
    *error = "attributes must arrive as name / value pairs";
    return false;
  }
  for (NSUInteger i = start; i + 1 < count; i += 2) {
    id name = args.value(i);
    NSAttributedStringKey key = AttributeKeyFromName(name);
    if (key == nil) {
      *error = EnumError(@"attribute", name, NamesForAttributeKey());
      return false;
    }
    id value = AttributeValue((NSString*)name, args.object(i + 1), args.value(i + 1), error);
    if (value == nil) return false;
    attrs[key] = value;
  }
  *out = attrs;
  return true;
}

// ---- 属性字典：原生 → JS ----

// 一个属性如果是对象，读出来用哪个 JS 类包它；不是对象的返回 nullptr。
// 值的类型不是这个键该有的（别人往富文本里放了我们不认识的东西）时把
// *skip 置成 YES，这个键不交给 JS
static const char* AttributeObjectClass(NSString* name, id value, BOOL* skip) {
  *skip = NO;
  auto expect = [&](Class cls, const char* className) -> const char* {
    if (![value isKindOfClass:cls]) *skip = YES;
    return className;
  };
  if ([name isEqualToString:@"font"]) return expect(UIFont.class, "UIFont");
  if ([name isEqualToString:@"foregroundColor"] || [name isEqualToString:@"backgroundColor"] ||
      [name isEqualToString:@"strokeColor"] || [name isEqualToString:@"underlineColor"] ||
      [name isEqualToString:@"strikethroughColor"]) {
    return expect(UIColor.class, "UIColor");
  }
  if ([name isEqualToString:@"paragraphStyle"]) {
    return expect(NSParagraphStyle.class, "NSParagraphStyle");
  }
  if ([name isEqualToString:@"shadow"]) return expect(NSShadow.class, "NSShadow");
  if ([name isEqualToString:@"attachment"]) {
    return expect(NSTextAttachment.class, "NSTextAttachment");
  }
  return nullptr;
}

// 一处的属性拆成两半。两个出参都可以是空：
//   info     { values: { 标量的键: 值 }, objects: [ 对象的键 ] }
//   refs     那几个对象，顺序和 objects 一样
// 不认识的键（系统自己加的、别的代码放的自定义键）不交给 JS
static void SplitAttributes(NSDictionary<NSAttributedStringKey, id>* attrs,
                            NSMutableDictionary* info,
                            std::vector<nacre::NativeObjectRef>* refs) {
  NSMutableDictionary* values = [NSMutableDictionary dictionary];
  NSMutableArray<NSString*>* objects = [NSMutableArray array];
  for (NSArray* pair in AttributeKeyPairs()) {
    NSString* name = pair[0];
    id value = attrs[(NSAttributedStringKey)pair[1]];
    if (value == nil) continue;
    BOOL skip = NO;
    const char* className = AttributeObjectClass(name, value, &skip);
    if (skip) continue;
    if (className != nullptr) {
      [objects addObject:name];
      if (refs != nullptr) {
        // 可改的对象给副本。不可变的段落样式 copy 返回它自己，所以同一处
        // 读两次是同一个对象
        id given = value;
        if ([name isEqualToString:@"paragraphStyle"] || [name isEqualToString:@"shadow"]) {
          given = [value copy];
        }
        refs->push_back({NacreKeep(given), className});
      }
      continue;
    }
    if ([name isEqualToString:@"underlineStyle"] || [name isEqualToString:@"strikethroughStyle"]) {
      if ([value isKindOfClass:NSNumber.class]) {
        values[name] = UnderlineNames([(NSNumber*)value integerValue]);
      }
    } else if ([name isEqualToString:@"link"]) {
      if ([value isKindOfClass:NSURL.class]) {
        values[name] = ((NSURL*)value).absoluteString ?: @"";
      } else if ([value isKindOfClass:NSString.class]) {
        values[name] = value;
      }
    } else if ([value isKindOfClass:NSNumber.class]) {
      values[name] = value;
    }
  }
  if (info != nil) {
    info[@"values"] = values;
    info[@"objects"] = objects;
  }
}

// 交给 JS 的富文本一律是不可变的快照，见文件开头：视图上读回来的、取出来的
// 一段、copy()。不可变的 copy 返回它自己。nil 交出去 JS 那一侧是 null
static nacre::NativeObjectRef SnapshotRef(NSAttributedString* text) {
  NSAttributedString* frozen = [text copy];
  return {NacreKeep(frozen), "NSAttributedString"};
}

// ---- 构造 ----
static bool AttributedConstruct(const std::string& className, const NacreArgs& args,
                                nacre::NativeObjectRef* out, std::string* error) {
  if (className == "NSAttributedString" || className == "NSMutableAttributedString") {
    const bool mutableOne = className == "NSMutableAttributedString";
    Class cls = mutableOne ? NSMutableAttributedString.class : NSAttributedString.class;
    if (args.values.count == 0) {
      *out = {NacreKeep([[cls alloc] init]), className};
      return true;
    }
    id source = args.object(0);
    if (source != nil) {
      if (![source isKindOfClass:NSAttributedString.class] || args.values.count != 1) {
        *error = className + " needs a string, or another NSAttributedString";
        return true;
      }
      *out = {NacreKeep([[cls alloc] initWithAttributedString:(NSAttributedString*)source]),
              className};
      return true;
    }
    id string = args.value(0);
    if (![string isKindOfClass:NSString.class]) {
      *error = className + " needs a string, or another NSAttributedString";
      return true;
    }
    NSDictionary<NSAttributedStringKey, id>* attrs = nil;
    if (!AttributesFromArgs(args, 1, &attrs, error)) return true;
    *out = {NacreKeep([[cls alloc] initWithString:(NSString*)string attributes:attrs]),
            className};
    return true;
  }
  if (className == "NSParagraphStyle") {
    *out = {NacreKeep([[NSParagraphStyle alloc] init]), className};
    return true;
  }
  if (className == "NSMutableParagraphStyle") {
    *out = {NacreKeep([[NSMutableParagraphStyle alloc] init]), className};
    return true;
  }
  if (className == "NSShadow") {
    *out = {NacreKeep([[NSShadow alloc] init]), className};
    return true;
  }
  if (className == "NSTextAttachment") {
    *out = {NacreKeep([[NSTextAttachment alloc] init]), className};
    return true;
  }
  return false;
}

// ---- 类方法 ----
static bool AttributedClassCallObject(const std::string& className, NSString* sel,
                                      const NacreArgs& args, nacre::NativeObjectRef* out,
                                      std::string* error) {
  if (className == "NSTextAttachment" && [sel isEqualToString:@"textAttachmentWithImage:"]) {
    id image = args.object(0);
    if (!AttrObject(image, args.value(0), UIImage.class, "UIImage", false,
                    @"textAttachmentWithImage", error)) {
      return true;
    }
    *out = {NacreKeep([NSTextAttachment textAttachmentWithImage:(UIImage*)image]),
            "NSTextAttachment"};
    return true;
  }
  if (className == "NSAttributedString" &&
      [sel isEqualToString:@"attributedStringWithAttachment:attributes:"]) {
    id attachment = args.object(0);
    if (!AttrObject(attachment, args.value(0), NSTextAttachment.class, "NSTextAttachment",
                    false, @"attributedStringWithAttachment", error)) {
      return true;
    }
    NSDictionary<NSAttributedStringKey, id>* attrs = nil;
    if (!AttributesFromArgs(args, 1, &attrs, error)) return true;
    *out = {NacreKeep([NSAttributedString
                attributedStringWithAttachment:(NSTextAttachment*)attachment
                                    attributes:attrs]),
            "NSAttributedString"};
    return true;
  }
  return false;
}

static nacre::NativeObjectRef AttributedClassObject(const std::string& className,
                                                    const std::string& name) {
  if (className == "NSParagraphStyle" && name == "defaultParagraphStyle") {
    return {NacreKeep(NSParagraphStyle.defaultParagraphStyle), "NSParagraphStyle"};
  }
  return {};
}

// ---- 标量属性 ----
static id ReadAttributedStringProperty(id object, NSString* key) {
  if ([object isKindOfClass:NSAttributedString.class]) {
    NSAttributedString* text = (NSAttributedString*)object;
    if ([key isEqualToString:@"string"]) return text.string ?: @"";
    if ([key isEqualToString:@"length"]) return @(text.length);
    return nil;
  }
  if ([object isKindOfClass:NSParagraphStyle.class]) {
    NSParagraphStyle* style = (NSParagraphStyle*)object;
    if ([key isEqualToString:@"alignment"]) {
      return NameForTextAlignment(style.alignment) ?: (id)NSNull.null;
    }
    if ([key isEqualToString:@"lineSpacing"]) return @(style.lineSpacing);
    if ([key isEqualToString:@"paragraphSpacing"]) return @(style.paragraphSpacing);
    if ([key isEqualToString:@"paragraphSpacingBefore"]) return @(style.paragraphSpacingBefore);
    if ([key isEqualToString:@"firstLineHeadIndent"]) return @(style.firstLineHeadIndent);
    if ([key isEqualToString:@"headIndent"]) return @(style.headIndent);
    if ([key isEqualToString:@"tailIndent"]) return @(style.tailIndent);
    if ([key isEqualToString:@"lineBreakMode"]) {
      return NameForLineBreakMode(style.lineBreakMode) ?: (id)NSNull.null;
    }
    if ([key isEqualToString:@"minimumLineHeight"]) return @(style.minimumLineHeight);
    if ([key isEqualToString:@"maximumLineHeight"]) return @(style.maximumLineHeight);
    if ([key isEqualToString:@"lineHeightMultiple"]) return @(style.lineHeightMultiple);
    if ([key isEqualToString:@"baseWritingDirection"]) {
      return NameForWritingDirection(style.baseWritingDirection) ?: (id)NSNull.null;
    }
    if ([key isEqualToString:@"hyphenationFactor"]) return @(style.hyphenationFactor);
    if ([key isEqualToString:@"defaultTabInterval"]) return @(style.defaultTabInterval);
    if ([key isEqualToString:@"allowsDefaultTighteningForTruncation"]) {
      return @(style.allowsDefaultTighteningForTruncation);
    }
    return nil;
  }
  if ([object isKindOfClass:NSShadow.class]) {
    NSShadow* shadow = (NSShadow*)object;
    if ([key isEqualToString:@"shadowOffset"]) return SizeToJSON(shadow.shadowOffset);
    if ([key isEqualToString:@"shadowBlurRadius"]) return @(shadow.shadowBlurRadius);
    return nil;
  }
  if ([object isKindOfClass:NSTextAttachment.class]) {
    if ([key isEqualToString:@"bounds"]) return RectToJSON(((NSTextAttachment*)object).bounds);
    return nil;
  }
  return nil;
}

static BOOL WriteAttributedStringProperty(id object, NSString* key, id value,
                                          std::string* error) {
  // 不可改的段落样式不在这里认领：JS 那一侧它没有 setter，走不到这里
  if ([object isKindOfClass:NSMutableParagraphStyle.class]) {
    NSMutableParagraphStyle* style = (NSMutableParagraphStyle*)object;
    if ([key isEqualToString:@"alignment"]) {
      NSTextAlignment out;
      if (!TextAlignmentFromName(value, &out)) {
        *error = EnumError(key, value, NamesForTextAlignment());
        return YES;
      }
      style.alignment = out;
      return YES;
    }
    if ([key isEqualToString:@"lineBreakMode"]) {
      NSLineBreakMode out;
      if (!LineBreakModeFromName(value, &out)) {
        *error = EnumError(key, value, NamesForLineBreakMode());
        return YES;
      }
      style.lineBreakMode = out;
      return YES;
    }
    if ([key isEqualToString:@"baseWritingDirection"]) {
      NSWritingDirection out;
      if (!WritingDirectionFromName(value, &out)) {
        *error = EnumError(key, value, NamesForWritingDirection());
        return YES;
      }
      style.baseWritingDirection = out;
      return YES;
    }
    // 下面这些量头文件都写着不能是负数（tailIndent 除外：负数是从右边量）
    if ([key isEqualToString:@"lineSpacing"]) {
      double v = NACRE_NUM(value, key);
      if (NonNegative(v, key, error)) style.lineSpacing = v;
      return YES;
    }
    if ([key isEqualToString:@"paragraphSpacing"]) {
      double v = NACRE_NUM(value, key);
      if (NonNegative(v, key, error)) style.paragraphSpacing = v;
      return YES;
    }
    if ([key isEqualToString:@"paragraphSpacingBefore"]) {
      double v = NACRE_NUM(value, key);
      if (NonNegative(v, key, error)) style.paragraphSpacingBefore = v;
      return YES;
    }
    if ([key isEqualToString:@"firstLineHeadIndent"]) {
      double v = NACRE_NUM(value, key);
      if (NonNegative(v, key, error)) style.firstLineHeadIndent = v;
      return YES;
    }
    if ([key isEqualToString:@"headIndent"]) {
      double v = NACRE_NUM(value, key);
      if (NonNegative(v, key, error)) style.headIndent = v;
      return YES;
    }
    if ([key isEqualToString:@"tailIndent"]) {
      style.tailIndent = NACRE_NUM(value, key);
      return YES;
    }
    if ([key isEqualToString:@"minimumLineHeight"]) {
      double v = NACRE_NUM(value, key);
      if (NonNegative(v, key, error)) style.minimumLineHeight = v;
      return YES;
    }
    if ([key isEqualToString:@"maximumLineHeight"]) {
      double v = NACRE_NUM(value, key);
      if (NonNegative(v, key, error)) style.maximumLineHeight = v;
      return YES;
    }
    if ([key isEqualToString:@"lineHeightMultiple"]) {
      double v = NACRE_NUM(value, key);
      if (NonNegative(v, key, error)) style.lineHeightMultiple = v;
      return YES;
    }
    if ([key isEqualToString:@"hyphenationFactor"]) {
      double v = NACRE_NUM(value, key);
      if (v < 0 || v > 1) {
        *error = "hyphenationFactor must be between 0 and 1";
        return YES;
      }
      style.hyphenationFactor = (float)v;
      return YES;
    }
    if ([key isEqualToString:@"defaultTabInterval"]) {
      double v = NACRE_NUM(value, key);
      if (NonNegative(v, key, error)) style.defaultTabInterval = v;
      return YES;
    }
    if ([key isEqualToString:@"allowsDefaultTighteningForTruncation"]) {
      style.allowsDefaultTighteningForTruncation = NACRE_BOOL(value, key);
      return YES;
    }
    return NO;
  }
  if ([object isKindOfClass:NSShadow.class]) {
    NSShadow* shadow = (NSShadow*)object;
    if ([key isEqualToString:@"shadowOffset"]) {
      shadow.shadowOffset = JSONToSize(value);
      return YES;
    }
    if ([key isEqualToString:@"shadowBlurRadius"]) {
      double v = NACRE_NUM(value, key);
      if (NonNegative(v, key, error)) shadow.shadowBlurRadius = v;
      return YES;
    }
    return NO;
  }
  if ([object isKindOfClass:NSTextAttachment.class]) {
    if ([key isEqualToString:@"bounds"]) {
      ((NSTextAttachment*)object).bounds = JSONToRect(value);
      return YES;
    }
    return NO;
  }
  return NO;
}

// ---- 对象属性 ----
static nacre::NativeObjectRef ReadAttributedStringObjectProperty(id object,
                                                                 const std::string& name) {
  if ([object isKindOfClass:UILabel.class]) {
    if (name == "attributedText") return SnapshotRef(((UILabel*)object).attributedText);
    return {};
  }
  if ([object isKindOfClass:UITextField.class]) {
    UITextField* field = (UITextField*)object;
    if (name == "attributedText") return SnapshotRef(field.attributedText);
    if (name == "attributedPlaceholder") return SnapshotRef(field.attributedPlaceholder);
    return {};
  }
  if ([object isKindOfClass:UITextView.class]) {
    if (name == "attributedText") return SnapshotRef(((UITextView*)object).attributedText);
    return {};
  }
  if ([object isKindOfClass:UIButton.class]) {
    if (name == "currentAttributedTitle") {
      return SnapshotRef(((UIButton*)object).currentAttributedTitle);
    }
    return {};
  }
  if ([object isKindOfClass:NSShadow.class]) {
    if (name == "shadowColor") {
      // 头文件里它的类型是 id。不是 UIColor 的（别的代码放了 CGColor 之类）
      // 交不出去，按没有处理
      id color = ((NSShadow*)object).shadowColor;
      return {NacreKeep([color isKindOfClass:UIColor.class] ? color : nil), "UIColor"};
    }
    return {};
  }
  if ([object isKindOfClass:NSTextAttachment.class]) {
    if (name == "image") return {NacreKeep(((NSTextAttachment*)object).image), "UIImage"};
    return {};
  }
  return {};
}

// 对象值的写入。照 Web IDL：对象不转换，null 可以，给了对象就得是要求的
// 那个类。这条通道返回 bool（认不认领），用不了 NACRE_OBJECT_OR_NIL
static bool WriteAttributedStringObjectProperty(id object, const std::string& name, id value,
                                                std::string* error) {
  auto attributed = [&]() -> bool {
    if (value == nil || [value isKindOfClass:NSAttributedString.class]) return true;
    ObjectTypeError(name, "NSAttributedString", true, error);
    return false;
  };
  if ([object isKindOfClass:UILabel.class]) {
    if (name == "attributedText") {
      if (attributed()) ((UILabel*)object).attributedText = (NSAttributedString*)value;
      return true;
    }
    return false;
  }
  if ([object isKindOfClass:UITextField.class]) {
    UITextField* field = (UITextField*)object;
    if (name == "attributedText") {
      if (attributed()) field.attributedText = (NSAttributedString*)value;
      return true;
    }
    if (name == "attributedPlaceholder") {
      if (attributed()) field.attributedPlaceholder = (NSAttributedString*)value;
      return true;
    }
    return false;
  }
  if ([object isKindOfClass:UITextView.class]) {
    if (name == "attributedText") {
      // 写 nil 的意思是清空。明确换成一个空的富文本，不依赖系统怎么
      // 处理 nil（头文件里这个属性标的是 null_resettable）
      if (attributed()) {
        ((UITextView*)object).attributedText =
            (NSAttributedString*)value ?: [[NSAttributedString alloc] init];
      }
      return true;
    }
    return false;
  }
  if ([object isKindOfClass:NSShadow.class]) {
    if (name == "shadowColor") {
      if (value != nil && ![value isKindOfClass:UIColor.class]) {
        ObjectTypeError(name, "UIColor", true, error);
        return true;
      }
      ((NSShadow*)object).shadowColor = value;
      return true;
    }
    return false;
  }
  if ([object isKindOfClass:NSTextAttachment.class]) {
    if (name == "image") {
      if (value != nil && ![value isKindOfClass:UIImage.class]) {
        ObjectTypeError(name, "UIImage", true, error);
        return true;
      }
      ((NSTextAttachment*)object).image = (UIImage*)value;
      return true;
    }
    return false;
  }
  return false;
}

// ---- 方法：返回标量或者没有返回值 ----

// 不可改的富文本也有的那些
static bool AttributedReadMethod(NSAttributedString* text, NSString* sel, const NacreArgs& args,
                                 std::string* out, std::string* error) {
  const NSUInteger length = text.length;
  // 读属性的前一半：标量的值，和哪些键是对象。后一半在 AttributedCallObjectArray
  if ([sel isEqualToString:@"nacre:attributesAtIndex:"]) {
    *out = "null";
    NSUInteger index = 0;
    if (!AttrIndex(@"attributesAtIndex index", args.value(0), length, NO, &index, error)) {
      return true;
    }
    NSMutableDictionary* info = [NSMutableDictionary dictionary];
    SplitAttributes([text attributesAtIndex:index effectiveRange:nullptr], info, nullptr);
    *out = EncodeJSON(info);
    return true;
  }
  // 按「属性相同的连续一段」切开。同样只给前一半
  if ([sel isEqualToString:@"nacre:runsInRange:"]) {
    *out = "null";
    NSRange range;
    if (!AttrRange(@"enumerateAttributesInRange range", args.value(0), length, &range, error)) {
      return true;
    }
    NSMutableArray* runs = [NSMutableArray array];
    [text enumerateAttributesInRange:range
                             options:0
                          usingBlock:^(NSDictionary<NSAttributedStringKey, id>* attrs,
                                       NSRange runRange, BOOL* stop) {
                            NSMutableDictionary* info = [NSMutableDictionary dictionary];
                            SplitAttributes(attrs, info, nullptr);
                            info[@"range"] = AttrRangeToJSON(runRange);
                            [runs addObject:info];
                          }];
    *out = EncodeJSON(runs);
    return true;
  }
  // nacre:ownership-exempt isEqualToAttributedString: —— 只比较，不持有
  if ([sel isEqualToString:@"isEqualToAttributedString:"]) {
    *out = "null";
    id other = args.object(0);
    if (!AttrObject(other, args.value(0), NSAttributedString.class, "NSAttributedString",
                    false, @"isEqualToAttributedString", error)) {
      return true;
    }
    *out = [text isEqualToAttributedString:(NSAttributedString*)other] ? "true" : "false";
    return true;
  }
  if ([sel isEqualToString:@"containsAttachmentsInRange:"]) {
    *out = "null";
    NSRange range;
    if (!AttrRange(@"containsAttachmentsInRange range", args.value(0), length, &range, error)) {
      return true;
    }
    *out = [text containsAttachmentsInRange:range] ? "true" : "false";
    return true;
  }
  if ([sel isEqualToString:@"size"]) {
    *out = EncodeJSON(SizeToJSON([text size]));
    return true;
  }
  if ([sel isEqualToString:@"boundingRectWithSize:options:context:"]) {
    *out = "null";
    NSStringDrawingOptions options = 0;
    id bad = nil;
    id given = args.value(1);
    if (!StringDrawingOptionsFromNames(given, &options, &bad)) {
      *error = bad != nil
                   ? EnumError(@"options", bad, NamesForStringDrawingOptions())
                   : [NSString stringWithFormat:
                         @"options must be an array of option names; expected any of: %@",
                         NamesForStringDrawingOptions()].UTF8String;
      return true;
    }
    CGRect rect = [text boundingRectWithSize:JSONToSize(args.value(0))
                                     options:options
                                     context:nil];
    *out = EncodeJSON(RectToJSON(rect));
    return true;
  }
  return false;
}

// 只有可改的富文本有的那些
static bool AttributedWriteMethod(NSMutableAttributedString* text, NSString* sel,
                                  const NacreArgs& args, std::string* out, std::string* error) {
  const NSUInteger length = text.length;
  auto source = [&](NSUInteger i, NSString* what) -> NSAttributedString* {
    id given = args.object(i);
    return AttrObject(given, args.value(i), NSAttributedString.class, "NSAttributedString",
                      false, what, error)
               ? (NSAttributedString*)given
               : nil;
  };
  if ([sel isEqualToString:@"replaceCharactersInRange:withString:"]) {
    *out = "null";
    NSRange range;
    if (!AttrRange(@"replaceCharactersInRange range", args.value(0), length, &range, error)) {
      return true;
    }
    id string = args.value(1);
    if (![string isKindOfClass:NSString.class]) {
      *error = "replaceCharactersInRange: withString needs a string";
      return true;
    }
    [text replaceCharactersInRange:range withString:(NSString*)string];
    return true;
  }
  if ([sel isEqualToString:@"replaceCharactersInRange:withAttributedString:"]) {
    *out = "null";
    NSRange range;
    if (!AttrRange(@"replaceCharactersInRange range", args.value(0), length, &range, error)) {
      return true;
    }
    NSAttributedString* other = source(1, @"replaceCharactersInRange: withAttributedString");
    if (other == nil) return true;
    // 自己换进自己里：先抄一份，不让系统边读边改同一个对象
    [text replaceCharactersInRange:range withAttributedString:[other copy]];
    return true;
  }
  // 属性在参数包里接在 range 后面，见文件开头
  if ([sel isEqualToString:@"setAttributes:range:"] ||
      [sel isEqualToString:@"addAttributes:range:"]) {
    *out = "null";
    const BOOL replacing = [sel isEqualToString:@"setAttributes:range:"];
    NSRange range;
    if (!AttrRange(replacing ? @"setAttributes range" : @"addAttributes range", args.value(0),
                   length, &range, error)) {
      return true;
    }
    NSDictionary<NSAttributedStringKey, id>* attrs = nil;
    if (!AttributesFromArgs(args, 1, &attrs, error)) return true;
    if (replacing) {
      [text setAttributes:attrs range:range];
    } else {
      [text addAttributes:attrs range:range];
    }
    return true;
  }
  if ([sel isEqualToString:@"removeAttribute:range:"]) {
    *out = "null";
    id name = args.value(0);
    NSAttributedStringKey key = AttributeKeyFromName(name);
    if (key == nil) {
      *error = EnumError(@"attribute", name, NamesForAttributeKey());
      return true;
    }
    NSRange range;
    if (!AttrRange(@"removeAttribute range", args.value(1), length, &range, error)) return true;
    [text removeAttribute:key range:range];
    return true;
  }
  if ([sel isEqualToString:@"appendAttributedString:"]) {
    *out = "null";
    NSAttributedString* other = source(0, @"appendAttributedString");
    if (other != nil) [text appendAttributedString:[other copy]];
    return true;
  }
  if ([sel isEqualToString:@"insertAttributedString:atIndex:"]) {
    *out = "null";
    NSAttributedString* other = source(0, @"insertAttributedString");
    if (other == nil) return true;
    NSUInteger index = 0;
    if (!AttrIndex(@"insertAttributedString atIndex", args.value(1), length, YES, &index,
                   error)) {
      return true;
    }
    [text insertAttributedString:[other copy] atIndex:index];
    return true;
  }
  if ([sel isEqualToString:@"deleteCharactersInRange:"]) {
    *out = "null";
    NSRange range;
    if (!AttrRange(@"deleteCharactersInRange range", args.value(0), length, &range, error)) {
      return true;
    }
    [text deleteCharactersInRange:range];
    return true;
  }
  if ([sel isEqualToString:@"setAttributedString:"]) {
    *out = "null";
    NSAttributedString* other = source(0, @"setAttributedString");
    if (other != nil) [text setAttributedString:[other copy]];
    return true;
  }
  return false;
}

static bool AttributedCallMethod(id object, NSString* sel, const NacreArgs& args,
                                 std::string* out, std::string* error) {
  if ([object isKindOfClass:NSAttributedString.class]) {
    if (AttributedReadMethod((NSAttributedString*)object, sel, args, out, error)) return true;
    if ([object isKindOfClass:NSMutableAttributedString.class]) {
      return AttributedWriteMethod((NSMutableAttributedString*)object, sel, args, out, error);
    }
    return false;
  }
  if ([object isKindOfClass:NSMutableParagraphStyle.class]) {
    // nacre:ownership-exempt setParagraphStyle: —— 把属性值抄过来，之后和参数没有关系
    if ([sel isEqualToString:@"setParagraphStyle:"]) {
      *out = "null";
      id other = args.object(0);
      if (AttrObject(other, args.value(0), NSParagraphStyle.class, "NSParagraphStyle", false,
                     @"setParagraphStyle", error)) {
        [(NSMutableParagraphStyle*)object setParagraphStyle:(NSParagraphStyle*)other];
      }
      return true;
    }
    return false;
  }
  if ([object isKindOfClass:UIButton.class]) {
    if ([sel isEqualToString:@"setAttributedTitle:forState:"]) {
      *out = "null";
      id title = args.object(0);
      if (!AttrObject(title, args.value(0), NSAttributedString.class, "NSAttributedString",
                      true, @"setAttributedTitle", error)) {
        return true;
      }
      UIControlState state = UIControlStateNormal;
      id bad = nil;
      if (!ControlStateArgFromNames(args.value(1), &state, &bad)) {
        *error = bad != nil
                     ? EnumError(@"state", bad, NamesForControlStateArg())
                     : [NSString stringWithFormat:
                           @"state needs an array of state names; expected any of: %@",
                           NamesForControlStateArg()].UTF8String;
        return true;
      }
      [(UIButton*)object setAttributedTitle:(NSAttributedString*)title forState:state];
      return true;
    }
    return false;
  }
  return false;
}

// ---- 方法：返回一个对象 ----
static bool AttributedCallObject(id object, NSString* sel, const NacreArgs& args,
                                 nacre::NativeObjectRef* out, std::string* error) {
  if ([object isKindOfClass:NSAttributedString.class]) {
    NSAttributedString* text = (NSAttributedString*)object;
    if ([sel isEqualToString:@"attributedSubstringFromRange:"]) {
      NSRange range;
      if (!AttrRange(@"attributedSubstringFromRange range", args.value(0), text.length, &range,
                     error)) {
        return true;
      }
      // 可改的富文本上取出来的也给不可改的
      *out = SnapshotRef([text attributedSubstringFromRange:range]);
      return true;
    }
    if ([sel isEqualToString:@"copy"]) {
      *out = SnapshotRef(text);
      return true;
    }
    if ([sel isEqualToString:@"mutableCopy"]) {
      *out = {NacreKeep([text mutableCopy]), "NSMutableAttributedString"};
      return true;
    }
    return false;
  }
  if ([object isKindOfClass:NSParagraphStyle.class]) {
    NSParagraphStyle* style = (NSParagraphStyle*)object;
    if ([sel isEqualToString:@"copy"]) {
      *out = {NacreKeep([style copy]), "NSParagraphStyle"};
      return true;
    }
    if ([sel isEqualToString:@"mutableCopy"]) {
      *out = {NacreKeep([style mutableCopy]), "NSMutableParagraphStyle"};
      return true;
    }
    return false;
  }
  if ([object isKindOfClass:UIButton.class]) {
    if ([sel isEqualToString:@"attributedTitleForState:"]) {
      UIControlState state = UIControlStateNormal;
      id bad = nil;
      if (!ControlStateArgFromNames(args.value(0), &state, &bad)) {
        *error = bad != nil
                     ? EnumError(@"state", bad, NamesForControlStateArg())
                     : [NSString stringWithFormat:
                           @"state needs an array of state names; expected any of: %@",
                           NamesForControlStateArg()].UTF8String;
        return true;
      }
      *out = SnapshotRef([(UIButton*)object attributedTitleForState:state]);
      return true;
    }
    return false;
  }
  return false;
}

// ---- 方法：返回一组对象 ----
// 读属性的后一半：对象值，顺序和前一半里的 objects 一样
static bool AttributedCallObjectArray(id object, NSString* sel, const NacreArgs& args,
                                      std::vector<nacre::NativeObjectRef>* out,
                                      std::string* error) {
  if (![object isKindOfClass:NSAttributedString.class]) return false;
  NSAttributedString* text = (NSAttributedString*)object;
  if ([sel isEqualToString:@"nacre:attributeObjectsAtIndex:"]) {
    NSUInteger index = 0;
    if (!AttrIndex(@"attributesAtIndex index", args.value(0), text.length, NO, &index, error)) {
      return true;
    }
    SplitAttributes([text attributesAtIndex:index effectiveRange:nullptr], nil, out);
    return true;
  }
  if ([sel isEqualToString:@"nacre:runObjectsInRange:"]) {
    NSRange range;
    if (!AttrRange(@"enumerateAttributesInRange range", args.value(0), text.length, &range,
                   error)) {
      return true;
    }
    [text enumerateAttributesInRange:range
                             options:0
                          usingBlock:^(NSDictionary<NSAttributedStringKey, id>* attrs,
                                       NSRange runRange, BOOL* stop) {
                            SplitAttributes(attrs, nil, out);
                          }];
    return true;
  }
  return false;
}

}  // namespace nacre_bridge

// ---- 登记 ----
// 前四个是这个域自己的类；后四个是别的域的视图类，列进来只为了认领加在
// 它们上面的那几个成员
@interface NacreAttributedStringDomain : NSObject
@end
@implementation NacreAttributedStringDomain
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "attributed-string";
  d.classes = {NSAttributedString.class, NSParagraphStyle.class, NSShadow.class,
               NSTextAttachment.class, UILabel.class, UITextField.class, UITextView.class,
               UIButton.class};
  d.read = nacre_bridge::ReadAttributedStringProperty;
  d.write = nacre_bridge::WriteAttributedStringProperty;
  d.readObject = nacre_bridge::ReadAttributedStringObjectProperty;
  d.writeObject = nacre_bridge::WriteAttributedStringObjectProperty;
  d.call = nacre_bridge::AttributedCallMethod;
  d.callObject = nacre_bridge::AttributedCallObject;
  d.callObjectArray = nacre_bridge::AttributedCallObjectArray;
  d.construct = nacre_bridge::AttributedConstruct;
  d.classCallObject = nacre_bridge::AttributedClassCallObject;
  d.classObject = nacre_bridge::AttributedClassObject;
  nacre_bridge::NacreRegisterDomain(d);
}
@end
