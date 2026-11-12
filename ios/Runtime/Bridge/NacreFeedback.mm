// 触感反馈：UIFeedbackGenerator 和它的三个子类。
//
// 一个域一个文件，每个入口返回「认不认领」。
//
// 只暴露和视图绑定的工厂方法（+feedbackGeneratorForView: 一组，iOS 17.5）。
// -init 和 -initWithStyle: 在头文件里已经标成将废弃，而我们最低就是 iOS 26，
// 没有理由再给一个要废弃的入口。带触点位置的那几个变体（…AtLocation:）没做。

#import "NacreBridge.h"

namespace nacre_bridge {

NACRE_ENUM_MAP(ImpactFeedbackStyle, UIImpactFeedbackStyle,
               @"light": @(UIImpactFeedbackStyleLight),
               @"medium": @(UIImpactFeedbackStyleMedium),
               @"heavy": @(UIImpactFeedbackStyleHeavy),
               @"soft": @(UIImpactFeedbackStyleSoft),
               @"rigid": @(UIImpactFeedbackStyleRigid))

NACRE_ENUM_MAP(NotificationFeedbackType, UINotificationFeedbackType,
               @"success": @(UINotificationFeedbackTypeSuccess),
               @"warning": @(UINotificationFeedbackTypeWarning),
               @"error": @(UINotificationFeedbackTypeError))

// 取「绑定到哪个视图」那个参数。给的不是视图就填错误，不当 nil 吞掉
static UIView* BoundView(const std::vector<void*>& argPtrs, size_t i, const char* what,
                         std::string* error) {
  id given = i < argPtrs.size() ? (__bridge id)argPtrs[i] : nil;
  if ([given isKindOfClass:UIView.class]) return (UIView*)given;
  *error = std::string(what) + " needs a UIView";
  return nil;
}

// ---- 工厂（类方法）----
bool FeedbackClassCall(const std::string& className, NSString* sel, NSArray* args,
                       const std::vector<void*>& argPtrs, nacre::NativeObjectRef* out,
                       std::string* error) {
  if (className == "UIImpactFeedbackGenerator" &&
      [sel isEqualToString:@"feedbackGeneratorWithStyle:forView:"]) {
    id given = args.count > 0 ? args[0] : nil;
    UIImpactFeedbackStyle style;
    if (!ImpactFeedbackStyleFromName(given, &style)) {
      *error = EnumError(@"style", given, NamesForImpactFeedbackStyle());
      return true;
    }
    UIView* view = BoundView(argPtrs, 1, "forView", error);
    if (view == nil) return true;
    *out = {(__bridge void*)[UIImpactFeedbackGenerator feedbackGeneratorWithStyle:style
                                                                          forView:view],
            "UIImpactFeedbackGenerator"};
    return true;
  }
  if (![sel isEqualToString:@"feedbackGeneratorForView:"]) return false;
  if (className == "UISelectionFeedbackGenerator") {
    UIView* view = BoundView(argPtrs, 0, "feedbackGeneratorForView", error);
    if (view == nil) return true;
    *out = {(__bridge void*)[UISelectionFeedbackGenerator feedbackGeneratorForView:view],
            "UISelectionFeedbackGenerator"};
    return true;
  }
  if (className == "UINotificationFeedbackGenerator") {
    UIView* view = BoundView(argPtrs, 0, "feedbackGeneratorForView", error);
    if (view == nil) return true;
    *out = {(__bridge void*)[UINotificationFeedbackGenerator feedbackGeneratorForView:view],
            "UINotificationFeedbackGenerator"};
    return true;
  }
  return false;
}

// ---- 方法 ----
bool FeedbackCallMethod(id object, NSString* sel, const NacreArgs& args,
                        std::string* out, std::string* error) {
  if (![object isKindOfClass:UIFeedbackGenerator.class]) return false;
  *out = "null";
  // 提前让触感引擎就绪，减少真正触发时的延迟。三个子类都有
  if ([sel isEqualToString:@"prepare"]) {
    [(UIFeedbackGenerator*)object prepare];
    return true;
  }
  if ([object isKindOfClass:UIImpactFeedbackGenerator.class]) {
    UIImpactFeedbackGenerator* impact = (UIImpactFeedbackGenerator*)object;
    if ([sel isEqualToString:@"impactOccurred"]) {
      [impact impactOccurred];
      return true;
    }
    if ([sel isEqualToString:@"impactOccurredWithIntensity:"]) {
      id given = args.value(0);
      double intensity = [given isKindOfClass:NSNumber.class] ? [given doubleValue] : NAN;
      // 头文件没写范围，Apple 文档写的是 0 到 1。范围外的值是什么效果没有
      // 承诺，所以拦掉，不交给系统去猜
      if (!(intensity >= 0 && intensity <= 1)) {
        *error = "intensity must be a number between 0 and 1";
        return true;
      }
      [impact impactOccurredWithIntensity:intensity];
      return true;
    }
  }
  if ([object isKindOfClass:UISelectionFeedbackGenerator.class] &&
      [sel isEqualToString:@"selectionChanged"]) {
    [(UISelectionFeedbackGenerator*)object selectionChanged];
    return true;
  }
  if ([object isKindOfClass:UINotificationFeedbackGenerator.class] &&
      [sel isEqualToString:@"notificationOccurred:"]) {
    UINotificationFeedbackType type;
    if (!NotificationFeedbackTypeFromName(args.value(0), &type)) {
      *error = EnumError(@"notificationOccurred", args.value(0),
                         NamesForNotificationFeedbackType());
      return true;
    }
    [(UINotificationFeedbackGenerator*)object notificationOccurred:type];
    return true;
  }
  return false;
}

}  // namespace nacre_bridge
