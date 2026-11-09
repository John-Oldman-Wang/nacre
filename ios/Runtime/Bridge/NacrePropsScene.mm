// 场景和窗口。UIScene、UIWindowScene、UISceneSession、UIWindow、UIViewController。
//
// 属性分发按能力域拆开，这里只装这一个域；调用顺序在 NacreProperties.mm。

#import "NacreBridge.h"

namespace nacre_bridge {

id ReadSceneProperty(id object, NSString* key) {
  id value = nil;
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
      ((UIWindow*)object).windowLevel = [value doubleValue];
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

void WriteSceneObjectProperty(id object, const std::string& name, id value) {
  if ([object isKindOfClass:UIWindow.class]) {
    UIWindow* window = (UIWindow*)object;
    if (name == "rootViewController") {
      window.rootViewController = [value isKindOfClass:UIViewController.class] ? value : nil;
    } else if (name == "windowScene") {
      window.windowScene = [value isKindOfClass:UIWindowScene.class] ? value : nil;
    }
  }
}

}  // namespace nacre_bridge
