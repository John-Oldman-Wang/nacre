// NacreRuntime 的内部头：运行时自己的几个 .mm 之间共用的声明。
//
// 不是给外面用的（公开面是 NacreRuntime.h，给能力包的是 NacreExtension.h）。
// 里面有两样：
//   - NacreRuntime 派发事件、管订阅的那几个方法。它们的实现在 NacreRuntime.mm，
//     事件的中转对象（NacreEventTrampolines.mm）要调它们
//   - 那些中转对象的类声明，和把它们挂到原生对象上用的关联对象的 key。
//     NacreRuntime.mm 的订阅代码要建它们、找它们
#import <UIKit/UIKit.h>

#include <string>

#import "NacreRuntime.h"

#include "Bridge/NacreBridge.h"

@interface NacreRuntime ()
- (void)emitControlEvent:(NSString*)type from:(UIControl*)control event:(UIEvent*)event;
- (void)emitEvent:(NSString*)type
             from:(id)object
        className:(const char*)className
             then:(dispatch_block_t)completion;
- (void)emitEvent:(NSString*)type
             from:(id)object
        className:(const char*)className
             with:(id)payload
    payloadClass:(const char*)payloadClass;
- (void)emitEvent:(NSString*)type
             from:(id)object
        className:(const char*)className
             json:(const std::string&)json;
- (nacre_bridge::NacreSubscribed)setSubscription:(id)object
                   type:(const std::string&)type
                     on:(BOOL)on
                  error:(std::string*)error;
- (nacre_bridge::NacreSubscribed)routeSubscription:(id)object
                     type:(const std::string&)type
                       on:(BOOL)on
                    error:(std::string*)error;
- (void)installPresentationDelegate:(UIViewController*)vc;
@end

@interface NacreControlTarget : NSObject
@property(nonatomic, weak) NacreRuntime* runtime;
@property(nonatomic, copy) NSString* type;
@end

@interface NacreDefaultsObserver : NSObject
@property(nonatomic, weak) NacreRuntime* runtime;
@property(nonatomic, weak) NSUserDefaults* defaults;
@end

@interface NacreScrollDelegate : NSObject <UIScrollViewDelegate>
@property(nonatomic, weak) NacreRuntime* runtime;
@property(nonatomic, strong) NSMutableSet<NSString*>* types;
// 合并用：队列里已经有一个 scroll 在等着就不再排第二个。
// 这么做是无损的，因为事件不带数据，JS 回头从 contentOffset 上读最新值
@property(nonatomic, assign) BOOL scrollPending;
@end

@interface NacreAnimationDelegate : NSObject <CAAnimationDelegate>
@property(nonatomic, weak) NacreRuntime* runtime;
// **weak，不能 strong**：动画 strong 持有 delegate（和 UIScrollView.delegate
// 的 weak 正好相反），反过来再强持有就成环。
//
// 另外还有一层保险：只有 types 非空时才碰 origin，而 types 非空就意味着
// JS 侧的 subscribed 还攥着那个包装，包装攥着句柄，原生对象活着。
@property(nonatomic, weak) CAAnimation* origin;
@property(nonatomic, strong) NSMutableSet<NSString*>* types;
@end

@interface NacreNavDelegate : NSObject <UINavigationControllerDelegate>
@property(nonatomic, weak) NacreRuntime* runtime;
@property(nonatomic, strong) NSMutableSet<NSString*>* types;
@end

@interface NacreTabDelegate : NSObject <UITabBarControllerDelegate>
@property(nonatomic, weak) NacreRuntime* runtime;
@property(nonatomic, strong) NSMutableSet<NSString*>* types;
@end

@interface NacrePresentationDelegate : NSObject <UIAdaptivePresentationControllerDelegate>
@property(nonatomic, weak) NacreRuntime* runtime;
@property(nonatomic, strong) NSMutableSet<NSString*>* types;
@end

extern const void* kNacreControlTargetsKey;
extern const void* kNacreScrollDelegateKey;
extern const void* kNacreDefaultsObserverKey;
extern const void* kNacreNavDelegateKey;
extern const void* kNacreTabDelegateKey;
extern const void* kNacreAnimationDelegateKey;
extern const void* kNacrePresentationDelegateKey;
