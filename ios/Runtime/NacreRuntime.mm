#import "NacreRuntime.h"

#import <UIKit/UIKit.h>
#import <os/log.h>

#include <memory>
#include <mutex>
#include <string>

#include "Engine/Engine.h"

// Blob：JS 侧只拿一个句柄，字节留在这边的 NSData 里。
//
// Chrome 为此要跨进程、要 UUID、要配额管理，因为它的数据在 browser 进程、
// JS 在渲染进程。我们同进程，直接持指针——而且这套包装机制已经在跑了，
// UIView、UIColor 都是「JS 侧小包装 + 原生侧真数据 + 弱引用句柄表」。
@interface NacreBlob : NSObject
@property(nonatomic, strong) NSData* data;
@property(nonatomic, copy) NSString* type;
@end

@implementation NacreBlob
@end

namespace {

os_log_t JSLog() {
  static os_log_t log = os_log_create("com.orbitlabs.nacre", "js");
  return log;
}

os_log_t RuntimeLog() {
  static os_log_t log = os_log_create("com.orbitlabs.nacre", "runtime");
  return log;
}

const char* LevelName(nacre::LogLevel level) {
  switch (level) {
    case nacre::LogLevel::Debug: return "debug";
    case nacre::LogLevel::Log: return "log";
    case nacre::LogLevel::Info: return "info";
    case nacre::LogLevel::Warn: return "warn";
    case nacre::LogLevel::Error: return "error";
  }
  return "log";
}

// console.* 同时输出到 stdout（终端 / simctl --console-pty 可见）和系统日志（Xcode 控制台可见）
void WriteJSLog(nacre::LogLevel level, const std::string& message) {
  fprintf(stdout, "[JS][%s] %s\n", LevelName(level), message.c_str());
  fflush(stdout);
  os_log_type_t type = OS_LOG_TYPE_DEFAULT;
  if (level == nacre::LogLevel::Error) type = OS_LOG_TYPE_ERROR;
  if (level == nacre::LogLevel::Debug) type = OS_LOG_TYPE_DEBUG;
  os_log_with_type(JSLog(), type, "[%{public}s] %{public}s", LevelName(level), message.c_str());
}

void WriteRuntimeLog(NSString* message) {
  fprintf(stdout, "[nacre] %s\n", message.UTF8String);
  fflush(stdout);
  os_log(RuntimeLog(), "%{public}@", message);
}

double NowMs() { return [NSDate date].timeIntervalSince1970 * 1000.0; }

// application 的数据快照：主线程写，JS 线程读。
// UIKit 只能在主线程访问，所以这里缓存值，JS 线程上的回调只读缓存，绝不碰 UIKit。
struct AppSnapshot {
  std::string infoJSON;                 // 启动时抓一次，之后不变
  std::mutex mutex;                     // 保护下面这个
  std::string environmentJSON = "{}";   // 主线程在相关通知到达时重建
};

NSString* BackgroundRefreshName(UIBackgroundRefreshStatus status) {
  switch (status) {
    case UIBackgroundRefreshStatusRestricted: return @"restricted";
    case UIBackgroundRefreshStatusDenied: return @"denied";
    case UIBackgroundRefreshStatusAvailable: return @"available";
  }
  return @"unknown";
}

NSString* SceneActivationName(UISceneActivationState state) {
  switch (state) {
    case UISceneActivationStateUnattached: return @"unattached";
    case UISceneActivationStateForegroundActive: return @"foregroundActive";
    case UISceneActivationStateForegroundInactive: return @"foregroundInactive";
    case UISceneActivationStateBackground: return @"background";
  }
  return @"unknown";
}

const char* StateName(int state) {
  switch (state) {
    case UIApplicationStateActive: return "active";
    case UIApplicationStateInactive: return "inactive";
    case UIApplicationStateBackground: return "background";
  }
  return "unknown";
}

// Info.plist 里绝大多数是字符串/数字/布尔/数组/字典，但不保证全都能 JSON 序列化
// （NSDate、NSData 就不行）。这里递归过一遍，不认识的转成字符串，避免整个序列化失败。
id SanitizeForJSON(id value) {
  // NSNull 本来就是合法的 JSON null，必须原样放行。
  // 漏掉它会落到最后那行 [value description]，把 null 变成字符串 "<null>"。
  if ([value isKindOfClass:NSString.class] || [value isKindOfClass:NSNumber.class] ||
      value == NSNull.null) {
    return value;
  }
  if ([value isKindOfClass:NSArray.class]) {
    NSMutableArray* out = [NSMutableArray arrayWithCapacity:[value count]];
    for (id item in (NSArray*)value) [out addObject:SanitizeForJSON(item)];
    return out;
  }
  if ([value isKindOfClass:NSDictionary.class]) {
    NSMutableDictionary* out = [NSMutableDictionary dictionaryWithCapacity:[value count]];
    for (id key in (NSDictionary*)value) {
      out[[key description]] = SanitizeForJSON(((NSDictionary*)value)[key]);
    }
    return out;
  }
  return [value description];
}

// 只能在主线程调用：下面每一项都是 UIKit 属性。
// backgroundTimeRemaining 不收进来——它是连续变化的值，快照没有意义，
// 而「主线程永远不同步等待 JS」又不允许实时读，等有了别的机制再说。
void RebuildEnvironment(const std::shared_ptr<AppSnapshot>& snapshot) {
  UIApplication* app = UIApplication.sharedApplication;
  NSMutableDictionary* env = [@{
    @"state" : @(StateName((int)app.applicationState)),
    @"supportsMultipleScenes" : @(app.supportsMultipleScenes),
    @"protectedDataAvailable" : @(app.isProtectedDataAvailable),
    @"layoutDirection" : app.userInterfaceLayoutDirection ==
                                 UIUserInterfaceLayoutDirectionRightToLeft
                             ? @"rtl"
                             : @"ltr",
    @"contentSizeCategory" : app.preferredContentSizeCategory ?: @"",
    @"backgroundRefreshStatus" : BackgroundRefreshName(app.backgroundRefreshStatus),
    @"idleTimerDisabled" : @(app.isIdleTimerDisabled),
  } mutableCopy];
  if (@available(iOS 27.0, *)) {
    env[@"prefersReducedResourceUsage"] = @(app.systemPrefersReducedResourceUsage);
  }

  NSData* data = [NSJSONSerialization dataWithJSONObject:env options:0 error:nil];
  std::string json = data ? std::string(static_cast<const char*>(data.bytes), data.length)
                          : std::string("{}");
  std::lock_guard<std::mutex> lock(snapshot->mutex);
  snapshot->environmentJSON = std::move(json);
}

// 值和 JS 之间走 JSON。FragmentsAllowed 让顶层可以是字符串/数字/布尔，
// 不用为标量再包一层数组。
std::string EncodeJSON(id value) {
  id safe = SanitizeForJSON(value ?: NSNull.null);
  NSData* data = [NSJSONSerialization dataWithJSONObject:safe
                                                 options:NSJSONWritingFragmentsAllowed
                                                   error:nil];
  if (!data) return "null";
  return std::string(static_cast<const char*>(data.bytes), data.length);
}

id DecodeJSON(const std::string& json) {
  NSData* data = [NSData dataWithBytes:json.data() length:json.size()];
  id value = [NSJSONSerialization JSONObjectWithData:data
                                             options:NSJSONReadingFragmentsAllowed
                                               error:nil];
  return (value == nil || value == NSNull.null) ? nil : value;
}

// 结构体和 JSON 的互转。线上格式是扁平的（CGRect 是 x/y/width/height，
// 不是嵌套的 origin/size）——JS 侧的 CGRect 类负责提供嵌套视图，
// 线上格式是内部约定，以后换编码不影响 JS。
NSDictionary* PointToJSON(CGPoint p) { return @{@"x": @(p.x), @"y": @(p.y)}; }
NSDictionary* SizeToJSON(CGSize z) { return @{@"width": @(z.width), @"height": @(z.height)}; }
NSDictionary* InsetsToJSON(UIEdgeInsets i) {
  return @{@"top": @(i.top), @"left": @(i.left),
           @"bottom": @(i.bottom), @"right": @(i.right)};
}
NSDictionary* RectToJSON(CGRect r) {
  return @{@"x": @(r.origin.x), @"y": @(r.origin.y),
           @"width": @(r.size.width), @"height": @(r.size.height)};
}
CGPoint JSONToPoint(id v) {
  NSDictionary* d = [v isKindOfClass:NSDictionary.class] ? v : @{};
  return CGPointMake([d[@"x"] doubleValue], [d[@"y"] doubleValue]);
}
CGSize JSONToSize(id v) {
  NSDictionary* d = [v isKindOfClass:NSDictionary.class] ? v : @{};
  return CGSizeMake([d[@"width"] doubleValue], [d[@"height"] doubleValue]);
}
CGRect JSONToRect(id v) {
  NSDictionary* d = [v isKindOfClass:NSDictionary.class] ? v : @{};
  return CGRectMake([d[@"x"] doubleValue], [d[@"y"] doubleValue],
                    [d[@"width"] doubleValue], [d[@"height"] doubleValue]);
}
UIEdgeInsets JSONToInsets(id v) {
  NSDictionary* d = [v isKindOfClass:NSDictionary.class] ? v : @{};
  return UIEdgeInsetsMake([d[@"top"] doubleValue], [d[@"left"] doubleValue],
                          [d[@"bottom"] doubleValue], [d[@"right"] doubleValue]);
}

// 枚举：JS 侧一律用字符串。名字是我们定的（去掉类型前缀、首字母小写），
// 数值由 SDK 决定——NSTextAlignment 的值随 ABI 变（iOS 上 Center 是 1，
// macOS 上是 2），所以这张表只能放在原生层，JS 里写死索引会错。
//
// 查不到名字时返回 NO，调用方据此让 JS 抛异常。
//
// 错误信息里的可选值列表和真正用来查的表必须是同一份，否则两边会慢慢
// 漂开。所以 NamesForXxx 从同一张表派生，JS 侧不再抄一份。
//
// 名字按枚举数值排序，顺序才稳定——NSDictionary 的遍历顺序是不保证的。
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
std::string ReadNativeProperty(id object, const std::string& name) {
  NSString* key = @(name.c_str());
  id value = nil;
  if ([object isKindOfClass:UIScene.class]) {
    UIScene* scene = (UIScene*)object;
    if ([key isEqualToString:@"activationState"]) {
      value = SceneActivationName(scene.activationState);
    } else if ([key isEqualToString:@"title"]) {
      value = scene.title;
    } else if ([key isEqualToString:@"subtitle"]) {
      value = scene.subtitle;
    } else if ([key isEqualToString:@"isFullScreen"] &&
               [scene isKindOfClass:UIWindowScene.class]) {
      value = @(((UIWindowScene*)scene).isFullScreen);
    }
  } else if ([object isKindOfClass:UIWindow.class]) {
    UIWindow* window = (UIWindow*)object;
    if ([key isEqualToString:@"windowLevel"]) {
      value = @(window.windowLevel);
    } else if ([key isEqualToString:@"isKeyWindow"]) {
      value = @(window.isKeyWindow);
    } else if ([key isEqualToString:@"canBecomeKeyWindow"]) {
      value = @(window.canBecomeKeyWindow);
    }
  } else if ([object isKindOfClass:UISceneSession.class]) {
    UISceneSession* session = (UISceneSession*)object;
    if ([key isEqualToString:@"role"]) {
      value = session.role;
    } else if ([key isEqualToString:@"persistentIdentifier"]) {
      value = session.persistentIdentifier;
    } else if ([key isEqualToString:@"userInfo"]) {
      value = session.userInfo;
    }
  }
  if (value == nil && [object isKindOfClass:UIView.class]) {
    UIView* view = (UIView*)object;
    if ([key isEqualToString:@"frame"]) {
      value = RectToJSON(view.frame);
    } else if ([key isEqualToString:@"bounds"]) {
      value = RectToJSON(view.bounds);
    } else if ([key isEqualToString:@"center"]) {
      value = PointToJSON(view.center);
    } else if ([key isEqualToString:@"safeAreaInsets"]) {
      value = InsetsToJSON(view.safeAreaInsets);
    } else if ([key isEqualToString:@"alpha"]) {
      value = @(view.alpha);
    } else if ([key isEqualToString:@"isHidden"]) {
      value = @(view.isHidden);
    } else if ([key isEqualToString:@"clipsToBounds"]) {
      value = @(view.clipsToBounds);
    } else if ([key isEqualToString:@"isOpaque"]) {
      value = @(view.isOpaque);
    } else if ([key isEqualToString:@"isUserInteractionEnabled"]) {
      value = @(view.isUserInteractionEnabled);
    } else if ([key isEqualToString:@"tag"]) {
      value = @(view.tag);
    } else if ([key isEqualToString:@"contentMode"]) {
      value = NameForContentMode(view.contentMode);
    } else if ([key isEqualToString:@"intrinsicContentSize"]) {
      value = SizeToJSON(view.intrinsicContentSize);
    } else if ([key isEqualToString:@"translatesAutoresizingMaskIntoConstraints"]) {
      value = @(view.translatesAutoresizingMaskIntoConstraints);
    } else if ([key isEqualToString:@"hasAmbiguousLayout"]) {
      value = @(view.hasAmbiguousLayout);
    }
  }
  if (value == nil && [object isKindOfClass:NSLayoutConstraint.class]) {
    NSLayoutConstraint* c = (NSLayoutConstraint*)object;
    if ([key isEqualToString:@"isActive"]) {
      value = @(c.isActive);
    } else if ([key isEqualToString:@"constant"]) {
      value = @(c.constant);
    } else if ([key isEqualToString:@"multiplier"]) {
      value = @(c.multiplier);
    } else if ([key isEqualToString:@"priority"]) {
      // 读永远是数字：749 这种值没有名字
      value = @(c.priority);
    } else if ([key isEqualToString:@"relation"]) {
      value = NameForLayoutRelation(c.relation);
    } else if ([key isEqualToString:@"firstAttribute"]) {
      value = NameForLayoutAttribute(c.firstAttribute);
    } else if ([key isEqualToString:@"secondAttribute"]) {
      value = NameForLayoutAttribute(c.secondAttribute);
    } else if ([key isEqualToString:@"identifier"]) {
      value = c.identifier;
    }
  }
  if (value == nil && [object isKindOfClass:UILayoutGuide.class]) {
    UILayoutGuide* guide = (UILayoutGuide*)object;
    if ([key isEqualToString:@"layoutFrame"]) {
      value = RectToJSON(guide.layoutFrame);
    } else if ([key isEqualToString:@"identifier"]) {
      value = guide.identifier;
    }
  }
  if (value == nil && [object isKindOfClass:UILabel.class]) {
    UILabel* label = (UILabel*)object;
    if ([key isEqualToString:@"text"]) {
      value = label.text;
    } else if ([key isEqualToString:@"textAlignment"]) {
      value = NameForTextAlignment(label.textAlignment);
    } else if ([key isEqualToString:@"lineBreakMode"]) {
      value = NameForLineBreakMode(label.lineBreakMode);
    } else if ([key isEqualToString:@"numberOfLines"]) {
      value = @(label.numberOfLines);
    } else if ([key isEqualToString:@"adjustsFontSizeToFitWidth"]) {
      value = @(label.adjustsFontSizeToFitWidth);
    } else if ([key isEqualToString:@"minimumScaleFactor"]) {
      value = @(label.minimumScaleFactor);
    } else if ([key isEqualToString:@"isHighlighted"]) {
      value = @(label.isHighlighted);
    } else if ([key isEqualToString:@"isEnabled"]) {
      value = @(label.isEnabled);
    } else if ([key isEqualToString:@"preferredMaxLayoutWidth"]) {
      value = @(label.preferredMaxLayoutWidth);
    } else if ([key isEqualToString:@"shadowOffset"]) {
      value = SizeToJSON(label.shadowOffset);
    } else if ([key isEqualToString:@"baselineAdjustment"]) {
      value = NameForBaselineAdjustment(label.baselineAdjustment);
    }
  }
  // UIImageView 要放在 UILabel 之前吗？不用——两者都是 UIView 的兄弟，
  // 名字不重叠。但 isHighlighted 两边都有，所以各自的分支里都写一遍。
  if (value == nil && [object isKindOfClass:UIImageView.class]) {
    UIImageView* iv = (UIImageView*)object;
    if ([key isEqualToString:@"isHighlighted"]) {
      value = @(iv.isHighlighted);
    } else if ([key isEqualToString:@"isAnimating"]) {
      value = @(iv.isAnimating);
    }
  }
  if (value == nil && [object isKindOfClass:UIImage.class]) {
    UIImage* image = (UIImage*)object;
    if ([key isEqualToString:@"size"]) {
      // 点，不是像素。像素 = size × scale
      value = SizeToJSON(image.size);
    } else if ([key isEqualToString:@"scale"]) {
      value = @(image.scale);
    } else if ([key isEqualToString:@"imageOrientation"]) {
      value = NameForImageOrientation(image.imageOrientation);
    } else if ([key isEqualToString:@"isSymbolImage"]) {
      value = @(image.isSymbolImage);
    } else if ([key isEqualToString:@"renderingMode"]) {
      value = NameForImageRenderingMode(image.renderingMode);
    } else if ([key isEqualToString:@"capInsets"]) {
      value = InsetsToJSON(image.capInsets);
    } else if ([key isEqualToString:@"resizingMode"]) {
      value = NameForImageResizingMode(image.resizingMode);
    } else if ([key isEqualToString:@"alignmentRectInsets"]) {
      value = InsetsToJSON(image.alignmentRectInsets);
    } else if ([key isEqualToString:@"duration"]) {
      value = @(image.duration);
    }
  }
  if (value == nil && [object isKindOfClass:NacreBlob.class]) {
    NacreBlob* blob = (NacreBlob*)object;
    if ([key isEqualToString:@"size"]) {
      value = @(blob.data.length);
    } else if ([key isEqualToString:@"type"]) {
      value = blob.type ?: @"";
    }
  }
  if (value == nil && [object isKindOfClass:UIFont.class]) {
    UIFont* font = (UIFont*)object;
    if ([key isEqualToString:@"familyName"]) {
      value = font.familyName;
    } else if ([key isEqualToString:@"fontName"]) {
      value = font.fontName;
    } else if ([key isEqualToString:@"pointSize"]) {
      value = @(font.pointSize);
    } else if ([key isEqualToString:@"ascender"]) {
      value = @(font.ascender);
    } else if ([key isEqualToString:@"descender"]) {
      value = @(font.descender);
    } else if ([key isEqualToString:@"capHeight"]) {
      value = @(font.capHeight);
    } else if ([key isEqualToString:@"xHeight"]) {
      value = @(font.xHeight);
    } else if ([key isEqualToString:@"lineHeight"]) {
      value = @(font.lineHeight);
    } else if ([key isEqualToString:@"leading"]) {
      value = @(font.leading);
    }
  }
  return EncodeJSON(value);
}

// 写不进去就往 error 里写一句话，引擎据此抛 TypeError——写不进去又不报错
// 是最难查的那种错。两种情况都在这里凑话：这个对象没有这个可写属性，或者
// 枚举给了个不认识的名字。
//
// 错误信息只能在这里凑：可选值列表就在上面那几张表里，而且这里知道上下文
// （哪个类、哪个属性），所以不会有 UIControl.state 和 UIGestureRecognizer
// .state 这种按属性名索引就会撞的问题。
void WriteNativeProperty(id object, const std::string& name, const std::string& json,
                         std::string* error) {
  NSString* key = @(name.c_str());
  id value = DecodeJSON(json);
  // 每个分支写完就 return，末尾统一填「没有这个属性」。
  if ([object isKindOfClass:UIScene.class]) {
    UIScene* scene = (UIScene*)object;
    if ([key isEqualToString:@"title"]) {
      scene.title = [value isKindOfClass:NSString.class] ? value : nil;
      return;
    }
    if ([key isEqualToString:@"subtitle"]) {
      scene.subtitle = [value isKindOfClass:NSString.class] ? value : @"";
      return;
    }
  }
  if ([object isKindOfClass:UIWindow.class]) {
    if ([key isEqualToString:@"windowLevel"]) {
      ((UIWindow*)object).windowLevel = [value doubleValue];
      return;
    }
  }
  if ([object isKindOfClass:UISceneSession.class]) {
    if ([key isEqualToString:@"userInfo"]) {
      ((UISceneSession*)object).userInfo =
          [value isKindOfClass:NSDictionary.class] ? value : nil;
      return;
    }
  }
  if ([object isKindOfClass:NSLayoutConstraint.class]) {
    NSLayoutConstraint* c = (NSLayoutConstraint*)object;
    if ([key isEqualToString:@"constant"]) { c.constant = [value doubleValue]; return; }
    if ([key isEqualToString:@"identifier"]) {
      c.identifier = [value isKindOfClass:NSString.class] ? value : nil;
      return;
    }
    if ([key isEqualToString:@"priority"]) {
      UILayoutPriority priority;
      if (!LayoutPriorityFromValue(value, &priority)) {
        *error = EnumError(@"priority", value, NamesForLayoutPriority());
        return;
      }
      c.priority = priority;
      return;
    }
    if ([key isEqualToString:@"isActive"]) {
      // 两端没有公共祖先时 UIKit 抛 NSGenericException。不接住整个 App 就挂了，
      // 而这是 JS 写错了，必须变成 JS 的异常。这是少数几处接 NSException 的地方
      // ——判据是「不接的代价是崩溃，而错误来自调用方」。
      @try {
        c.active = [value boolValue];
      } @catch (NSException* e) {
        *error = [NSString stringWithFormat:@"failed to activate constraint: %@", e.reason].UTF8String;
      }
      return;
    }
  }
  if ([object isKindOfClass:UILayoutGuide.class]) {
    if ([key isEqualToString:@"identifier"]) {
      ((UILayoutGuide*)object).identifier =
          [value isKindOfClass:NSString.class] ? value : @"";
      return;
    }
  }
  if ([object isKindOfClass:UIView.class]) {
    UIView* view = (UIView*)object;
    if ([key isEqualToString:@"translatesAutoresizingMaskIntoConstraints"]) {
      view.translatesAutoresizingMaskIntoConstraints = [value boolValue];
      return;
    }
    if ([key isEqualToString:@"frame"]) { view.frame = JSONToRect(value); return; }
    if ([key isEqualToString:@"bounds"]) { view.bounds = JSONToRect(value); return; }
    if ([key isEqualToString:@"center"]) { view.center = JSONToPoint(value); return; }
    if ([key isEqualToString:@"alpha"]) { view.alpha = [value doubleValue]; return; }
    if ([key isEqualToString:@"isHidden"]) { view.hidden = [value boolValue]; return; }
    if ([key isEqualToString:@"clipsToBounds"]) {
      view.clipsToBounds = [value boolValue];
      return;
    }
    if ([key isEqualToString:@"isOpaque"]) { view.opaque = [value boolValue]; return; }
    if ([key isEqualToString:@"isUserInteractionEnabled"]) {
      view.userInteractionEnabled = [value boolValue];
      return;
    }
    if ([key isEqualToString:@"tag"]) { view.tag = [value integerValue]; return; }
    if ([key isEqualToString:@"contentMode"]) {
      UIViewContentMode mode;
      if (!ContentModeFromName(value, &mode)) {
        *error = EnumError(@"contentMode", value, NamesForContentMode());
        return;
      }
      view.contentMode = mode;
      return;
    }
  }
  if ([object isKindOfClass:UIImageView.class]) {
    UIImageView* iv = (UIImageView*)object;
    if ([key isEqualToString:@"isHighlighted"]) {
      iv.highlighted = [value boolValue];
      return;
    }
  }
  if ([object isKindOfClass:UILabel.class]) {
    UILabel* label = (UILabel*)object;
    if ([key isEqualToString:@"text"]) {
      label.text = [value isKindOfClass:NSString.class] ? value : nil;
      return;
    }
    if ([key isEqualToString:@"textAlignment"]) {
      NSTextAlignment a;
      if (!TextAlignmentFromName(value, &a)) {
        *error = EnumError(@"textAlignment", value, NamesForTextAlignment());
        return;
      }
      label.textAlignment = a;
      return;
    }
    if ([key isEqualToString:@"lineBreakMode"]) {
      NSLineBreakMode m;
      if (!LineBreakModeFromName(value, &m)) {
        *error = EnumError(@"lineBreakMode", value, NamesForLineBreakMode());
        return;
      }
      label.lineBreakMode = m;
      return;
    }
    if ([key isEqualToString:@"baselineAdjustment"]) {
      UIBaselineAdjustment b;
      if (!BaselineAdjustmentFromName(value, &b)) {
        *error = EnumError(@"baselineAdjustment", value, NamesForBaselineAdjustment());
        return;
      }
      label.baselineAdjustment = b;
      return;
    }
    if ([key isEqualToString:@"numberOfLines"]) {
      label.numberOfLines = [value integerValue];
      return;
    }
    if ([key isEqualToString:@"adjustsFontSizeToFitWidth"]) {
      label.adjustsFontSizeToFitWidth = [value boolValue];
      return;
    }
    if ([key isEqualToString:@"minimumScaleFactor"]) {
      label.minimumScaleFactor = [value doubleValue];
      return;
    }
    if ([key isEqualToString:@"isHighlighted"]) {
      label.highlighted = [value boolValue];
      return;
    }
    if ([key isEqualToString:@"isEnabled"]) { label.enabled = [value boolValue]; return; }
    if ([key isEqualToString:@"preferredMaxLayoutWidth"]) {
      label.preferredMaxLayoutWidth = [value doubleValue];
      return;
    }
    if ([key isEqualToString:@"shadowOffset"]) {
      label.shadowOffset = JSONToSize(value);
      return;
    }
  }
  // 注意：走正常的 JS 路径到不了这里。JS 侧的属性是一个个显式定义的
  // 取值器，名字不认识的赋值压根不会过桥，而是在包装对象上挂一个普通
  // 属性（JS 包装对象还是可扩展的，见 project.md 的 TODO）。这句话是
  // 给直接调 __nacre_native.setProp 的情况兜底的。
  *error = [NSString stringWithFormat:@"%@ has no writable property %@",
                                      NSStringFromClass([object class]), key]
               .UTF8String;
}

nacre::NativeObjectRef ReadNativeObjectProperty(id object, const std::string& name) {
  if ([object isKindOfClass:UIScene.class] && name == "session") {
    return {(__bridge void*)((UIScene*)object).session, "UISceneSession"};
  }
  if ([object isKindOfClass:UIWindow.class]) {
    UIWindow* window = (UIWindow*)object;
    if (name == "windowScene") return {(__bridge void*)window.windowScene, "UIWindowScene"};
    if (name == "rootViewController") {
      return {(__bridge void*)window.rootViewController, "UIViewController"};
    }
  }
  if ([object isKindOfClass:UIViewController.class] && name == "view") {
    return {(__bridge void*)((UIViewController*)object).view, "UIView"};
  }
  // UIWindow 也是 UIView，所以这条放在 UIWindow 的分支之后，名字不重叠。
  if ([object isKindOfClass:UILayoutGuide.class]) {
    UILayoutGuide* guide = (UILayoutGuide*)object;
    if (name == "owningView") return {(__bridge void*)guide.owningView, "UIView"};
    nacre::NativeObjectRef anchor = AnchorNamed(guide, name);
    if (anchor.ptr != nullptr) return anchor;
  }
  if ([object isKindOfClass:NSLayoutConstraint.class]) {
    NSLayoutConstraint* c = (NSLayoutConstraint*)object;
    // firstItem / secondItem 刻意不暴露：它们是 assign，view 死了就是野指针，
    // 头文件自己写着「Access to these properties is not recommended」。
    if (name == "firstAnchor") {
      return {(__bridge void*)c.firstAnchor, AnchorClassName(c.firstAnchor)};
    }
    if (name == "secondAnchor") {
      return {(__bridge void*)c.secondAnchor, AnchorClassName(c.secondAnchor)};
    }
  }
  if ([object isKindOfClass:UIView.class]) {
    UIView* view = (UIView*)object;
    if (name == "backgroundColor") return {(__bridge void*)view.backgroundColor, "UIColor"};
    if (name == "safeAreaLayoutGuide") {
      return {(__bridge void*)view.safeAreaLayoutGuide, "UILayoutGuide"};
    }
    if (name == "layoutMarginsGuide") {
      return {(__bridge void*)view.layoutMarginsGuide, "UILayoutGuide"};
    }
    if (name == "readableContentGuide") {
      return {(__bridge void*)view.readableContentGuide, "UILayoutGuide"};
    }
    nacre::NativeObjectRef anchor = AnchorNamed(view, name);
    if (anchor.ptr != nullptr) return anchor;
    if (name == "superview") return {(__bridge void*)view.superview, "UIView"};
    if (name == "window") return {(__bridge void*)view.window, "UIWindow"};
  }
  if ([object isKindOfClass:UIImageView.class]) {
    UIImageView* iv = (UIImageView*)object;
    if (name == "image") return {(__bridge void*)iv.image, "UIImage"};
    if (name == "highlightedImage") {
      return {(__bridge void*)iv.highlightedImage, "UIImage"};
    }
    if (name == "tintColor") return {(__bridge void*)iv.tintColor, "UIColor"};
  }
  if ([object isKindOfClass:UILabel.class]) {
    UILabel* label = (UILabel*)object;
    if (name == "font") return {(__bridge void*)label.font, "UIFont"};
    if (name == "textColor") return {(__bridge void*)label.textColor, "UIColor"};
    if (name == "shadowColor") return {(__bridge void*)label.shadowColor, "UIColor"};
    if (name == "highlightedTextColor") {
      return {(__bridge void*)label.highlightedTextColor, "UIColor"};
    }
  }
  return {};
}

// 属性值是原生对象数组
std::vector<nacre::NativeObjectRef> ReadNativeObjectArrayProperty(
    id object, const std::string& name) {
  std::vector<nacre::NativeObjectRef> refs;
  if ([object isKindOfClass:UIView.class] && name == "subviews") {
    for (UIView* child in ((UIView*)object).subviews) {
      refs.push_back({(__bridge void*)child, "UIView"});
    }
  }
  if ([object isKindOfClass:UIView.class] && name == "constraints") {
    for (NSLayoutConstraint* c in ((UIView*)object).constraints) {
      refs.push_back({(__bridge void*)c, "NSLayoutConstraint"});
    }
  }
  if ([object isKindOfClass:UIView.class] && name == "layoutGuides") {
    for (UILayoutGuide* g in ((UIView*)object).layoutGuides) {
      refs.push_back({(__bridge void*)g, "UILayoutGuide"});
    }
  }
  return refs;
}

// 类级只读属性。目前只有 UIColor 的颜色常量，手写成表：
// 用名字拼 selector 再 performSelector 等于把任意 ObjC 调用的入口开给 JS，
// 通用的能力暴露方案做好之前不开这个口子。
NSDictionary<NSString*, UIColor*>* NamedColors() {
  static NSDictionary<NSString*, UIColor*>* colors = nil;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    colors = @{
      // UIColor.h：基础色
      @"blackColor": UIColor.blackColor,
      @"darkGrayColor": UIColor.darkGrayColor,
      @"lightGrayColor": UIColor.lightGrayColor,
      @"whiteColor": UIColor.whiteColor,
      @"grayColor": UIColor.grayColor,
      @"redColor": UIColor.redColor,
      @"greenColor": UIColor.greenColor,
      @"blueColor": UIColor.blueColor,
      @"cyanColor": UIColor.cyanColor,
      @"yellowColor": UIColor.yellowColor,
      @"magentaColor": UIColor.magentaColor,
      @"orangeColor": UIColor.orangeColor,
      @"purpleColor": UIColor.purpleColor,
      @"brownColor": UIColor.brownColor,
      @"clearColor": UIColor.clearColor,
      // UIInterface.h：系统色
      @"systemRedColor": UIColor.systemRedColor,
      @"systemGreenColor": UIColor.systemGreenColor,
      @"systemBlueColor": UIColor.systemBlueColor,
      @"systemOrangeColor": UIColor.systemOrangeColor,
      @"systemYellowColor": UIColor.systemYellowColor,
      @"systemPinkColor": UIColor.systemPinkColor,
      @"systemPurpleColor": UIColor.systemPurpleColor,
      @"systemTealColor": UIColor.systemTealColor,
      @"systemIndigoColor": UIColor.systemIndigoColor,
      @"systemBrownColor": UIColor.systemBrownColor,
      @"systemMintColor": UIColor.systemMintColor,
      @"systemCyanColor": UIColor.systemCyanColor,
      @"systemGrayColor": UIColor.systemGrayColor,
      // UIInterface.h：语义色，按绘制时的外观动态解析
      @"labelColor": UIColor.labelColor,
      @"secondaryLabelColor": UIColor.secondaryLabelColor,
      @"tertiaryLabelColor": UIColor.tertiaryLabelColor,
      @"quaternaryLabelColor": UIColor.quaternaryLabelColor,
      @"placeholderTextColor": UIColor.placeholderTextColor,
      @"separatorColor": UIColor.separatorColor,
      @"opaqueSeparatorColor": UIColor.opaqueSeparatorColor,
      @"linkColor": UIColor.linkColor,
      @"systemBackgroundColor": UIColor.systemBackgroundColor,
      @"secondarySystemBackgroundColor": UIColor.secondarySystemBackgroundColor,
      @"tertiarySystemBackgroundColor": UIColor.tertiarySystemBackgroundColor,
    };
  });
  return colors;
}

