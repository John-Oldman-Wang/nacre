// JS 侧的字符串 ↔ ObjC 的数值。还有字重、文本样式、布局优先级，
// 它们在 ObjC 里不是枚举，但 JS 侧一视同仁用字符串。
// 顺带放 Auto Layout 的锚点辅助——锚点的类名也是一种「名字 ↔ 类型」的映射。

#import "NacreBridge.h"

#import <os/log.h>

namespace nacre_bridge {

NSString* JoinEnumNames(NSDictionary<NSString*, NSNumber*>* table) {
  NSArray<NSString*>* keys =
      [table.allKeys sortedArrayUsingComparator:^NSComparisonResult(NSString* a,
                                                                    NSString* b) {
        return [table[a] compare:table[b]];
      }];
  return [keys componentsJoinedByString:@" / "];
}

// 枚举名不认识时给 JS 的那句话。和 JS 侧属性写入的措辞保持一致。
std::string EnumError(NSString* what, id given, NSString* choices) {
  NSString* shown = [given isKindOfClass:NSString.class]
                        ? [NSString stringWithFormat:@"\"%@\"", given]
                        : (given == nil ? @"undefined" : [given description]);
  return [NSString stringWithFormat:@"%@ has no value %@; expected one of: %@", what, shown, choices]
      .UTF8String;
}

#define NACRE_ENUM_MAP(FuncName, Type, ...)                                   \
  static NSDictionary<NSString*, NSNumber*>* FuncName##Table(void) {          \
    static NSDictionary<NSString*, NSNumber*>* table;                         \
    static dispatch_once_t once;                                              \
    dispatch_once(&once, ^{ table = @{__VA_ARGS__}; });                       \
    return table;                                                             \
  }                                                                           \
  BOOL FuncName##FromName(NSString* name, Type* out) {                        \
    if (![name isKindOfClass:NSString.class]) return NO;                      \
    NSNumber* v = FuncName##Table()[name];                                    \
    if (v == nil) return NO;                                                  \
    *out = (Type)v.integerValue;                                              \
    return YES;                                                               \
  }                                                                           \
  NSString* NameFor##FuncName(Type value) {                                   \
    NSDictionary<NSString*, NSNumber*>* table = FuncName##Table();            \
    for (NSString* key in table) {                                            \
      if (table[key].integerValue == (NSInteger)value) return key;            \
    }                                                                         \
    return nil;                                                               \
  }                                                                           \
  NSString* NamesFor##FuncName(void) { return JoinEnumNames(FuncName##Table()); }

NACRE_ENUM_MAP(TextAlignment, NSTextAlignment,
               @"left": @(NSTextAlignmentLeft),
               @"center": @(NSTextAlignmentCenter),
               @"right": @(NSTextAlignmentRight),
               @"justified": @(NSTextAlignmentJustified),
               @"natural": @(NSTextAlignmentNatural))

NACRE_ENUM_MAP(LineBreakMode, NSLineBreakMode,
               @"byWordWrapping": @(NSLineBreakByWordWrapping),
               @"byCharWrapping": @(NSLineBreakByCharWrapping),
               @"byClipping": @(NSLineBreakByClipping),
               @"byTruncatingHead": @(NSLineBreakByTruncatingHead),
               @"byTruncatingTail": @(NSLineBreakByTruncatingTail),
               @"byTruncatingMiddle": @(NSLineBreakByTruncatingMiddle))

NACRE_ENUM_MAP(ContentMode, UIViewContentMode,
               @"scaleToFill": @(UIViewContentModeScaleToFill),
               @"scaleAspectFit": @(UIViewContentModeScaleAspectFit),
               @"scaleAspectFill": @(UIViewContentModeScaleAspectFill),
               @"redraw": @(UIViewContentModeRedraw),
               @"center": @(UIViewContentModeCenter),
               @"top": @(UIViewContentModeTop),
               @"bottom": @(UIViewContentModeBottom),
               @"left": @(UIViewContentModeLeft),
               @"right": @(UIViewContentModeRight),
               @"topLeft": @(UIViewContentModeTopLeft),
               @"topRight": @(UIViewContentModeTopRight),
               @"bottomLeft": @(UIViewContentModeBottomLeft),
               @"bottomRight": @(UIViewContentModeBottomRight))

