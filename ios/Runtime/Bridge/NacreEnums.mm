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

// 位掩码。一个数值拆成一组名字，所以 JS 侧是字符串数组。
// 单值枚举那套宏不够用：它一个名字对一个值，这里要双向拆合。
#define NACRE_MASK_MAP(FuncName, Type, ...)                                   \
  static NSDictionary<NSString*, NSNumber*>* FuncName##Table(void) {          \
    static NSDictionary<NSString*, NSNumber*>* table;                         \
    static dispatch_once_t once;                                              \
    dispatch_once(&once, ^{ table = @{__VA_ARGS__}; });                       \
    return table;                                                             \
  }                                                                           \
  BOOL FuncName##FromNames(id value, Type* out, id* bad) {                    \
    *bad = nil;                                                               \
    /* 「不是数组」和「名字不认识」是两种错，要分开报 */                        \
    if (![value isKindOfClass:NSArray.class]) return NO;                      \
    NSDictionary<NSString*, NSNumber*>* table = FuncName##Table();            \
    Type mask = (Type)0;                                                      \
    for (id name in (NSArray*)value) {                                        \
      NSNumber* bit = [name isKindOfClass:NSString.class] ? table[name] : nil; \
      if (bit == nil) { *bad = name; return NO; }                             \
      mask = (Type)(mask | (Type)bit.unsignedIntegerValue);                   \
    }                                                                         \
    *out = mask;                                                              \
    return YES;                                                               \
  }                                                                           \
  NSArray<NSString*>* NamesIn##FuncName(Type value) {                         \
    NSDictionary<NSString*, NSNumber*>* table = FuncName##Table();            \
    NSArray<NSString*>* keys = [table.allKeys                                 \
        sortedArrayUsingComparator:^NSComparisonResult(NSString* a, NSString* b) { \
          return [table[a] compare:table[b]];                                 \
        }];                                                                   \
    NSMutableArray<NSString*>* out = [NSMutableArray array];                  \
    for (NSString* key in keys) {                                             \
      if (value & (Type)table[key].unsignedIntegerValue) [out addObject:key]; \
    }                                                                         \
    return out;                                                               \
  }                                                                           \
  NSString* NamesFor##FuncName(void) { return JoinEnumNames(FuncName##Table()); }

// 哪几个角要圆。名字是 ObjC 常量去掉 kCALayer 前缀和 Corner 后缀。
// UIKit 的 y 轴朝下，所以 MinY 是上边：minXMinY 就是左上角。
NACRE_MASK_MAP(CornerMask, CACornerMask,
               @"minXMinY": @(kCALayerMinXMinYCorner),
               @"maxXMinY": @(kCALayerMaxXMinYCorner),
               @"minXMaxY": @(kCALayerMinXMaxYCorner),
               @"maxXMaxY": @(kCALayerMaxXMaxYCorner))

// 控件事件。16 个具体事件，另外 5 个是聚合掩码（AllTouchEvents 之类），
// 不暴露——JS 侧一次订阅一个类型。
//
// 名字是 ObjC 常量去掉 UIControlEvent 前缀、首字母小写。
NACRE_ENUM_MAP(ControlEvent, UIControlEvents,
               @"touchDown": @(UIControlEventTouchDown),
               @"touchDownRepeat": @(UIControlEventTouchDownRepeat),
               @"touchDragInside": @(UIControlEventTouchDragInside),
               @"touchDragOutside": @(UIControlEventTouchDragOutside),
               @"touchDragEnter": @(UIControlEventTouchDragEnter),
               @"touchDragExit": @(UIControlEventTouchDragExit),
               @"touchUpInside": @(UIControlEventTouchUpInside),
               @"touchUpOutside": @(UIControlEventTouchUpOutside),
               @"touchCancel": @(UIControlEventTouchCancel),
               @"valueChanged": @(UIControlEventValueChanged),
               @"primaryActionTriggered": @(UIControlEventPrimaryActionTriggered),
               @"menuActionTriggered": @(UIControlEventMenuActionTriggered),
               @"editingDidBegin": @(UIControlEventEditingDidBegin),
               @"editingChanged": @(UIControlEventEditingChanged),
               @"editingDidEnd": @(UIControlEventEditingDidEnd),
               @"editingDidEndOnExit": @(UIControlEventEditingDidEndOnExit))

