// 场景和窗口。UIScene、UIWindowScene、UISceneSession、UIWindow、UIViewController。
//
// 属性分发按能力域拆开，这里只装这一个域；调用顺序在 NacreProperties.mm。

#import "NacreBridge.h"

namespace nacre_bridge {

// 一个页面在 JS 侧该包成哪个类。包装已经存在时用不上（按指针查得到），
// 只在第一次给它建包装时决定类型
static const char* ControllerClassName(UIViewController* vc) {
  if ([vc isKindOfClass:UINavigationController.class]) return "UINavigationController";
  return "UIViewController";
}

id ReadSceneProperty(id object, NSString* key) {
  id value = nil;
  if ([object isKindOfClass:UINavigationController.class]) {
    UINavigationController* nav = (UINavigationController*)object;
    if ([key isEqualToString:@"isNavigationBarHidden"]) {
      value = @(nav.isNavigationBarHidden);
    }
  }
  if ([object isKindOfClass:UINavigationItem.class]) {
    UINavigationItem* item = (UINavigationItem*)object;
    if ([key isEqualToString:@"title"]) {
      value = item.title;
    } else if ([key isEqualToString:@"subtitle"]) {
      value = item.subtitle;
    } else if ([key isEqualToString:@"backButtonTitle"]) {
      value = item.backButtonTitle;
    } else if ([key isEqualToString:@"hidesBackButton"]) {
      value = @(item.hidesBackButton);
    }
  }
  if (value == nil && [object isKindOfClass:UIViewController.class]) {
    UIViewController* vc = (UIViewController*)object;
    if ([key isEqualToString:@"title"]) {
      value = vc.title;
    } else if ([key isEqualToString:@"modalPresentationStyle"]) {
      value = NameForModalPresentationStyle(vc.modalPresentationStyle);
    } else if ([key isEqualToString:@"modalTransitionStyle"]) {
      value = NameForModalTransitionStyle(vc.modalTransitionStyle);
    } else if ([key isEqualToString:@"isModalInPresentation"]) {
      value = @(vc.isModalInPresentation);
    } else if ([key isEqualToString:@"additionalSafeAreaInsets"]) {
      value = InsetsToJSON(vc.additionalSafeAreaInsets);
    }
  }
  if ([object isKindOfClass:UIScene.class]) {
    UIScene* scene = (UIScene*)object;
    if ([key isEqualToString:@"activationState"]) {
      value = SceneActivationName(scene.activationState);
    } else if ([key isEqualToString:@"title"]) {
      value = scene.title;
    } else if ([key isEqualToString:@"subtitle"]) {
      value = scene.subtitle;
    } else if ([key isEqualToString:@"isFullScreen"] &&
               [scene isKindOfClass:UIWindowScene.class]) {
      value = @(((UIWindowScene*)scene).isFullScreen);
    }
  } else if ([object isKindOfClass:UIWindow.class]) {
    UIWindow* window = (UIWindow*)object;
    if ([key isEqualToString:@"windowLevel"]) {
      value = @(window.windowLevel);
    } else if ([key isEqualToString:@"isKeyWindow"]) {
      value = @(window.isKeyWindow);
    } else if ([key isEqualToString:@"canBecomeKeyWindow"]) {
      value = @(window.canBecomeKeyWindow);
    }
  } else if ([object isKindOfClass:UISceneSession.class]) {
    UISceneSession* session = (UISceneSession*)object;
    if ([key isEqualToString:@"role"]) {
      value = session.role;
    } else if ([key isEqualToString:@"persistentIdentifier"]) {
      value = session.persistentIdentifier;
    } else if ([key isEqualToString:@"userInfo"]) {
      value = session.userInfo;
    }
  }
  return value;
}

BOOL WriteSceneProperty(id object, NSString* key, id value,
                      std::string* error) {
  if ([object isKindOfClass:UINavigationController.class]) {
    if ([key isEqualToString:@"isNavigationBarHidden"]) {
      ((UINavigationController*)object).navigationBarHidden = NACRE_BOOL(value, key);
      return YES;
    }
  }
  if ([object isKindOfClass:UINavigationItem.class]) {
    UINavigationItem* item = (UINavigationItem*)object;
    auto str = [&](id v) -> NSString* {
      return [v isKindOfClass:NSString.class] ? (NSString*)v : nil;
    };
    if ([key isEqualToString:@"title"]) { item.title = str(value); return YES; }
    if ([key isEqualToString:@"subtitle"]) { item.subtitle = str(value); return YES; }
    if ([key isEqualToString:@"backButtonTitle"]) {
      item.backButtonTitle = str(value);
      return YES;
    }
    if ([key isEqualToString:@"hidesBackButton"]) {
      item.hidesBackButton = NACRE_BOOL(value, key);
      return YES;
    }
  }
  if ([object isKindOfClass:UIViewController.class]) {
    UIViewController* vc = (UIViewController*)object;
    if ([key isEqualToString:@"additionalSafeAreaInsets"]) {
      vc.additionalSafeAreaInsets = JSONToInsets(value);
      return YES;
    }
    if ([key isEqualToString:@"modalPresentationStyle"]) {
      UIModalPresentationStyle style;
      if (!ModalPresentationStyleFromName(value, &style)) {
        *error = EnumError(@"modalPresentationStyle", value,
                           NamesForModalPresentationStyle());
        return YES;
      }
      vc.modalPresentationStyle = style;
      return YES;
    }
    if ([key isEqualToString:@"modalTransitionStyle"]) {
      UIModalTransitionStyle style;
      if (!ModalTransitionStyleFromName(value, &style)) {
        *error = EnumError(@"modalTransitionStyle", value,
                           NamesForModalTransitionStyle());
        return YES;
      }
      vc.modalTransitionStyle = style;
      return YES;
    }
    if ([key isEqualToString:@"isModalInPresentation"]) {
      vc.modalInPresentation = NACRE_BOOL(value, key);
      return YES;
    }
    if ([key isEqualToString:@"title"]) {
      // 返回按钮的标题默认取上一页的 title，所以这一个属性就够走通「返回」
      ((UIViewController*)object).title =
          [value isKindOfClass:NSString.class] ? value : nil;
      return YES;
    }
  }
  // 每个分支写完就 return，末尾统一填「没有这个属性」。
  if ([object isKindOfClass:UIScene.class]) {
    UIScene* scene = (UIScene*)object;
    if ([key isEqualToString:@"title"]) {
      scene.title = [value isKindOfClass:NSString.class] ? value : nil;
      return YES;
    }
    if ([key isEqualToString:@"subtitle"]) {
      scene.subtitle = [value isKindOfClass:NSString.class] ? value : @"";
      return YES;
    }
  }

  if ([object isKindOfClass:UIWindow.class]) {
    if ([key isEqualToString:@"windowLevel"]) {
      ((UIWindow*)object).windowLevel = NACRE_NUM(value, key);
      return YES;
    }
  }

  if ([object isKindOfClass:UISceneSession.class]) {
    if ([key isEqualToString:@"userInfo"]) {
      ((UISceneSession*)object).userInfo =
          [value isKindOfClass:NSDictionary.class] ? value : nil;
      return YES;
    }
  }
  return NO;
}

nacre::NativeObjectRef ReadSceneObjectProperty(id object,
                                            const std::string& name) {
  if ([object isKindOfClass:UINavigationController.class]) {
    UINavigationController* nav = (UINavigationController*)object;
    if (name == "topViewController") {
      return {(__bridge void*)nav.topViewController, "UIViewController"};
    }
    if (name == "visibleViewController") {
      return {(__bridge void*)nav.visibleViewController, "UIViewController"};
    }
  }
  // 两条都是 ObjC 侧的 weak 回边，JS 侧要翻成 strong（见 internals/wrapper.md）
  if ([object isKindOfClass:UIViewController.class]) {
    UIViewController* vc = (UIViewController*)object;
    if (name == "navigationController") {
      return {(__bridge void*)vc.navigationController, "UINavigationController"};
    }
    if (name == "parentViewController") {
      UIViewController* parent = vc.parentViewController;
      return {(__bridge void*)parent, ControllerClassName(parent)};
    }
    if (name == "presentedViewController") {
      return {(__bridge void*)vc.presentedViewController, "UIViewController"};
    }
    if (name == "presentingViewController") {
      return {(__bridge void*)vc.presentingViewController, "UIViewController"};
    }
  }
  if ([object isKindOfClass:UINavigationItem.class] && name == "titleView") {
    return {(__bridge void*)((UINavigationItem*)object).titleView, "UIView"};
  }
  // navigationItem 由 VC 自己懒加载，JS 第一次读到就要记边
  if ([object isKindOfClass:UIViewController.class] && name == "navigationItem") {
    return {(__bridge void*)((UIViewController*)object).navigationItem,
            "UINavigationItem"};
  }
  if ([object isKindOfClass:UIScene.class] && name == "session") {
    return {(__bridge void*)((UIScene*)object).session, "UISceneSession"};
  }

  if ([object isKindOfClass:UIWindow.class]) {
    UIWindow* window = (UIWindow*)object;
    if (name == "windowScene") return {(__bridge void*)window.windowScene, "UIWindowScene"};
    if (name == "rootViewController") {
      return {(__bridge void*)window.rootViewController, "UIViewController"};
    }
  }

  if ([object isKindOfClass:UIViewController.class] && name == "view") {
    return {(__bridge void*)((UIViewController*)object).view, "UIView"};
  }
  return {};
}

void WriteSceneObjectProperty(id object, const std::string& name, id value,
                              std::string* error) {
  if ([object isKindOfClass:UINavigationItem.class] && name == "titleView") {
    ((UINavigationItem*)object).titleView =
        NACRE_OBJECT_OR_NIL(value, UIView, name);
    return;
  }
  if ([object isKindOfClass:UIWindow.class]) {
    UIWindow* window = (UIWindow*)object;
    if (name == "rootViewController") {
      window.rootViewController = NACRE_OBJECT_OR_NIL(value, UIViewController, name);
    } else if (name == "windowScene") {
      window.windowScene = NACRE_OBJECT_OR_NIL(value, UIWindowScene, name);
    }
  }
}

void ReadSceneObjectArray(id object, const std::string& name,
                          std::vector<nacre::NativeObjectRef>& refs) {
  if ([object isKindOfClass:UINavigationItem.class]) {
    UINavigationItem* item = (UINavigationItem*)object;
    NSArray<UIBarButtonItem*>* list = nil;
    if (name == "leftBarButtonItems") list = item.leftBarButtonItems;
    else if (name == "rightBarButtonItems") list = item.rightBarButtonItems;
    for (UIBarButtonItem* b in list) {
      refs.push_back({(__bridge void*)b, "UIBarButtonItem"});
    }
  }
  if ([object isKindOfClass:UINavigationController.class] &&
      name == "viewControllers") {
    for (UIViewController* vc in ((UINavigationController*)object).viewControllers) {
      refs.push_back({(__bridge void*)vc, "UIViewController"});
    }
  }
  if ([object isKindOfClass:UIViewController.class] && name == "childViewControllers") {
    for (UIViewController* vc in ((UIViewController*)object).childViewControllers) {
      refs.push_back({(__bridge void*)vc, ControllerClassName(vc)});
    }
  }
}

// 可写的对象数组属性，目前只有导航栈。类型不对的直接拒，不当 nil 吞掉——
// 「参数类型不对但有句柄 → 静默忽略」那条 TODO 在这里就不再欠了。
BOOL WriteSceneObjectArray(id object, const std::string& name,
                           const std::vector<void*>& values, std::string* error) {
  if ([object isKindOfClass:UINavigationItem.class] &&
      (name == "leftBarButtonItems" || name == "rightBarButtonItems")) {
    NSMutableArray<UIBarButtonItem*>* items = [NSMutableArray array];
    for (void* ptr : values) {
      id b = (__bridge id)ptr;
      if (![b isKindOfClass:UIBarButtonItem.class]) {
        *error = "bar button items only accept UIBarButtonItem";
        return YES;
      }
      [items addObject:b];
    }
    UINavigationItem* item = (UINavigationItem*)object;
    if (name == "leftBarButtonItems") item.leftBarButtonItems = items;
    else item.rightBarButtonItems = items;
    return YES;
  }
  if ([object isKindOfClass:UINavigationController.class] &&
      name == "viewControllers") {
    NSMutableArray<UIViewController*>* list = [NSMutableArray array];
    for (void* ptr : values) {
      id vc = (__bridge id)ptr;
      if (![vc isKindOfClass:UIViewController.class]) {
        *error = "viewControllers only accepts UIViewController";
        return YES;
      }
      [list addObject:vc];
    }
    ((UINavigationController*)object).viewControllers = list;
    return YES;
  }
  return NO;
}

}  // namespace nacre_bridge