NACRE_ENUM_MAP(BaselineAdjustment, UIBaselineAdjustment,
               @"alignBaselines": @(UIBaselineAdjustmentAlignBaselines),
               @"alignCenters": @(UIBaselineAdjustmentAlignCenters),
               @"none": @(UIBaselineAdjustmentNone))

// 图片的方向。相机拍出来的图常常是「横着存、靠这个标记转正」的，
// 所以读 size 和读方向要一起看：size 已经反映了方向。
NACRE_ENUM_MAP(ImageOrientation, UIImageOrientation,
               @"up": @(UIImageOrientationUp),
               @"down": @(UIImageOrientationDown),
               @"left": @(UIImageOrientationLeft),
               @"right": @(UIImageOrientationRight),
               @"upMirrored": @(UIImageOrientationUpMirrored),
               @"downMirrored": @(UIImageOrientationDownMirrored),
               @"leftMirrored": @(UIImageOrientationLeftMirrored),
               @"rightMirrored": @(UIImageOrientationRightMirrored))

// 模板图：忽略原图颜色，整张按 tintColor 上色。SF Symbols 默认走这个。
NACRE_ENUM_MAP(ImageRenderingMode, UIImageRenderingMode,
               @"automatic": @(UIImageRenderingModeAutomatic),
               @"alwaysOriginal": @(UIImageRenderingModeAlwaysOriginal),
               @"alwaysTemplate": @(UIImageRenderingModeAlwaysTemplate))

// 九宫格的中间那块怎么填。注意这个枚举的数值**随 ABI 变**
// （TARGET_ABI_USES_IOS_VALUES：iOS 上 Tile=0，别处 Stretch=0），
// 正好又一次说明名字↔数值的映射只能放在原生层。
NACRE_ENUM_MAP(ImageResizingMode, UIImageResizingMode,
               @"tile": @(UIImageResizingModeTile),
               @"stretch": @(UIImageResizingModeStretch))

// ---- Auto Layout ----
//
// 一条约束就是 item1.attr1 <关系> multiplier × item2.attr2 + constant。
// 关系只有三个值，JS 侧不单独写它——它编在方法名里（constraintEqualTo…），
// 读 constraint.relation 时才需要人话。
NACRE_ENUM_MAP(LayoutRelation, NSLayoutRelation,
               @"lessThanOrEqual": @(NSLayoutRelationLessThanOrEqual),
               @"equal": @(NSLayoutRelationEqual),
               @"greaterThanOrEqual": @(NSLayoutRelationGreaterThanOrEqual))

// 约束的两端各自约束的是什么。JS 侧不用它建约束（锚点覆盖了全部组合），
// 只在读 firstAttribute / secondAttribute 时用到。
NACRE_ENUM_MAP(LayoutAttribute, NSLayoutAttribute,
               @"left": @(NSLayoutAttributeLeft),
               @"right": @(NSLayoutAttributeRight),
               @"top": @(NSLayoutAttributeTop),
               @"bottom": @(NSLayoutAttributeBottom),
               @"leading": @(NSLayoutAttributeLeading),
               @"trailing": @(NSLayoutAttributeTrailing),
               @"width": @(NSLayoutAttributeWidth),
               @"height": @(NSLayoutAttributeHeight),
               @"centerX": @(NSLayoutAttributeCenterX),
               @"centerY": @(NSLayoutAttributeCenterY),
               @"lastBaseline": @(NSLayoutAttributeLastBaseline),
               @"firstBaseline": @(NSLayoutAttributeFirstBaseline),
               @"leftMargin": @(NSLayoutAttributeLeftMargin),
               @"rightMargin": @(NSLayoutAttributeRightMargin),
               @"topMargin": @(NSLayoutAttributeTopMargin),
               @"bottomMargin": @(NSLayoutAttributeBottomMargin),
               @"leadingMargin": @(NSLayoutAttributeLeadingMargin),
               @"trailingMargin": @(NSLayoutAttributeTrailingMargin),
               @"centerXWithinMargins": @(NSLayoutAttributeCenterXWithinMargins),
               @"centerYWithinMargins": @(NSLayoutAttributeCenterYWithinMargins),
               @"notAnAttribute": @(NSLayoutAttributeNotAnAttribute))

