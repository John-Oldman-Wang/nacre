// 系统弹窗和分享面板：UIAlertController（提示框和底部菜单）、UIAlertAction
// （弹窗上的按钮）、UIActivityViewController（系统分享面板）。
//
// 一个域一个文件，每个入口返回「认不认领」。这个域是**登记进来的**
// （文件末尾的 +load，见 NacreExtension.h 的 NacreRegisterDomain），核心不
// 认识它，所以函数全是 static。
//
// 两个控制器都是 UIViewController 的子类，呈现和关闭走核心里现成的
// presentViewController / dismissViewController，这里不碰。
//
// ObjC 这一组的三个 block，各有各的去处（理由见 docs/internals/alerts.md）：
//   actionWithTitle:style:handler: 的 handler      → 按钮上的事件
//   addTextFieldWithConfigurationHandler: 的 block → 不要了，输入框当返回值
//   completionWithItemsHandler                     → 分享面板上的事件

#import "NacreBridge.h"

#import <objc/runtime.h>

// 按钮的状态。UIAlertAction 的 handler 只能在创建时给、之后换不了，
// 所以 handler 永远装着，派不派发看 subscribed 这个开关。按钮通过关联对象
// 持有它，handler 的 block 也捕获它；它对按钮没有引用，不成环
@interface NacreAlertActionState : NSObject
@property(nonatomic) BOOL subscribed;
/// 这个按钮被加进了哪些弹窗。弱引用：按钮不持有弹窗（弹窗持有按钮）。
/// 公开接口里按钮找不到自己的弹窗，而点了按钮之后要替弹窗报一声「关掉了」
@property(nonatomic, strong) NSHashTable<UIAlertController*>* alerts;
@end

@implementation NacreAlertActionState
- (instancetype)init {
  if ((self = [super init])) _alerts = [NSHashTable weakObjectsHashTable];
  return self;
}
@end

// 关联对象的 key：UIAlertAction → NacreAlertActionState
static const void* kNacreAlertActionStateKey = &kNacreAlertActionStateKey;
// 关联对象的 key：UIActivityViewController → 最近一次完成回调的结果（字典）。
// JS 那一侧在派发 complete 之前取走，见 AlertsCallMethod
static const void* kNacreActivityCompletionKey = &kNacreActivityCompletionKey;

