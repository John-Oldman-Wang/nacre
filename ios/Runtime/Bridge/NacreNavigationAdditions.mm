// 初稿是 bindgen 生成的（docs/internals/bindgen.md）。之后它是普通的手写文件：直接改，bindgen 不会再碰它。
//
// UINavigationController 补上的成员：工具条、返回手势、自动隐藏导航条、showViewController。
// 写法和手写的域一样，见 docs/internals/adding-classes.md。
//
// navigationBar 定了暂不接（它返回的 UINavigationBar 没接）；delegate 的两个回调已经是
// 事件 beforeshow / show。原因见 docs/internals/navigation.md。

#import "NacreBridge.h"

namespace nacre_bridge {

static id ReadNavigationAdditionsProperty(id object, NSString* key) {
  if ([object isKindOfClass:UINavigationController.class]) {
    UINavigationController* o = (UINavigationController*)object;
    if ([key isEqualToString:@"isToolbarHidden"]) return @(o.isToolbarHidden);
    if ([key isEqualToString:@"hidesBarsWhenKeyboardAppears"]) return @(o.hidesBarsWhenKeyboardAppears);
    if ([key isEqualToString:@"hidesBarsOnSwipe"]) return @(o.hidesBarsOnSwipe);
    if ([key isEqualToString:@"hidesBarsWhenVerticallyCompact"]) return @(o.hidesBarsWhenVerticallyCompact);
    if ([key isEqualToString:@"hidesBarsOnTap"]) return @(o.hidesBarsOnTap);
  }
  return nil;
}

static BOOL WriteNavigationAdditionsProperty(id object, NSString* key, id value, std::string* error) {
  if ([object isKindOfClass:UINavigationController.class]) {
    UINavigationController* o = (UINavigationController*)object;
    if ([key isEqualToString:@"isToolbarHidden"]) { o.toolbarHidden = NACRE_BOOL(value, key); return YES; }
    if ([key isEqualToString:@"hidesBarsWhenKeyboardAppears"]) { o.hidesBarsWhenKeyboardAppears = NACRE_BOOL(value, key); return YES; }
    if ([key isEqualToString:@"hidesBarsOnSwipe"]) { o.hidesBarsOnSwipe = NACRE_BOOL(value, key); return YES; }
    if ([key isEqualToString:@"hidesBarsWhenVerticallyCompact"]) { o.hidesBarsWhenVerticallyCompact = NACRE_BOOL(value, key); return YES; }
    if ([key isEqualToString:@"hidesBarsOnTap"]) { o.hidesBarsOnTap = NACRE_BOOL(value, key); return YES; }
  }
  return NO;
}

static nacre::NativeObjectRef ReadNavigationAdditionsObjectProperty(id object, const std::string& name) {
  if ([object isKindOfClass:UINavigationController.class]) {
    UINavigationController* o = (UINavigationController*)object;
    if (name == "toolbar") return {NacreKeep(o.toolbar), "UIToolbar"};
    if (name == "interactivePopGestureRecognizer") return {NacreKeep(o.interactivePopGestureRecognizer), "UIGestureRecognizer"};
    if (name == "interactiveContentPopGestureRecognizer") return {NacreKeep(o.interactiveContentPopGestureRecognizer), "UIGestureRecognizer"};
    if (name == "barHideOnSwipeGestureRecognizer") return {NacreKeep(o.barHideOnSwipeGestureRecognizer), "UIPanGestureRecognizer"};
    if (name == "barHideOnTapGestureRecognizer") return {NacreKeep(o.barHideOnTapGestureRecognizer), "UITapGestureRecognizer"};
  }
  return {};
}

static bool WriteNavigationAdditionsObjectProperty(id object, const std::string& name, id value,
                                        std::string* error) {
  return false;
}

static bool CallNavigationAdditionsMethod(id object, NSString* sel, const NacreArgs& args,
                             std::string* out, std::string* error) {
  if ([object isKindOfClass:UINavigationController.class]) {
    UINavigationController* o = (UINavigationController*)object;
    if ([sel isEqualToString:@"setToolbarHidden:animated:"]) {
      BOOL a0 = NACRE_BOOL(args.value(0), @"setToolbarHidden");
      BOOL a1 = NACRE_BOOL(args.value(1), @"animated");
      [o setToolbarHidden:a0 animated:a1];
      *out = "null";
      return true;
    }
    // 和 pushViewController 同一种写法：头文件写明它在导航控制器上就是 push。
    // sender 只是传给系统，可以是任何原生对象，也可以没有
    if ([sel isEqualToString:@"showViewController:sender:"]) {
      id vc = args.object(0);
      if (![vc isKindOfClass:UIViewController.class]) {
        *error = "showViewController: expects a UIViewController";
        *out = "null";
        return true;
      }
      id sender = args.object(1);
      // UIKit 为「层级不一致」抛 ObjC 异常（把正在当窗口根的页面塞进来），接住转成 JS 的错误
      @try {
        [o showViewController:(UIViewController*)vc sender:sender];
      } @catch (NSException* e) {
        *error = [NSString stringWithFormat:@"showViewController: %@", e.reason].UTF8String;
      }
      *out = "null";
      return true;
    }
  }
  return false;
}

}  // namespace nacre_bridge

@interface NacreNavigationAdditionsDomain : NSObject
@end
@implementation NacreNavigationAdditionsDomain
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "navigation-additions";
  d.classes = {UINavigationController.class};
  d.read = nacre_bridge::ReadNavigationAdditionsProperty;
  d.write = nacre_bridge::WriteNavigationAdditionsProperty;
  d.readObject = nacre_bridge::ReadNavigationAdditionsObjectProperty;
  d.writeObject = nacre_bridge::WriteNavigationAdditionsObjectProperty;
  d.call = nacre_bridge::CallNavigationAdditionsMethod;
  nacre_bridge::NacreRegisterDomain(d);
}
@end