// URL 解析，底子是 NSURLComponents。
//
// 为什么用原生而不是自己写 WHATWG 的解析状态机：按能力对齐，NSURL 是 iOS
// 的真实能力，先无损映射它。代价是 NSURL 遵循 RFC 3986，和 WHATWG URL 在
// 边界情况上有差异（某些串一边接受一边拒绝），已知差异写进文档。
//
// 取的全是 percentEncoded* 系列：WHATWG 的 pathname / search 返回的是**编码后**
// 的形式，用解码版会让 '/a%20b' 读出 '/a b'，再拼回去就坏了。
std::string ParseURL(const std::string& text, const std::string& base) {
  NSString* input = @(text.c_str());
  NSURL* url = nil;
  if (base.empty()) {
    url = [NSURL URLWithString:input];
    // 没有 base 时必须是绝对 URL——我们没有 location，相对路径无依可循
    if (url.scheme.length == 0) return "";
  } else {
    NSURL* baseURL = [NSURL URLWithString:@(base.c_str())];
    if (baseURL == nil || baseURL.scheme.length == 0) return "";
    url = [NSURL URLWithString:input relativeToURL:baseURL];
  }
  if (url == nil) return "";

  // 点段规范化交给系统：实测 standardizedURL 和 WHATWG 的结果一致，
  // 连 '//double' 保留双斜杠、'/../x' 越界不穿透这些边角都对得上。
  // 自己在 JS 里写这个循环既慢又容易错（'//double' 很容易被吞成 '/double'）。
  // 必须先 absoluteURL 再 standardizedURL：对一个相对 URL 直接标准化，
  // NSURL 会先把相对部分自己收干净（'../y' → 'y'）再和 base 组合，
  // 结果是 /a/b/y 而不是 /a/y。
  NSURL* absolute = url.absoluteURL ?: url;
  NSURL* standardized = absolute.standardizedURL ?: absolute;
  NSURLComponents* c = [NSURLComponents componentsWithURL:standardized
                                  resolvingAgainstBaseURL:YES];
  if (c == nil || c.scheme.length == 0) return "";

  // 规范化全在这一层做完，JS 侧只做薄包装：
  //   1. scheme 和 host 小写化
  //   2. 默认端口移除
  //   3. 点段（上面的 standardizedURL）
  NSString* scheme = c.scheme.lowercaseString;
  NSString* host = (c.percentEncodedHost ?: @"").lowercaseString;
  NSString* port = c.port != nil ? c.port.stringValue : @"";
  static NSDictionary<NSString*, NSString*>* defaultPorts = nil;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    defaultPorts = @{@"http" : @"80", @"https" : @"443", @"ws" : @"80",
                     @"wss" : @"443", @"ftp" : @"21"};
  });
  if (port.length > 0 && [defaultPorts[scheme] isEqualToString:port]) port = @"";

  NSString* path = c.percentEncodedPath ?: @"";
  // WHATWG：有 host 的 URL，pathname 至少是 "/"。
  // standardizedURL 把 '/a/..' 收成空串，这里一并补上。
  if (path.length == 0 && host.length > 0) path = @"/";

  NSMutableString* hostPort = [host mutableCopy];
  if (port.length > 0) [hostPort appendFormat:@":%@", port];

  // origin 只对 http(s) 有意义，其余一律 "null"（和 WHATWG 一致）
  NSString* origin = @"null";
  if (([scheme isEqualToString:@"http"] || [scheme isEqualToString:@"https"]) &&
      host.length > 0) {
    origin = [NSString stringWithFormat:@"%@://%@", scheme, hostPort];
  }

  NSDictionary* parts = @{
    @"protocol" : [scheme stringByAppendingString:@":"],
    @"username" : c.percentEncodedUser ?: @"",
    @"password" : c.percentEncodedPassword ?: @"",
    @"hostname" : host,
    @"host" : hostPort,
    @"port" : port,
    @"pathname" : path,
    @"search" : c.percentEncodedQuery.length > 0
                    ? [@"?" stringByAppendingString:c.percentEncodedQuery]
                    : @"",
    @"hash" : c.percentEncodedFragment.length > 0
                  ? [@"#" stringByAppendingString:c.percentEncodedFragment]
                  : @"",
    @"origin" : origin,
  };
  return EncodeJSON(parts);
}