// 控件状态。normal 是 0，所以它在掩码里永远拆不出来——
// 读的那一侧单独处理：掩码为 0 时给 ['normal']。
NACRE_MASK_MAP(ControlState, UIControlState,
               @"highlighted": @(UIControlStateHighlighted),
               @"disabled": @(UIControlStateDisabled),
               @"selected": @(UIControlStateSelected),
               @"focused": @(UIControlStateFocused))

NACRE_ENUM_MAP(ControlHorizontalAlignment, UIControlContentHorizontalAlignment,
               @"center": @(UIControlContentHorizontalAlignmentCenter),
               @"left": @(UIControlContentHorizontalAlignmentLeft),
               @"right": @(UIControlContentHorizontalAlignmentRight),
               @"fill": @(UIControlContentHorizontalAlignmentFill),
               @"leading": @(UIControlContentHorizontalAlignmentLeading),
               @"trailing": @(UIControlContentHorizontalAlignmentTrailing))

NACRE_ENUM_MAP(ControlVerticalAlignment, UIControlContentVerticalAlignment,
               @"center": @(UIControlContentVerticalAlignmentCenter),
               @"top": @(UIControlContentVerticalAlignmentTop),
               @"bottom": @(UIControlContentVerticalAlignmentBottom),
               @"fill": @(UIControlContentVerticalAlignmentFill))

// 按钮的外观类型。plain 是 tvOS 专有，roundedRect 是 system 的别名，都不收。
NACRE_ENUM_MAP(ButtonType, UIButtonType,
               @"custom": @(UIButtonTypeCustom),
               @"system": @(UIButtonTypeSystem),
               @"detailDisclosure": @(UIButtonTypeDetailDisclosure),
               @"infoLight": @(UIButtonTypeInfoLight),
               @"infoDark": @(UIButtonTypeInfoDark),
               @"contactAdd": @(UIButtonTypeContactAdd),
               @"close": @(UIButtonTypeClose))

// 按钮的语义角色，影响系统给它的配色
NACRE_ENUM_MAP(ButtonRole, UIButtonRole,
               @"normal": @(UIButtonRoleNormal),
               @"primary": @(UIButtonRolePrimary),
               @"cancel": @(UIButtonRoleCancel),
               @"destructive": @(UIButtonRoleDestructive))

NACRE_ENUM_MAP(IndicatorStyle, UIScrollViewIndicatorStyle,
               @"default": @(UIScrollViewIndicatorStyleDefault),
               @"black": @(UIScrollViewIndicatorStyleBlack),
               @"white": @(UIScrollViewIndicatorStyleWhite))

NACRE_ENUM_MAP(ContentInsetAdjustmentBehavior,
               UIScrollViewContentInsetAdjustmentBehavior,
               @"automatic": @(UIScrollViewContentInsetAdjustmentAutomatic),
               @"scrollableAxes": @(UIScrollViewContentInsetAdjustmentScrollableAxes),
               @"never": @(UIScrollViewContentInsetAdjustmentNever),
               @"always": @(UIScrollViewContentInsetAdjustmentAlways))

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

NACRE_ENUM_MAP(ModalPresentationStyle, UIModalPresentationStyle,
               @"automatic": @(UIModalPresentationAutomatic),
               @"fullScreen": @(UIModalPresentationFullScreen),
               @"pageSheet": @(UIModalPresentationPageSheet),
               @"formSheet": @(UIModalPresentationFormSheet),
               @"currentContext": @(UIModalPresentationCurrentContext),
               @"overFullScreen": @(UIModalPresentationOverFullScreen),
               @"overCurrentContext": @(UIModalPresentationOverCurrentContext),
               @"popover": @(UIModalPresentationPopover),
               @"custom": @(UIModalPresentationCustom),
               @"none": @(UIModalPresentationNone))

NACRE_ENUM_MAP(ModalTransitionStyle, UIModalTransitionStyle,
               @"coverVertical": @(UIModalTransitionStyleCoverVertical),
               @"flipHorizontal": @(UIModalTransitionStyleFlipHorizontal),
               @"crossDissolve": @(UIModalTransitionStyleCrossDissolve),
               @"partialCurl": @(UIModalTransitionStylePartialCurl))

