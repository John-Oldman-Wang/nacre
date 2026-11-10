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
  BOOL animated = [args.value(1) boolValue];

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
    [nav setNavigationBarHidden:[args.value(0) boolValue] animated:animated];
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
  BOOL animated = [args.value(0) boolValue];
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
    popped = [nav popToViewController:vc animated:[args.value(1) boolValue]];
  } else if (name == "popToRootViewControllerAnimated:") {
    popped = [nav popToRootViewControllerAnimated:[args.value(0) boolValue]];
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
    BOOL animated = args.values.count > 0 && [args.values.lastObject boolValue];
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