// 带参数的类方法。和实例方法一样，name 是完整的 ObjC selector。
nacre::NativeObjectRef CallClassObjectMethod(const std::string& className,
                                             const std::string& name,
                                             const std::string& argsJSON,
                                             const std::vector<void*>& argPtrs,
                                             std::string* error) {
  NSString* sel = @(name.c_str());
  id decoded = DecodeJSON(argsJSON);
  NSArray* args = [decoded isKindOfClass:NSArray.class] ? decoded : @[];
  auto arg = [&](NSUInteger i) -> id { return i < args.count ? args[i] : nil; };
  // 字重查不到就填错误并退出。注意和「返回 nil」要分开：fontWithName
  // 找不到字体是合法答案（JS 得到 null），字重写错了是调用方的错。
  // 下标显式传，不写死 1——换个 selector 字重未必还在同一位。
  auto weight = [&](NSUInteger i, UIFontWeight* out) {
    if (FontWeightFromName(arg(i), out)) return true;
    *error = EnumError(@"weight", arg(i), NamesForFontWeight());
    return false;
  };

  // 批量激活/停用。约束按「每个参数一个对象」传过来（argPtrs 本来就是
  // 一维的句柄数组），所以不用为「数组参数」另开一条通道。
  // 批量比逐个 isActive = true 好的地方是中间态不会短暂地不可满足。
  if (className == "NSLayoutConstraint") {
    BOOL activate = [sel isEqualToString:@"activateConstraints:"];
    if (activate || [sel isEqualToString:@"deactivateConstraints:"]) {
      NSMutableArray<NSLayoutConstraint*>* list = [NSMutableArray array];
      for (void* ptr : argPtrs) {
        id c = (__bridge id)ptr;
        if ([c isKindOfClass:NSLayoutConstraint.class]) [list addObject:c];
      }
      @try {
        if (activate) {
          [NSLayoutConstraint activateConstraints:list];
        } else {
          [NSLayoutConstraint deactivateConstraints:list];
        }
      } @catch (NSException* e) {
        *error = [NSString stringWithFormat:@"failed to activate constraint: %@", e.reason].UTF8String;
      }
      return {};
    }
  }

  if (className == "UIFont") {
    UIFont* font = nil;
    if ([sel isEqualToString:@"systemFontOfSize:"]) {
      font = [UIFont systemFontOfSize:[arg(0) doubleValue]];
    } else if ([sel isEqualToString:@"boldSystemFontOfSize:"]) {
      font = [UIFont boldSystemFontOfSize:[arg(0) doubleValue]];
    } else if ([sel isEqualToString:@"italicSystemFontOfSize:"]) {
      font = [UIFont italicSystemFontOfSize:[arg(0) doubleValue]];
    } else if ([sel isEqualToString:@"systemFontOfSize:weight:"]) {
      UIFontWeight w;
      if (!weight(1, &w)) return {};
      font = [UIFont systemFontOfSize:[arg(0) doubleValue] weight:w];
    } else if ([sel isEqualToString:@"monospacedSystemFontOfSize:weight:"]) {
      UIFontWeight w;
      if (!weight(1, &w)) return {};
      font = [UIFont monospacedSystemFontOfSize:[arg(0) doubleValue] weight:w];
    } else if ([sel isEqualToString:@"monospacedDigitSystemFontOfSize:weight:"]) {
      UIFontWeight w;
      if (!weight(1, &w)) return {};
      font = [UIFont monospacedDigitSystemFontOfSize:[arg(0) doubleValue] weight:w];
    } else if ([sel isEqualToString:@"fontWithName:size:"]) {
      NSString* fontName = [arg(0) isKindOfClass:NSString.class] ? arg(0) : nil;
      if (fontName == nil) return {};
      font = [UIFont fontWithName:fontName size:[arg(1) doubleValue]];
    } else if ([sel isEqualToString:@"preferredFontForTextStyle:"]) {
      UIFontTextStyle style = TextStyleFromName(arg(0));
      if (style == nil) {
        *error = EnumError(@"textStyle", arg(0), NamesForTextStyle());
        return {};
      }
      font = [UIFont preferredFontForTextStyle:style];
    }
    if (font == nil) return {};
    return {(__bridge void*)font, "UIFont"};
  }

  // UIImage 的四条取图路径。返回 nil 是**合法答案**（名字不存在、文件读不到、
  // 字节解不出来），所以这里只在参数类型不对时才填 error。
  if (className == "UIImage") {
    UIImage* image = nil;
    NSString* text = [arg(0) isKindOfClass:NSString.class] ? arg(0) : nil;
    if ([sel isEqualToString:@"imageNamed:"]) {
      // Asset Catalog 和 bundle 里的普通文件都能命中，而且认子目录路径
      // （实测 'assets/logo' 可以，但不会递归搜）
      if (text == nil) {
        *error = "imageNamed 需要一个字符串名字";
        return {};
      }
      image = [UIImage imageNamed:text];
    } else if ([sel isEqualToString:@"systemImageNamed:"]) {
      if (text == nil) {
        *error = "systemImageNamed 需要一个字符串名字";
        return {};
      }
      image = [UIImage systemImageNamed:text];
    } else if ([sel isEqualToString:@"imageWithContentsOfFile:"]) {
      if (text == nil) {
        *error = "imageWithContentsOfFile 需要一个字符串路径";
        return {};
      }
      image = [UIImage imageWithContentsOfFile:text];
    } else if ([sel isEqualToString:@"imageWithData:"] ||
               [sel isEqualToString:@"imageWithData:scale:"]) {
      // 字节来自 Blob，全程不进 V8 堆——fetch 下来的图直接上屏走这条
      id source = argPtrs.empty() ? nil : (__bridge id)argPtrs[0];
      if (![source isKindOfClass:NacreBlob.class]) {
        *error = "imageWithData 需要一个 Blob";
        return {};
      }
      NSData* data = ((NacreBlob*)source).data;
      if ([sel isEqualToString:@"imageWithData:scale:"]) {
        double scale = [arg(1) doubleValue];
        image = [UIImage imageWithData:data scale:scale > 0 ? scale : 1.0];
      } else {
        image = [UIImage imageWithData:data];
      }
    }
    if (image == nil) return {};
    return {(__bridge void*)image, "UIImage"};
  }
  return {};
}