NACRE_ENUM_MAP(BarButtonSystemItem, UIBarButtonSystemItem,
               @"done": @(UIBarButtonSystemItemDone),
               @"cancel": @(UIBarButtonSystemItemCancel),
               @"edit": @(UIBarButtonSystemItemEdit),
               @"save": @(UIBarButtonSystemItemSave),
               @"add": @(UIBarButtonSystemItemAdd),
               @"flexibleSpace": @(UIBarButtonSystemItemFlexibleSpace),
               @"fixedSpace": @(UIBarButtonSystemItemFixedSpace),
               @"compose": @(UIBarButtonSystemItemCompose),
               @"reply": @(UIBarButtonSystemItemReply),
               @"action": @(UIBarButtonSystemItemAction),
               @"organize": @(UIBarButtonSystemItemOrganize),
               @"bookmarks": @(UIBarButtonSystemItemBookmarks),
               @"search": @(UIBarButtonSystemItemSearch),
               @"refresh": @(UIBarButtonSystemItemRefresh),
               @"stop": @(UIBarButtonSystemItemStop),
               @"camera": @(UIBarButtonSystemItemCamera),
               @"trash": @(UIBarButtonSystemItemTrash),
               @"play": @(UIBarButtonSystemItemPlay),
               @"pause": @(UIBarButtonSystemItemPause),
               @"rewind": @(UIBarButtonSystemItemRewind),
               @"fastForward": @(UIBarButtonSystemItemFastForward),
               @"undo": @(UIBarButtonSystemItemUndo),
               @"redo": @(UIBarButtonSystemItemRedo),
               @"pageCurl": @(UIBarButtonSystemItemPageCurl),
               @"close": @(UIBarButtonSystemItemClose),
               @"writingTools": @(UIBarButtonSystemItemWritingTools))

// 第二个带别名的枚举。iOS 26 的头文件：
//   UIBarButtonItemStyleProminent = 2
//   UIBarButtonItemStyleDone      = UIBarButtonItemStyleProminent
// 所以 done 和 prominent 是同一个值。还有一个 Bordered = 1 已经废弃，不暴露。
// 和 UIStackViewAlignment 一样用有序 pairs：主名在前（头文件里 Done 是被赋
// 值的那一侧，所以主名是 prominent），别名在后，读出来只给主名。
static NSArray<NSArray*>* BarButtonItemStylePairs(void) {
  static NSArray<NSArray*>* pairs;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    pairs = @[
      @[ @"plain", @(UIBarButtonItemStylePlain) ],
      @[ @"prominent", @(UIBarButtonItemStyleProminent) ],
      // 别名：写得进去，读不出来
      @[ @"done", @(UIBarButtonItemStyleDone) ],
    ];
  });
  return pairs;
}

BOOL BarButtonItemStyleFromName(NSString* name, UIBarButtonItemStyle* out) {
  if (![name isKindOfClass:NSString.class]) return NO;
  for (NSArray* pair in BarButtonItemStylePairs()) {
    if ([pair[0] isEqualToString:name]) {
      *out = (UIBarButtonItemStyle)[pair[1] integerValue];
      return YES;
    }
  }
  return NO;
}

NSString* NameForBarButtonItemStyle(UIBarButtonItemStyle value) {
  for (NSArray* pair in BarButtonItemStylePairs()) {
    if ([pair[1] integerValue] == (NSInteger)value) return pair[0];
  }
  return nil;
}

NSString* NamesForBarButtonItemStyle(void) {
  NSMutableArray<NSString*>* names = [NSMutableArray array];
  for (NSArray* pair in BarButtonItemStylePairs()) [names addObject:pair[0]];
  return [names componentsJoinedByString:@" / "];
}

// UIBarButtonItem 的事件名。它不是 UIControl，没有控件事件，只有 target/action
// 一个点——但名字沿用 UIButton 那个 primaryActionTriggered：JS 开发者在按钮和
// 导航条按钮之间切换时不该还要记两个名字。
static NSArray<NSString*>* BarButtonEventNamesList(void) {
  static NSArray<NSString*>* names;
  static dispatch_once_t once;
  dispatch_once(&once, ^{ names = @[ @"primaryActionTriggered" ]; });
  return names;
}

