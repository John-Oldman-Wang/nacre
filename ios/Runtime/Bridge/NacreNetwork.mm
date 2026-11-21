// 一个域：网络状态。application.network（JS 里是 Network 类，不能 new）。
//
// iOS 的网络状态接口是 Network 框架的 C 函数（nw_path_monitor），不是 ObjC 的类，
// 所以没有底层可以裸暴露，这是我们定义的上层 API，形状照 Web 的
// navigator.onLine 和 navigator.connection：
//   isConnected   连没连上（路径可用）
//   type          'wifi' | 'cellular' | 'wired' | 'other' | 'none'
//   isExpensive   按流量计费（蜂窝、个人热点）
//   change        上面三个里有一个变了。原生的通知，照规矩延后一轮派发
//
// 监视器在自己的串行队列上跑，第一次报告是异步来的。main.js 一启动就同步执行，
// 可能赶在第一次报告之前读：那时在这个队列之外等，最多 100 ms 拿到初值。等的是
// 后台队列，不是主线程，所以不会死锁。
#import "NacreBridge.h"

#import <Network/Network.h>

@interface NacreNetwork : NSObject
+ (instancetype)shared;
@property(atomic) BOOL subscribed;
- (NSDictionary*)snapshot;
@end

@implementation NacreNetwork {
  nw_path_monitor_t _monitor;
  dispatch_queue_t _queue;
  dispatch_semaphore_t _first;
  BOOL _ready;
  BOOL _connected;
  BOOL _expensive;
  NSString* _type;
}

+ (instancetype)shared {
  static NacreNetwork* shared;
  static dispatch_once_t once;
  dispatch_once(&once, ^{ shared = [NacreNetwork new]; });
  return shared;
}

- (instancetype)init {
  if ((self = [super init])) {
    _type = @"none";
    _first = dispatch_semaphore_create(0);
    _queue = dispatch_queue_create("nacre.network", DISPATCH_QUEUE_SERIAL);
    _monitor = nw_path_monitor_create();
    nw_path_monitor_set_queue(_monitor, _queue);
    __weak NacreNetwork* weakSelf = self;
    nw_path_monitor_set_update_handler(_monitor, ^(nw_path_t path) {
      [weakSelf update:path];
    });
    nw_path_monitor_start(_monitor);
  }
  return self;
}

// 在监视器的队列上
- (void)update:(nw_path_t)path {
  const BOOL connected = nw_path_get_status(path) == nw_path_status_satisfied;
  NSString* type = @"none";
  if (connected) {
    if (nw_path_uses_interface_type(path, nw_interface_type_wifi)) {
      type = @"wifi";
    } else if (nw_path_uses_interface_type(path, nw_interface_type_cellular)) {
      type = @"cellular";
    } else if (nw_path_uses_interface_type(path, nw_interface_type_wired)) {
      type = @"wired";
    } else {
      type = @"other";
    }
  }
  const BOOL expensive = nw_path_is_expensive(path);
  BOOL changed = NO;
  BOOL first = NO;
  @synchronized(self) {
    first = !_ready;
    changed = !first && (connected != _connected || expensive != _expensive ||
                         ![type isEqualToString:_type]);
    _connected = connected;
    _expensive = expensive;
    _type = type;
    _ready = YES;
  }
  if (first) dispatch_semaphore_signal(_first);
  if (changed && self.subscribed) {
    dispatch_async(dispatch_get_main_queue(), ^{
      nacre_bridge::NacreEmitEvent(self, "Network", @"change");
    });
  }
}

- (NSDictionary*)snapshot {
  BOOL ready;
  @synchronized(self) { ready = _ready; }
  if (!ready) {
    dispatch_semaphore_wait(_first, dispatch_time(DISPATCH_TIME_NOW, 100 * NSEC_PER_MSEC));
    // 等到了就把信号还回去，后面再有人等不会卡住
    @synchronized(self) {
      if (_ready) dispatch_semaphore_signal(_first);
    }
  }
  @synchronized(self) {
    return @{@"isConnected": @(_connected), @"type": _type, @"isExpensive": @(_expensive)};
  }
}

@end

namespace nacre_bridge {

// 三个名字逐个写出来：check-api.sh 按字面认原生层有哪些属性
static id ReadNetworkProperty(id object, NSString* key) {
  if (![object isKindOfClass:NacreNetwork.class]) return nil;
  NSDictionary* now = [(NacreNetwork*)object snapshot];
  if ([key isEqualToString:@"isConnected"]) return now[@"isConnected"];
  if ([key isEqualToString:@"type"]) return now[@"type"];
  if ([key isEqualToString:@"isExpensive"]) return now[@"isExpensive"];
  return nil;
}

static nacre::NativeObjectRef NetworkClassObject(const std::string& className,
                                                 const std::string& name) {
  if (className == "Network" && name == "shared") return {NacreKeep(NacreNetwork.shared), "Network"};
  return {};
}

static NacreSubscribed NetworkSubscribe(id object, NSString* type, BOOL on, std::string* error) {
  if (![object isKindOfClass:NacreNetwork.class]) return false;
  if (![type isEqualToString:@"change"]) return NacreSubscribed::UnknownEvent;
  ((NacreNetwork*)object).subscribed = on;
  return true;
}

}  // namespace nacre_bridge

@interface NacreNetworkDomain : NSObject
@end
@implementation NacreNetworkDomain
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "network";
  d.classes = {NacreNetwork.class};
  d.read = nacre_bridge::ReadNetworkProperty;
  d.classObject = nacre_bridge::NetworkClassObject;
  d.subscribe = nacre_bridge::NetworkSubscribe;
  nacre_bridge::NacreRegisterDomain(d);
}
@end
