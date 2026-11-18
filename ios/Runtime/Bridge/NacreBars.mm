// 两个条状的视图：UIToolbar（工具条）和 UISearchBar（搜索框）。
//
// 一个域一个文件，装它在所有通道上的分支；每个入口返回「认不认领」。
// 这个域是**登记进来的**（文件末尾的 +load，见 NacreExtension.h 的
// NacreRegisterDomain），核心不认识它，所以函数全是 static。
//
// 两个类都是 UIView 的子类，不是 UIControl。UIView 的那些成员（frame、
// isHidden、sizeToFit、becomeFirstResponder…）不在这里——这个域对不认识的
// 名字一律说「不认领」，分发器接着去问核心的视图域。
//
// 搜索框的事件来自它的委托（UISearchBarDelegate）里**只通知、不要返回值**
// 的那八个方法。委托由这个域自己装：UISearchBar.delegate 是它自己的槽位，
// 不和别人共用。要同步返回 BOOL 的那几个（shouldBeginEditing、
// shouldEndEditing、shouldChangeTextInRanges）要同步回调，没接。
//
// 没接的：
//   - 外观对象那一组（standardAppearance 等，UIToolbarAppearance）
//   - 所有换图的方法（背景图、阴影图、搜索框里各个图标、范围按钮的图）
//   - UISearchBar 的两个 UIOffset 属性和 setPositionAdjustment:…：
//     JS 那边还没有 UIOffset 这个结构体
//   - 范围按钮的文字属性（要先有 NSAttributedString 的那套键）
//   - barPosition 和它的委托方法 positionForBar:（要同步返回值）
//   - UITextInputTraits 里九个之外的那些（smartQuotesType 一组、
//     inlinePredictionType、passwordRules、writingToolsBehavior…）：
//     输入框和多行输入框上也还没有，三处一起做
//   - inputAssistantItem、lookToDictateEnabled

#import "NacreBridge.h"

#import <objc/runtime.h>

// 关联对象的 key：UISearchBar → NacreSearchBarDelegate。
// searchBar.delegate 是 weak，所以靠这个关联让它活着
static const void* kNacreSearchBarDelegateKey = &kNacreSearchBarDelegateKey;

// 搜索框的 trampoline：运行时自己当委托，**不持有任何 JS 函数**，只记订阅了
// 哪几个事件名。搜索框通过关联对象持有它，它对搜索框没有引用，不成环
@interface NacreSearchBarDelegate : NSObject <UISearchBarDelegate>
@property(nonatomic, strong) NSMutableSet<NSString*>* types;
@end

namespace nacre_bridge {

// 名字带 Bars 前缀：这个宏定义出来的函数不是 static 的，别的域要是也给
// UIBarStyle 建一张表（导航条迟早要），名字不能撞。
// 头文件里另外两个值（BlackOpaque = 1、BlackTranslucent = 2）从 iOS 13 起
// 废弃，不接
NACRE_ENUM_MAP(BarsBarStyle, UIBarStyle,
               @"default": @(UIBarStyleDefault),
               @"black": @(UIBarStyleBlack))

NACRE_ENUM_MAP(BarsSearchBarStyle, UISearchBarStyle,
               @"default": @(UISearchBarStyleDefault),
               @"prominent": @(UISearchBarStyleProminent),
               @"minimal": @(UISearchBarStyleMinimal))

// 搜索框的事件名，一个对一个委托方法：
//   focus              searchBarTextDidBeginEditing:
//   blur                searchBarTextDidEndEditing:
//   input                searchBar:textDidChange:
//   search       searchBarSearchButtonClicked:
//   cancel       searchBarCancelButtonClicked:
//   bookmarkclick     searchBarBookmarkButtonClicked:
//   resultslistclick  searchBarResultsListButtonClicked:
//   scopechange               searchBar:selectedScopeButtonIndexDidChange:
static NSArray<NSString*>* SearchBarEventNames() {
  static NSArray<NSString*>* names;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    names = @[
      @"focus", @"blur", @"input", @"search",
      @"cancel", @"bookmarkclick", @"resultslistclick",
      @"scopechange"
    ];
  });
  return names;
}

}  // namespace nacre_bridge