BOOL IsBarButtonEventName(NSString* name) {
  return [name isKindOfClass:NSString.class] &&
         [BarButtonEventNamesList() containsObject:name];
}

NSString* NamesForBarButtonEvent(void) {
  return [BarButtonEventNamesList() componentsJoinedByString:@" / "];
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

// decelerationRate：和 spacing 同一个套路，具名常量走字符串。区别是这两个
// 值不是哨兵而是真实的速率，所以读出来优先给名字、对不上就给数字。
static NSArray<NSArray*>* DecelerationRatePairs(void) {
  static NSArray<NSArray*>* pairs;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    pairs = @[
      @[ @"normal", @(UIScrollViewDecelerationRateNormal) ],
      @[ @"fast", @(UIScrollViewDecelerationRateFast) ],
    ];
  });
  return pairs;
}

BOOL DecelerationRateFromValue(id value, CGFloat* out) {
  if ([value isKindOfClass:NSString.class]) {
    for (NSArray* pair in DecelerationRatePairs()) {
      if ([pair[0] isEqualToString:value]) {
        *out = [pair[1] doubleValue];
        return YES;
      }
    }
    return NO;
  }
  if (![value isKindOfClass:NSNumber.class]) return NO;
  *out = [value doubleValue];
  return YES;
}

id ValueForDecelerationRate(CGFloat rate) {
  for (NSArray* pair in DecelerationRatePairs()) {
    if ([pair[1] doubleValue] == rate) return pair[0];
  }
  return @(rate);
}

NSString* NamesForDecelerationRate(void) {
  NSMutableArray<NSString*>* names = [NSMutableArray array];
  for (NSArray* pair in DecelerationRatePairs()) {
    [names addObject:[NSString stringWithFormat:@"\"%@\"", pair[0]]];
  }
  return [@"a number / " stringByAppendingString:
             [names componentsJoinedByString:@" / "]];
}

// UIScrollView 的事件名。纯通知那一类，一个对一个 delegate 方法：
//   scroll                     ← scrollViewDidScroll:
//   dragbegin / dragend        ← scrollViewWillBeginDragging: / DidEndDragging:
//   deceleratebegin / end      ← WillBeginDecelerating: / DidEndDecelerating:
//   scrollanimationend         ← scrollViewDidEndScrollingAnimation:
//   scrolltotop                ← scrollViewDidScrollToTop:
//   adjustedcontentinsetchange ← scrollViewDidChangeAdjustedContentInset:
static NSArray<NSString*>* ScrollEventNamesList(void) {
  static NSArray<NSString*>* names;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    names = @[ @"scroll", @"dragbegin", @"dragend", @"deceleratebegin",
               @"decelerateend", @"scrollanimationend", @"scrolltotop",
               @"adjustedcontentinsetchange" ];
  });
  return names;
}

BOOL IsScrollEventName(NSString* name) {
  return [name isKindOfClass:NSString.class] &&
         [ScrollEventNamesList() containsObject:name];
}

NSString* NamesForScrollEvent(void) {
  return [ScrollEventNamesList() componentsJoinedByString:@" / "];
}

// UINavigationController 的事件名。和滚动一样派生自 delegate 方法名，
// 所以全小写。区别是这两条**带数据**——「哪个页面」在那一刻从 nav 上读不到
// （willShow 时 topViewController 还没换过去），所以原生送什么就给什么。
// 模态页被关掉的三条通知。都派发到**被呈现的那个 VC** 上，而不是
// UIPresentationController 上——那个类对 JS 没有别的用处，暴露出来只为挂一个
// delegate。形状和 ObjC 不一样，但底层承诺的是能力对齐不是形状一致。
//
// 第四条 presentationControllerShouldDismiss: 要同步返回 BOOL，没做——
// UIKit 自己给了「预先声明的状态」版本，就是 isModalInPresentation。
static NSArray<NSString*>* PresentationEventNamesList(void) {
  static NSArray<NSString*>* names;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    names = @[ @"willdismiss", @"diddismiss", @"dismissattempted" ];
  });
  return names;
}

BOOL IsPresentationEventName(NSString* name) {
  return [name isKindOfClass:NSString.class] &&
         [PresentationEventNamesList() containsObject:name];
}

