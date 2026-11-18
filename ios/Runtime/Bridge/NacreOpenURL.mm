// 别的 App 或者一条链接打开我们：application 的 openurl 事件。
//
// 系统把链接交给**场景的委托**，没有通知可接：
//   - 自定义协议（myapp://…）：scene:openURLContexts:
//   - 通用链接（https://…）：scene:continueUserActivity:，活动类型是
//     NSUserActivityTypeBrowsingWeb，地址在 webpageURL
//   - App 没在运行时被打开：上面两个都不调，地址在
//     scene:willConnectToSession:options: 的 connectionOptions 里
//
// 场景委托是启动壳里的类，而启动壳要设计成不需要被改的。所以由运行时在运行期
// 给那个类补上这三个方法：它没实现的就加上，它实现了的就包一层，先调原来的
// 再转发。页面的出现和消失（NacreAppearance.mm）是同一种做法。
//
// 哪个类是场景委托，两处来源：
//   1. Info.plist 的场景配置（UISceneDelegateClassName）。运行时启动时就补，
//      那时还没有任何场景接入、委托的实例还没建，所以冷启动的那一次调用也
//      一定落在补过的方法上。CLI 生成的工程走的是这一条
//   2. 场景接入的通知到的时候，看那个场景实际的委托是哪个类。这是给不走
//      Info.plist、在代码里指定委托类的宿主准备的。它能不能赶上冷启动的那
//      一次调用取决于系统先发通知还是先问委托，没有实测过，见
//      docs/internals/open-url.md
//
// 原生这一侧只转发：把地址、来源、是哪个场景交给 JS，不解析地址，不决定
// 跳到哪。事件延后派发、不能取消，和别的原生通知一致。

#import "NacreBridge.h"

#import <objc/runtime.h>