// 事件都不带数据。判据是「回头读不到才带」：文字和选中的范围在事件派发时
// 从搜索框上读得到（text / selectedScopeButtonIndex），读到的是当时的值
@implementation NacreSearchBarDelegate

- (void)emit:(NSString*)type from:(UISearchBar*)searchBar {
  if (![self.types containsObject:type]) return;
  nacre_bridge::NacreEmitEvent(searchBar, "UISearchBar", type);
}

- (void)searchBarTextDidBeginEditing:(UISearchBar*)searchBar {
  [self emit:@"focus" from:searchBar];
}
- (void)searchBarTextDidEndEditing:(UISearchBar*)searchBar {
  [self emit:@"blur" from:searchBar];
}
- (void)searchBar:(UISearchBar*)searchBar textDidChange:(NSString*)searchText {
  [self emit:@"input" from:searchBar];
}
- (void)searchBarSearchButtonClicked:(UISearchBar*)searchBar {
  [self emit:@"search" from:searchBar];
}
- (void)searchBarCancelButtonClicked:(UISearchBar*)searchBar {
  [self emit:@"cancel" from:searchBar];
}
- (void)searchBarBookmarkButtonClicked:(UISearchBar*)searchBar {
  [self emit:@"bookmarkclick" from:searchBar];
}
- (void)searchBarResultsListButtonClicked:(UISearchBar*)searchBar {
  [self emit:@"resultslistclick" from:searchBar];
}
- (void)searchBar:(UISearchBar*)searchBar selectedScopeButtonIndexDidChange:(NSInteger)selectedScope {
  [self emit:@"scopechange" from:searchBar];
}

@end