namespace nacre_bridge {

NACRE_ENUM_MAP(AlertActionStyle, UIAlertActionStyle,
               @"default": @(UIAlertActionStyleDefault),
               @"cancel": @(UIAlertActionStyleCancel),
               @"destructive": @(UIAlertActionStyleDestructive))

NACRE_ENUM_MAP(AlertControllerStyle, UIAlertControllerStyle,
               @"actionSheet": @(UIAlertControllerStyleActionSheet),
               @"alert": @(UIAlertControllerStyleAlert))

NACRE_ENUM_MAP(AlertControllerSeverity, UIAlertControllerSeverity,
               @"default": @(UIAlertControllerSeverityDefault),
               @"critical": @(UIAlertControllerSeverityCritical))

// 系统自带的分享动作。值是 NSString 常量（com.apple.UIKit.activity.Mail…），
// 而且这个类型是**开放的**（NS_TYPED_EXTENSIBLE_ENUM）：第三方的分享扩展有
// 自己的标识符，不在这张表里。所以读出来时表里没有的原样给标识符；写进去
// 只收表里的名字
// nacre:enum-type ActivityType = UIActivityType
NACRE_STRING_ENUM_MAP(ActivityType,
                      @[@"postToFacebook", UIActivityTypePostToFacebook],
                      @[@"postToTwitter", UIActivityTypePostToTwitter],
                      @[@"postToWeibo", UIActivityTypePostToWeibo],
                      @[@"message", UIActivityTypeMessage],
                      @[@"mail", UIActivityTypeMail],
                      @[@"print", UIActivityTypePrint],
                      @[@"copyToPasteboard", UIActivityTypeCopyToPasteboard],
                      @[@"assignToContact", UIActivityTypeAssignToContact],
                      @[@"saveToCameraRoll", UIActivityTypeSaveToCameraRoll],
                      @[@"addToReadingList", UIActivityTypeAddToReadingList],
                      @[@"postToFlickr", UIActivityTypePostToFlickr],
                      @[@"postToVimeo", UIActivityTypePostToVimeo],
                      @[@"postToTencentWeibo", UIActivityTypePostToTencentWeibo],
                      @[@"airDrop", UIActivityTypeAirDrop],
                      @[@"openInIBooks", UIActivityTypeOpenInIBooks],
                      @[@"markupAsPDF", UIActivityTypeMarkupAsPDF],
                      @[@"sharePlay", UIActivityTypeSharePlay],
                      @[@"collaborationInviteWithLink", UIActivityTypeCollaborationInviteWithLink],
                      @[@"collaborationCopyLink", UIActivityTypeCollaborationCopyLink],
                      @[@"addToHomeScreen", UIActivityTypeAddToHomeScreen])

// 分享面板里可以整块隐藏的分区。位掩码，所以 JS 侧是字符串数组；
// 现在系统只定义了一个位
NACRE_MASK_MAP(ActivitySectionTypes, UIActivitySectionTypes,
               @"peopleSuggestions": @(UIActivitySectionTypesPeopleSuggestions))

// 按钮被点了。名字沿用 UIButton 和 UIBarButtonItem 的那一个：三样都是
// 「用户点了一个按钮」，不该要记三个名字
static NSString* const kAlertActionEventName = @"click";
// 分享面板结束了（分享出去了，或者用户把它关了）
static NSString* const kActivityEventName = @"complete";

// 系统自己把一个模态页关掉了（用户点了弹窗的按钮、在分享面板里选了去处），
// 替它发一次运行时内部的 @dismissed。JS 那一侧（17-scene.js 的事件汇入口）
// 收到之后按原生的真相放开「呈现它的页面持有它」那条边。
//
// 核心自己发 @dismissed 靠的是呈现委托（presentationControllerDidDismiss:），
// 那只在用户把页面**拖走**时才有；而提示框根本不许挂呈现委托（见
// AlertsSetSubscription）。所以这两种由系统关掉的情况由这个域来报。
//
// 时机：要等这一页真的关完了再发——JS 那一侧是去读 presentedViewController
// 的，关到一半时读到的还是它。回调来的时候已经关完了就直接发；正在关就等
// 转场结束；还好好地呈现着就不是它（同一个按钮可以加在几个弹窗里），不发
static void NotifyDismissedBySystem(UIViewController* page, const char* className) {
  void (^emit)(void) = ^{
    NacreEmitEvent(page, className, @"@dismissed");
  };
  if (page.presentingViewController == nil) {
    emit();
    return;
  }
  if (!page.isBeingDismissed) return;
  id<UIViewControllerTransitionCoordinator> coordinator = page.transitionCoordinator;
  BOOL queued = coordinator != nil &&
      [coordinator animateAlongsideTransition:nil
                                   completion:^(id<UIViewControllerTransitionCoordinatorContext> context) {
                                     emit();
                                   }];
  if (!queued) emit();
}

// 可空的字符串：null 是 nil，字符串原样，别的类型填错误。
// 返回 false 表示值不可用（error 已经填了）
static bool NullableText(id value, NSString* what, NSString** out, std::string* error) {
  if (value == nil || value == NSNull.null) {
    *out = nil;
    return true;
  }
  if ([value isKindOfClass:NSString.class]) {
    *out = value;
    return true;
  }
  *error = [NSString stringWithFormat:@"%@ must be a string or null", what].UTF8String;
  return false;
}

// ---- 类方法：两个工厂 ----
static bool AlertsClassCall(const std::string& className, NSString* sel,
                            const NacreArgs& args, nacre::NativeObjectRef* out,
                            std::string* error) {
  if (className == "UIAlertAction" &&
      [sel isEqualToString:@"actionWithTitle:style:handler:"]) {
    // 标题必须有：实测 iPhone 上没有标题的按钮在创建那一刻就抛异常，三种
    // 样式都是。空串可以
    id title = args.value(0);
    if (![title isKindOfClass:NSString.class]) {
      *error = "actionWithTitle needs a string title";
      return true;
    }
    UIAlertActionStyle style;
    if (!AlertActionStyleFromName(args.value(1), &style)) {
      *error = EnumError(@"style", args.value(1), NamesForAlertActionStyle());
      return true;
    }
    NacreAlertActionState* state = [NacreAlertActionState new];
    // handler 收到的就是这个按钮本身（实测 addAction: 不复制按钮，弹窗里的
    // 和加进去的是同一个对象），所以事件派发到它上面。block 不捕获按钮。
    //
    // 先发按钮的事件，再替弹窗发 @dismissed。顺序有讲究：按钮的包装靠
    // 「呈现者 → 弹窗 → 按钮」这串持有边活着，@dismissed 一处理这串就断了；
    // 先断的话，两次派发之间赶上一次 GC，监听器就跟着包装一起没了
    UIAlertAction* action =
        [UIAlertAction actionWithTitle:title
                                 style:style
                               handler:^(UIAlertAction* fired) {
                                 if (state.subscribed) {
                                   NacreEmitEvent(fired, "UIAlertAction", kAlertActionEventName);
                                 }
                                 for (UIAlertController* alert in state.alerts.allObjects) {
                                   NotifyDismissedBySystem(alert, "UIAlertController");
                                 }
                               }];
    objc_setAssociatedObject(action, kNacreAlertActionStateKey, state,
                             OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    *out = {NacreKeep(action), "UIAlertAction"};
    return true;
  }
  if (className == "UIAlertController" &&
      [sel isEqualToString:@"alertControllerWithTitle:message:preferredStyle:"]) {
    NSString* title = nil;
    NSString* message = nil;
    if (!NullableText(args.value(0), @"title", &title, error)) return true;
    if (!NullableText(args.value(1), @"message", &message, error)) return true;
    UIAlertControllerStyle style;
    if (!AlertControllerStyleFromName(args.value(2), &style)) {
      *error = EnumError(@"preferredStyle", args.value(2), NamesForAlertControllerStyle());
      return true;
    }
    *out = {NacreKeep([UIAlertController alertControllerWithTitle:title
                                                           message:message
                                                    preferredStyle:style]),
            "UIAlertController"};
    return true;
  }
  return false;
}

// ---- 构造：分享面板 ----
// 要分享的东西一项一个参数：图片是对象，文字和网址在 JS 那一侧包成
// { text } / { url }——都是字符串，不包一层这边分不出哪个是网址
static bool AlertsConstruct(const std::string& className, const NacreArgs& args,
                            nacre::NativeObjectRef* out, std::string* error) {
  if (className != "UIActivityViewController") return false;
  NSMutableArray* items = [NSMutableArray array];
  const NSUInteger count = args.values.count;
  for (NSUInteger i = 0; i < count; i++) {
    id given = args.object(i);
    if ([given isKindOfClass:UIImage.class]) {
      [items addObject:given];
      continue;
    }
    id spec = args.value(i);
    id text = [spec isKindOfClass:NSDictionary.class] ? spec[@"text"] : nil;
    id url = [spec isKindOfClass:NSDictionary.class] ? spec[@"url"] : nil;
    if ([text isKindOfClass:NSString.class]) {
      [items addObject:text];
      continue;
    }
    NSURL* parsed = [url isKindOfClass:NSString.class] ? [NSURL URLWithString:url] : nil;
    if (parsed != nil) {
      [items addObject:parsed];
      continue;
    }
    *error = [NSString stringWithFormat:@"activityItems[%lu] must be a string, a URL or a UIImage",
                                        (unsigned long)i]
                 .UTF8String;
    return true;
  }
  UIActivityViewController* sheet =
      [[UIActivityViewController alloc] initWithActivityItems:items
                                        applicationActivities:nil];
  // 完成回调在这里就装上，不等 JS 订阅：头文件写着它用过一次就被系统清掉，
  // 所以它天生是一次性的，没有「订了再装」的余地要留。
  // 结果先记在面板上，再发一个不带数据的事件；JS 那一侧派发之前把结果取走、
  // 挂到事件对象上（见 50-alerts.js）。不直接用 NacreEmitEventWithJSON：
  // 核心的事件汇入口只认它知道的那几种负载形状，别的会被丢掉
  __weak UIActivityViewController* weakSheet = sheet;
  sheet.completionWithItemsHandler =
      ^(UIActivityType activityType, BOOL completed, NSArray* returnedItems,
        NSError* activityError) {
        UIActivityViewController* strongSheet = weakSheet;
        if (strongSheet == nil) return;
        id type = NSNull.null;
        if (activityType != nil) type = NameForActivityType(activityType) ?: activityType;
        id failure = NSNull.null;
        if (activityError != nil) {
          failure = @{
            @"message": activityError.localizedDescription ?: @"",
            @"code": @(activityError.code),
            @"domain": activityError.domain ?: @"",
          };
        }
        NSDictionary* result = @{
          @"activityType": type,
          @"completed": @(completed),
          @"activityError": failure,
        };
        objc_setAssociatedObject(strongSheet, kNacreActivityCompletionKey, result,
                                 OBJC_ASSOCIATION_RETAIN_NONATOMIC);
        NacreEmitEvent(strongSheet, "UIActivityViewController", kActivityEventName);
        // 用户选了去处之后面板是系统自己关的，和弹窗一样要报一声。
        // 同样排在 complete 后面
        NotifyDismissedBySystem(strongSheet, "UIActivityViewController");
      };
  *out = {NacreKeep(sheet), className};
  return true;
}

// ---- 订阅 ----
static NacreSubscribed AlertsSetSubscription(id object, NSString* type, BOOL on, std::string* error) {
  if ([object isKindOfClass:UIAlertAction.class]) {
    if (![type isEqualToString:kAlertActionEventName]) {
      return NacreSubscribed::UnknownEvent;
    }
    NacreAlertActionState* state = objc_getAssociatedObject(object, kNacreAlertActionStateKey);
    if (state == nil) {
      // 不是上面那个工厂建的按钮，handler 不是我们的，事件发不出来
      *error = "addEventListener: this UIAlertAction was not created by "
               "UIAlertAction.actionWithTitle, so it cannot report taps";
      return true;
    }
    state.subscribed = on;
    return true;
  }
  if ([object isKindOfClass:UIActivityViewController.class]) {
    // 完成回调构造时就装好了，这里没有要开关的东西
    if ([type isEqualToString:kActivityEventName]) return true;
    // 它也是页面：模态的那三个（和运行时自己订的 @dismissed）归核心
    if ([type hasPrefix:@"@"] || IsPresentationEventName(type)) return false;
    return NacreSubscribed::UnknownEvent;
  }
  if ([object isKindOfClass:UIAlertController.class]) {
    // 弹窗上的订阅**全部在这里认领**，一个都不能落到核心的页面那一支：
    // 那一支会给这一页挂呈现委托（presentationController.delegate = …），
    // 而实测系统不许动提示框的呈现委托，连写 nil 都抛
    // NSInternalInconsistencyException（"The presentation controller of an
    // alert controller presenting as an alert must not have its delegate
    // modified"）。合并后的第一轮验收就是崩在这里：核心对每个被呈现的页面都
    // 常驻订一个 @dismissed，present 的 completion 里装委托，那里没有保护。
    //
    // @dismissed：认领，什么都不做。弹窗被系统关掉时由按钮的 handler 来报
    // （见 NotifyDismissedBySystem）。
    if ([type isEqualToString:@"@dismissed"]) return true;
    // 别的名字都拒掉，包括页面的 beforedismiss / dismiss / dismissattempt：
    // 它们靠的就是那个委托。底部菜单没呈现时量到委托可以改，但真的呈现在
    // iPhone 上用的是不是同一个呈现控制器没量到，所以两种样式一样处理
    // 监听了也不会被派发：弹窗被系统关掉时不让我们知道，要听按钮的 click
    return NacreSubscribed::UnknownEvent;
  }
  return false;
}

// ---- 属性 ----
// UIAlertController 的 title 不在这里：它就是 UIViewController 的 title，
// 核心已经接了
static id ReadAlertsProperty(id object, NSString* key) {
  if ([object isKindOfClass:UIAlertAction.class]) {
    UIAlertAction* action = (UIAlertAction*)object;
    if ([key isEqualToString:@"title"]) return action.title ?: NSNull.null;
    if ([key isEqualToString:@"style"]) return NameForAlertActionStyle(action.style);
    if ([key isEqualToString:@"isEnabled"]) return @(action.isEnabled);
    return nil;
  }
  if ([object isKindOfClass:UIAlertController.class]) {
    UIAlertController* alert = (UIAlertController*)object;
    if ([key isEqualToString:@"message"]) return alert.message ?: NSNull.null;
    if ([key isEqualToString:@"preferredStyle"]) {
      return NameForAlertControllerStyle(alert.preferredStyle);
    }
    if ([key isEqualToString:@"severity"]) return NameForAlertControllerSeverity(alert.severity);
    return nil;
  }
  if ([object isKindOfClass:UIActivityViewController.class]) {
    UIActivityViewController* sheet = (UIActivityViewController*)object;
    if ([key isEqualToString:@"excludedActivityTypes"]) {
      NSArray<UIActivityType>* excluded = sheet.excludedActivityTypes;
      if (excluded == nil) return NSNull.null;
      NSMutableArray<NSString*>* names = [NSMutableArray array];
      for (UIActivityType type in excluded) {
        [names addObject:NameForActivityType(type) ?: type];
      }
      return names;
    }
    if ([key isEqualToString:@"excludedActivitySectionTypes"]) {
      return NamesInActivitySectionTypes(sheet.excludedActivitySectionTypes);
    }
    if ([key isEqualToString:@"allowsProminentActivity"]) {
      return @(sheet.allowsProminentActivity);
    }
    return nil;
  }
  return nil;
}

static BOOL WriteAlertsProperty(id object, NSString* key, id value, std::string* error) {
  if ([object isKindOfClass:UIAlertAction.class]) {
    if ([key isEqualToString:@"isEnabled"]) {
      ((UIAlertAction*)object).enabled = NACRE_BOOL(value, key);
      return YES;
    }
    return NO;
  }
  if ([object isKindOfClass:UIAlertController.class]) {
    UIAlertController* alert = (UIAlertController*)object;
    if ([key isEqualToString:@"message"]) {
      NSString* message = nil;
      if (NullableText(value, key, &message, error)) alert.message = message;
      return YES;
    }
    if ([key isEqualToString:@"severity"]) {
      UIAlertControllerSeverity severity;
      if (!AlertControllerSeverityFromName(value, &severity)) {
        *error = EnumError(key, value, NamesForAlertControllerSeverity());
        return YES;
      }
      alert.severity = severity;
      return YES;
    }
    return NO;
  }
  if ([object isKindOfClass:UIActivityViewController.class]) {
    UIActivityViewController* sheet = (UIActivityViewController*)object;
    if ([key isEqualToString:@"excludedActivityTypes"]) {
      if (value == nil || value == NSNull.null) {
        sheet.excludedActivityTypes = nil;
        return YES;
      }
      if (![value isKindOfClass:NSArray.class]) {
        *error = "excludedActivityTypes must be an array of activity type names or null";
        return YES;
      }
      NSMutableArray<UIActivityType>* types = [NSMutableArray array];
      for (id name in (NSArray*)value) {
        UIActivityType type = ActivityTypeFromName(name);
        if (type == nil) {
          *error = EnumError(key, name, NamesForActivityType());
          return YES;
        }
        [types addObject:type];
      }
      sheet.excludedActivityTypes = types;
      return YES;
    }
    if ([key isEqualToString:@"excludedActivitySectionTypes"]) {
      UIActivitySectionTypes sections;
      id bad = nil;
      if (!ActivitySectionTypesFromNames(value, &sections, &bad)) {
        if (bad != nil) {
          *error = EnumError(key, bad, NamesForActivitySectionTypes());
        } else {
          *error = "excludedActivitySectionTypes must be an array of section names";
        }
        return YES;
      }
      sheet.excludedActivitySectionTypes = sections;
      return YES;
    }
    if ([key isEqualToString:@"allowsProminentActivity"]) {
      sheet.allowsProminentActivity = NACRE_BOOL(value, key);
      return YES;
    }
    return NO;
  }
  return NO;
}

static nacre::NativeObjectRef ReadAlertsObjectProperty(id object, const std::string& name) {
  if (![object isKindOfClass:UIAlertController.class]) return {};
  if (name == "preferredAction") {
    return {NacreKeep(((UIAlertController*)object).preferredAction), "UIAlertAction"};
  }
  return {};
}

static bool WriteAlertsObjectProperty(id object, const std::string& name, id value,
                                      std::string* error) {
  if (![object isKindOfClass:UIAlertController.class]) return false;
  if (name == "preferredAction") {
    UIAlertController* alert = (UIAlertController*)object;
    if (value != nil && ![value isKindOfClass:UIAlertAction.class]) {
      ObjectTypeError(name, "UIAlertAction", true, error);
      return true;
    }
    // 实测：不在 actions 里的按钮写进来，系统抛 NSInternalInconsistencyException。
    // 这里先拦，报一句说得清原因的话
    if (value != nil && ![alert.actions containsObject:value]) {
      *error = "preferredAction must be one of this alert's actions; add it with "
               "addAction() first";
      return true;
    }
    alert.preferredAction = (UIAlertAction*)value;
    return true;
  }
  return false;
}

static void ReadAlertsObjectArray(id object, const std::string& name,
                                  std::vector<nacre::NativeObjectRef>& refs) {
  if (![object isKindOfClass:UIAlertController.class]) return;
  UIAlertController* alert = (UIAlertController*)object;
  if (name == "actions") {
    for (UIAlertAction* action in alert.actions) {
      refs.push_back({NacreKeep(action), "UIAlertAction"});
    }
  } else if (name == "textFields") {
    // 实测：里面是 UITextField 的一个私有子类，按 UITextField 包装。
    // 底部菜单上这个属性读出来是空数组
    for (UITextField* field in alert.textFields) {
      refs.push_back({NacreKeep(field), "UITextField"});
    }
  }
}

// ---- 方法 ----
static bool AlertsCallMethod(id object, NSString* sel, const NacreArgs& args,
                             std::string* out, std::string* error) {
  if ([object isKindOfClass:UIAlertController.class]) {
    UIAlertController* alert = (UIAlertController*)object;
    if ([sel isEqualToString:@"addAction:"]) {
      *out = "null";
      id given = args.object(0);
      if (![given isKindOfClass:UIAlertAction.class]) {
        *error = "addAction needs a UIAlertAction";
        return true;
      }
      UIAlertAction* action = (UIAlertAction*)given;
      // 实测：第二个取消样式的按钮加进来，系统抛
      // NSInternalInconsistencyException。先拦
      if (action.style == UIAlertActionStyleCancel) {
        for (UIAlertAction* existing in alert.actions) {
          if (existing.style == UIAlertActionStyleCancel) {
            *error = "addAction: an alert can have only one action with the cancel style";
            return true;
          }
        }
      }
      [alert addAction:action];
      // 记下这个按钮在哪个弹窗里，点了之后好替弹窗报一声「关掉了」
      NacreAlertActionState* state =
          objc_getAssociatedObject(action, kNacreAlertActionStateKey);
      [state.alerts addObject:alert];
      return true;
    }
    if ([sel isEqualToString:@"addTextFieldWithConfigurationHandler:"]) {
      *out = "null";
      // 实测：往底部菜单上加输入框，系统抛 NSInternalInconsistencyException
      if (alert.preferredStyle != UIAlertControllerStyleAlert) {
        *error = "addTextField: text fields can only be added to an alert whose "
                 "preferredStyle is \"alert\"";
        return true;
      }
      // 配置用的 block 传 nil：实测输入框在这一句里就建好了，JS 从
      // textFields 里拿到它再配置，效果一样
      [alert addTextFieldWithConfigurationHandler:nil];
      return true;
    }
    return false;
  }
  if ([object isKindOfClass:UIActivityViewController.class]) {
    // 运行时自己用的：取走最近一次完成回调的结果。取一次就清掉，所以
    // JS 自己 dispatchEvent 一个 complete 时这里是 null
    if ([sel isEqualToString:@"nacre:takeCompletion"]) {
      NSDictionary* result = objc_getAssociatedObject(object, kNacreActivityCompletionKey);
      objc_setAssociatedObject(object, kNacreActivityCompletionKey, nil,
                               OBJC_ASSOCIATION_RETAIN_NONATOMIC);
      *out = result != nil ? EncodeJSON(result) : "null";
      return true;
    }
    return false;
  }
  return false;
}

}  // namespace nacre_bridge

// ---- 登记 ----
@interface NacreAlertsDomain : NSObject
@end
@implementation NacreAlertsDomain
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "alerts";
  d.classes = {UIAlertAction.class, UIAlertController.class, UIActivityViewController.class};
  d.read = nacre_bridge::ReadAlertsProperty;
  d.write = nacre_bridge::WriteAlertsProperty;
  d.readObject = nacre_bridge::ReadAlertsObjectProperty;
  d.writeObject = nacre_bridge::WriteAlertsObjectProperty;
  d.readObjectArray = nacre_bridge::ReadAlertsObjectArray;
  d.call = nacre_bridge::AlertsCallMethod;
  d.construct = nacre_bridge::AlertsConstruct;
  d.classCallObject = nacre_bridge::AlertsClassCall;
  d.subscribe = nacre_bridge::AlertsSetSubscription;
  nacre_bridge::NacreRegisterDomain(d);
}
@end
