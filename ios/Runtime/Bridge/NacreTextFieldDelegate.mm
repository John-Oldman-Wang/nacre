// 输入框的 should… 事件：系统来问「要不要」，监听器里 preventDefault() 就是
// 「不要」。同步回调（M1b）的第一个使用者。
//
// UITextFieldDelegate 里返回 BOOL 的五个方法，各对一个**可取消**的事件，
// 当场派发（NacreEmitEventSync），监听器执行完才把答案交回系统：
//
//   beforefocus  ← textFieldShouldBeginEditing:    取消 = 不进入编辑
//   beforeblur    ← textFieldShouldEndEditing:      取消 = 不结束编辑
//   beforeinput        ← textField:shouldChangeCharactersInRange:replacementString:
//                                                         取消 = 这次修改不发生
//   beforeclear         ← textFieldShouldClear:           取消 = 不清空
//   beforereturn        ← textFieldShouldReturn:          取消 = 忽略这次回车
//
// 没有监听器、监听器抛了，都按「要」处理——和不设委托时一样。
//
// 同一个委托对象上还有一个不问答案的通知，照普通事件延后一轮派发：
//
//   selectionchange     ← textFieldDidChangeSelection:    选区或光标的位置变了
//
// 这个域是登记进来的（文件末尾的 +load）。输入框别的事件（input
// 一类）走的是 UIControl 的 target-action，在核心里；这里只认上面六个名字，
// 别的返回「不认领」让它落到核心的控件分支。委托是惰性的：六个里一个监听器
// 都没有时不设委托，系统根本不会来问。
//
// 输入框后来补的成员也在这个文件里（核心里按类写死的那一份在
// NacrePropsControl.mm，不在这一批能动的文件里），都在订阅的前面：
//   selectedRange        选区
//   inputAccessoryView   键盘上方的工具条
//   hasText / insertText: / deleteBackward
//                        按用户打字的规矩改内容，形状照 UITextView 上的同名成员
//
// 选区：UIKit 给输入框的
// 是 selectedTextRange（UITextRange，两头是不透明的 UITextPosition），这里换算
// 成从文档开头数的 UTF-16 码元偏移，JS 那一侧见到的是和 UITextView 一样的
// NSRange，不接触 UITextRange / UITextPosition。

#import "NacreBridge.h"

#import <objc/runtime.h>

// 关联对象的 key：UITextField → NacreTextFieldDelegate。
// textField.delegate 是 weak，所以委托对象靠这个关联活着
static const void* kNacreTextFieldDelegateKey = &kNacreTextFieldDelegateKey;

@interface NacreTextFieldDelegate : NSObject <UITextFieldDelegate>
@property(nonatomic, strong) NSMutableSet<NSString*>* types;
@end

@implementation NacreTextFieldDelegate

// 返回系统要的那个 BOOL：监听器没取消就是 YES
- (BOOL)ask:(NSString*)type field:(UITextField*)field json:(NSString*)json {
  if (![self.types containsObject:type]) return YES;
  // 只有 beforeinput 带字段；别的几个是普通的 Event
  const char* eventClass = [type isEqualToString:@"beforeinput"] ? "UITextBeforeInputEvent" : nullptr;
  return !nacre_bridge::NacreEmitEventSync(field, "UITextField", type, json, eventClass);
}

- (BOOL)textFieldShouldBeginEditing:(UITextField*)textField {
  return [self ask:@"beforefocus" field:textField json:nil];
}

- (BOOL)textFieldShouldEndEditing:(UITextField*)textField {
  return [self ask:@"beforeblur" field:textField json:nil];
}

// iOS 26 多了一个收多段范围的版本（…InRanges:）。两个都实现时系统只调新的，
// 这里只实现单段的这个：它在头文件里标的是将来废弃、现在照常调
- (BOOL)textField:(UITextField*)textField
    shouldChangeCharactersInRange:(NSRange)range
                replacementString:(NSString*)string {
  if (![self.types containsObject:@"beforeinput"]) return YES;
  NSDictionary* fields = @{
    @"range": @{@"location": @(range.location), @"length": @(range.length)},
    @"replacementString": string ?: @"",
  };
  return [self ask:@"beforeinput"
             field:textField
              json:@(nacre_bridge::EncodeJSON(fields).c_str())];
}

- (BOOL)textFieldShouldClear:(UITextField*)textField {
  return [self ask:@"beforeclear" field:textField json:nil];
}

