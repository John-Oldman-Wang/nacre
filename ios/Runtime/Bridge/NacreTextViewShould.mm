// 一个域：多行输入框（UITextView）上「系统当场来问」的事件。形状和单行输入框
// 的那几个一样（NacreTextFieldDelegate.mm），监听器里 preventDefault() 就是「不要」：
//
//   beforefocus  ← textViewShouldBeginEditing:     取消 = 不进入编辑
//   beforeblur   ← textViewShouldEndEditing:       取消 = 不结束编辑
//   beforeinput  ← textView:shouldChangeTextInRange:replacementText:
//                                                  取消 = 这次修改不发生
//   linkclick    ← textView:primaryActionForTextItem:defaultAction:
//                                                  点了富文本里的链接。取消 = 不打开
//
// 都是当场派发（NacreEmitEventSync）、可以取消，监听器执行完才把答案交回系统。
// 没有监听器、监听器抛了，都按系统默认处理。
//
// 委托的槽位：UITextView 的 delegate 和 UIScrollView 的是同一个，核心的滚动事件
// 和 selectionchange（NacreTextView.mm）也往里放东西。所以这里也用
// NacreAddDelegatePart 加一方，不直接写 delegate。四个名字里有一个有监听器
// 时这一方在，一个都没有时拿走，系统根本不会来问。
//
// beforeinput：iOS 26 多了一个收多段范围的版本（…InRanges:）。槽位里没有一方
// 实现它时，系统调单段的这个、传几段的并集（头文件里这么写的），所以只实现这个，
// 和单行输入框一样。
//
// linkclick 只管链接。富文本里的附件、自定义标记（UITextItem 的另外两种）照系统
// 默认。系统默认的动作是打开链接（交给 Safari 或者对应的 App）。
#import "NacreBridge.h"

#import <objc/runtime.h>

@interface NacreTextViewShouldDelegate : NSObject <UITextViewDelegate>
@property(nonatomic, strong) NSMutableSet<NSString*>* types;
@end

@implementation NacreTextViewShouldDelegate

// 返回系统要的那个 BOOL：监听器没取消就是 YES
- (BOOL)ask:(NSString*)type view:(UITextView*)view json:(NSString*)json {
  if (![self.types containsObject:type]) return YES;
  return !nacre_bridge::NacreEmitEventSync(view, "UITextView", type, json);
}

- (BOOL)textViewShouldBeginEditing:(UITextView*)textView {
  return [self ask:@"beforefocus" view:textView json:nil];
}

- (BOOL)textViewShouldEndEditing:(UITextView*)textView {
  return [self ask:@"beforeblur" view:textView json:nil];
}

- (BOOL)textView:(UITextView*)textView
    shouldChangeTextInRange:(NSRange)range
            replacementText:(NSString*)text {
  if (![self.types containsObject:@"beforeinput"]) return YES;
  NSDictionary* fields = @{
    @"range": @{@"location": @(range.location), @"length": @(range.length)},
    @"replacementString": text ?: @"",
  };
  return [self ask:@"beforeinput"
              view:textView
              json:@(nacre_bridge::EncodeJSON(fields).c_str())];
}

- (UIAction*)textView:(UITextView*)textView
    primaryActionForTextItem:(UITextItem*)textItem
               defaultAction:(UIAction*)defaultAction {
  if (![self.types containsObject:@"linkclick"]) return defaultAction;
  if (textItem.contentType != UITextItemContentTypeLink || textItem.link == nil) {
    return defaultAction;
  }
  const NSRange range = textItem.range;
  NSDictionary* fields = @{
    @"url": textItem.link.absoluteString ?: @"",
    @"range": @{@"location": @(range.location), @"length": @(range.length)},
  };
  // 取消了就返回 nil：系统什么都不做
  return [self ask:@"linkclick" view:textView json:@(nacre_bridge::EncodeJSON(fields).c_str())]
             ? defaultAction
             : nil;
}

@end

static const void* kNacreTextViewShouldKey = &kNacreTextViewShouldKey;

namespace nacre_bridge {

static NSArray<NSString*>* TextViewShouldEventNames(void) {
  return @[@"beforefocus", @"beforeblur", @"beforeinput", @"linkclick"];
}

static NacreSubscribed TextViewShouldSubscribe(id object, NSString* type, BOOL on,
                                               std::string* error) {
  if (![object isKindOfClass:UITextView.class]) return false;
  // 别的名字不是这个域的：多行输入框自己的四个事件和滚动事件由别的域接
  if (![TextViewShouldEventNames() containsObject:type]) return false;
  UITextView* view = (UITextView*)object;
  NacreTextViewShouldDelegate* part = objc_getAssociatedObject(view, kNacreTextViewShouldKey);
  if (on) {
    if (part == nil) {
      part = [NacreTextViewShouldDelegate new];
      part.types = [NSMutableSet set];
      objc_setAssociatedObject(view, kNacreTextViewShouldKey, part,
                               OBJC_ASSOCIATION_RETAIN_NONATOMIC);
      NacreAddDelegatePart(view, part);
    }
    [part.types addObject:type];
  } else if (part != nil) {
    [part.types removeObject:type];
    // 一个监听器都不剩就把这一方拿走：系统不再来问，行为回到默认
    if (part.types.count == 0) {
      NacreRemoveDelegatePart(view, part);
      objc_setAssociatedObject(view, kNacreTextViewShouldKey, nil,
                               OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    }
  }
  return true;
}

}  // namespace nacre_bridge

@interface NacreTextViewShouldDomain : NSObject
@end
@implementation NacreTextViewShouldDomain
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "text-view-should";
  d.classes = {UITextView.class};
  d.subscribe = nacre_bridge::TextViewShouldSubscribe;
  nacre_bridge::NacreRegisterDomain(d);
}
@end