NSString* NamesForPresentationEvent(void) {
  return [PresentationEventNamesList() componentsJoinedByString:@" / "];
}

static NSArray<NSString*>* NavEventNamesList(void) {
  static NSArray<NSString*>* names;
  static dispatch_once_t once;
  dispatch_once(&once, ^{ names = @[ @"willshow", @"didshow" ]; });
  return names;
}

BOOL IsNavEventName(NSString* name) {
  return [name isKindOfClass:NSString.class] &&
         [NavEventNamesList() containsObject:name];
}

NSString* NamesForNavEvent(void) {
  return [NavEventNamesList() componentsJoinedByString:@" / "];
}

// 状态作参数：'normal' 是 0，位掩码表里没有它，但它是最常用的写法，
// 所以单独认一下。读 state 的那一侧是反过来的——掩码为 0 时给 ['normal']。
BOOL ControlStateArgFromNames(id value, UIControlState* out, id* bad) {
  *bad = nil;
  if (![value isKindOfClass:NSArray.class]) return NO;
  UIControlState mask = UIControlStateNormal;
  for (id name in (NSArray*)value) {
    if ([name isKindOfClass:NSString.class] && [name isEqualToString:@"normal"]) continue;
    UIControlState bit;
    id inner = nil;
    if (!ControlStateFromNames(@[ name ], &bit, &inner)) {
      *bad = name;
      return NO;
    }
    mask |= bit;
  }
  *out = mask;
  return YES;
}

NSString* NamesForControlStateArg(void) {
  return [@"normal / " stringByAppendingString:NamesForControlState()];
}

// 圆角的曲线。continuous 是 Apple 自己在用的那种「超椭圆」圆角，
// 比正圆弧过渡得更顺——图标、卡片都是它。
static NSArray<NSArray*>* CornerCurvePairs(void) {
  static NSArray<NSArray*>* pairs;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    pairs = @[
      @[ @"circular", kCACornerCurveCircular ],
      @[ @"continuous", kCACornerCurveContinuous ],
    ];
  });
  return pairs;
}

NSString* CornerCurveFromName(NSString* name) {
  if (![name isKindOfClass:NSString.class]) return nil;
  for (NSArray* pair in CornerCurvePairs()) {
    if ([pair[0] isEqualToString:name]) return pair[1];
  }
  return nil;
}

NSString* NameForCornerCurve(NSString* curve) {
  for (NSArray* pair in CornerCurvePairs()) {
    if ([pair[1] isEqualToString:curve]) return pair[0];
  }
  return nil;
}

NSString* NamesForCornerCurve(void) {
  NSMutableArray<NSString*>* names = [NSMutableArray array];
  for (NSArray* pair in CornerCurvePairs()) [names addObject:pair[0]];
  return [names componentsJoinedByString:@" / "];
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

// Keychain 的访问级别。原生侧那五个是 CFStringRef 常量，NACRE_ENUM_MAP 的
// 值必须是数字，所以这里映射成序号，NacreKeychain.mm 再按序号换成常量。
//
// kSecAttrAccessibleAlways 和 AlwaysThisDeviceOnly **不暴露**：iOS 12 起
// API_DEPRECATED，头文件原话是 "Use an accessibility level that provides
// some user protection"。
NACRE_ENUM_MAP(KeychainAccessible, NacreKeychainAccessible,
               @"whenUnlocked": @(NacreKeychainAccessibleWhenUnlocked),
               @"whenUnlockedThisDeviceOnly":
                   @(NacreKeychainAccessibleWhenUnlockedThisDeviceOnly),
               @"afterFirstUnlock": @(NacreKeychainAccessibleAfterFirstUnlock),
               @"afterFirstUnlockThisDeviceOnly":
                   @(NacreKeychainAccessibleAfterFirstUnlockThisDeviceOnly),
               @"whenPasscodeSetThisDeviceOnly":
                   @(NacreKeychainAccessibleWhenPasscodeSetThisDeviceOnly))

// 属性分发表。加一个属性只要在这里加一行，不用动 C++ 的桥。
// 这是手写方案，撑得过 scene / window 这几个类；到 UIView 那一层
// （成百上千个属性）就必须换成通用的能力暴露方案了。

}  // namespace nacre_bridge
