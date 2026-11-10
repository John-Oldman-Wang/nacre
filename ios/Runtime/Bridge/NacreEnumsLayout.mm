// Auto Layout、锚点、优先级、UIStackView
//
// 字符串 ↔ 数值的映射。
//
// 名字 ↔ 数值只能放原生层：数值随 ABI 变（NSTextAlignment 在 iOS 上
// Center 是 1、macOS 上是 2），JS 里按下标映射换个平台就全错。
// 宏在 NacreBridge.h 里，所以每个能力域可以单独成文件。
#import "NacreBridge.h"

namespace nacre_bridge {

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

NACRE_ENUM_MAP(StackDistribution, UIStackViewDistribution,
               @"fill": @(UIStackViewDistributionFill),
               @"fillEqually": @(UIStackViewDistributionFillEqually),
               @"fillProportionally": @(UIStackViewDistributionFillProportionally),
               @"equalSpacing": @(UIStackViewDistributionEqualSpacing),
               @"equalCentering": @(UIStackViewDistributionEqualCentering))

// UIStackViewAlignment 是第一个一个值挂两个名字的枚举。头文件原话：
//   UIStackViewAlignmentTop    = UIStackViewAlignmentLeading    （都是 1）
//   UIStackViewAlignmentBottom = UIStackViewAlignmentTrailing   （都是 5）
// 别名是真实的能力——照 Apple 文档写 .top 必须认——但读出来只能有一个确定的
// 答案，不能看字典的遍历顺序。所以用有序数组：主名在前、别名在后，NameFor
// 取第一个命中的。主名取 leading / trailing 那一侧，因为头文件里是
// Top = Leading，前者才是声明，后者是别名。
static NSArray<NSArray*>* StackAlignmentPairs(void) {
  static NSArray<NSArray*>* pairs;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    pairs = @[
      @[ @"fill", @(UIStackViewAlignmentFill) ],
      @[ @"leading", @(UIStackViewAlignmentLeading) ],
      @[ @"firstBaseline", @(UIStackViewAlignmentFirstBaseline) ],
      @[ @"center", @(UIStackViewAlignmentCenter) ],
      @[ @"trailing", @(UIStackViewAlignmentTrailing) ],
      @[ @"lastBaseline", @(UIStackViewAlignmentLastBaseline) ],
      // 以下是别名：写得进去，读不出来
      @[ @"top", @(UIStackViewAlignmentTop) ],
      @[ @"bottom", @(UIStackViewAlignmentBottom) ],
    ];
  });
  return pairs;
}

BOOL StackAlignmentFromName(NSString* name, UIStackViewAlignment* out) {
  if (![name isKindOfClass:NSString.class]) return NO;
  for (NSArray* pair in StackAlignmentPairs()) {
    if ([pair[0] isEqualToString:name]) {
      *out = (UIStackViewAlignment)[pair[1] integerValue];
      return YES;
    }
  }
  return NO;
}

NSString* NameForStackAlignment(UIStackViewAlignment value) {
  for (NSArray* pair in StackAlignmentPairs()) {
    if ([pair[1] integerValue] == (NSInteger)value) return pair[0];
  }
  return nil;
}

NSString* NamesForStackAlignment(void) {
  NSMutableArray<NSString*>* names = [NSMutableArray array];
  for (NSArray* pair in StackAlignmentPairs()) [names addObject:pair[0]];
  return [names componentsJoinedByString:@" / "];
}

// spacing 的哨兵值 ↔ JS 的字符串。== 比较浮点在这里是对的：这两个值是
// 原样存进属性的令牌，不参与任何算术，UIKit 自己也是这么比的。
BOOL StackSpacingFromValue(id value, CGFloat* out, BOOL allowDefault) {
  if ([value isKindOfClass:NSString.class]) {
    if ([value isEqualToString:@"system"]) {
      *out = UIStackViewSpacingUseSystem;
      return YES;
    }
    if (allowDefault && [value isEqualToString:@"default"]) {
      *out = UIStackViewSpacingUseDefault;
      return YES;
    }
    return NO;
  }
  if (![value isKindOfClass:NSNumber.class]) return NO;
  *out = [value doubleValue];
  return YES;
}

id ValueForStackSpacing(CGFloat spacing) {
  if (spacing == UIStackViewSpacingUseSystem) return @"system";
  if (spacing == UIStackViewSpacingUseDefault) return @"default";
  return @(spacing);
}

NSString* NamesForStackSpacing(BOOL allowDefault) {
  return allowDefault ? @"a number / \"system\" / \"default\""
                      : @"a number / \"system\"";
}

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

}  // namespace nacre_bridge
