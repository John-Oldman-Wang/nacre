// 多行输入：UITextView 和它的 NSTextContainer。
//
// 一个域一个文件，装它在所有通道上的分支；每个入口返回「认不认领」。
// 这个域是**登记进来的**（文件末尾的 +load，见 NacreExtension.h 的
// NacreRegisterDomain），核心不认识它，所以函数全是 static。
//
// UITextView 是 UIScrollView 的子类。滚动视图和视图的那些成员（contentOffset、
// keyboardDismissMode、frame、becomeFirstResponder…）不在这里——这个域对不认识的名字一律说
// 「不认领」，分发器接着去问核心。
//
// 三个文字事件走通知，不占 delegate。UITextView 的 delegate 和 UIScrollView 的
// delegate 是同一个槽位（UITextViewDelegate 继承 UIScrollViewDelegate），
// 核心的滚动事件要往那个槽位里放自己的对象。三个通知正好盖住三个事件：
//
//   focus  ← UITextViewTextDidBeginEditingNotification
//   blur    ← UITextViewTextDidEndEditingNotification
//   input    ← UITextViewTextDidChangeNotification
//
// 「选区变了」没有通知，只有委托方法（textViewDidChangeSelection:）。它用
// NacreAddDelegatePart 把自己的委托对象加进那个槽位，和滚动委托并排放着：
// 两边实现的方法不重叠，转发对象按方法分给各自的那一方。
//
//   selectionchange  ← textViewDidChangeSelection:
//
// 键盘那九个属性在 UITextField 上已经有一份（NacrePropsControl.mm），那份是
// 按类写死的。两个类只是都遵循 UITextInputTraits，没有共同的父类可以挂，
// 这里照样再写一份；枚举的互转用的是内部头里已经声明的那些。

#import "NacreBridge.h"

#import <objc/runtime.h>

namespace nacre_bridge {

// 事件名 ↔ 通知名。用字符串枚举的宏：正查订阅时用，反查派发时用，
// check-api.sh 也按这张表核对类型定义里的事件名
// nacre:enum-type TextViewEvent = UITextViewEventType
//
// 最后一行不是通知：selectionchange 走委托（见 TextViewSetSubscription），放进
// 这张表是为了让 check-api.sh 拿四个名字一起和类型定义核对。右边那个串只是
// 占位，没有人发这个名字的通知，订阅时在查表之前就认走了
NACRE_STRING_ENUM_MAP(TextViewEvent,
                      @[ @"focus", UITextViewTextDidBeginEditingNotification ],
                      @[ @"blur", UITextViewTextDidEndEditingNotification ],
                      @[ @"input", UITextViewTextDidChangeNotification ],
                      @[ @"selectionchange", @"NacreTextViewSelectionChangeViaDelegate" ])

}  // namespace nacre_bridge

// 通知中心的观察者。不持有任何 JS 函数，也不持有文本视图；文本视图通过
// 关联对象持有它，所以它跟着文本视图一起走
@interface NacreTextViewObserver : NSObject
/// 现在订着哪几个事件
@property(nonatomic, strong) NSMutableSet<NSString*>* types;
@end

@implementation NacreTextViewObserver

- (void)textViewNotified:(NSNotification*)note {
  UITextView* view = [note.object isKindOfClass:UITextView.class] ? note.object : nil;
  NSString* type = nacre_bridge::NameForTextViewEvent(note.name);
  if (view == nil || type == nil) return;
  nacre_bridge::NacreEmitEvent(view, "UITextView", type);
}

- (void)dealloc {
  [NSNotificationCenter.defaultCenter removeObserver:self];
}

@end

static const void* kNacreTextViewObserverKey = &kNacreTextViewObserverKey;

// 选区变了。委托槽位里的一方：只实现这一个方法，别的委托方法（滚动的那些）
// 由槽位里的别的对象答。只在有人监听 selectionchange 时存在。
//
// 事件上不带选区：读 target.selectedRange 就有，而且事件延后一轮才到 JS，
// 带上的也只是「当时」的值
@interface NacreTextViewSelectionDelegate : NSObject <UITextViewDelegate>
@end