namespace nacre_bridge {

// ---- 构造 ----
// 都走 init。实测 init 出来的 frame 是 0×0，高度靠它们自己想要的大小
// （intrinsicContentSize：工具条在 App 里 48、在没有 UIApplication 的探针里 44，
// 搜索框 64）或者 sizeToFit
static bool BarsConstruct(const std::string& className, const NacreArgs& args,
                          nacre::NativeObjectRef* out, std::string* error) {
  if (className == "UIToolbar") {
    *out = {NacreKeep([[UIToolbar alloc] init]), className};
    return true;
  }
  if (className == "UISearchBar") {
    *out = {NacreKeep([[UISearchBar alloc] init]), className};
    return true;
  }
  return false;
}

// ---- 订阅 ----
// 惰性：第一个事件名有监听器时才装委托，最后一个移走时卸掉。
// 工具条没有自己的事件，不认领（它只有继承来的 traitchange，那个在分到
// 各个域之前就按名字认走了）
static NacreSubscribed BarsSetSubscription(id object, NSString* type, BOOL on, std::string* error) {
  if (![object isKindOfClass:UISearchBar.class]) return false;
  UISearchBar* bar = (UISearchBar*)object;
  if (![SearchBarEventNames() containsObject:type]) {
    return NacreSubscribed::UnknownEvent;
  }
  NacreSearchBarDelegate* hop = objc_getAssociatedObject(bar, kNacreSearchBarDelegateKey);
  if (on) {
    if (hop == nil) {
      hop = [NacreSearchBarDelegate new];
      hop.types = [NSMutableSet set];
      objc_setAssociatedObject(bar, kNacreSearchBarDelegateKey, hop,
                               OBJC_ASSOCIATION_RETAIN_NONATOMIC);
      bar.delegate = hop;
    }
    [hop.types addObject:type];
  } else if (hop != nil) {
    [hop.types removeObject:type];
    if (hop.types.count == 0) {
      bar.delegate = nil;
      objc_setAssociatedObject(bar, kNacreSearchBarDelegateKey, nil,
                               OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    }
  }
  return true;
}

// ---- 属性 ----
static id ReadBarsProperty(id object, NSString* key) {
  if ([object isKindOfClass:UIToolbar.class]) {
    UIToolbar* bar = (UIToolbar*)object;
    // 废弃的 BlackTranslucent（数值 2）从 JS 写不进去；系统自己给出来的话
    // 按 black 读
    if ([key isEqualToString:@"barStyle"]) return NameForBarsBarStyle(bar.barStyle) ?: @"black";
    if ([key isEqualToString:@"isTranslucent"]) return @(bar.isTranslucent);
    return nil;
  }
  if ([object isKindOfClass:UISearchBar.class]) {
    UISearchBar* bar = (UISearchBar*)object;
    // 实测：没设过是空串不是 nil，写 nil 读回来也是空串
    if ([key isEqualToString:@"text"]) return bar.text ?: @"";
    if ([key isEqualToString:@"placeholder"]) return bar.placeholder ?: NSNull.null;
    if ([key isEqualToString:@"prompt"]) return bar.prompt ?: NSNull.null;
    if ([key isEqualToString:@"barStyle"]) return NameForBarsBarStyle(bar.barStyle) ?: @"black";
    if ([key isEqualToString:@"searchBarStyle"]) {
      return NameForBarsSearchBarStyle(bar.searchBarStyle) ?: @"default";
    }
    if ([key isEqualToString:@"isTranslucent"]) return @(bar.isTranslucent);
    if ([key isEqualToString:@"showsCancelButton"]) return @(bar.showsCancelButton);
    if ([key isEqualToString:@"showsBookmarkButton"]) return @(bar.showsBookmarkButton);
    if ([key isEqualToString:@"showsSearchResultsButton"]) {
      return @(bar.showsSearchResultsButton);
    }
    if ([key isEqualToString:@"isSearchResultsButtonSelected"]) {
      return @(bar.isSearchResultsButtonSelected);
    }
    // 没设过是 nil。nil 和空数组在行为上没有差别，JS 那边一律是空数组
    if ([key isEqualToString:@"scopeButtonTitles"]) return bar.scopeButtonTitles ?: @[];
    if ([key isEqualToString:@"selectedScopeButtonIndex"]) {
      return @(bar.selectedScopeButtonIndex);
    }
    if ([key isEqualToString:@"showsScopeBar"]) return @(bar.showsScopeBar);
    if ([key isEqualToString:@"isEnabled"]) return @(bar.isEnabled);
    // ---- 键盘设置（UITextInputTraits）----
    // 和 UITextView 上的是同一组九个，枚举表也是同一套（NacreEnumsInput.mm）。
    // 九个都**直接对搜索框读写**，不绕 searchTextField：UISearchBar 公开遵循
    // UITextInputTraits，它自己把这些消息转给一份和 searchTextField 共用的
    // 设置对象（量过：自己实现的只有 setKeyboardAppearance:，其余靠
    // forwardingTargetForSelector:），所以两边读到的是同一份。
    // 见 docs/internals/bars.md
    if ([key isEqualToString:@"keyboardType"]) return NameForKeyboardType(bar.keyboardType);
    if ([key isEqualToString:@"returnKeyType"]) return NameForReturnKeyType(bar.returnKeyType);
    if ([key isEqualToString:@"keyboardAppearance"]) {
      return NameForKeyboardAppearance(bar.keyboardAppearance);
    }
    if ([key isEqualToString:@"enablesReturnKeyAutomatically"]) {
      return @(bar.enablesReturnKeyAutomatically);
    }
    if ([key isEqualToString:@"isSecureTextEntry"]) return @(bar.isSecureTextEntry);
    if ([key isEqualToString:@"autocapitalizationType"]) {
      return NameForTextAutocapitalizationType(bar.autocapitalizationType);
    }
    if ([key isEqualToString:@"autocorrectionType"]) {
      return NameForTextAutocorrectionType(bar.autocorrectionType);
    }
    if ([key isEqualToString:@"spellCheckingType"]) {
      return NameForTextSpellCheckingType(bar.spellCheckingType);
    }
    // 没配过是 nil，JS 那一侧读到 null
    if ([key isEqualToString:@"textContentType"]) {
      return NameForTextContentType(bar.textContentType) ?: (id)NSNull.null;
    }
    return nil;
  }
  return nil;
}

// 字符串的取法。转换在 JS 那一侧做完了，这里只校验：可空的收字符串或
// null，不可空的只收字符串。返回 false 表示值不可用（error 已经填了）
static bool TextValue(id value, NSString* what, bool nullable, NSString** out,
                      std::string* error) {
  if ([value isKindOfClass:NSString.class]) {
    *out = value;
    return true;
  }
  if (nullable && (value == nil || value == NSNull.null)) {
    *out = nil;
    return true;
  }
  *error = [NSString stringWithFormat:@"%@ must be a string%@", what,
                                      nullable ? @" or null" : @""].UTF8String;
  return false;
}

static BOOL WriteBarsProperty(id object, NSString* key, id value, std::string* error) {
  if ([object isKindOfClass:UIToolbar.class]) {
    UIToolbar* bar = (UIToolbar*)object;
    if ([key isEqualToString:@"barStyle"]) {
      UIBarStyle style;
      if (!BarsBarStyleFromName(value, &style)) {
        *error = EnumError(key, value, NamesForBarsBarStyle());
        return YES;
      }
      bar.barStyle = style;
      return YES;
    }
    if ([key isEqualToString:@"isTranslucent"]) {
      bar.translucent = NACRE_BOOL(value, key);
      return YES;
    }
    return NO;
  }
  if ([object isKindOfClass:UISearchBar.class]) {
    UISearchBar* bar = (UISearchBar*)object;
    NSString* text = nil;
    if ([key isEqualToString:@"text"]) {
      if (TextValue(value, key, false, &text, error)) bar.text = text;
      return YES;
    }
    if ([key isEqualToString:@"placeholder"]) {
      if (TextValue(value, key, true, &text, error)) bar.placeholder = text;
      return YES;
    }
    if ([key isEqualToString:@"prompt"]) {
      if (TextValue(value, key, true, &text, error)) bar.prompt = text;
      return YES;
    }
    if ([key isEqualToString:@"barStyle"]) {
      UIBarStyle style;
      if (!BarsBarStyleFromName(value, &style)) {
        *error = EnumError(key, value, NamesForBarsBarStyle());
        return YES;
      }
      bar.barStyle = style;
      return YES;
    }
    if ([key isEqualToString:@"searchBarStyle"]) {
      UISearchBarStyle style;
      if (!BarsSearchBarStyleFromName(value, &style)) {
        *error = EnumError(key, value, NamesForBarsSearchBarStyle());
        return YES;
      }
      bar.searchBarStyle = style;
      return YES;
    }
    if ([key isEqualToString:@"isTranslucent"]) {
      bar.translucent = NACRE_BOOL(value, key);
      return YES;
    }
    if ([key isEqualToString:@"showsCancelButton"]) {
      bar.showsCancelButton = NACRE_BOOL(value, key);
      return YES;
    }
    if ([key isEqualToString:@"showsBookmarkButton"]) {
      bar.showsBookmarkButton = NACRE_BOOL(value, key);
      return YES;
    }
    if ([key isEqualToString:@"showsSearchResultsButton"]) {
      bar.showsSearchResultsButton = NACRE_BOOL(value, key);
      return YES;
    }
    if ([key isEqualToString:@"isSearchResultsButtonSelected"]) {
      bar.searchResultsButtonSelected = NACRE_BOOL(value, key);
      return YES;
    }
    if ([key isEqualToString:@"scopeButtonTitles"]) {
      if (value == nil || value == NSNull.null) {
        bar.scopeButtonTitles = nil;
        return YES;
      }
      if (![value isKindOfClass:NSArray.class]) {
        *error = "scopeButtonTitles must be an array of strings or null";
        return YES;
      }
      for (id title in (NSArray*)value) {
        if (![title isKindOfClass:NSString.class]) {
          *error = "scopeButtonTitles must be an array of strings or null";
          return YES;
        }
      }
      bar.scopeButtonTitles = value;
      return YES;
    }
    // 不设范围：实测 UIKit 把超出范围的值照样存下来（写 7 读回 7，写 -1
    // 读回 -1），不报错也不改别的。这是平台自己的处理，照它的
    if ([key isEqualToString:@"selectedScopeButtonIndex"]) {
      bar.selectedScopeButtonIndex = NACRE_INT(value, key);
      return YES;
    }
    if ([key isEqualToString:@"showsScopeBar"]) {
      bar.showsScopeBar = NACRE_BOOL(value, key);
      return YES;
    }
    if ([key isEqualToString:@"isEnabled"]) {
      bar.enabled = NACRE_BOOL(value, key);
      return YES;
    }
    // ---- 键盘设置 ----
    // 形状一样，但**不用宏铺开**：check-api.sh 按 isEqualToString 后面那个
    // 字符串字面量抽属性名，宏会把它藏起来。
    // 枚举写错：先查名字，查不到就填报错返回，这时还没碰过搜索框——
    // 「值保持不变」靠的是这个顺序（属性位的报错由入口改成警告）
    if ([key isEqualToString:@"keyboardType"]) {
      UIKeyboardType out;
      if (!KeyboardTypeFromName(value, &out)) {
        *error = EnumError(key, value, NamesForKeyboardType());
        return YES;
      }
      bar.keyboardType = out;
      return YES;
    }
    if ([key isEqualToString:@"returnKeyType"]) {
      UIReturnKeyType out;
      if (!ReturnKeyTypeFromName(value, &out)) {
        *error = EnumError(key, value, NamesForReturnKeyType());
        return YES;
      }
      bar.returnKeyType = out;
      return YES;
    }
    if ([key isEqualToString:@"keyboardAppearance"]) {
      UIKeyboardAppearance out;
      if (!KeyboardAppearanceFromName(value, &out)) {
        *error = EnumError(key, value, NamesForKeyboardAppearance());
        return YES;
      }
      bar.keyboardAppearance = out;
      return YES;
    }
    if ([key isEqualToString:@"enablesReturnKeyAutomatically"]) {
      bar.enablesReturnKeyAutomatically = NACRE_BOOL(value, key);
      return YES;
    }
    if ([key isEqualToString:@"isSecureTextEntry"]) {
      bar.secureTextEntry = NACRE_BOOL(value, key);
      return YES;
    }
    if ([key isEqualToString:@"autocapitalizationType"]) {
      UITextAutocapitalizationType out;
      if (!TextAutocapitalizationTypeFromName(value, &out)) {
        *error = EnumError(key, value, NamesForTextAutocapitalizationType());
        return YES;
      }
      bar.autocapitalizationType = out;
      return YES;
    }
    if ([key isEqualToString:@"autocorrectionType"]) {
      UITextAutocorrectionType out;
      if (!TextAutocorrectionTypeFromName(value, &out)) {
        *error = EnumError(key, value, NamesForTextAutocorrectionType());
        return YES;
      }
      bar.autocorrectionType = out;
      return YES;
    }
    if ([key isEqualToString:@"spellCheckingType"]) {
      UITextSpellCheckingType out;
      if (!TextSpellCheckingTypeFromName(value, &out)) {
        *error = EnumError(key, value, NamesForTextSpellCheckingType());
        return YES;
      }
      bar.spellCheckingType = out;
      return YES;
    }
    if ([key isEqualToString:@"textContentType"]) {
      if (value == nil || value == NSNull.null) {
        bar.textContentType = nil;
        return YES;
      }
      UITextContentType out = nil;
      if (!TextContentTypeFromName(value, &out)) {
        *error = EnumError(key, value, NamesForTextContentType());
        return YES;
      }
      bar.textContentType = out;
      return YES;
    }
    return NO;
  }
  return NO;
}

// ---- 对象属性 ----
// 颜色在 JS 那一侧是字符串，过桥的是 UIColor 对象（字符串在 JS 里解析、
// 池化，见 16-color.js），所以走的是对象通道

// 键盘上方那个视图读出来用哪个 JS 类包。平时用不到：JS 写进去的那个包装
// 被搜索框的持有边留着，读回来就是它。只有系统自己放了一个时才走到这里
static const char* AccessoryClassName(UIView* view) {
  if ([view isKindOfClass:UIToolbar.class]) return "UIToolbar";
  if ([view isKindOfClass:UISearchBar.class]) return "UISearchBar";
  return "UIView";
}

static nacre::NativeObjectRef ReadBarsObjectProperty(id object, const std::string& name) {
  if ([object isKindOfClass:UIToolbar.class]) {
    UIToolbar* bar = (UIToolbar*)object;
    // null_resettable：读出来永远有值，没设过就是继承来的那个
    if (name == "tintColor") return {NacreKeep(bar.tintColor), "UIColor"};
    if (name == "barTintColor") return {NacreKeep(bar.barTintColor), "UIColor"};
    return {};
  }
  if ([object isKindOfClass:UISearchBar.class]) {
    UISearchBar* bar = (UISearchBar*)object;
    if (name == "tintColor") return {NacreKeep(bar.tintColor), "UIColor"};
    if (name == "barTintColor") return {NacreKeep(bar.barTintColor), "UIColor"};
    // 系统的类是 UISearchTextField（实测拿到的是它的私有子类
    // UISearchBarTextField），是 UITextField 的子类。按 UITextField 包装：
    // 它自己多出来的那几样（搜索标记、搜索建议）还没接
    if (name == "searchTextField") return {NacreKeep(bar.searchTextField), "UITextField"};
    if (name == "inputAccessoryView") {
      UIView* accessory = bar.inputAccessoryView;
      return {NacreKeep(accessory), AccessoryClassName(accessory)};
    }
    return {};
  }
  return {};
}

// 对象值的取法。照 Web IDL：对象不转换，nil 可以（这几个属性都可空），
// 给了对象就得是要求的那个类。返回 false 表示类型不对，error 已经填好。
// 核心里同样用途的宏 NACRE_OBJECT_OR_NIL 是给返回 void 的函数写的
// （它失败时 `return;`），这条通道返回 bool，用不了
static bool TypedOrNil(id value, Class cls, const char* className, const std::string& name,
                       std::string* error) {
  if (value == nil || [value isKindOfClass:cls]) return true;
  ObjectTypeError(name, className, true, error);
  return false;
}

static bool WriteBarsObjectProperty(id object, const std::string& name, id value,
                                    std::string* error) {
  if ([object isKindOfClass:UIToolbar.class]) {
    UIToolbar* bar = (UIToolbar*)object;
    if (name == "tintColor") {
      // 写 nil 是退回继承来的颜色，不是「没有颜色」
      if (TypedOrNil(value, UIColor.class, "UIColor", name, error)) {
        bar.tintColor = (UIColor*)value;
      }
      return true;
    }
    if (name == "barTintColor") {
      if (TypedOrNil(value, UIColor.class, "UIColor", name, error)) {
        bar.barTintColor = (UIColor*)value;
      }
      return true;
    }
    return false;
  }
  if ([object isKindOfClass:UISearchBar.class]) {
    UISearchBar* bar = (UISearchBar*)object;
    if (name == "tintColor") {
      if (TypedOrNil(value, UIColor.class, "UIColor", name, error)) {
        bar.tintColor = (UIColor*)value;
      }
      return true;
    }
    if (name == "barTintColor") {
      if (TypedOrNil(value, UIColor.class, "UIColor", name, error)) {
        bar.barTintColor = (UIColor*)value;
      }
      return true;
    }
    if (name == "inputAccessoryView") {
      if (TypedOrNil(value, UIView.class, "UIView", name, error)) {
        bar.inputAccessoryView = (UIView*)value;
      }
      return true;
    }
    return false;
  }
  return false;
}

// ---- 对象数组：工具条的 items ----
static void ReadBarsObjectArray(id object, const std::string& name,
                                std::vector<nacre::NativeObjectRef>& refs) {
  if ([object isKindOfClass:UIToolbar.class] && name == "items") {
    // 没设过是 nil，遍历 nil 就是空的
    for (UIBarButtonItem* item in ((UIToolbar*)object).items) {
      refs.push_back({NacreKeep(item), "UIBarButtonItem"});
    }
  }
}

// 每个都得是 UIBarButtonItem；空指针（JS 给的 null、数、字符串）也不行
static bool WriteBarsObjectArray(id object, const std::string& name,
                                 const std::vector<void*>& values, std::string* error) {
  if ([object isKindOfClass:UIToolbar.class] && name == "items") {
    NSMutableArray<UIBarButtonItem*>* items = [NSMutableArray array];
    for (void* ptr : values) {
      id item = (__bridge id)ptr;
      if (![item isKindOfClass:UIBarButtonItem.class]) {
        *error = "items needs an array of UIBarButtonItem";
        return true;
      }
      [items addObject:item];
    }
    ((UIToolbar*)object).items = items;
    return true;
  }
  return false;
}

// ---- 方法 ----
static bool BarsCallMethod(id object, NSString* sel, const NacreArgs& args, std::string* out,
                           std::string* error) {
  if ([object isKindOfClass:UIToolbar.class]) {
    // 参数的排法：animated 在前，后面每个项一个句柄（项数不定）
    if ([sel isEqualToString:@"setItems:animated:"]) {
      *out = "null";
      BOOL animated = NACRE_BOOL(args.value(0), @"animated");
      const size_t count = args.ptrs != nullptr ? args.ptrs->size() : 0;
      NSMutableArray<UIBarButtonItem*>* items = [NSMutableArray array];
      for (size_t i = 1; i < count; i++) {
        id item = args.object(i);
        if (![item isKindOfClass:UIBarButtonItem.class]) {
          *error = "setItems needs an array of UIBarButtonItem";
          return true;
        }
        [items addObject:item];
      }
      [(UIToolbar*)object setItems:items animated:animated];
      return true;
    }
    return false;
  }
  if ([object isKindOfClass:UISearchBar.class]) {
    UISearchBar* bar = (UISearchBar*)object;
    if ([sel isEqualToString:@"setShowsCancelButton:animated:"]) {
      *out = "null";
      BOOL shows = NACRE_BOOL(args.value(0), @"showsCancelButton");
      BOOL animated = NACRE_BOOL(args.value(1), @"animated");
      [bar setShowsCancelButton:shows animated:animated];
      return true;
    }
    if ([sel isEqualToString:@"setShowsScopeBar:animated:"]) {
      *out = "null";
      BOOL shows = NACRE_BOOL(args.value(0), @"showsScopeBar");
      BOOL animated = NACRE_BOOL(args.value(1), @"animated");
      [bar setShowsScopeBar:shows animated:animated];
      return true;
    }
    return false;
  }
  return false;
}

}  // namespace nacre_bridge

// ---- 登记 ----
@interface NacreBarsDomain : NSObject
@end
@implementation NacreBarsDomain
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "bars";
  d.classes = {UIToolbar.class, UISearchBar.class};
  d.read = nacre_bridge::ReadBarsProperty;
  d.write = nacre_bridge::WriteBarsProperty;
  d.readObject = nacre_bridge::ReadBarsObjectProperty;
  d.writeObject = nacre_bridge::WriteBarsObjectProperty;
  d.readObjectArray = nacre_bridge::ReadBarsObjectArray;
  d.writeObjectArray = nacre_bridge::WriteBarsObjectArray;
  d.call = nacre_bridge::BarsCallMethod;
  d.construct = nacre_bridge::BarsConstruct;
  d.subscribe = nacre_bridge::BarsSetSubscription;
  nacre_bridge::NacreRegisterDomain(d);
}
@end
