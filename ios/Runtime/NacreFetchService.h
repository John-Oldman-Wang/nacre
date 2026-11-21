// 网络请求：fetch 在原生这一侧的全部状态和逻辑。
//
// 从 NacreRuntime.mm 里提出来的（2026-11-17）。它自己持有会话、请求记录和
// 那两条队列；NacreRuntime 只做三件事：启动时建一个、把引擎来的四个调用
// 转给它、销毁时让它 invalidate。线程分工和背压的说明在 .mm 的开头。
//
// 四个方法都在主线程上被调（JS 在主线程），立刻返回；结果之后回主线程通过
// 引擎兑现或者拒绝那个 callId 对应的 Promise。
#import <Foundation/Foundation.h>

#include <memory>
#include <string>

#include "Engine.h"   // core/engine/

@interface NacreFetchService : NSObject

// engine 和 NacreRuntime 手里的是同一个。workQueue 是一条并发队列，重活
// （解码）派到它上面；由运行时建，读 Blob 的内容也用这一条
- (instancetype)initWithEngine:(std::shared_ptr<std::unique_ptr<nacre::Engine>>)engine
                     workQueue:(dispatch_queue_t)workQueue;

// 发请求。返回请求的号，之后读内容、取消、释放都用它；参数不对时返回 0，
// 那个 Promise 会在下一轮被拒绝。body 是 NacreBlob 或者 nil
- (int)fetchStart:(const std::string&)urlText
          options:(const std::string&)optionsJSON
             body:(id)body
           callId:(int)callId;
// 读内容。kind 是 text / blob / arrayBuffer（等下完再给），或者 chunk（有多少给多少）
- (void)fetchReadBody:(int)requestId kind:(const std::string&)kindText callId:(int)callId;
- (void)fetchCancel:(int)requestId;
// 这个请求的内容不会再有人读了，把它的记录放掉；还没下完就停掉
- (void)fetchRelease:(int)requestId;

// 运行时销毁时调：取消还在跑的请求，放掉会话
- (void)invalidate;

@end