nacre::NativeObjectRef ReadClassObjectProperty(const std::string& className,
                                               const std::string& name) {
  if (className == "UIColor") {
    UIColor* color = NamedColors()[@(name.c_str())];
    if (color != nil) return {(__bridge void*)color, "UIColor"};
  }
  return {};
}

void WriteNativeObjectProperty(id object, const std::string& name, void* valuePtr) {
  id value = (__bridge id)valuePtr;
  if ([object isKindOfClass:UIWindow.class]) {
    UIWindow* window = (UIWindow*)object;
    if (name == "rootViewController") {
      window.rootViewController = [value isKindOfClass:UIViewController.class] ? value : nil;
    } else if (name == "windowScene") {
      window.windowScene = [value isKindOfClass:UIWindowScene.class] ? value : nil;
    }
  }
  if ([object isKindOfClass:UIView.class] && name == "backgroundColor") {
    ((UIView*)object).backgroundColor = [value isKindOfClass:UIColor.class] ? value : nil;
  }
  if ([object isKindOfClass:UIImageView.class]) {
    UIImageView* iv = (UIImageView*)object;
    UIImage* image = [value isKindOfClass:UIImage.class] ? (UIImage*)value : nil;
    if (name == "image") {
      iv.image = image;
    } else if (name == "highlightedImage") {
      iv.highlightedImage = image;
    } else if (name == "tintColor") {
      // null_resettable：赋 nil 是合法的，表示退回继承来的那个
      iv.tintColor = [value isKindOfClass:UIColor.class] ? (UIColor*)value : nil;
    }
  }
  if ([object isKindOfClass:UILabel.class]) {
    UILabel* label = (UILabel*)object;
    UIColor* color = [value isKindOfClass:UIColor.class] ? (UIColor*)value : nil;
    if (name == "font") {
      label.font = [value isKindOfClass:UIFont.class] ? (UIFont*)value : nil;
    } else if (name == "textColor") {
      label.textColor = color;
    } else if (name == "shadowColor") {
      label.shadowColor = color;
    } else if (name == "highlightedTextColor") {
      label.highlightedTextColor = color;
    }
  }
}

void CallVoidMethod(id object, const std::string& name) {
  if ([object isKindOfClass:UIWindow.class]) {
    UIWindow* window = (UIWindow*)object;
    if (name == "makeKeyAndVisible") {
      [window makeKeyAndVisible];
    } else if (name == "makeKeyWindow") {
      [window makeKeyWindow];
    }
  }
}

// 带参数的方法。name 是完整的 ObjC selector（JS 层负责把
// 「第一段 + options」还原成 selector），所以这里的表和 Apple 文档一一对上。
// 对象参数在 args 里是 NSNull，真正的指针按同样的下标在 argPtrs 里。
// error 暂时没有填的地方：这些方法的参数里还没有枚举。通道先铺好，
// 到 NSLayoutConstraint 和 UIControlEvents 就用得上了。
std::string CallMethod(id object, const std::string& name, const std::string& argsJSON,
                       const std::vector<void*>& argPtrs, std::string* error) {
  NSString* sel = @(name.c_str());
  id decoded = DecodeJSON(argsJSON);
  NSArray* args = [decoded isKindOfClass:NSArray.class] ? decoded : @[];
  id result = nil;

  auto objectArg = [&](size_t i) -> id {
    return i < argPtrs.size() ? (__bridge id)argPtrs[i] : nil;
  };
  auto valueArg = [&](NSUInteger i) -> id { return i < args.count ? args[i] : nil; };
  auto viewArg = [&](size_t i) -> UIView* {
    id v = objectArg(i);
    return [v isKindOfClass:UIView.class] ? (UIView*)v : nil;
  };
  auto guideArg = [&](size_t i) -> UILayoutGuide* {
    id g = objectArg(i);
    return [g isKindOfClass:UILayoutGuide.class] ? (UILayoutGuide*)g : nil;
  };

  if ([object isKindOfClass:UIView.class]) {
    UIView* view = (UIView*)object;
    if ([sel isEqualToString:@"addSubview:"]) {
      if (UIView* child = viewArg(0)) [view addSubview:child];
    } else if ([sel isEqualToString:@"insertSubview:atIndex:"]) {
      if (UIView* child = viewArg(0)) {
        [view insertSubview:child atIndex:[valueArg(1) integerValue]];
      }
    } else if ([sel isEqualToString:@"insertSubview:belowSubview:"]) {
      if (UIView* child = viewArg(0)) {
        if (UIView* sibling = viewArg(1)) [view insertSubview:child belowSubview:sibling];
      }
    } else if ([sel isEqualToString:@"insertSubview:aboveSubview:"]) {
      if (UIView* child = viewArg(0)) {
        if (UIView* sibling = viewArg(1)) [view insertSubview:child aboveSubview:sibling];
      }
    } else if ([sel isEqualToString:@"removeFromSuperview"]) {
      [view removeFromSuperview];
    } else if ([sel isEqualToString:@"bringSubviewToFront:"]) {
      if (UIView* child = viewArg(0)) [view bringSubviewToFront:child];
    } else if ([sel isEqualToString:@"sendSubviewToBack:"]) {
      if (UIView* child = viewArg(0)) [view sendSubviewToBack:child];
    } else if ([sel isEqualToString:@"isDescendantOfView:"]) {
      UIView* other = viewArg(0);
      result = @(other != nil && [view isDescendantOfView:other]);
    } else if ([sel isEqualToString:@"sizeThatFits:"]) {
      result = SizeToJSON([view sizeThatFits:JSONToSize(valueArg(0))]);
    } else if ([sel isEqualToString:@"sizeToFit"]) {
      [view sizeToFit];
    } else if ([sel isEqualToString:@"convertPoint:toView:"]) {
      result = PointToJSON([view convertPoint:JSONToPoint(valueArg(0)) toView:viewArg(1)]);
    } else if ([sel isEqualToString:@"convertPoint:fromView:"]) {
      result = PointToJSON([view convertPoint:JSONToPoint(valueArg(0)) fromView:viewArg(1)]);
    } else if ([sel isEqualToString:@"convertRect:toView:"]) {
      result = RectToJSON([view convertRect:JSONToRect(valueArg(0)) toView:viewArg(1)]);
    } else if ([sel isEqualToString:@"convertRect:fromView:"]) {
      result = RectToJSON([view convertRect:JSONToRect(valueArg(0)) fromView:viewArg(1)]);
    } else if ([sel isEqualToString:@"setNeedsLayout"]) {
      [view setNeedsLayout];
    } else if ([sel isEqualToString:@"layoutIfNeeded"]) {
      [view layoutIfNeeded];
    } else if ([sel isEqualToString:@"setNeedsDisplay"]) {
      [view setNeedsDisplay];
    } else if ([sel isEqualToString:@"invalidateIntrinsicContentSize"]) {
      [view invalidateIntrinsicContentSize];
    } else if ([sel isEqualToString:@"addLayoutGuide:"]) {
      if (UILayoutGuide* guide = guideArg(0)) [view addLayoutGuide:guide];
    } else if ([sel isEqualToString:@"removeLayoutGuide:"]) {
      if (UILayoutGuide* guide = guideArg(0)) [view removeLayoutGuide:guide];
    } else if ([sel isEqualToString:@"exerciseAmbiguityInLayout"]) {
      [view exerciseAmbiguityInLayout];
    } else if ([sel isEqualToString:@"contentHuggingPriorityForAxis:"]) {
      UILayoutConstraintAxis axis;
      if (!LayoutConstraintAxisFromName(valueArg(0), &axis)) {
        *error = EnumError(@"axis", valueArg(0), NamesForLayoutConstraintAxis());
      } else {
        result = @([view contentHuggingPriorityForAxis:axis]);
      }
    } else if ([sel isEqualToString:@"contentCompressionResistancePriorityForAxis:"]) {
      UILayoutConstraintAxis axis;
      if (!LayoutConstraintAxisFromName(valueArg(0), &axis)) {
        *error = EnumError(@"axis", valueArg(0), NamesForLayoutConstraintAxis());
      } else {
        result = @([view contentCompressionResistancePriorityForAxis:axis]);
      }
    } else if ([sel isEqualToString:@"setContentHuggingPriority:forAxis:"]) {
      UILayoutPriority priority;
      UILayoutConstraintAxis axis;
      if (!LayoutPriorityFromValue(valueArg(0), &priority)) {
        *error = EnumError(@"priority", valueArg(0), NamesForLayoutPriority());
      } else if (!LayoutConstraintAxisFromName(valueArg(1), &axis)) {
        *error = EnumError(@"forAxis", valueArg(1), NamesForLayoutConstraintAxis());
      } else {
        [view setContentHuggingPriority:priority forAxis:axis];
      }
    } else if ([sel isEqualToString:@"setContentCompressionResistancePriority:forAxis:"]) {
      UILayoutPriority priority;
      UILayoutConstraintAxis axis;
      if (!LayoutPriorityFromValue(valueArg(0), &priority)) {
        *error = EnumError(@"priority", valueArg(0), NamesForLayoutPriority());
      } else if (!LayoutConstraintAxisFromName(valueArg(1), &axis)) {
        *error = EnumError(@"forAxis", valueArg(1), NamesForLayoutConstraintAxis());
      } else {
        [view setContentCompressionResistancePriority:priority forAxis:axis];
      }
    } else if ([sel isEqualToString:@"systemLayoutSizeFittingSize:"]) {
      result = SizeToJSON([view systemLayoutSizeFittingSize:JSONToSize(valueArg(0))]);
    } else if ([sel isEqualToString:@"systemLayoutSizeFittingSize:"
                                     "withHorizontalFittingPriority:"
                                     "verticalFittingPriority:"]) {
      UILayoutPriority h;
      UILayoutPriority v;
      if (!LayoutPriorityFromValue(valueArg(1), &h)) {
        *error = EnumError(@"withHorizontalFittingPriority", valueArg(1),
                           NamesForLayoutPriority());
      } else if (!LayoutPriorityFromValue(valueArg(2), &v)) {
        *error = EnumError(@"verticalFittingPriority", valueArg(2),
                           NamesForLayoutPriority());
      } else {
        result = SizeToJSON([view systemLayoutSizeFittingSize:JSONToSize(valueArg(0))
                               withHorizontalFittingPriority:h
                                     verticalFittingPriority:v]);
      }
    }
  }
  return EncodeJSON(result);
}