NACRE_ENUM_MAP(LayoutConstraintAxis, UILayoutConstraintAxis,
               @"horizontal": @(UILayoutConstraintAxisHorizontal),
               @"vertical": @(UILayoutConstraintAxisVertical))

// UILayoutPriority 是 float 不是枚举，具名值只有七个，中间的值（749、1）
// 没有名字。所以**写接受字符串或数字，读永远返回数字**——给不出名字的值
// 要硬编成字符串，就只能编一个出来。
static NSDictionary<NSString*, NSNumber*>* LayoutPriorityTable(void) {
  static NSDictionary<NSString*, NSNumber*>* table;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    table = @{
      @"required": @(UILayoutPriorityRequired),
      @"defaultHigh": @(UILayoutPriorityDefaultHigh),
      @"dragThatCanResizeScene": @(UILayoutPriorityDragThatCanResizeScene),
      @"sceneSizeStayPut": @(UILayoutPrioritySceneSizeStayPut),
      @"dragThatCannotResizeScene": @(UILayoutPriorityDragThatCannotResizeScene),
      @"defaultLow": @(UILayoutPriorityDefaultLow),
      @"fittingSizeLevel": @(UILayoutPriorityFittingSizeLevel),
    };
  });
  return table;
}

BOOL LayoutPriorityFromValue(id value, UILayoutPriority* out) {
  if ([value isKindOfClass:NSNumber.class]) {
    *out = [value floatValue];
    return YES;
  }
  if (![value isKindOfClass:NSString.class]) return NO;
  NSNumber* v = LayoutPriorityTable()[value];
  if (v == nil) return NO;
  *out = v.floatValue;
  return YES;
}

NSString* NamesForLayoutPriority(void) {
  return [JoinEnumNames(LayoutPriorityTable())
      stringByAppendingString:@", or a number between 0 and 1000"];
}

// 锚点分三类，不能互连——topAnchor 连 leadingAnchor，原生抛
// NSInvalidArgumentException。类名既是 JS 侧的包装类，也是类型检查的依据。
const char* AnchorClassName(NSLayoutAnchor* anchor) {
  if ([anchor isKindOfClass:NSLayoutDimension.class]) return "NSLayoutDimension";
  if ([anchor isKindOfClass:NSLayoutXAxisAnchor.class]) return "NSLayoutXAxisAnchor";
  if ([anchor isKindOfClass:NSLayoutYAxisAnchor.class]) return "NSLayoutYAxisAnchor";
  return "NSLayoutAnchor";
}

// UIView 有 12 个锚点，UILayoutGuide 有 10 个（没有基线——guide 没有文字）。
// 两者没有公共协议，所以分开写。
nacre::NativeObjectRef AnchorNamed(id owner, const std::string& name) {
  NSLayoutAnchor* a = nil;
  if ([owner isKindOfClass:UIView.class]) {
    UIView* v = (UIView*)owner;
    if (name == "leadingAnchor") a = v.leadingAnchor;
    else if (name == "trailingAnchor") a = v.trailingAnchor;
    else if (name == "leftAnchor") a = v.leftAnchor;
    else if (name == "rightAnchor") a = v.rightAnchor;
    else if (name == "topAnchor") a = v.topAnchor;
    else if (name == "bottomAnchor") a = v.bottomAnchor;
    else if (name == "widthAnchor") a = v.widthAnchor;
    else if (name == "heightAnchor") a = v.heightAnchor;
    else if (name == "centerXAnchor") a = v.centerXAnchor;
    else if (name == "centerYAnchor") a = v.centerYAnchor;
    else if (name == "firstBaselineAnchor") a = v.firstBaselineAnchor;
    else if (name == "lastBaselineAnchor") a = v.lastBaselineAnchor;
  } else if ([owner isKindOfClass:UILayoutGuide.class]) {
    UILayoutGuide* g = (UILayoutGuide*)owner;
    if (name == "leadingAnchor") a = g.leadingAnchor;
    else if (name == "trailingAnchor") a = g.trailingAnchor;
    else if (name == "leftAnchor") a = g.leftAnchor;
    else if (name == "rightAnchor") a = g.rightAnchor;
    else if (name == "topAnchor") a = g.topAnchor;
    else if (name == "bottomAnchor") a = g.bottomAnchor;
    else if (name == "widthAnchor") a = g.widthAnchor;
    else if (name == "heightAnchor") a = g.heightAnchor;
    else if (name == "centerXAnchor") a = g.centerXAnchor;
    else if (name == "centerYAnchor") a = g.centerYAnchor;
  }
  if (a == nil) return {};
  return {(__bridge void*)a, AnchorClassName(a)};
}