- (BOOL)textFieldShouldReturn:(UITextField*)textField {
  return [self ask:@"beforereturn" field:textField json:nil];
}

// 选区变了。系统不等答案，所以不是同步回调：照普通事件延后一轮派发。
// 事件上不带选区：读 target.selectedRange 就有
- (void)textFieldDidChangeSelection:(UITextField*)textField {
  if (![self.types containsObject:@"selectionchange"]) return;
  nacre_bridge::NacreEmitEvent(textField, "UITextField", @"selectionchange");
}

@end

namespace nacre_bridge {

// 定义在 NacreTextView.mm 里：UITextView.selectedRange 用的那一个，两边的
// 校验和报错因此是同一份。内部头这次不许动，所以在这里声明一行；签名对不上
// 链接时会报
bool TextInputRangeFromJSON(NSString* what, id value, NSRange* out, std::string* error);
// 同上：键盘上方的工具条，两种输入框共用（定义和说明在 NacreTextView.mm）
const char* TextInputAccessoryClassName(UIView* view);
void TextInputSetAccessoryView(UIResponder* responder, UIView* accessory);

// ---- 选区 ----
// 形状和 UITextView.selectedRange 一样：读永远是一个范围，写不看是不是正在
// 编辑。
//
// 最初以为不在编辑时 selectedTextRange 是 nil，于是定成「读到 null、写会抛」。
// 合并后的验收量出来不是（iPhone Air，iOS 27.2）：从没编辑过的输入框读到
// (0, 0)，不在编辑时写 (0, 3) 读回来就是 (0, 3)。所以那条规矩撤掉了。
//
// 下面两处 nil 的分支是兜底，**没有观察到过**：读给 (0, 0)，写什么都不做、
// 也不报错。
static id ReadTextFieldInputProperty(id object, NSString* key) {
  if (![object isKindOfClass:UITextField.class]) return nil;
  UITextField* field = (UITextField*)object;
  // UIKeyInput 的属性：有没有内容。和 UITextView.hasText 是同一个
  if ([key isEqualToString:@"hasText"]) return @(field.hasText);
  if (![key isEqualToString:@"selectedRange"]) return nil;
  UITextRange* selected = field.selectedTextRange;
  if (selected == nil) return @{@"location": @0, @"length": @0};
  // UITextField 的位置按 UTF-16 码元数，和 NSString 的下标是同一个单位
  NSInteger location = [field offsetFromPosition:field.beginningOfDocument
                                      toPosition:selected.start];
  NSInteger length = [field offsetFromPosition:selected.start toPosition:selected.end];
  // 按接口的约定这两个数不会是负的；真是负的也不把它交给 JS（NSRange 的字段
  // 是非负整数，JS 那一侧建结构体时会抛）
  return @{@"location": @(MAX(location, (NSInteger)0)), @"length": @(MAX(length, (NSInteger)0))};
}

static BOOL WriteTextFieldInputProperty(id object, NSString* key, id value,
                                        std::string* error) {
  if (![object isKindOfClass:UITextField.class]) return NO;
  if (![key isEqualToString:@"selectedRange"]) return NO;
  UITextField* field = (UITextField*)object;
  NSRange range;
  // 类型不对、字段是负数：和 UITextView.selectedRange 是同一份校验
  if (!TextInputRangeFromJSON(key, value, &range, error)) return YES;
  // 越界不抛。UITextView 的规则是 UIKit 自己定的（量到的：位置超了停在末尾，
  // 长度超了变成 0，不是截到末尾）；输入框这边位置是自己算的，照同一条规则
  // 收，两个类写同一个越界的范围读回来一样
  const NSUInteger total = field.text.length;
  if (range.location > total) {
    range = NSMakeRange(total, 0);
  } else if (range.length > total - range.location) {
    range.length = 0;
  }
  UITextPosition* start = [field positionFromPosition:field.beginningOfDocument
                                               offset:(NSInteger)range.location];
  UITextPosition* end = start == nil ? nil
                                     : [field positionFromPosition:start
                                                            offset:(NSInteger)range.length];
  // 位置已经收到内容以内了，按理一定换得出来。换不出来（没有观察到过）就
  // 什么都不做，和 UIKit 自己对待写不进去的选区一样，不报错
  if (start == nil || end == nil) return YES;
  field.selectedTextRange = [field textRangeFromPosition:start toPosition:end];
  return YES;
}

// ---- 键盘上方的工具条 ----
// 形状照搜索框的同名属性（NacreBars.mm）：读写都走对象通道，值是 UIView 或
// nil，类型不对填报错。输入框强持有它，JS 那一侧记一条所有权边
static nacre::NativeObjectRef ReadTextFieldObjectProperty(id object, const std::string& name) {
  if (![object isKindOfClass:UITextField.class]) return {};
  if (name != "inputAccessoryView") return {};
  UIView* accessory = ((UITextField*)object).inputAccessoryView;
  return {NacreKeep(accessory), TextInputAccessoryClassName(accessory)};
}

static bool WriteTextFieldObjectProperty(id object, const std::string& name, id value,
                                         std::string* error) {
  if (![object isKindOfClass:UITextField.class]) return false;
  if (name != "inputAccessoryView") return false;
  if (value != nil && ![value isKindOfClass:UIView.class]) {
    ObjectTypeError(name, "UIView", true, error);
    return true;
  }
  TextInputSetAccessoryView((UITextField*)object, (UIView*)value);
  return true;
}

// ---- 方法：按用户打字的规矩改内容 ----
// UIKeyInput 的两个方法，UITextField 遵循 UITextInput 所以有。和
// NacreTextView.mm 里 UITextView 的那两个分支是同一个形状：插在选区处、有选区
// 就换掉；参数在 JS 那一侧已经转成字符串了，这里只校验。
//
// 不在编辑时调会怎样、派不派发 input（EditingChanged）、问不问委托，都交给
// UIKit，这里不拦也不补。这几条没有在模拟器上量过，见 text-input.md
static bool TextFieldCallMethod(id object, NSString* sel, const NacreArgs& args,
                                std::string* out, std::string* error) {
  if (![object isKindOfClass:UITextField.class]) return false;
  UITextField* field = (UITextField*)object;
  if ([sel isEqualToString:@"insertText:"]) {
    *out = "null";
    id text = args.value(0);
    if (![text isKindOfClass:NSString.class]) {
      *error = "insertText: needs a string";
      return true;
    }
    [field insertText:(NSString*)text];
    return true;
  }
  if ([sel isEqualToString:@"deleteBackward"]) {
    [field deleteBackward];
    *out = "null";
    return true;
  }
  return false;
}

// ---- 订阅 ----
static NSArray<NSString*>* TextFieldDelegateEventNames(void) {
  return @[@"beforefocus", @"beforeblur", @"beforeinput", @"beforeclear",
           @"beforereturn", @"selectionchange"];
}

static NacreSubscribed TextFieldDelegateSubscribe(id object, NSString* type, BOOL on, std::string* error) {
  if (![object isKindOfClass:UITextField.class]) return false;
  // 别的名字不是这个域的：控件事件在核心里，名字不对也由那边报
  if (![TextFieldDelegateEventNames() containsObject:type]) return false;
  UITextField* field = (UITextField*)object;
  NacreTextFieldDelegate* d = objc_getAssociatedObject(field, kNacreTextFieldDelegateKey);
  if (on) {
    if (d == nil) {
      d = [NacreTextFieldDelegate new];
      d.types = [NSMutableSet set];
      objc_setAssociatedObject(field, kNacreTextFieldDelegateKey, d,
                               OBJC_ASSOCIATION_RETAIN_NONATOMIC);
      field.delegate = d;
    }
    [d.types addObject:type];
  } else if (d != nil) {
    [d.types removeObject:type];
    // 一个监听器都不剩就把委托摘掉：系统不再来问，行为回到默认
    if (d.types.count == 0) {
      if (field.delegate == d) field.delegate = nil;
      objc_setAssociatedObject(field, kNacreTextFieldDelegateKey, nil,
                               OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    }
  }
  return true;
}

}  // namespace nacre_bridge

@interface NacreTextFieldDelegateDomain : NSObject
@end
@implementation NacreTextFieldDelegateDomain
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "text-field-delegate";
  d.classes = {UITextField.class};
  d.read = nacre_bridge::ReadTextFieldInputProperty;
  d.write = nacre_bridge::WriteTextFieldInputProperty;
  d.readObject = nacre_bridge::ReadTextFieldObjectProperty;
  d.writeObject = nacre_bridge::WriteTextFieldObjectProperty;
  d.call = nacre_bridge::TextFieldCallMethod;
  d.subscribe = nacre_bridge::TextFieldDelegateSubscribe;
  nacre_bridge::NacreRegisterDomain(d);
}
@end