// 带参数、返回原生对象的方法
nacre::NativeObjectRef CallObjectMethod(id object, const std::string& name,
                                        const std::string& argsJSON,
                                        const std::vector<void*>& argPtrs,
                                        std::string* error) {
  NSString* sel = @(name.c_str());
  id decoded = DecodeJSON(argsJSON);
  NSArray* args = [decoded isKindOfClass:NSArray.class] ? decoded : @[];
  if ([object isKindOfClass:UIView.class]) {
    UIView* view = (UIView*)object;
    if ([sel isEqualToString:@"viewWithTag:"] && args.count > 0) {
      return {(__bridge void*)[view viewWithTag:[args[0] integerValue]], "UIView"};
    }
    if ([sel isEqualToString:@"hitTest:withEvent:"] && args.count > 0) {
      return {(__bridge void*)[view hitTest:JSONToPoint(args[0]) withEvent:nil], "UIView"};
    }
  }
  // 锚点。一条约束只能连同类的锚点，跨类连原生抛 NSInvalidArgumentException，
  // 所以这里先查，把「你问错了」变成 TypeError 而不是崩溃。
  if ([object isKindOfClass:NSLayoutAnchor.class]) {
    NSLayoutAnchor* anchor = (NSLayoutAnchor*)object;
    auto num = [&](NSUInteger i) -> CGFloat {
      return i < args.count ? [args[i] doubleValue] : 0;
    };
    id otherRaw = argPtrs.empty() ? nil : (__bridge id)argPtrs[0];
    NSLayoutConstraint* made = nil;

    // 尺寸锚点的「等于一个常数」系列不需要另一个锚点
    if ([anchor isKindOfClass:NSLayoutDimension.class]) {
      NSLayoutDimension* dim = (NSLayoutDimension*)anchor;
      if ([sel isEqualToString:@"constraintEqualToConstant:"]) {
        made = [dim constraintEqualToConstant:num(0)];
      } else if ([sel isEqualToString:@"constraintGreaterThanOrEqualToConstant:"]) {
        made = [dim constraintGreaterThanOrEqualToConstant:num(0)];
      } else if ([sel isEqualToString:@"constraintLessThanOrEqualToConstant:"]) {
        made = [dim constraintLessThanOrEqualToConstant:num(0)];
      }
      if (made != nil) return {(__bridge void*)made, "NSLayoutConstraint"};
    }

    if (![otherRaw isKindOfClass:NSLayoutAnchor.class]) {
      *error = [NSString stringWithFormat:@"%@ needs an anchor as its argument", sel].UTF8String;
      return {};
    }
    NSLayoutAnchor* other = (NSLayoutAnchor*)otherRaw;
    if (strcmp(AnchorClassName(anchor), AnchorClassName(other)) != 0) {
      *error = [NSString stringWithFormat:@"%s cannot be constrained to %s: their units are not compatible",
                                          AnchorClassName(anchor),
                                          AnchorClassName(other)]
                   .UTF8String;
      return {};
    }

    if ([sel isEqualToString:@"constraintEqualToAnchor:"]) {
      made = [anchor constraintEqualToAnchor:other];
    } else if ([sel isEqualToString:@"constraintEqualToAnchor:constant:"]) {
      made = [anchor constraintEqualToAnchor:other constant:num(1)];
    } else if ([sel isEqualToString:@"constraintGreaterThanOrEqualToAnchor:"]) {
      made = [anchor constraintGreaterThanOrEqualToAnchor:other];
    } else if ([sel isEqualToString:@"constraintGreaterThanOrEqualToAnchor:constant:"]) {
      made = [anchor constraintGreaterThanOrEqualToAnchor:other constant:num(1)];
    } else if ([sel isEqualToString:@"constraintLessThanOrEqualToAnchor:"]) {
      made = [anchor constraintLessThanOrEqualToAnchor:other];
    } else if ([sel isEqualToString:@"constraintLessThanOrEqualToAnchor:constant:"]) {
      made = [anchor constraintLessThanOrEqualToAnchor:other constant:num(1)];
    }
    if (made != nil) return {(__bridge void*)made, "NSLayoutConstraint"};

    if ([anchor isKindOfClass:NSLayoutDimension.class]) {
      NSLayoutDimension* dim = (NSLayoutDimension*)anchor;
      NSLayoutDimension* od = (NSLayoutDimension*)other;
      if ([sel isEqualToString:@"constraintEqualToAnchor:multiplier:"]) {
        made = [dim constraintEqualToAnchor:od multiplier:num(1)];
      } else if ([sel isEqualToString:@"constraintEqualToAnchor:multiplier:constant:"]) {
        made = [dim constraintEqualToAnchor:od multiplier:num(1) constant:num(2)];
      } else if ([sel isEqualToString:@"constraintGreaterThanOrEqualToAnchor:multiplier:"]) {
        made = [dim constraintGreaterThanOrEqualToAnchor:od multiplier:num(1)];
      } else if ([sel isEqualToString:
                          @"constraintGreaterThanOrEqualToAnchor:multiplier:constant:"]) {
        made = [dim constraintGreaterThanOrEqualToAnchor:od
                                              multiplier:num(1)
                                                constant:num(2)];
      } else if ([sel isEqualToString:@"constraintLessThanOrEqualToAnchor:multiplier:"]) {
        made = [dim constraintLessThanOrEqualToAnchor:od multiplier:num(1)];
      } else if ([sel isEqualToString:
                          @"constraintLessThanOrEqualToAnchor:multiplier:constant:"]) {
        made = [dim constraintLessThanOrEqualToAnchor:od
                                           multiplier:num(1)
                                             constant:num(2)];
      }
      if (made != nil) return {(__bridge void*)made, "NSLayoutConstraint"};
    }

    // 系统标准间距。两个锚点之间差多少由系统按上下文决定（8pt 起步，
    // 但靠近屏幕边缘、不同控件之间都不一样）——这是 iOS 独有的能力，
    // Web 里没有对应物，所以原样暴露。
    if ([anchor isKindOfClass:NSLayoutXAxisAnchor.class]) {
      NSLayoutXAxisAnchor* x = (NSLayoutXAxisAnchor*)anchor;
      NSLayoutXAxisAnchor* ox = (NSLayoutXAxisAnchor*)other;
      if ([sel isEqualToString:@"constraintEqualToSystemSpacingAfterAnchor:multiplier:"]) {
        made = [x constraintEqualToSystemSpacingAfterAnchor:ox multiplier:num(1)];
      } else if ([sel isEqualToString:
                          @"constraintGreaterThanOrEqualToSystemSpacingAfterAnchor:"
                          @"multiplier:"]) {
        made = [x constraintGreaterThanOrEqualToSystemSpacingAfterAnchor:ox
                                                              multiplier:num(1)];
      } else if ([sel isEqualToString:
                          @"constraintLessThanOrEqualToSystemSpacingAfterAnchor:"
                          @"multiplier:"]) {
        made = [x constraintLessThanOrEqualToSystemSpacingAfterAnchor:ox
                                                           multiplier:num(1)];
      } else if ([sel isEqualToString:@"anchorWithOffsetToAnchor:"]) {
        return {(__bridge void*)[x anchorWithOffsetToAnchor:ox], "NSLayoutDimension"};
      }
    } else if ([anchor isKindOfClass:NSLayoutYAxisAnchor.class]) {
      NSLayoutYAxisAnchor* y = (NSLayoutYAxisAnchor*)anchor;
      NSLayoutYAxisAnchor* oy = (NSLayoutYAxisAnchor*)other;
      if ([sel isEqualToString:@"constraintEqualToSystemSpacingBelowAnchor:multiplier:"]) {
        made = [y constraintEqualToSystemSpacingBelowAnchor:oy multiplier:num(1)];
      } else if ([sel isEqualToString:
                          @"constraintGreaterThanOrEqualToSystemSpacingBelowAnchor:"
                          @"multiplier:"]) {
        made = [y constraintGreaterThanOrEqualToSystemSpacingBelowAnchor:oy
                                                              multiplier:num(1)];
      } else if ([sel isEqualToString:
                          @"constraintLessThanOrEqualToSystemSpacingBelowAnchor:"
                          @"multiplier:"]) {
        made = [y constraintLessThanOrEqualToSystemSpacingBelowAnchor:oy
                                                           multiplier:num(1)];
      } else if ([sel isEqualToString:@"anchorWithOffsetToAnchor:"]) {
        return {(__bridge void*)[y anchorWithOffsetToAnchor:oy], "NSLayoutDimension"};
      }
    }
    if (made != nil) return {(__bridge void*)made, "NSLayoutConstraint"};
  }

  // UIImage 不可变：这些方法都返回一张新图，不改原图。
  if ([object isKindOfClass:UIImage.class]) {
    UIImage* image = (UIImage*)object;
    auto arg = [&](NSUInteger i) -> id { return i < args.count ? args[i] : nil; };
    if ([sel isEqualToString:@"resizableImageWithCapInsets:"]) {
      return {(__bridge void*)[image resizableImageWithCapInsets:JSONToInsets(arg(0))],
              "UIImage"};
    }
    if ([sel isEqualToString:@"resizableImageWithCapInsets:resizingMode:"]) {
      UIImageResizingMode mode;
      if (!ImageResizingModeFromName(arg(1), &mode)) {
        *error = EnumError(@"resizingMode", arg(1), NamesForImageResizingMode());
        return {};
      }
      return {(__bridge void*)[image resizableImageWithCapInsets:JSONToInsets(arg(0))
                                                    resizingMode:mode],
              "UIImage"};
    }
    if ([sel isEqualToString:@"imageWithRenderingMode:"]) {
      UIImageRenderingMode mode;
      if (!ImageRenderingModeFromName(arg(0), &mode)) {
        *error = EnumError(@"renderingMode", arg(0), NamesForImageRenderingMode());
        return {};
      }
      return {(__bridge void*)[image imageWithRenderingMode:mode], "UIImage"};
    }
  }
  return {};
}

// 返回原生对象数组的方法。目前只有排版调试那一个——UIKit 在我们这个
// 环境里对约束冲突一声不吭（stdout / stderr / os_log 三路实测全空），
// JS 开发者也没有 Xcode 控制台可看，这是唯一的自查手段。
std::vector<nacre::NativeObjectRef> CallObjectArrayMethod(
    id object, const std::string& name, const std::string& argsJSON,
    const std::vector<void*>& argPtrs, std::string* error) {
  std::vector<nacre::NativeObjectRef> refs;
  NSString* sel = @(name.c_str());
  id decoded = DecodeJSON(argsJSON);
  NSArray* args = [decoded isKindOfClass:NSArray.class] ? decoded : @[];
  if ([object isKindOfClass:UIView.class] &&
      [sel isEqualToString:@"constraintsAffectingLayoutForAxis:"]) {
    UILayoutConstraintAxis axis;
    id given = args.count > 0 ? args[0] : nil;
    if (!LayoutConstraintAxisFromName(given, &axis)) {
      *error = EnumError(@"axis", given, NamesForLayoutConstraintAxis());
      return refs;
    }
    for (NSLayoutConstraint* c in
         [(UIView*)object constraintsAffectingLayoutForAxis:axis]) {
      refs.push_back({(__bridge void*)c, "NSLayoutConstraint"});
    }
  }
  return refs;
}

// JS 发起的构造。
// ARC 会在本函数返回时释放局部变量，而调用方要到返回之后才 retain——
// 中间这一瞬对象就没了。CFAutorelease 把它交给当前 run loop 轮次的
// 自动释放池，撑到调用方 retain 为止。
nacre::NativeObjectRef ConstructNative(const std::string& className,
                                       const std::vector<void*>& args) {
  id object = nil;
  if (className == "UIWindow") {
    id scene = args.empty() ? nil : (__bridge id)args[0];
    if (![scene isKindOfClass:UIWindowScene.class]) return {};
    object = [[UIWindow alloc] initWithWindowScene:(UIWindowScene*)scene];
  } else if (className == "UIViewController") {
    object = [[UIViewController alloc] init];
  } else if (className == "UIView") {
    object = [[UIView alloc] init];
  } else if (className == "UILabel") {
    object = [[UILabel alloc] init];
  } else if (className == "UIImageView") {
    object = [[UIImageView alloc] init];
  } else if (className == "UILayoutGuide") {
    object = [[UILayoutGuide alloc] init];
  }
  if (object == nil) return {};
  return {(void*)CFAutorelease(CFBridgingRetain(object)), className};
}

