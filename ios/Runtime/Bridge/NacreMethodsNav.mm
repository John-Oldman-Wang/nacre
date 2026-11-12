// 导航这个域在**所有通道**上的方法分支。
//
// 一个域一个文件、装它在所有通道上的分支——真实的改动单元是「给导航加一个
// 方法」，一次往往要同时动好几条通道，按域切这件事在一个文件里完成。
//
// 每个入口都返回「认不认领」，不靠「在同一个函数里往下掉」：那样将来再拆
// 才是纯搬家，不用新增返回约定。
#import "NacreBridge.h"

namespace nacre_bridge {

bool NavCallVoidMethod(id object, const std::string& name) {
  if (![object isKindOfClass:UIWindow.class]) return false;
  UIWindow* window = (UIWindow*)object;
  if (name == "makeKeyAndVisible") {
    [window makeKeyAndVisible];
    return true;
  }
  if (name == "makeKeyWindow") {
    [window makeKeyWindow];
    return true;
  }
  return false;
}

bool NavCallMethod(id object, NSString* sel, const NacreArgs& args,
                   std::string* out, std::string* error) {
  if (![object isKindOfClass:UINavigationController.class]) return false;
  UINavigationController* nav = (UINavigationController*)object;
  auto vcArg = [&](size_t i) -> UIViewController* {
    id v = args.object(i);
    return [v isKindOfClass:UIViewController.class] ? (UIViewController*)v : nil;
  };
  BOOL animated = NACRE_BOOL(args.value(1), sel);

  if ([sel isEqualToString:@"pushViewController:animated:"]) {
    UIViewController* vc = vcArg(0);
    if (vc == nil) {
      *error = "pushViewController: expects a UIViewController";
      *out = "null";
      return true;
    }
    // UIKit 会为「层级不一致」抛 ObjC 异常，最典型的是把一个正在当窗口根
    // 的 VC 塞进来（UIViewControllerHierarchyInconsistency）。不接住就是
    // 整个 App 死掉，而错误来自调用方——和约束激活同一个判据
    @try {
      [nav pushViewController:vc animated:animated];
    } @catch (NSException* e) {
      *error = [NSString stringWithFormat:@"pushViewController: %@", e.reason].UTF8String;
    }
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"setNavigationBarHidden:animated:"]) {
    [nav setNavigationBarHidden:NACRE_BOOL(args.value(0), sel) animated:animated];
    *out = "null";
    return true;
  }
  return false;
}

// ---- 父子控制器 ----
//
// 取一个可以是 null 的页面参数。给的既不是页面也不是 null 就填报错，
// 不当成 nil 吞掉
static bool optionalControllerArg(const NacreArgs& args, size_t i, const char* what,
                                  UIViewController* __strong* out, std::string* error) {
  id given = args.object(i);
  id raw = args.value(i);
  if ([given isKindOfClass:UIViewController.class]) {
    *out = (UIViewController*)given;
    return true;
  }
  if (given == nil && (raw == nil || raw == NSNull.null)) {
    *out = nil;
    return true;
  }
  ObjectTypeError(what, "UIViewController", true, error);
  return false;
}

bool ContainerCallMethod(id object, NSString* sel, const NacreArgs& args,
                         std::string* out, std::string* error) {
  if (![object isKindOfClass:UIViewController.class]) return false;
  UIViewController* vc = (UIViewController*)object;

  if ([sel isEqualToString:@"addChildViewController:"]) {
    id child = args.object(0);
    if (![child isKindOfClass:UIViewController.class]) {
      ObjectTypeError("addChildViewController", "UIViewController", false, error);
      *out = "null";
      return true;
    }
    // 父子关系不能成环：不能把自己、也不能把自己的祖先加成子控制器。
    // UIKit 不检查这个，照样加进去，之后任何沿着父链往上找的调用（比如读
    // navigationController）都会无限递归——实测是栈溢出直接崩，不是能接住
    // 的 ObjC 异常。所以在这里拦
    for (UIViewController* up = vc; up != nil; up = up.parentViewController) {
      if (up == child) {
        *error = "addChildViewController: a view controller cannot be added as a child "
                 "of itself or of one of its own descendants";
        *out = "null";
        return true;
      }
    }
    [vc addChildViewController:(UIViewController*)child];
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"removeFromParentViewController"]) {
    [vc removeFromParentViewController];
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"willMoveToParentViewController:"]) {
    UIViewController* parent = nil;
    if (optionalControllerArg(args, 0, "willMoveToParentViewController", &parent, error)) {
      [vc willMoveToParentViewController:parent];
    }
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"didMoveToParentViewController:"]) {
    UIViewController* parent = nil;
    if (optionalControllerArg(args, 0, "didMoveToParentViewController", &parent, error)) {
      [vc didMoveToParentViewController:parent];
    }
    *out = "null";
    return true;
  }
  return false;
}

bool NavCallObjectMethod(id object, const std::string& name, const NacreArgs& args,
                         nacre::NativeObjectRef* out, std::string* error) {
  if (![object isKindOfClass:UINavigationController.class]) return false;
  if (name != "popViewControllerAnimated:") return false;
  UINavigationController* nav = (UINavigationController*)object;
  BOOL animated = NACRE_BOOL(args.value(0), @"animated");
  // 栈底那一个弹不动，返回 nil —— 「没命中」和「你问错了」要分开，
  // 所以这里不填 error
  *out = {(__bridge void*)[nav popViewControllerAnimated:animated], "UIViewController"};
  return true;
}

bool NavCallObjectArrayMethod(id object, const std::string& name, const NacreArgs& args,
                              std::vector<nacre::NativeObjectRef>* out,
                              std::string* error) {
  if (![object isKindOfClass:UINavigationController.class]) return false;
  UINavigationController* nav = (UINavigationController*)object;
  NSArray<UIViewController*>* popped = nil;

  if (name == "popToViewController:animated:") {
    id vc = args.object(0);
    if (![vc isKindOfClass:UIViewController.class]) {
      *error = "popToViewController: expects a UIViewController";
      return true;
    }
    popped = [nav popToViewController:vc animated:NACRE_BOOL(args.value(1), @"animated")];
  } else if (name == "popToRootViewControllerAnimated:") {
    popped = [nav popToRootViewControllerAnimated:NACRE_BOOL(args.value(0), @"animated")];
  } else if (name == "setViewControllers:animated:") {
    // 数组按「每个参数一个句柄」传，最后一个参数是 animated
    NSMutableArray<UIViewController*>* list = [NSMutableArray array];
    for (void* ptr : *args.ptrs) {
      id vc = (__bridge id)ptr;
      if (vc != nil && ![vc isKindOfClass:UIViewController.class]) {
        *error = "setViewControllers: only accepts UIViewController";
        return true;
      }
      if (vc != nil) [list addObject:vc];
    }
    BOOL animated = NO;
    if (args.values.count > 0) animated = NACRE_BOOL(args.values.lastObject, @"animated");
    @try {
      [nav setViewControllers:list animated:animated];
    } @catch (NSException* e) {
      *error = [NSString stringWithFormat:@"setViewControllers: %@", e.reason].UTF8String;
    }
    return true;
  } else {
    return false;
  }

  for (UIViewController* vc in popped) {
    out->push_back({(__bridge void*)vc, "UIViewController"});
  }
  return true;
}

}  // namespace nacre_bridge