@implementation NacreTextViewSelectionDelegate

- (void)textViewDidChangeSelection:(UITextView*)textView {
  nacre_bridge::NacreEmitEvent(textView, "UITextView", @"selectionchange");
}

@end

static const void* kNacreTextViewSelectionDelegateKey = &kNacreTextViewSelectionDelegateKey;

namespace nacre_bridge {

// ---- 构造 ----
// 只有 UITextView 能 new。NSTextContainer 不开放构造：现在唯一拿得到它的
// 地方是 textView.textContainer，自己建一个也没有地方可以交
static bool TextViewConstruct(const std::string& className, const NacreArgs& args,
                              nacre::NativeObjectRef* out, std::string* error) {
  if (className != "UITextView") return false;
  *out = {NacreKeep([[UITextView alloc] init]), className};
  return true;
}

// ---- 取参 ----
// 下面几个函数返回 true 表示**值可用**，所以里面不能用 NACRE_NUM 那几个宏
// （宏失败时让所在函数返回「真」，在这里意思正好反了）

// 非负整数：行数、范围的位置和长度。类型由 RequireInteger 把关，这里只管
// 「不能是负数」——那是范围的问题，单独一句报错。
//
// 上限收到 2^53 - 1（JS 里能精确表示的最大整数）：原生是 64 位无符号数，
// 而 JS 给得出 1e300 这样的数，直接转是未定义行为；范围的位置加长度溢出时
// UIKit 自己还会抛 NSInvalidArgumentException（探针里量到的：
// selectedRange = (8, NSUIntegerMax) 进程直接没了）。两个数各自不超过
// 2^53，加起来到不了 2^64
static bool TextViewCount(NSString* what, id value, NSUInteger* out, std::string* error) {
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

// NSRange。过桥的是 { location, length }。越界不在这里管：UIKit 自己不抛
// （位置超了停在末尾，长度超了变成 0），照它的
//
// 不是 static：单行输入框的 selectedRange（NacreTextFieldDelegate.mm）用的是
// 同一个，那边自己声明了一行。它该进内部头，和别的结构体互转放在一起
bool TextInputRangeFromJSON(NSString* what, id value, NSRange* out, std::string* error) {
  if (![value isKindOfClass:NSDictionary.class]) {
    *error = [NSString stringWithFormat:@"%@ needs an object with location and length", what]
                 .UTF8String;
    return false;
  }
  NSDictionary* dict = (NSDictionary*)value;
  NSUInteger location = 0;
  NSUInteger length = 0;
  if (!TextViewCount([what stringByAppendingString:@".location"], dict[@"location"],
                     &location, error)) {
    return false;
  }
  if (!TextViewCount([what stringByAppendingString:@".length"], dict[@"length"], &length,
                     error)) {
    return false;
  }
  *out = NSMakeRange(location, length);
  return true;
}

// ---- 键盘上方的工具条：inputAccessoryView ----
// 单行输入框和多行输入框共用的两个函数（单行那边在 NacreTextFieldDelegate.mm
// 里各声明了一行，和上面的 TextInputRangeFromJSON 一样）。

// 读出来用哪个 JS 类包。平时用不到：JS 写进去的那个包装被输入框的持有边
// 留着，读回来就是它。只有包装不在了（或者视图不是从 JS 来的）才按这个名字
// 新建一个
const char* TextInputAccessoryClassName(UIView* view) {
  if ([view isKindOfClass:UIToolbar.class]) return "UIToolbar";
  return "UIView";
}

// 写。responder 是 UITextField 或者 UITextView：两个类各自把这个属性重新声明
// 成了可写的，没有共同的类型可以收，所以按 id 发消息。
//
// 正在编辑时换：UIKit 只在输入框成为 first responder 的那一刻去读这个属性，
// 之后再写，屏幕上还是旧的那个，要调 reloadInputViews 才换（头文件对
// reloadInputViews 的说明就是这个用途；不是 first responder 时它什么都不做）。
// JS 那一侧没有 reloadInputViews，所以在这里补上：写进去就生效。
// 「不调就不换」和「调了就当场换」都没有在模拟器上量过，见 text-input.md
void TextInputSetAccessoryView(UIResponder* responder, UIView* accessory) {
  if (responder.inputAccessoryView == accessory) return;
  [(id)responder setInputAccessoryView:accessory];
  if (responder.isFirstResponder) [responder reloadInputViews];
}

static NSDictionary* TextViewRangeToJSON(NSRange range) {
  return @{@"location": @(range.location), @"length": @(range.length)};
}

// 对象值的取法。照 Web IDL：对象不转换，nil 可以（这两个属性都可空），
// 给了对象就得是要求的那个类。返回 false 表示类型不对，error 已经填好。
// 核心里同样用途的宏 NACRE_OBJECT_OR_NIL 是给返回 void 的函数写的
// （它失败时 `return;`），这条通道返回 bool，用不了
static bool TextViewTypedOrNil(id value, Class cls, const char* className,
                               const std::string& name, std::string* error) {
  if (value == nil || [value isKindOfClass:cls]) return true;
  ObjectTypeError(name, className, true, error);
  return false;
}

// ---- 属性 ----
static id ReadTextViewProperty(id object, NSString* key) {
  if ([object isKindOfClass:NSTextContainer.class]) {
    NSTextContainer* box = (NSTextContainer*)object;
    if ([key isEqualToString:@"lineFragmentPadding"]) return @(box.lineFragmentPadding);
    if ([key isEqualToString:@"maximumNumberOfLines"]) return @(box.maximumNumberOfLines);
    if ([key isEqualToString:@"lineBreakMode"]) return NameForLineBreakMode(box.lineBreakMode);
    return nil;
  }
  if (![object isKindOfClass:UITextView.class]) return nil;
  UITextView* view = (UITextView*)object;
  // 实测没有内容时读出来就是空串，不是 nil；?: 只是兜底
  if ([key isEqualToString:@"text"]) return view.text ?: @"";
  if ([key isEqualToString:@"hasText"]) return @(view.hasText);
  if ([key isEqualToString:@"textAlignment"]) return NameForTextAlignment(view.textAlignment);
  if ([key isEqualToString:@"textContainerInset"]) {
    return InsetsToJSON(view.textContainerInset);
  }
  if ([key isEqualToString:@"isEditable"]) return @(view.isEditable);
  if ([key isEqualToString:@"isSelectable"]) return @(view.isSelectable);
  if ([key isEqualToString:@"selectedRange"]) return TextViewRangeToJSON(view.selectedRange);
  // 键盘那一组。和 UITextField 的同名属性是同一套枚举
  if ([key isEqualToString:@"keyboardType"]) return NameForKeyboardType(view.keyboardType);
  if ([key isEqualToString:@"returnKeyType"]) return NameForReturnKeyType(view.returnKeyType);
  if ([key isEqualToString:@"keyboardAppearance"]) {
    return NameForKeyboardAppearance(view.keyboardAppearance);
  }
  if ([key isEqualToString:@"enablesReturnKeyAutomatically"]) {
    return @(view.enablesReturnKeyAutomatically);
  }
  if ([key isEqualToString:@"isSecureTextEntry"]) return @(view.isSecureTextEntry);
  if ([key isEqualToString:@"autocapitalizationType"]) {
    return NameForTextAutocapitalizationType(view.autocapitalizationType);
  }
  if ([key isEqualToString:@"autocorrectionType"]) {
    return NameForTextAutocorrectionType(view.autocorrectionType);
  }
  if ([key isEqualToString:@"spellCheckingType"]) {
    return NameForTextSpellCheckingType(view.spellCheckingType);
  }
  // 没配过是 nil，JS 那一侧读到 null
  if ([key isEqualToString:@"textContentType"]) {
    return NameForTextContentType(view.textContentType) ?: (id)NSNull.null;
  }
  return nil;
}

static BOOL WriteTextViewProperty(id object, NSString* key, id value, std::string* error) {
  if ([object isKindOfClass:NSTextContainer.class]) {
    NSTextContainer* box = (NSTextContainer*)object;
    if ([key isEqualToString:@"lineFragmentPadding"]) {
      box.lineFragmentPadding = NACRE_NUM(value, key);
      return YES;
    }
    if ([key isEqualToString:@"maximumNumberOfLines"]) {
      NSUInteger lines = 0;
      if (TextViewCount(key, value, &lines, error)) box.maximumNumberOfLines = lines;
      return YES;
    }
    if ([key isEqualToString:@"lineBreakMode"]) {
      NSLineBreakMode mode;
      if (!LineBreakModeFromName(value, &mode)) {
        *error = EnumError(key, value, NamesForLineBreakMode());
        return YES;
      }
      box.lineBreakMode = mode;
      return YES;
    }
    return NO;
  }
  if (![object isKindOfClass:UITextView.class]) return NO;
  UITextView* view = (UITextView*)object;
  if ([key isEqualToString:@"text"]) {
    // JS 那一侧已经转成字符串了（null / undefined 是空串）
    view.text = [value isKindOfClass:NSString.class] ? value : @"";
    return YES;
  }
  if ([key isEqualToString:@"textAlignment"]) {
    NSTextAlignment out;
    if (!TextAlignmentFromName(value, &out)) {
      *error = EnumError(key, value, NamesForTextAlignment());
      return YES;
    }
    view.textAlignment = out;
    return YES;
  }
  if ([key isEqualToString:@"textContainerInset"]) {
    view.textContainerInset = JSONToInsets(value);
    return YES;
  }
  if ([key isEqualToString:@"isEditable"]) {
    view.editable = NACRE_BOOL(value, key);
    return YES;
  }
  if ([key isEqualToString:@"isSelectable"]) {
    view.selectable = NACRE_BOOL(value, key);
    return YES;
  }
  if ([key isEqualToString:@"selectedRange"]) {
    NSRange range;
    if (TextInputRangeFromJSON(key, value, &range, error)) view.selectedRange = range;
    return YES;
  }
  // 键盘那一组。形状一样，但**不用宏铺开**：check-api.sh 按 isEqualToString
  // 后面那个字符串字面量抽属性名，宏会把它藏起来
  if ([key isEqualToString:@"keyboardType"]) {
    UIKeyboardType out;
    if (!KeyboardTypeFromName(value, &out)) {
      *error = EnumError(key, value, NamesForKeyboardType());
      return YES;
    }
    view.keyboardType = out;
    return YES;
  }
  if ([key isEqualToString:@"returnKeyType"]) {
    UIReturnKeyType out;
    if (!ReturnKeyTypeFromName(value, &out)) {
      *error = EnumError(key, value, NamesForReturnKeyType());
      return YES;
    }
    view.returnKeyType = out;
    return YES;
  }
  if ([key isEqualToString:@"keyboardAppearance"]) {
    UIKeyboardAppearance out;
    if (!KeyboardAppearanceFromName(value, &out)) {
      *error = EnumError(key, value, NamesForKeyboardAppearance());
      return YES;
    }
    view.keyboardAppearance = out;
    return YES;
  }
  if ([key isEqualToString:@"enablesReturnKeyAutomatically"]) {
    view.enablesReturnKeyAutomatically = NACRE_BOOL(value, key);
    return YES;
  }
  if ([key isEqualToString:@"isSecureTextEntry"]) {
    view.secureTextEntry = NACRE_BOOL(value, key);
    return YES;
  }
  if ([key isEqualToString:@"autocapitalizationType"]) {
    UITextAutocapitalizationType out;
    if (!TextAutocapitalizationTypeFromName(value, &out)) {
      *error = EnumError(key, value, NamesForTextAutocapitalizationType());
      return YES;
    }
    view.autocapitalizationType = out;
    return YES;
  }
  if ([key isEqualToString:@"autocorrectionType"]) {
    UITextAutocorrectionType out;
    if (!TextAutocorrectionTypeFromName(value, &out)) {
      *error = EnumError(key, value, NamesForTextAutocorrectionType());
      return YES;
    }
    view.autocorrectionType = out;
    return YES;
  }
  if ([key isEqualToString:@"spellCheckingType"]) {
    UITextSpellCheckingType out;
    if (!TextSpellCheckingTypeFromName(value, &out)) {
      *error = EnumError(key, value, NamesForTextSpellCheckingType());
      return YES;
    }
    view.spellCheckingType = out;
    return YES;
  }
  if ([key isEqualToString:@"textContentType"]) {
    if (value == nil || value == NSNull.null) {
      view.textContentType = nil;
      return YES;
    }
    UITextContentType out = nil;
    if (!TextContentTypeFromName(value, &out)) {
      *error = EnumError(key, value, NamesForTextContentType());
      return YES;
    }
    view.textContentType = out;
    return YES;
  }
  return NO;
}

// ---- 对象属性：字体、颜色、文字容器、键盘上方的工具条 ----
// 颜色在 JS 那一侧是字符串，过桥的是 UIColor 对象（字符串在 JS 里解析、
// 池化，见 16-color.js），所以走的是对象通道
static nacre::NativeObjectRef ReadTextViewObjectProperty(id object, const std::string& name) {
  if (![object isKindOfClass:UITextView.class]) return {};
  UITextView* view = (UITextView*)object;
  // 实测：没设过字体时是 nil，设了文字之后也还是 nil
  if (name == "font") return {NacreKeep(view.font), "UIFont"};
  // 默认是 labelColor；写过 nil 之后读出来就是 nil
  if (name == "textColor") return {NacreKeep(view.textColor), "UIColor"};
  // 实测每次读都是同一个对象
  if (name == "textContainer") return {NacreKeep(view.textContainer), "NSTextContainer"};
  // 没设过是 nil
  if (name == "inputAccessoryView") {
    UIView* accessory = view.inputAccessoryView;
    return {NacreKeep(accessory), TextInputAccessoryClassName(accessory)};
  }
  return {};
}

static bool WriteTextViewObjectProperty(id object, const std::string& name, id value,
                                        std::string* error) {
  if (![object isKindOfClass:UITextView.class]) return false;
  UITextView* view = (UITextView*)object;
  if (name == "font") {
    if (TextViewTypedOrNil(value, UIFont.class, "UIFont", name, error)) {
      view.font = (UIFont*)value;
    }
    return true;
  }
  if (name == "textColor") {
    if (TextViewTypedOrNil(value, UIColor.class, "UIColor", name, error)) {
      view.textColor = (UIColor*)value;
    }
    return true;
  }
  if (name == "inputAccessoryView") {
    if (TextViewTypedOrNil(value, UIView.class, "UIView", name, error)) {
      TextInputSetAccessoryView(view, (UIView*)value);
    }
    return true;
  }
  return false;
}

// ---- 方法 ----
static bool TextViewCallMethod(id object, NSString* sel, const NacreArgs& args,
                               std::string* out, std::string* error) {
  if (![object isKindOfClass:UITextView.class]) return false;
  UITextView* view = (UITextView*)object;
  // 这两个是 UIKeyInput 的方法：按用户打字的规矩改内容——插在光标处、
  // 有选区就换掉选区——并且发「文字变了」的通知。写 text 属性不发
  if ([sel isEqualToString:@"insertText:"]) {
    *out = "null";
    id text = args.value(0);
    if (![text isKindOfClass:NSString.class]) {
      *error = "insertText: needs a string";
      return true;
    }
    [view insertText:(NSString*)text];
    return true;
  }
  if ([sel isEqualToString:@"deleteBackward"]) {
    [view deleteBackward];
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"scrollRangeToVisible:"]) {
    *out = "null";
    NSRange range;
    if (TextInputRangeFromJSON(sel, args.value(0), &range, error)) [view scrollRangeToVisible:range];
    return true;
  }
  return false;
}

// ---- 订阅 ----
// 只认领自己那四个名字。别的名字说「不认领」，分发器接着往下问——滚动
// 视图的八个事件由核心的滚动分支接，所以滚动事件在文本视图上照常能用。

// selectionchange：往委托的槽位里加一方，或者把它拿走。JS 那一侧只在某个
// 事件名的监听器从无到有、从有到无时才来，所以这里不用计数
static void TextViewSetSelectionSubscription(UITextView* view, BOOL on) {
  NacreTextViewSelectionDelegate* part =
      objc_getAssociatedObject(view, kNacreTextViewSelectionDelegateKey);
  if (on) {
    if (part != nil) return;   // 已经订着了
    part = [NacreTextViewSelectionDelegate new];
    objc_setAssociatedObject(view, kNacreTextViewSelectionDelegateKey, part,
                             OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    // 不直接写 view.delegate：核心的滚动委托也在这个槽位里
    NacreAddDelegatePart(view, part);
  } else if (part != nil) {
    NacreRemoveDelegatePart(view, part);
    objc_setAssociatedObject(view, kNacreTextViewSelectionDelegateKey, nil,
                             OBJC_ASSOCIATION_RETAIN_NONATOMIC);
  }
}

static NacreSubscribed TextViewSetSubscription(id object, NSString* type, BOOL on, std::string* error) {
  if (![object isKindOfClass:UITextView.class]) return false;
  UITextView* view = (UITextView*)object;
  if ([type isEqualToString:@"selectionchange"]) {
    TextViewSetSelectionSubscription(view, on);
    return true;
  }
  NSString* notification = TextViewEventFromName(type);
  if (notification == nil) return false;
  NacreTextViewObserver* observer = objc_getAssociatedObject(view, kNacreTextViewObserverKey);
  if (on) {
    if (observer == nil) {
      observer = [NacreTextViewObserver new];
      observer.types = [NSMutableSet set];
      objc_setAssociatedObject(view, kNacreTextViewObserverKey, observer,
                               OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    }
    if ([observer.types containsObject:type]) return true;   // 已经订着了
    [observer.types addObject:type];
    // 按发送者过滤：通知的 object 就是那个文本视图
    [NSNotificationCenter.defaultCenter addObserver:observer
                                           selector:@selector(textViewNotified:)
                                               name:notification
                                             object:view];
  } else if (observer != nil && [observer.types containsObject:type]) {
    [observer.types removeObject:type];
    [NSNotificationCenter.defaultCenter removeObserver:observer name:notification object:view];
    // 一个都不剩就把观察者放掉，回到零开销
    if (observer.types.count == 0) {
      objc_setAssociatedObject(view, kNacreTextViewObserverKey, nil,
                               OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    }
  }
  return true;
}

}  // namespace nacre_bridge

// ---- 登记 ----
@interface NacreTextViewDomain : NSObject
@end
@implementation NacreTextViewDomain
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "text-view";
  d.classes = {UITextView.class, NSTextContainer.class};
  d.read = nacre_bridge::ReadTextViewProperty;
  d.write = nacre_bridge::WriteTextViewProperty;
  d.readObject = nacre_bridge::ReadTextViewObjectProperty;
  d.writeObject = nacre_bridge::WriteTextViewObjectProperty;
  d.call = nacre_bridge::TextViewCallMethod;
  d.construct = nacre_bridge::TextViewConstruct;
  d.subscribe = nacre_bridge::TextViewSetSubscription;
  nacre_bridge::NacreRegisterDomain(d);
}
@end