std::string InfoDictionaryJSON() {
  NSDictionary* info = NSBundle.mainBundle.infoDictionary ?: @{};
  id safe = SanitizeForJSON(info);
  NSError* error = nil;
  NSData* data = [NSJSONSerialization dataWithJSONObject:safe options:0 error:&error];
  if (!data) {
    WriteRuntimeLog([NSString stringWithFormat:@"failed to serialize Info.plist: %@", error.localizedDescription]);
    return "{}";
  }
  return std::string(static_cast<const char*>(data.bytes), data.length);
}

}  // namespace

// ---------------------------------------------------------------------------
// fetch
// ---------------------------------------------------------------------------
//
// 线程分工（实测定下来的）：
//
//   NSURLSession 的线程池     DNS/TCP/TLS/传输/gzip，系统的，并行
//          ↓
//   delegate 串行队列         **只做最轻的事**：追加数据、记状态、一次 dispatch
//          ↓
//   并发队列                  UTF-8 解码这类 CPU 活
//          ↓
//   主线程                    建 V8 对象、兑现 Promise
//
// 中间那层是被实测逼出来的：20 个并发请求，每个回调做 100ms 重活，直接在
// delegate 队列上做要 2179ms（全串行），派到并发队列只要 166ms。

@interface NacreFetchTask : NSObject
@property(nonatomic) int requestId;
@property(nonatomic, strong) NSURLSessionDataTask* task;
@property(nonatomic, strong) NSMutableData* body;
@property(nonatomic) BOOL completed;      // body 下载完了（成功或失败）
@property(nonatomic, strong) NSError* error;
// 等 body 的那个调用。headers 先到、body 后到，所以 read 可能来得比完成早
@property(nonatomic) int pendingBodyCallId;
@property(nonatomic, copy) NSString* pendingBodyKind;
@end

@implementation NacreFetchTask
@end

@interface NacreRuntime () <NSURLSessionDataDelegate>
@end

@implementation NacreRuntime {
  BOOL _started;
  // JS 跑在主线程，所以这些都只在主线程上创建、使用和销毁
  std::shared_ptr<std::unique_ptr<nacre::Engine>> _engine;
  std::shared_ptr<AppSnapshot> _snapshot;
  NSMutableArray* _observers;
  // 主线程即将空闲时把时间交给 V8 做增量 GC
  CFRunLoopObserverRef _idleObserver;
  // fetch 的状态。_fetchTasks 只在 _fetchQueue 上访问，所以不用加锁。
  NSURLSession* _session;
  NSOperationQueue* _delegateQueue;     // 串行，只做最轻的事
  dispatch_queue_t _fetchQueue;         // 串行，守着 _fetchTasks
  dispatch_queue_t _fetchWorkQueue;     // 并发，干解码这类重活
  NSMutableDictionary<NSNumber*, NacreFetchTask*>* _fetchTasks;
  int _nextRequestId;

  // 定时器唤醒的「代数」。到期顺序由 Engine 的堆决定，这里只管「叫醒」。
  //
  // 为什么不用 dispatch_source 复用一个 timer：FireDueTimers 整个跑在唤醒的
  // 回调里，而它结尾要安排下一次唤醒——那就是在 dispatch_source 的 handler
  // 内部重设这个 source 自己，实测会把这次约定丢掉，于是定时器只触发一次。
  //
  // 改成每次 dispatch_after 一个新 block，用代数作废旧的约定。代价是被作废
  // 的 block 还要等到原定时刻才空转一次，但它只做一次整数比较。
  //
  // dispatch_after 和 postToJS: 的 dispatch_async 都提交到主队列，按入队时刻
  // FIFO——实测验证过，所以定时器和原生事件的先后顺序是确定的。
  uint64_t _wakeupGeneration;
}

- (instancetype)init {
  if ((self = [super init])) {
    _engine = std::make_shared<std::unique_ptr<nacre::Engine>>();
    _snapshot = std::make_shared<AppSnapshot>();
    _observers = [NSMutableArray array];
    _fetchTasks = [NSMutableDictionary dictionary];
    _nextRequestId = 1;
    _fetchQueue = dispatch_queue_create("nacre.fetch", DISPATCH_QUEUE_SERIAL);
    _fetchWorkQueue = dispatch_queue_create(
        "nacre.fetch.work", DISPATCH_QUEUE_CONCURRENT);
    // delegate 队列设成串行（maxConcurrent = 1）：回调顺序要确定，
    // 而且我们在上面只做最轻的事，重活会派到 _fetchWorkQueue
    _delegateQueue = [NSOperationQueue new];
    _delegateQueue.maxConcurrentOperationCount = 1;
    _delegateQueue.name = @"nacre.fetch.delegate";
  }
  return self;
}

// ---- fetch ----

- (NSURLSession*)fetchSession {
  if (!_session) {
    NSURLSessionConfiguration* cfg =
        [NSURLSessionConfiguration defaultSessionConfiguration];
    _session = [NSURLSession sessionWithConfiguration:cfg
                                             delegate:self
                                        delegateQueue:_delegateQueue];
  }
  return _session;
}

- (int)fetchStart:(const std::string&)urlText
          options:(const std::string&)optionsJSON
           callId:(int)callId {
  auto engine = _engine;
  NSURL* url = [NSURL URLWithString:@(urlText.c_str())];
  if (url == nil || url.scheme.length == 0) {
    // 立刻拒绝，但要排到下一轮——JS 还没拿到 Promise 呢
    dispatch_async(dispatch_get_main_queue(), ^{
      if (*engine) (*engine)->RejectCall(callId, "TypeError", "URL 不合法");
    });
    return 0;
  }

  id decoded = DecodeJSON(optionsJSON);
  NSDictionary* opts = [decoded isKindOfClass:NSDictionary.class] ? decoded : @{};
  NSMutableURLRequest* req = [NSMutableURLRequest requestWithURL:url];
  NSString* method = opts[@"method"];
  req.HTTPMethod = [method isKindOfClass:NSString.class] ? method.uppercaseString : @"GET";
  NSArray* headerPairs = opts[@"headers"];
  if ([headerPairs isKindOfClass:NSArray.class]) {
    for (NSArray* pair in headerPairs) {
      if (![pair isKindOfClass:NSArray.class] || pair.count != 2) continue;
      // 用 add 而不是 set：同名多值要保留
      [req addValue:pair[1] forHTTPHeaderField:pair[0]];
    }
  }
  NSString* bodyText = opts[@"body"];
  if ([bodyText isKindOfClass:NSString.class]) {
    req.HTTPBody = [bodyText dataUsingEncoding:NSUTF8StringEncoding];
  }

  const int requestId = _nextRequestId++;
  NacreFetchTask* entry = [NacreFetchTask new];
  entry.requestId = requestId;
  entry.body = [NSMutableData data];
  entry.pendingBodyCallId = 0;
  entry.task = [[self fetchSession] dataTaskWithRequest:req];
  // taskDescription 是从 delegate 回调找回 requestId 的那根线
  entry.task.taskDescription = [NSString stringWithFormat:@"%d:%d", requestId, callId];
  dispatch_async(_fetchQueue, ^{
    self->_fetchTasks[@(requestId)] = entry;
  });
  [entry.task resume];
  return requestId;
}

// 把 delegate 回调里的 task 映射回我们的记录
- (void)withTask:(NSURLSessionTask*)task
              do:(void (^)(NacreFetchTask* entry, int callId))block {
  NSArray* parts = [task.taskDescription componentsSeparatedByString:@":"];
  if (parts.count != 2) return;
  const int requestId = [parts[0] intValue];
  const int callId = [parts[1] intValue];
  dispatch_async(_fetchQueue, ^{
    NacreFetchTask* entry = self->_fetchTasks[@(requestId)];
    if (entry) block(entry, callId);
  });
}

// headers 到了 —— 这时候就兑现 Response，body 还在下
- (void)URLSession:(NSURLSession*)session
              dataTask:(NSURLSessionDataTask*)dataTask
    didReceiveResponse:(NSURLResponse*)response
     completionHandler:(void (^)(NSURLSessionResponseDisposition))completionHandler {
  completionHandler(NSURLSessionResponseAllow);
  auto engine = _engine;
  NSHTTPURLResponse* http =
      [response isKindOfClass:NSHTTPURLResponse.class] ? (NSHTTPURLResponse*)response : nil;
  [self withTask:dataTask
              do:^(NacreFetchTask* entry, int callId) {
                NSMutableArray* headerPairs = [NSMutableArray array];
                [http.allHeaderFields
                    enumerateKeysAndObjectsUsingBlock:^(id k, id v, BOOL* stop) {
                      [headerPairs addObject:@[ [k description], [v description] ]];
                    }];
                NSDictionary* payload = @{
                  @"requestId" : @(entry.requestId),
                  @"status" : @(http ? http.statusCode : 200),
                  @"url" : response.URL.absoluteString ?: @"",
                  @"headers" : headerPairs,
                };
                const std::string json = EncodeJSON(payload);
                dispatch_async(dispatch_get_main_queue(), ^{
                  if (*engine) (*engine)->SettleJSON(callId, json);
                });
              }];
}

// 数据块到了 —— delegate 队列上只做 append，绝不在这里干活
- (void)URLSession:(NSURLSession*)session
          dataTask:(NSURLSessionDataTask*)dataTask
    didReceiveData:(NSData*)data {
  [self withTask:dataTask
              do:^(NacreFetchTask* entry, int callId) { [entry.body appendData:data]; }];
}

- (void)URLSession:(NSURLSession*)session
                    task:(NSURLSessionTask*)task
    didCompleteWithError:(NSError*)error {
  [self withTask:task
              do:^(NacreFetchTask* entry, int callId) {
                entry.completed = YES;
                entry.error = error;
                if (error && entry.pendingBodyCallId == 0) {
                  // headers 都没到就失败了，拒绝那个 Response 的 Promise
                  [self rejectCall:callId withError:error];
                }
                if (entry.pendingBodyCallId != 0) {
                  // 已经有人在等 body 了，现在能给了
                  [self deliverBody:entry
                               kind:entry.pendingBodyKind
                             callId:entry.pendingBodyCallId];
                  entry.pendingBodyCallId = 0;
                }
              }];
}

- (void)rejectCall:(int)callId withError:(NSError*)error {
  auto engine = _engine;
  const BOOL cancelled = error.code == NSURLErrorCancelled;
  const std::string name = cancelled ? "AbortError" : "TypeError";
  NSString* text = cancelled
                       ? @"The operation was aborted"
                       : [NSString stringWithFormat:@"Network request failed: %@",
                                                    error.localizedDescription];
  const std::string message = text.UTF8String;
  dispatch_async(dispatch_get_main_queue(), ^{
    if (*engine) (*engine)->RejectCall(callId, name, message);
  });
}

// 真正把 body 交出去。重活（UTF-8 解码）在并发队列上做。
- (void)deliverBody:(NacreFetchTask*)entry kind:(NSString*)kind callId:(int)callId {
  auto engine = _engine;
  if (entry.error) {
    [self rejectCall:callId withError:entry.error];
    return;
  }
  NSData* data = [entry.body copy];
  dispatch_async(_fetchWorkQueue, ^{
    if ([kind isEqualToString:@"text"]) {
      // UTF-8 解码：这是实打实的 CPU 活，所以才要并发队列
      NSString* text = [[NSString alloc] initWithData:data
                                             encoding:NSUTF8StringEncoding]
                           ?: @"";
      const std::string json = EncodeJSON(text);
      dispatch_async(dispatch_get_main_queue(), ^{
        if (*engine) (*engine)->SettleJSON(callId, json);
      });
    } else if ([kind isEqualToString:@"blob"]) {
      // blob：字节压根不进 V8 堆，JS 侧只拿一个句柄
      NacreBlob* blob = [NacreBlob new];
      blob.data = data;
      blob.type = @"";
      dispatch_async(dispatch_get_main_queue(), ^{
        if (!*engine) return;
        (*engine)->SettleObject(
            callId, {(void*)CFAutorelease(CFBridgingRetain(blob)), "Blob"});
      });
    } else {
      // arrayBuffer：把 NSData 的内存直接交给 V8，零拷贝。
      // CFBridgingRetain 把所有权转过去，deleter 里再 release。
      const void* bytes = data.bytes;
      const size_t length = data.length;
      void* owned = (void*)CFBridgingRetain(data);
      dispatch_async(dispatch_get_main_queue(), ^{
        if (!*engine) {
          CFRelease(owned);
          return;
        }
        (*engine)->SettleBytes(
            callId, (void*)bytes, length,
            [](void* d, size_t len, void* info) { CFRelease(info); }, owned);
      });
    }
  });
}

