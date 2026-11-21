// 一个域：输入法组字的范围。UITextField / UITextView 的 markedTextRange。
//
// UIKit 给的是 UITextRange（两头是不透明的 UITextPosition），这里换算成从文档
// 开头数的 UTF-16 码元偏移，JS 那一侧见到的是 NSRange，和 selectedRange 一样。
// 没在组字时是 nil，JS 那边是 null。
#import "NacreBridge.h"

namespace nacre_bridge {

static id MarkedRangeToJSON(id<UITextInput> input) {
  UITextRange* marked = input.markedTextRange;
  if (marked == nil) return NSNull.null;
  NSInteger location = [input offsetFromPosition:input.beginningOfDocument toPosition:marked.start];
  NSInteger length = [input offsetFromPosition:marked.start toPosition:marked.end];
  return @{@"location": @(MAX(location, 0)), @"length": @(MAX(length, 0))};
}

static id ReadMarkedTextProperty(id object, NSString* key) {
  if (![key isEqualToString:@"markedTextRange"]) return nil;
  if ([object isKindOfClass:UITextField.class] || [object isKindOfClass:UITextView.class]) {
    return MarkedRangeToJSON((id<UITextInput>)object);
  }
  return nil;
}

}  // namespace nacre_bridge

@interface NacreMarkedTextDomain : NSObject
@end
@implementation NacreMarkedTextDomain
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "marked-text";
  d.classes = {UITextField.class, UITextView.class};
  d.read = nacre_bridge::ReadMarkedTextProperty;
  nacre_bridge::NacreRegisterDomain(d);
}
@end