// 字体的粗细和文本样式不是枚举，是 CGFloat / NSString 常量，
// 但 JS 侧一样用字符串，所以放在一起。
// 字重的值是 CGFloat 不是整数，所以不能用上面那个宏，但规矩一样：
// 查不到返回 NO，可选值列表和查表用同一份数据。
static NSDictionary<NSString*, NSNumber*>* FontWeightTable(void) {
  static NSDictionary<NSString*, NSNumber*>* table;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    table = @{
      @"ultraLight": @(UIFontWeightUltraLight), @"thin": @(UIFontWeightThin),
      @"light": @(UIFontWeightLight), @"regular": @(UIFontWeightRegular),
      @"medium": @(UIFontWeightMedium), @"semibold": @(UIFontWeightSemibold),
      @"bold": @(UIFontWeightBold), @"heavy": @(UIFontWeightHeavy),
      @"black": @(UIFontWeightBlack),
    };
  });
  return table;
}

BOOL FontWeightFromName(NSString* name, UIFontWeight* out) {
  if (![name isKindOfClass:NSString.class]) return NO;
  NSNumber* v = FontWeightTable()[name];
  if (v == nil) return NO;
  *out = v.doubleValue;
  return YES;
}

NSString* NamesForFontWeight(void) { return JoinEnumNames(FontWeightTable()); }

// 文本样式的值是 NSString 常量，排不出数值顺序，而错误信息里的可选值又
// 需要一个稳定的顺序，所以这里用有序的「名字, 常量」数组而不是字典字面量。
// 查表和列名字都从这一份派生——两份数据迟早会漂。
// 顺序按字号从大到小，和 Apple 文档里的排法一致。
static NSArray<NSArray*>* TextStylePairs(void) {
  static NSArray<NSArray*>* pairs;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    pairs = @[
      @[ @"largeTitle", UIFontTextStyleLargeTitle ],
      @[ @"title1", UIFontTextStyleTitle1 ],
      @[ @"title2", UIFontTextStyleTitle2 ],
      @[ @"title3", UIFontTextStyleTitle3 ],
      @[ @"headline", UIFontTextStyleHeadline ],
      @[ @"subheadline", UIFontTextStyleSubheadline ],
      @[ @"body", UIFontTextStyleBody ],
      @[ @"callout", UIFontTextStyleCallout ],
      @[ @"footnote", UIFontTextStyleFootnote ],
      @[ @"caption1", UIFontTextStyleCaption1 ],
      @[ @"caption2", UIFontTextStyleCaption2 ],
    ];
  });
  return pairs;
}

UIFontTextStyle TextStyleFromName(NSString* name) {
  if (![name isKindOfClass:NSString.class]) return nil;
  for (NSArray* pair in TextStylePairs()) {
    if ([pair[0] isEqualToString:name]) return pair[1];
  }
  return nil;
}

NSString* NamesForTextStyle(void) {
  NSMutableArray<NSString*>* names = [NSMutableArray array];
  for (NSArray* pair in TextStylePairs()) [names addObject:pair[0]];
  return [names componentsJoinedByString:@" / "];
}

// 属性分发表。加一个属性只要在这里加一行，不用动 C++ 的桥。
// 这是手写方案，撑得过 scene / window 这几个类；到 UIView 那一层
// （成百上千个属性）就必须换成通用的能力暴露方案了。

}  // namespace nacre_bridge