- (void)fetchReadBody:(int)requestId kind:(const std::string&)kindText callId:(int)callId {
  NSString* kind = @(kindText.c_str());
  auto engine = _engine;
  dispatch_async(_fetchQueue, ^{
    NacreFetchTask* entry = self->_fetchTasks[@(requestId)];
    if (!entry) {
      dispatch_async(dispatch_get_main_queue(), ^{
        if (*engine) (*engine)->RejectCall(callId, "TypeError", "这个请求已经没了");
      });
      return;
    }
    if (entry.completed) {
      [self deliverBody:entry kind:kind callId:callId];
    } else {
      // body 还在下，记下来等完成时再给
      entry.pendingBodyCallId = callId;
      entry.pendingBodyKind = kind;
    }
  });
}

- (void)fetchCancel:(int)requestId {
  dispatch_async(_fetchQueue, ^{
    NacreFetchTask* entry = self->_fetchTasks[@(requestId)];
    [entry.task cancel];
  });
}

// ---- Blob ----

- (void)readObjectAsync:(id)object kind:(const std::string&)kindText callId:(int)callId {
  auto engine = _engine;
  NSString* kind = @(kindText.c_str());
  if (![object isKindOfClass:NacreBlob.class]) {
    dispatch_async(dispatch_get_main_queue(), ^{
      if (*engine) (*engine)->RejectCall(callId, "TypeError", "这个对象读不出内容");
    });
    return;
  }
  NSData* data = ((NacreBlob*)object).data;
  // 解码派到并发队列：大 Blob 的 UTF-8 解码是实打实的 CPU 活，
  // 在主线程做会掉帧。这也是 arrayBuffer 零拷贝、text 才要后台的原因。
  dispatch_async(_fetchWorkQueue, ^{
    if ([kind isEqualToString:@"text"]) {
      NSString* text =
          [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding] ?: @"";
      const std::string json = EncodeJSON(text);
      dispatch_async(dispatch_get_main_queue(), ^{
        if (*engine) (*engine)->SettleJSON(callId, json);
      });
    } else {
      const void* bytes = data.bytes;
      const size_t length = data.length;
      void* owned = (void*)CFBridgingRetain(data);
      dispatch_async(dispatch_get_main_queue(), ^{
        if (!*engine) {
          CFRelease(owned);
          return;
        }
        (*engine)->SettleBytes(
            callId, (void*)bytes, length,
            [](void* d, size_t len, void* info) { CFRelease(info); }, owned);
      });
    }
  });
}

nacre::NativeObjectRef CreateBlob(
    const std::string& partsJSON,
    const std::vector<std::pair<const void*, size_t>>& buffers,
    const std::string& type) {
  id decoded = DecodeJSON(partsJSON);
  NSArray* parts = [decoded isKindOfClass:NSArray.class] ? decoded : @[];
  NSMutableData* out = [NSMutableData data];
  for (NSUInteger i = 0; i < parts.count; i++) {
    id item = parts[i];
    if (i < buffers.size() && buffers[i].first != nullptr) {
      // 字节项：JSON 里是 null，真正的数据在 buffers 里
      [out appendBytes:buffers[i].first length:buffers[i].second];
    } else if ([item isKindOfClass:NSString.class]) {
      [out appendData:[item dataUsingEncoding:NSUTF8StringEncoding]];
    } else if (item != nil && item != NSNull.null) {
      [out appendData:[[item description] dataUsingEncoding:NSUTF8StringEncoding]];
    }
  }
  NacreBlob* blob = [NacreBlob new];
  blob.data = out;
  blob.type = @(type.c_str());
  return {(void*)CFAutorelease(CFBridgingRetain(blob)), "Blob"};
}

- (void)fetchRelease:(int)requestId {
  dispatch_async(_fetchQueue, ^{
    [self->_fetchTasks removeObjectForKey:@(requestId)];
  });
}

- (void)startWithScriptsDirectory:(NSURL *)directory {
  if (_started) return;
  _started = YES;

  // 环境快照。JS 现在和 UIKit 同线程，本可以直接读，
  // 但保留快照能让 environmentJSON 一次拿齐，少几次 UIKit 往返。
  _snapshot->infoJSON = InfoDictionaryJSON();
  RebuildEnvironment(_snapshot);

  auto engine = _engine;
  auto snapshot = _snapshot;
  NSURL* dir = [directory copy];
  __weak NacreRuntime* weakSelf = self;

  // 1. 初始化 V8、创建 Isolate / Context、准备全局对象
  [self postToJS:^{
    double t0 = NowMs();
    nacre::Engine::InitializeV8Once();
    double t1 = NowMs();

    nacre::EngineHost host;
    host.log = WriteJSLog;
    host.app_info_json = [snapshot]() { return snapshot->infoJSON; };
    host.app_environment_json = [snapshot]() {
      std::lock_guard<std::mutex> lock(snapshot->mutex);
      return snapshot->environmentJSON;
    };
    // 系统要用 completionHandler 回答，所以这个天然是异步的，返回 Promise
    host.open_url = [weakSelf](const std::string& url, int callId) {
      NSString* text = [NSString stringWithUTF8String:url.c_str()];
      NSURL* target = text.length ? [NSURL URLWithString:text] : nil;
      NacreRuntime* strongSelf = weakSelf;
      if (!strongSelf) return;
      if (!target) {
        [strongSelf settleCall:callId with:NO];
        return;
      }
      [UIApplication.sharedApplication openURL:target
                                       options:@{}
                             completionHandler:^(BOOL success) {
                               [strongSelf settleCall:callId with:success];
                             }];
    };
    // JS 和 UIKit 同线程，直接写就行，不用再切线程
    host.set_idle_timer_disabled = [snapshot](bool disabled) {
      UIApplication.sharedApplication.idleTimerDisabled = disabled;
      RebuildEnvironment(snapshot);
    };

    // 原生对象的引用计数。统一强引用：JS 包装活着时原生对象就不会被释放，
    // 这样不会有悬空指针。最坏情况只是数据过期（比如场景已断开）。
    host.retain_native = [](void* ptr) {
      if (ptr) CFRetain((CFTypeRef)ptr);
    };
    host.release_native = [](void* ptr) {
      if (ptr) CFRelease((CFTypeRef)ptr);
    };
    host.app_scenes = []() {
      std::vector<nacre::NativeObjectRef> refs;
      for (UIScene* scene in UIApplication.sharedApplication.connectedScenes) {
        if (![scene isKindOfClass:UIWindowScene.class]) continue;
        refs.push_back({(__bridge void*)scene, "UIWindowScene"});
      }
      return refs;
    };
    host.read_property = [](void* ptr, const std::string& name) {
      return ReadNativeProperty((__bridge id)ptr, name);
    };
    host.write_property = [](void* ptr, const std::string& name,
                             const std::string& json, std::string* error) {
      WriteNativeProperty((__bridge id)ptr, name, json, error);
    };
    host.read_object_property = [](void* ptr, const std::string& name) {
      return ReadNativeObjectProperty((__bridge id)ptr, name);
    };
    host.write_object_property = [](void* ptr, const std::string& name, void* value) {
      WriteNativeObjectProperty((__bridge id)ptr, name, value);
    };
    host.construct_native = [](const std::string& className,
                               const std::vector<void*>& args) {
      return ConstructNative(className, args);
    };
    host.call_method = [](void* ptr, const std::string& name,
                          const std::string& argsJSON,
                          const std::vector<void*>& argPtrs, std::string* error) {
      return CallMethod((__bridge id)ptr, name, argsJSON, argPtrs, error);
    };
    host.call_object_method = [](void* ptr, const std::string& name,
                                 const std::string& argsJSON,
                                 const std::vector<void*>& argPtrs,
                                 std::string* error) {
      return CallObjectMethod((__bridge id)ptr, name, argsJSON, argPtrs, error);
    };
    host.read_object_array_property = [](void* ptr, const std::string& name) {
      return ReadNativeObjectArrayProperty((__bridge id)ptr, name);
    };
    host.call_object_array_method = [](void* ptr, const std::string& name,
                                       const std::string& argsJSON,
                                       const std::vector<void*>& argPtrs,
                                       std::string* error) {
      return CallObjectArrayMethod((__bridge id)ptr, name, argsJSON, argPtrs, error);
    };
    host.call_class_object_method = [](const std::string& className,
                                       const std::string& name,
                                       const std::string& argsJSON,
                                       const std::vector<void*>& argPtrs,
                                       std::string* error) {
      return CallClassObjectMethod(className, name, argsJSON, argPtrs, error);
    };
    host.read_class_object_property = [](const std::string& className,
                                         const std::string& name) {
      return ReadClassObjectProperty(className, name);
    };
    host.fetch_start = [weakSelf](const std::string& url, const std::string& options,
                                  int callId) -> int {
      NacreRuntime* strongSelf = weakSelf;
      if (!strongSelf) return 0;
      return [strongSelf fetchStart:url options:options callId:callId];
    };
    host.fetch_read_body = [weakSelf](int requestId, const std::string& kind,
                                      int callId) {
      NacreRuntime* strongSelf = weakSelf;
      if (strongSelf) [strongSelf fetchReadBody:requestId kind:kind callId:callId];
    };
    host.fetch_cancel = [weakSelf](int requestId) {
      NacreRuntime* strongSelf = weakSelf;
      if (strongSelf) [strongSelf fetchCancel:requestId];
    };
    host.fetch_release = [weakSelf](int requestId) {
      NacreRuntime* strongSelf = weakSelf;
      if (strongSelf) [strongSelf fetchRelease:requestId];
    };
    host.read_object_async = [weakSelf](void* ptr, const std::string& kind,
                                        int callId) {
      NacreRuntime* strongSelf = weakSelf;
      if (strongSelf) [strongSelf readObjectAsync:(__bridge id)ptr kind:kind callId:callId];
    };
    host.create_blob = [](const std::string& partsJSON,
                          const std::vector<std::pair<const void*, size_t>>& buffers,
                          const std::string& type) {
      return CreateBlob(partsJSON, buffers, type);
    };
    host.parse_url = [](const std::string& url, const std::string& base) {
      return ParseURL(url, base);
    };
    // 「delay_ms 之后叫我」。每次覆盖上一次的约定，负数表示撤销。
    host.schedule_wakeup = [weakSelf](double delayMs) {
      NacreRuntime* strongSelf = weakSelf;
      if (strongSelf) [strongSelf scheduleWakeupAfter:delayMs];
    };
    // 把任务排到主队列尾部。未处理拒绝的延后结算走这条。
    host.post_task = [weakSelf](std::function<void()> task) {
      NacreRuntime* strongSelf = weakSelf;
      if (!strongSelf) return;
      auto engine = strongSelf->_engine;
      dispatch_async(dispatch_get_main_queue(), ^{
        if (*engine) task();
      });
    };
    host.call_void_method = [](void* ptr, const std::string& name) {
      CallVoidMethod((__bridge id)ptr, name);
    };
    host.call_async = [weakSelf](void* ptr, const std::string& name,
                                 const std::string& argsJSON, int callId) {
      NacreRuntime* strongSelf = weakSelf;
      if (!strongSelf) return;
      id object = (__bridge id)ptr;
      if ([object isKindOfClass:UIScene.class] && name == "openURL") {
        NSArray* args = DecodeJSON(argsJSON);
        NSString* text = [args isKindOfClass:NSArray.class] ? args.firstObject : nil;
        NSURL* url = [text isKindOfClass:NSString.class] ? [NSURL URLWithString:text] : nil;
        if (!url) {
          [strongSelf settleCall:callId with:NO];
          return;
        }
        [(UIScene*)object openURL:url
                          options:nil
                completionHandler:^(BOOL success) {
                  [strongSelf settleCall:callId with:success];
                }];
        return;
      }
      // 图片解码默认发生在**绘制时**，也就是主线程。这两个方法把解码挪到
      // 后台，解完再把准备好的那张图交回来。JS 本来就在主线程抢时间，
      // 大图不走这条就会掉帧。
      if ([object isKindOfClass:UIImage.class]) {
        UIImage* image = (UIImage*)object;
        if (name == "prepareForDisplay") {
          [image prepareForDisplayWithCompletionHandler:^(UIImage* ready) {
            [strongSelf settleCall:callId withObject:ready className:"UIImage"];
          }];
          return;
        }
        if (name == "prepareThumbnailOfSize:") {
          id decoded = DecodeJSON(argsJSON);
          NSArray* args = [decoded isKindOfClass:NSArray.class] ? decoded : @[];
          [image prepareThumbnailOfSize:JSONToSize(args.firstObject)
                      completionHandler:^(UIImage* ready) {
                        [strongSelf settleCall:callId
                                    withObject:ready
                                     className:"UIImage"];
                      }];
          return;
        }
      }
      [strongSelf settleCall:callId with:NO];
    };
    *engine = std::make_unique<nacre::Engine>(std::move(host));
    double t2 = NowMs();

    WriteRuntimeLog([NSString stringWithFormat:@"V8 %s initialized in %.1f ms, context ready in %.1f ms",
                                               nacre::Engine::V8Version(), t1 - t0, t2 - t1]);
  }];

  // 2. 执行内置脚本，装上 EventTarget / Event / Application / application
  [self postToJS:^{
    if (!*engine) return;
    NSURL* url = [NSBundle.mainBundle URLForResource:@"nacre" withExtension:@"js" subdirectory:@"Builtin"];
    NSString* source = url ? [NSString stringWithContentsOfURL:url encoding:NSUTF8StringEncoding error:nil] : nil;
    if (!source) {
      WriteRuntimeLog(@"builtin script Builtin/nacre.js is missing; the upper-layer API is unavailable");
      return;
    }
    // 脚本名用 nacre:internal/ 前缀而不是文件路径：调用栈里一眼能看出是运行时内部，
    // 和 Node 的 node:internal/... 同样的做法
    double t0 = NowMs();
    bool ok = (*engine)->Evaluate({"nacre:internal/nacre.js", source.UTF8String});
    WriteRuntimeLog([NSString stringWithFormat:@"builtin script %@ in %.1f ms", ok ? @"ready" : @"failed", NowMs() - t0]);
  }];

  // 3. 加载并执行 main.js
  [self postToJS:^{
    if (!*engine) return;
    NSURL* url = [dir URLByAppendingPathComponent:@"main.js"];
    NSError* error = nil;
    NSString* source = [NSString stringWithContentsOfURL:url encoding:NSUTF8StringEncoding error:&error];
    if (!source) {
      WriteRuntimeLog([NSString stringWithFormat:@"cannot read main.js: %@", error.localizedDescription]);
      return;
    }
    double t0 = NowMs();
    bool ok = (*engine)->Evaluate({"main.js", source.UTF8String});
    WriteRuntimeLog([NSString stringWithFormat:@"main.js %@ in %.1f ms", ok ? @"finished" : @"failed", NowMs() - t0]);
  }];

  [self installIdleObserver];
  [self installNotificationObservers];
}

