// 一个域：后台任务。application.runBackgroundTask(work, { name }) 和
// application.backgroundTimeRemaining 的原生那一半（JS 在 55-background-task.js）。
//
// UIKit 的做法是一对调用：beginBackgroundTaskWithName:expirationHandler: 拿到一个
// 号，做完了 endBackgroundTask: 交回去。切到后台之后，系统给手上还有号的 App
// 多留一段时间（大约 30 秒，系统定）。快到时间时系统调过期的 block，那时必须
// 把号交回去，不交 App 会被杀掉。
//
// JS 那一侧把这一对包成「传一个函数、它做完任务就结束」，这里只做三件事，按类方法
// 的通道接（类名用 UIApplication，没有实例）：
//
//   beginBackgroundTaskWithName:expirationHandler:   参数：名字（可以是 null）、
//       过期时调回 JS 的代码块号。返回任务号；系统不给时是 0（UIBackgroundTaskInvalid）
//   endBackgroundTask:          参数：任务号。交回去；已经交过的号什么都不做
//   backgroundTimeRemaining     还剩多少秒。在前台时系统给的是 DBL_MAX，这里给 null，
//                               JS 那一侧换成 Infinity（JSON 里写不了 Infinity）
//
// 过期时：先当场调回 JS（NacreCallBlock，JS 在里面中止 signal、监听器跟着跑），
// 回来之后马上把号交回去，不等 work 的 Promise。都在主线程上。
#import "NacreBridge.h"

namespace nacre_bridge {

// 还没交回去的号。只在主线程上用
static NSMutableSet<NSNumber*>* ActiveBackgroundTasks(void) {
  static NSMutableSet<NSNumber*>* set = [NSMutableSet set];
  return set;
}

static void EndBackgroundTask(UIBackgroundTaskIdentifier task) {
  NSNumber* key = @(task);
  if (![ActiveBackgroundTasks() containsObject:key]) return;
  [ActiveBackgroundTasks() removeObject:key];
  [UIApplication.sharedApplication endBackgroundTask:task];
}

static bool BackgroundTaskClassCall(const std::string& className, NSString* sel,
                                    const NacreArgs& args, std::string* out, std::string* error) {
  if (className != "UIApplication") return false;
  if ([sel isEqualToString:@"beginBackgroundTaskWithName:expirationHandler:"]) {
    id name = args.value(0);
    if (name != nil && name != NSNull.null && ![name isKindOfClass:NSString.class]) {
      *error = "beginBackgroundTaskWithName: name must be a string or null";
      return true;
    }
    const NSInteger blockId = NACRE_INT(args.value(1), sel);
    __block UIBackgroundTaskIdentifier task = UIBackgroundTaskInvalid;
    task = [UIApplication.sharedApplication
        beginBackgroundTaskWithName:[name isKindOfClass:NSString.class] ? name : nil
                  expirationHandler:^{
                    // 已经交回去了（work 先做完了）就没有 JS 要通知
                    if (![ActiveBackgroundTasks() containsObject:@(task)]) return;
                    NacreCallBlock(blockId, @"[]");
                    EndBackgroundTask(task);
                  }];
    if (task != UIBackgroundTaskInvalid) [ActiveBackgroundTasks() addObject:@(task)];
    *out = std::to_string((unsigned long)task);
    return true;
  }
  if ([sel isEqualToString:@"endBackgroundTask:"]) {
    const NSInteger task = NACRE_INT(args.value(0), sel);
    if (task > 0) EndBackgroundTask((UIBackgroundTaskIdentifier)task);
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"backgroundTimeRemaining"]) {
    const NSTimeInterval remaining = UIApplication.sharedApplication.backgroundTimeRemaining;
    *out = remaining >= DBL_MAX ? "null" : EncodeJSON(@(remaining));
    return true;
  }
  return false;
}

}  // namespace nacre_bridge

@interface NacreBackgroundTaskDomain : NSObject
@end
@implementation NacreBackgroundTaskDomain
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "background-task";
  d.classCall = nacre_bridge::BackgroundTaskClassCall;
  nacre_bridge::NacreRegisterDomain(d);
}
@end