namespace {

// 以下都只在主线程上用：场景委托的方法、场景的通知、运行时的启动都在主线程

// 补过的类。一个类只补一次
NSMutableSet<Class>* PatchedClasses(void) {
  static NSMutableSet<Class>* set = [NSMutableSet set];
  return set;
}

// 补上去的方法现在嵌了几层。只有最外面那一层转发：子类调了 super、而父类
// 和子类都被补过时，同一次系统调用会经过两层，都转发的话一条链接派发两次。
// 三个方法共用这个计数，所以委托在 willConnect 里自己调一次
// scene:openURLContexts: 来复用处理逻辑时也只派发一次
int& ForwardDepth(void) {
  static int depth = 0;
  return depth;
}

// 进一层、出一层。写成析构是为了原来的实现抛了异常时计数也能退回去
struct DepthScope {
  DepthScope() { ++ForwardDepth(); }
  ~DepthScope() { --ForwardDepth(); }
};

// 和 NacreRuntime.mm 里的 IsAppFacingScene 是同一条判据：只有公开角色的场景
// 交给过 JS（sceneconnect、application.scenes），别的场景的链接不转
bool IsAppFacingScene(UIScene* scene) {
  if (![scene isKindOfClass:UIWindowScene.class]) return false;
  UISceneSessionRole role = scene.session.role;
  return [role isEqualToString:UIWindowSceneSessionRoleApplication] ||
         [role isEqualToString:UIWindowSceneSessionRoleExternalDisplayNonInteractive];
}

// 一个地址交给 JS。派发在场景上的内部事件 @openurl，内置脚本把它变成
// application 上的 openurl（见 21-application.js）
void Emit(UIScene* scene, NSURL* url, NSString* sourceApplication) {
  if (url == nil || !IsAppFacingScene(scene)) return;
  NSString* text = url.absoluteString;
  if (text.length == 0) return;
  NSString* json = [NSString stringWithUTF8String:nacre_bridge::EncodeJSON(@{
    @"url" : text,
    @"sourceApplication" : sourceApplication ?: (id)NSNull.null,
  }).c_str()];
  // 多排一轮再交出去，两个原因：
  //   - 冷启动时系统先后做两件事：发场景接入的通知（运行时把它转成
  //     sceneconnect）、调委托的 willConnect（地址在这里）。哪个在前不依赖：
  //     两件事在主线程的同一轮里，这里多排一轮，交出去时 sceneconnect 一定
  //     已经在队列里排在前面了
  //   - 运行时的事件出口是它启动的第一个任务里接上的，那个任务这时可能还在
  //     队列里
  dispatch_async(dispatch_get_main_queue(), ^{
    nacre_bridge::NacreEmitEventWithJSON(scene, "UIWindowScene", @"@openurl", json);
  });
}

void EmitContexts(UIScene* scene, NSSet<UIOpenURLContext*>* contexts) {
  // 系统给的是一个集合，没有先后；一个地址一个事件，按集合枚举的顺序
  for (UIOpenURLContext* context in contexts) {
    Emit(scene, context.URL, context.options.sourceApplication);
  }
}

void EmitActivity(UIScene* scene, NSUserActivity* activity) {
  // 只认通用链接。别的活动类型（接力那一类）不归这个事件
  if (![activity.activityType isEqualToString:NSUserActivityTypeBrowsingWeb]) return;
  Emit(scene, activity.webpageURL, nil);
}

// 给 cls 补一个方法：先调原来的实现（有的话），最外面那一层再转发。
// forward 拿到的是方法的参数（最多三个对象，用不到的是 nil）
typedef void (^Forwarder)(id a, id b, id c);

void Patch(Class cls, SEL selector, int argc, Forwarder (^makeForwarder)(void)) {
  Method existing = class_getInstanceMethod(cls, selector);
  // 原来的实现：这个类自己的，或者从父类继承来的。没有就是 NULL
  IMP original = existing != NULL ? method_getImplementation(existing) : NULL;
  const char* types = NULL;
  if (existing != NULL) {
    types = method_getTypeEncoding(existing);
  } else {
    types = protocol_getMethodDescription(@protocol(UISceneDelegate), selector,
                                          /*isRequiredMethod=*/NO, /*isInstanceMethod=*/YES).types;
    if (types == NULL) types = argc == 3 ? "v@:@@@" : "v@:@@";
  }
  Forwarder forward = makeForwarder();
  IMP replacement;
  if (argc == 3) {
    replacement = imp_implementationWithBlock(^(id self, id a, id b, id c) {
      {
        DepthScope scope;
        if (original != NULL) ((void (*)(id, SEL, id, id, id))original)(self, selector, a, b, c);
      }
      if (ForwardDepth() == 0) forward(a, b, c);
    });
  } else {
    replacement = imp_implementationWithBlock(^(id self, id a, id b) {
      {
        DepthScope scope;
        if (original != NULL) ((void (*)(id, SEL, id, id))original)(self, selector, a, b);
      }
      if (ForwardDepth() == 0) forward(a, b, nil);
    });
  }
  // 这个类自己没有这个方法（没实现，或者是继承来的）：加上。自己有：换掉
  if (!class_addMethod(cls, selector, replacement, types)) {
    method_setImplementation(class_getInstanceMethod(cls, selector), replacement);
  }
}

void PatchSceneDelegateClass(Class cls) {
  if (cls == Nil || [PatchedClasses() containsObject:cls]) return;
  [PatchedClasses() addObject:cls];

  // App 在运行（或者挂在后台）时，用自定义协议打开
  Patch(cls, @selector(scene:openURLContexts:), 2, ^Forwarder {
    return ^(id scene, id contexts, id unused) {
      if ([scene isKindOfClass:UIScene.class] && [contexts isKindOfClass:NSSet.class]) {
        EmitContexts(scene, contexts);
      }
    };
  });
  // App 在运行时，用通用链接打开
  Patch(cls, @selector(scene:continueUserActivity:), 2, ^Forwarder {
    return ^(id scene, id activity, id unused) {
      if ([scene isKindOfClass:UIScene.class] && [activity isKindOfClass:NSUserActivity.class]) {
        EmitActivity(scene, activity);
      }
    };
  });
  // App 没在运行时被打开：地址跟着场景的接入一起来。先自定义协议，再通用链接
  Patch(cls, @selector(scene:willConnectToSession:options:), 3, ^Forwarder {
    return ^(id scene, id session, id options) {
      if (![scene isKindOfClass:UIScene.class] ||
          ![options isKindOfClass:UISceneConnectionOptions.class]) {
        return;
      }
      UISceneConnectionOptions* connection = options;
      EmitContexts(scene, connection.URLContexts);
      for (NSUserActivity* activity in connection.userActivities) EmitActivity(scene, activity);
    };
  });
}

// Info.plist 的场景配置里写的委托类：
//   UIApplicationSceneManifest → UISceneConfigurations → <角色> → [ { UISceneDelegateClassName } ]
void PatchDeclaredSceneDelegates(void) {
  NSDictionary* manifest = [NSBundle.mainBundle objectForInfoDictionaryKey:@"UIApplicationSceneManifest"];
  if (![manifest isKindOfClass:NSDictionary.class]) return;
  NSDictionary* roles = manifest[@"UISceneConfigurations"];
  if (![roles isKindOfClass:NSDictionary.class]) return;
  for (id configurations in roles.allValues) {
    if (![configurations isKindOfClass:NSArray.class]) continue;
    for (id configuration in (NSArray*)configurations) {
      if (![configuration isKindOfClass:NSDictionary.class]) continue;
      NSString* name = ((NSDictionary*)configuration)[@"UISceneDelegateClassName"];
      if (![name isKindOfClass:NSString.class]) continue;
      Class cls = NSClassFromString(name);
      if (cls == Nil) {
        nacre_bridge::WriteRuntimeLog([NSString stringWithFormat:
            @"scene delegate class \"%@\" from Info.plist was not found; "
            @"openurl will not fire for links that launch the app", name]);
        continue;
      }
      PatchSceneDelegateClass(cls);
    }
  }
}

}  // namespace

namespace nacre_bridge {

void InstallOpenURLForwarding(void) {
  static bool installed = false;
  if (installed) return;
  installed = true;

  PatchDeclaredSceneDelegates();

  // 第二处来源：场景实际的委托。观察者一直留着（运行时是整个 App 一个）
  [NSNotificationCenter.defaultCenter
      addObserverForName:UISceneWillConnectNotification
                  object:nil
                   queue:nil
              usingBlock:^(NSNotification* note) {
                UIScene* scene = note.object;
                if (!IsAppFacingScene(scene)) return;
                id delegate = scene.delegate;
                if (delegate != nil) PatchSceneDelegateClass([delegate class]);
              }];
}

}  // namespace nacre_bridge