// 主线程 run loop 即将进入等待（没事可做了）时，把这段空闲交给 V8。
// Chrome 就是这样在帧间隙做增量 GC 的——没有空闲任务时这个调用几乎零成本。
// Engine 说「delay_ms 之后叫我」。重设唯一的那个 dispatch_source。
- (void)scheduleWakeupAfter:(double)delayMs {
  // 每次都让旧约定失效：代数变了，之前排的 block 醒来会发现自己过期，直接返回。
  const uint64_t generation = ++_wakeupGeneration;
  if (delayMs < 0) return;  // 堆空了，只作废不排新的

  auto engine = _engine;
  __weak NacreRuntime* weakSelf = self;
  dispatch_block_t wake = ^{
    NacreRuntime* strongSelf = weakSelf;
    if (!strongSelf || strongSelf->_wakeupGeneration != generation) return;
    if (*engine) (*engine)->FireDueTimers();
  };
  // 0 延迟走 dispatch_async，不走 dispatch_after。
  //
  // 这两个不等价：dispatch_after 即使延迟为 0 也要过一次内核 timer，排进
  // 队列的时刻比当场 dispatch_async 晚。实测的后果是 setTimeout(fn, 0) 会
  // 落到之后才排队的任务后面——未处理拒绝的延后结算就撞上了这个：补在
  // timer 里的 handler 本该抑制上报，结果上报先跑了。
  if (delayMs <= 0) {
    dispatch_async(dispatch_get_main_queue(), wake);
  } else {
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(delayMs * NSEC_PER_MSEC)),
                   dispatch_get_main_queue(), wake);
  }
}

- (void)installIdleObserver {
  auto engine = _engine;
  _idleObserver = CFRunLoopObserverCreateWithHandler(
      kCFAllocatorDefault, kCFRunLoopBeforeWaiting, /*repeats=*/true, /*order=*/0,
      ^(CFRunLoopObserverRef observer, CFRunLoopActivity activity) {
        if (*engine) (*engine)->RunIdleTasks(0.005);
      });
  CFRunLoopAddObserver(CFRunLoopGetMain(), _idleObserver, kCFRunLoopCommonModes);
}

// 原生通知在主线程到达 → 投递到 JS 线程的任务队列 → 在 JS 线程上派发给 application。
// 这是单向的：原生不等待 JS 的结果，所以事件都是 cancelable: false。
- (void)installNotificationObservers {
  auto engine = _engine;
  auto snapshot = _snapshot;
  __weak NacreRuntime* weakSelf = self;

  // 通知 → JS 事件名。
  // 原则：暴露出去的状态必须同时给「读」和「变化通知」，否则 JS 只能轮询，
  // 而我们连定时器都没有，等于完全不可观测。
  //
  // 前后台这四个是 App 级的聚合状态，走 UIApplication 的通知——Apple 废弃的是
  // delegate 方法，通知形式没废弃。等 scene 对象做好后，scene 级管「这个窗口」，
  // 这里管「所有场景的聚合」，两者并存。
  NSDictionary<NSNotificationName, NSString*>* map = @{
    UIApplicationDidReceiveMemoryWarningNotification : @"memorywarning",
    UIApplicationUserDidTakeScreenshotNotification : @"screenshot",
    UIApplicationSignificantTimeChangeNotification : @"significanttimechange",
    UIApplicationWillTerminateNotification : @"willterminate",
    UIContentSizeCategoryDidChangeNotification : @"contentsizecategorychange",
    UIApplicationProtectedDataDidBecomeAvailable : @"protecteddataavailable",
    UIApplicationProtectedDataWillBecomeUnavailable : @"protecteddataunavailable",
    UIApplicationBackgroundRefreshStatusDidChangeNotification : @"backgroundrefreshstatuschange",
    UIApplicationDidBecomeActiveNotification : @"active",
    UIApplicationWillResignActiveNotification : @"inactive",
    UIApplicationDidEnterBackgroundNotification : @"background",
    UIApplicationWillEnterForegroundNotification : @"foreground",
  };

  [map enumerateKeysAndObjectsUsingBlock:^(NSNotificationName name, NSString* type, BOOL* stop) {
    id token = [NSNotificationCenter.defaultCenter
        addObserverForName:name
                    object:nil
                     queue:NSOperationQueue.mainQueue
                usingBlock:^(NSNotification* _) {
                  // 这里在主线程，可以安全读 UIKit
                  RebuildEnvironment(snapshot);
                  if (type.length == 0) return;
                  NacreRuntime* strongSelf = weakSelf;
                  if (!strongSelf) return;
                  std::string eventType = type.UTF8String;
                  [strongSelf postToJS:^{
                    if (*engine) (*engine)->EmitAppEvent(eventType);
                  }];
                }];
    [self->_observers addObject:token];
  }];

  // 场景接入和断开。事件带着 scene 对象——这是 JS 拿到场景的唯一入口，
  // 因为启动时 application.scenes 是空的。
  NSDictionary<NSNotificationName, NSString*>* sceneEvents = @{
    UISceneWillConnectNotification : @"sceneconnect",
    UISceneDidDisconnectNotification : @"scenedisconnect",
  };
  [sceneEvents enumerateKeysAndObjectsUsingBlock:^(NSNotificationName name, NSString* type, BOOL* stop) {
    id token = [NSNotificationCenter.defaultCenter
        addObserverForName:name
                    object:nil
                     queue:NSOperationQueue.mainQueue
                usingBlock:^(NSNotification* note) {
                  UIScene* scene = note.object;
                  if (![scene isKindOfClass:UIWindowScene.class]) return;
                  NacreRuntime* strongSelf = weakSelf;
                  if (!strongSelf) return;
                  std::string eventType = type.UTF8String;
                  // 块强引用 scene，保证投递到下一轮时它还活着
                  [strongSelf postToJS:^{
                    if (!*engine) return;
                    (*engine)->EmitAppEventWithObject(
                        eventType, "scene", {(__bridge void*)scene, "UIWindowScene"});
                  }];
                }];
    [self->_observers addObject:token];
  }];

  // 场景自己的前后台状态变化。派发给 scene 对象本身，不是 application——
  // application 上同名的四个是「所有场景的聚合状态」，语义不同。
  // 按第 10 条完备性原则：activationState 可读，就必须有变化通知。
  NSDictionary<NSNotificationName, NSString*>* sceneLifecycle = @{
    UISceneDidActivateNotification : @"active",
    UISceneWillDeactivateNotification : @"inactive",
    UISceneWillEnterForegroundNotification : @"foreground",
    UISceneDidEnterBackgroundNotification : @"background",
  };
  [sceneLifecycle enumerateKeysAndObjectsUsingBlock:^(NSNotificationName name, NSString* type, BOOL* stop) {
    id token = [NSNotificationCenter.defaultCenter
        addObserverForName:name
                    object:nil
                     queue:NSOperationQueue.mainQueue
                usingBlock:^(NSNotification* note) {
                  UIScene* scene = note.object;
                  if (![scene isKindOfClass:UIWindowScene.class]) return;
                  NacreRuntime* strongSelf = weakSelf;
                  if (!strongSelf) return;
                  std::string eventType = type.UTF8String;
                  [strongSelf postToJS:^{
                    if (!*engine) return;
                    (*engine)->EmitObjectEvent({(__bridge void*)scene, "UIWindowScene"},
                                               eventType);
                  }];
                }];
    [self->_observers addObject:token];
  }];

  // 窗口的 key 和可见性变化。按第 10 条完备性原则：isKeyWindow 和
  // isHidden 都可读，就必须有变化通知，否则 JS 只能轮询——而我们连
  // 定时器都没有，等于完全不可观测。
  //
  // 事件名没有照搬场景那边的「状态名」风格（active / foreground…）：
  // 场景的 activationState 是一个枚举，状态名就是现成的；窗口这边
  // key 和 visible 是两个独立的布尔，没有状态名可用，所以用动作名。
  NSDictionary<NSNotificationName, NSString*>* windowEvents = @{
    UIWindowDidBecomeKeyNotification : @"becomekey",
    UIWindowDidResignKeyNotification : @"resignkey",
    UIWindowDidBecomeVisibleNotification : @"becomevisible",
    UIWindowDidBecomeHiddenNotification : @"becomehidden",
  };
  [windowEvents enumerateKeysAndObjectsUsingBlock:^(NSNotificationName name, NSString* type, BOOL* stop) {
    id token = [NSNotificationCenter.defaultCenter
        addObserverForName:name
                    object:nil
                     queue:NSOperationQueue.mainQueue
                usingBlock:^(NSNotification* note) {
                  UIWindow* window = note.object;
                  if (![window isKindOfClass:UIWindow.class]) return;
                  NacreRuntime* strongSelf = weakSelf;
                  if (!strongSelf) return;
                  std::string eventType = type.UTF8String;
                  [strongSelf postToJS:^{
                    if (!*engine) return;
                    (*engine)->EmitObjectEvent({(__bridge void*)window, "UIWindow"},
                                               eventType);
                  }];
                }];
    [self->_observers addObject:token];
  }];

  // 这个通知 iOS 27 才有，但对应的属性已经暴露了，不接上就不完备
  if (@available(iOS 27.0, *)) {
    id token = [NSNotificationCenter.defaultCenter
        addObserverForName:UIApplicationSystemPrefersReducedResourceUsageDidChangeNotification
                    object:nil
                     queue:NSOperationQueue.mainQueue
                usingBlock:^(NSNotification* _) {
                  RebuildEnvironment(snapshot);
                  NacreRuntime* strongSelf = weakSelf;
                  if (!strongSelf) return;
                  [strongSelf postToJS:^{
                    if (*engine) (*engine)->EmitAppEvent("reducedresourceusagechange");
                  }];
                }];
    [_observers addObject:token];
  }
}

// 把一次 JS 发起的异步调用的结果投回 JS 线程
- (void)settleCall:(int)callId with:(BOOL)value {
  auto engine = _engine;
  [self postToJS:^{
    if (*engine) (*engine)->SettleBool(callId, value ? true : false);
  }];
}

// call_async 这条通道只约定了「异步地兑现 call_id」，没规定兑现成什么。
// openURL 兑现布尔，图片解码兑现一个原生对象，共用同一条路。
- (void)settleCall:(int)callId withObject:(id)object className:(const char*)className {
  auto engine = _engine;
  std::string name = className;
  // 捕获 object 本身而不是裸指针：block 要等下一轮主队列才跑，
  // 这中间必须有人持有它，否则 SettleObject 拿到的是野指针。
  [self postToJS:^{
    if (*engine) (*engine)->SettleObject(callId, {(__bridge void*)object, name});
  }];
}

// JS 现在就在主线程上跑。仍然用 dispatch_async 而不是直接调用：
// 保证每轮 JS 执行都是独立的一轮，不会在 UIKit 操作中途重入。
- (void)postToJS:(dispatch_block_t)block {
  auto engine = _engine;
  dispatch_async(dispatch_get_main_queue(), ^{
    block();
    // 每轮任务结束后处理 V8 平台投递的任务（微任务由 kAuto 自动排空）
    if (*engine) (*engine)->PumpMessageLoop();
  });
}

- (void)dealloc {
  for (id token in _observers) [NSNotificationCenter.defaultCenter removeObserver:token];
  [_observers removeAllObjects];
  if (_idleObserver) {
    CFRunLoopRemoveObserver(CFRunLoopGetMain(), _idleObserver, kCFRunLoopCommonModes);
    CFRelease(_idleObserver);
    _idleObserver = NULL;
  }
  // 让所有已排的唤醒作废；它们醒来时 weakSelf 也已经是 nil 了
  _wakeupGeneration++;
  [_session invalidateAndCancel];
  _session = nil;
  // Engine 和 JS 在同一个线程（主线程），dealloc 也在主线程，直接销毁
  _engine->reset();
}

@end
