// 页面的出现和消失：beforeappear / appear / beforedisappear /
// disappear 四个事件。
//
// UIKit 里这四个时机没有通知也没有委托，只有覆写点（viewWillAppear: 一组）。
// 原生类在 JS 里不能继承，所以由运行时把覆写点转成事件。
//
// 做法是替换 UIViewController **基类**上的这四个方法：先调原来的实现，再看
// 这个页面有没有人订这个事件，有就派发。选它而不是「运行时自己编译几个页面
// 子类」，三个理由：
//   - 对每一种页面都有效（导航控制器、标签栏控制器、以后宿主自己的页面），
//     不用每种各建一个子类，也不用改核心里造页面的那几处
//   - 子类覆写这几个方法时 Apple 要求调 super，所以基类的实现一定会被调到
//   - 整个能力在这一个文件里
//
// 替换是惰性的：第一次有人订这四个事件之一时才换。没人用就不换，进程里的
// 页面和没有这个文件时完全一样。换了之后，没订的页面每次出现多一次关联对象
// 的查询，不过桥。
//
// 事件和别的原生通知一样延后一轮派发，不能取消。带一个字段 animated：它是
// 方法的参数，过后读不回来。

#import "NacreBridge.h"

#import <objc/runtime.h>

// 页面 → 它订了哪几个事件（NSMutableSet<NSString*>）
static const void* kNacreAppearanceTypesKey = &kNacreAppearanceTypesKey;

static void NacreAppearanceEmit(UIViewController* controller, NSString* type, BOOL animated) {
  NSSet<NSString*>* types = objc_getAssociatedObject(controller, kNacreAppearanceTypesKey);
  if (![types containsObject:type]) return;
  // 包装万一被回收了要重建时用哪个 JS 类：认得出的两种容器，其余按普通页面
  const char* className = "UIViewController";
  if ([controller isKindOfClass:UINavigationController.class]) {
    className = "UINavigationController";
  } else if ([controller isKindOfClass:UITabBarController.class]) {
    className = "UITabBarController";
  }
  nacre_bridge::NacreEmitEventWithJSON(controller, className, type,
                                       animated ? @"{\"animated\":true}"
                                                : @"{\"animated\":false}");
}

// 换上去的四个方法。交换之后，[self nacre_viewWillAppear:] 调到的是原来的实现
@interface UIViewController (NacreAppearance)
@end

@implementation UIViewController (NacreAppearance)

- (void)nacre_viewWillAppear:(BOOL)animated {
  [self nacre_viewWillAppear:animated];
  NacreAppearanceEmit(self, @"beforeappear", animated);
}

- (void)nacre_viewDidAppear:(BOOL)animated {
  [self nacre_viewDidAppear:animated];
  NacreAppearanceEmit(self, @"appear", animated);
}

- (void)nacre_viewWillDisappear:(BOOL)animated {
  [self nacre_viewWillDisappear:animated];
  NacreAppearanceEmit(self, @"beforedisappear", animated);
}

- (void)nacre_viewDidDisappear:(BOOL)animated {
  [self nacre_viewDidDisappear:animated];
  NacreAppearanceEmit(self, @"disappear", animated);
}

@end

namespace nacre_bridge {

static NSArray<NSString*>* AppearanceEventNames(void) {
  return @[@"beforeappear", @"appear", @"beforedisappear", @"disappear"];
}

static void Exchange(SEL original, SEL replacement) {
  Method a = class_getInstanceMethod(UIViewController.class, original);
  Method b = class_getInstanceMethod(UIViewController.class, replacement);
  if (a != NULL && b != NULL) method_exchangeImplementations(a, b);
}

// 四个方法都是 UIViewController 自己实现的（不是从父类继承来的），直接交换
static void InstallAppearanceHooks(void) {
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    Exchange(@selector(viewWillAppear:), @selector(nacre_viewWillAppear:));
    Exchange(@selector(viewDidAppear:), @selector(nacre_viewDidAppear:));
    Exchange(@selector(viewWillDisappear:), @selector(nacre_viewWillDisappear:));
    Exchange(@selector(viewDidDisappear:), @selector(nacre_viewDidDisappear:));
  });
}

// 只认这四个名字。别的名字不认领，落到核心的页面分支（模态的那三个事件、
// 导航和标签栏的事件），哪边都不认识的也由它报错
static NacreSubscribed AppearanceSetSubscription(id object, NSString* type, BOOL on, std::string* error) {
  if (![object isKindOfClass:UIViewController.class]) return false;
  if (![AppearanceEventNames() containsObject:type]) return false;
  NSMutableSet<NSString*>* types = objc_getAssociatedObject(object, kNacreAppearanceTypesKey);
  if (on) {
    InstallAppearanceHooks();
    if (types == nil) {
      types = [NSMutableSet set];
      objc_setAssociatedObject(object, kNacreAppearanceTypesKey, types,
                               OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    }
    [types addObject:type];
  } else if (types != nil) {
    [types removeObject:type];
    if (types.count == 0) {
      objc_setAssociatedObject(object, kNacreAppearanceTypesKey, nil,
                               OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    }
  }
  return true;
}

}  // namespace nacre_bridge

@interface NacreAppearanceDomain : NSObject
@end
@implementation NacreAppearanceDomain
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "appearance";
  d.classes = {UIViewController.class};
  d.subscribe = nacre_bridge::AppearanceSetSubscription;
  nacre_bridge::NacreRegisterDomain(d);
}
@end
