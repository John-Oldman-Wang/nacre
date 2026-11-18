#import "NacreFetchService.h"

#include "Bridge/NacreBridge.h"

using namespace nacre_bridge;

// ---------------------------------------------------------------------------
// fetch
// ---------------------------------------------------------------------------
//
// 线程分工（实测定下来的）：
//
//   NSURLSession 的线程池     DNS/TCP/TLS/传输/gzip，系统的，并行
//          ↓
//   delegate 串行队列         **只做最轻的事**：追加数据、记状态、一次 dispatch
//          ↓
//   并发队列                  UTF-8 解码这类 CPU 活
//          ↓
//   主线程                    建 V8 对象、兑现 Promise
//
// 中间那层是被实测逼出来的：20 个并发请求，每个回调做 100ms 重活，直接在
// delegate 队列上做要 2179ms（全串行），派到并发队列只要 166ms。
//
// 边下边读（response.body）走的是同一条路，只是不等下完：JS 每调一次 read()
// 来要一次（kind 是 "chunk"），把那一刻攒下的全部字节作为一块交出去，一个
// 字节都没有就等到有。所以回主线程的次数不超过 JS 调 read() 的次数，主线程
// 忙的时候数据在这边攒着，下一块就大一些。
//
// 背压：JS 开始按块读之后，攒下的字节到了 kStreamHighWaterMark 就把任务
// suspend，被读走之后 resume。什么时候读、读不读，由 JS 定；这里只管「攒多了
// 就先别收」。没有按块读过的请求不受影响，照旧一直收到完。

// 按块读的请求最多攒多少字节就暂停。1 MiB：
//   - 系统一次回调给 16 KB 到 128 KB（macOS 上用原生探针量的），所以攒满要
//     8 到 64 次回调，读得跟得上的时候不会来回暂停、继续
//   - 100 Mbps 的下载约 80 ms 攒满，JS 一轮读取远比这快
//   - 每个读得慢的流最多占这么多内存
// 依据、实测和没验证的部分见 docs/internals/network.md
static const NSUInteger kStreamHighWaterMark = 1 << 20;

@interface NacreFetchTask : NSObject
@property(nonatomic) int requestId;
@property(nonatomic, strong) NSURLSessionDataTask* task;
@property(nonatomic, strong) NSMutableData* body;
@property(nonatomic) BOOL completed;      // body 下载完了（成功或失败）
// 响应头交给 JS 了。从这一刻起 JS 那边有一个 Response，这条记录的清理
// 归它管（它被回收时来 fetchRelease）；在这之前结束的请求没有人会来清理
@property(nonatomic) BOOL responded;
@property(nonatomic, strong) NSError* error;
// 等 body 的那个调用。headers 先到、body 后到，所以 read 可能来得比完成早。
// kind 是 "chunk" 时等的是下一块，有数据到就给；其余的等整个下完
@property(nonatomic) int pendingBodyCallId;
@property(nonatomic, copy) NSString* pendingBodyKind;
// JS 按块读过这个请求（response.body 的 read()）。从这一刻起才做背压
@property(nonatomic) BOOL streaming;
// 因为攒得太多，任务被我们 suspend 了
@property(nonatomic) BOOL suspended;
@end

@implementation NacreFetchTask
@end

@interface NacreFetchService () <NSURLSessionDataDelegate>
@end

@implementation NacreFetchService {
  // 和 NacreRuntime 手里的是同一个：引擎被销毁之后 *engine 是空的，回主线程
  // 兑现之前都先看一眼
  std::shared_ptr<std::unique_ptr<nacre::Engine>> _engine;
  // _fetchTasks 只在 _fetchQueue 上访问，所以不用加锁
  NSURLSession* _session;
  NSOperationQueue* _delegateQueue;     // 串行，只做最轻的事
  dispatch_queue_t _fetchQueue;         // 串行，守着 _fetchTasks
  dispatch_queue_t _workQueue;          // 并发，干解码这类重活。运行时给的，读 Blob 也用它
  NSMutableDictionary<NSNumber*, NacreFetchTask*>* _fetchTasks;
  int _nextRequestId;
}

- (instancetype)initWithEngine:(std::shared_ptr<std::unique_ptr<nacre::Engine>>)engine
                     workQueue:(dispatch_queue_t)workQueue {
  if ((self = [super init])) {
    _engine = engine;
    _workQueue = workQueue;
    _fetchTasks = [NSMutableDictionary dictionary];
    _nextRequestId = 1;
    _fetchQueue = dispatch_queue_create("nacre.fetch", DISPATCH_QUEUE_SERIAL);
    // delegate 队列设成串行（maxConcurrent = 1）：回调顺序要确定，
    // 而且我们在上面只做最轻的事，重活会派到 _workQueue
    _delegateQueue = [NSOperationQueue new];
    _delegateQueue.maxConcurrentOperationCount = 1;
    _delegateQueue.name = @"nacre.fetch.delegate";
  }
  return self;
}

// 会话强引用着它的委托（就是这个对象），不 invalidate 两边谁都放不掉。
// 运行时销毁的时候调
- (void)invalidate {
  [_session invalidateAndCancel];
  _session = nil;
}

- (NSURLSession*)fetchSession {
  if (!_session) {
    NSURLSessionConfiguration* cfg =
        [NSURLSessionConfiguration defaultSessionConfiguration];
    _session = [NSURLSession sessionWithConfiguration:cfg
                                             delegate:self
                                        delegateQueue:_delegateQueue];
  }
  return _session;
}

- (int)fetchStart:(const std::string&)urlText
          options:(const std::string&)optionsJSON
             body:(id)body
           callId:(int)callId {
  auto engine = _engine;
  NSURL* url = [NSURL URLWithString:@(urlText.c_str())];
  if (url == nil || url.scheme.length == 0) {
    // 立刻拒绝，但要排到下一轮——JS 还没拿到 Promise 呢
    dispatch_async(dispatch_get_main_queue(), ^{
      if (*engine) (*engine)->RejectCall(callId, "TypeError", "URL 不合法");
    });
    return 0;
  }

  id decoded = DecodeJSON(optionsJSON);
  NSDictionary* opts = [decoded isKindOfClass:NSDictionary.class] ? decoded : @{};
  NSMutableURLRequest* req = [NSMutableURLRequest requestWithURL:url];
  NSString* method = opts[@"method"];
  req.HTTPMethod = [method isKindOfClass:NSString.class] ? method.uppercaseString : @"GET";
  NSArray* headerPairs = opts[@"headers"];
  if ([headerPairs isKindOfClass:NSArray.class]) {
    for (NSArray* pair in headerPairs) {
      if (![pair isKindOfClass:NSArray.class] || pair.count != 2) continue;
      // 用 add 而不是 set：同名多值要保留
      [req addValue:pair[1] forHTTPHeaderField:pair[0]];
    }
  }
  // 请求体只认 Blob：字符串、ArrayBuffer、类型数组在 JS 侧都已经包成了 Blob。
  // NSData 不可变，直接交给请求，不用拷贝
  if (body != nil) {
    if (![body isKindOfClass:NacreBlob.class]) {
      dispatch_async(dispatch_get_main_queue(), ^{
        if (*engine) (*engine)->RejectCall(callId, "TypeError", "fetch body must be a Blob");
      });
      return 0;
    }
    req.HTTPBody = ((NacreBlob*)body).data;
  }

  const int requestId = _nextRequestId++;
  NacreFetchTask* entry = [NacreFetchTask new];
  entry.requestId = requestId;
  entry.body = [NSMutableData data];
  entry.pendingBodyCallId = 0;
  entry.task = [[self fetchSession] dataTaskWithRequest:req];
  // taskDescription 是从 delegate 回调找回 requestId 的那根线
  entry.task.taskDescription = [NSString stringWithFormat:@"%d:%d", requestId, callId];
  dispatch_async(_fetchQueue, ^{
    self->_fetchTasks[@(requestId)] = entry;
  });
  [entry.task resume];
  return requestId;
}

// 把 delegate 回调里的 task 映射回我们的记录
- (void)withTask:(NSURLSessionTask*)task
              do:(void (^)(NacreFetchTask* entry, int callId))block {
  NSArray* parts = [task.taskDescription componentsSeparatedByString:@":"];
  if (parts.count != 2) return;
  const int requestId = [parts[0] intValue];
  const int callId = [parts[1] intValue];
  dispatch_async(_fetchQueue, ^{
    NacreFetchTask* entry = self->_fetchTasks[@(requestId)];
    if (entry) block(entry, callId);
  });
}

// headers 到了 —— 这时候就兑现 Response，body 还在下。
//
// 「到了」是系统说了算：实测它要等到响应内容的第一个字节才调这个方法，
// 不是响应头到达的时候（iOS 27.2 模拟器和 macOS 27 上都量过）。所以服务端
// 发完响应头迟迟不发内容时，fetch 的 Promise 也迟迟不兑现。这里没有拖，
// 也绕不过去。见 docs/internals/network.md
- (void)URLSession:(NSURLSession*)session
              dataTask:(NSURLSessionDataTask*)dataTask
    didReceiveResponse:(NSURLResponse*)response
     completionHandler:(void (^)(NSURLSessionResponseDisposition))completionHandler {
  completionHandler(NSURLSessionResponseAllow);
  auto engine = _engine;
  NSHTTPURLResponse* http =
      [response isKindOfClass:NSHTTPURLResponse.class] ? (NSHTTPURLResponse*)response : nil;
  [self withTask:dataTask
              do:^(NacreFetchTask* entry, int callId) {
                entry.responded = YES;
                NSMutableArray* headerPairs = [NSMutableArray array];
                [http.allHeaderFields
                    enumerateKeysAndObjectsUsingBlock:^(id k, id v, BOOL* stop) {
                      [headerPairs addObject:@[ [k description], [v description] ]];
                    }];
                NSDictionary* payload = @{
                  @"requestId" : @(entry.requestId),
                  @"status" : @(http ? http.statusCode : 200),
                  @"url" : response.URL.absoluteString ?: @"",
                  @"headers" : headerPairs,
                };
                const std::string json = EncodeJSON(payload);
                dispatch_async(dispatch_get_main_queue(), ^{
                  if (*engine) (*engine)->SettleJSON(callId, json);
                });
              }];
}

// 数据块到了 —— delegate 队列上只做 append，绝不在这里干活
- (void)URLSession:(NSURLSession*)session
          dataTask:(NSURLSessionDataTask*)dataTask
    didReceiveData:(NSData*)data {
  [self withTask:dataTask
              do:^(NacreFetchTask* entry, int callId) {
                [entry.body appendData:data];
                if (!entry.streaming) return;
                if (entry.pendingBodyCallId != 0) {
                  // JS 正等着下一块：现在就给
                  const int waiting = entry.pendingBodyCallId;
                  entry.pendingBodyCallId = 0;
                  [self deliverChunk:entry callId:waiting];
                } else if (!entry.suspended && entry.body.length >= kStreamHighWaterMark) {
                  // 攒够了还没人来读：先别收了。macOS 上量过，suspend 之后回调
                  // 立刻就停；万一系统还交上来一截，照常追加
                  entry.suspended = YES;
                  [entry.task suspend];
                }
              }];
}

- (void)URLSession:(NSURLSession*)session
                    task:(NSURLSessionTask*)task
    didCompleteWithError:(NSError*)error {
  [self withTask:task
              do:^(NacreFetchTask* entry, int callId) {
                entry.completed = YES;
                entry.error = error;
                if (!entry.responded) {
                  // 响应头都没到就结束了（连不上、超时、被取消）：拒绝 fetch
                  // 的那个 Promise。JS 那边没有建出 Response，不会有人来
                  // fetchRelease，所以记录在这里当场删掉。
                  if (error) [self rejectCall:callId withError:error];
                  [self->_fetchTasks removeObjectForKey:@(entry.requestId)];
                  return;
                }
                // 响应头到了之后才失败的：fetch 的 Promise 早已兑现，错误留在
                // 记录里，等读 body 时交出去
                if (entry.pendingBodyCallId != 0) {
                  // 已经有人在等 body 了，现在能给了
                  const int waiting = entry.pendingBodyCallId;
                  entry.pendingBodyCallId = 0;
                  if ([entry.pendingBodyKind isEqualToString:@"chunk"]) {
                    [self deliverChunk:entry callId:waiting];
                  } else {
                    [self deliverBody:entry kind:entry.pendingBodyKind callId:waiting];
                  }
                }
              }];
}

- (void)rejectCall:(int)callId withError:(NSError*)error {
  auto engine = _engine;
  const BOOL cancelled = error.code == NSURLErrorCancelled;
  const std::string name = cancelled ? "AbortError" : "TypeError";
  NSString* text = cancelled
                       ? @"The operation was aborted"
                       : [NSString stringWithFormat:@"Network request failed: %@",
                                                    error.localizedDescription];
  const std::string message = text.UTF8String;
  dispatch_async(dispatch_get_main_queue(), ^{
    if (*engine) (*engine)->RejectCall(callId, name, message);
  });
}

// 真正把 body 交出去。重活（UTF-8 解码）在并发队列上做。
- (void)deliverBody:(NacreFetchTask*)entry kind:(NSString*)kind callId:(int)callId {
  auto engine = _engine;
  if (entry.error) {
    [self rejectCall:callId withError:entry.error];
    return;
  }
  NSData* data = [entry.body copy];
  dispatch_async(_workQueue, ^{
    if ([kind isEqualToString:@"text"]) {
      // UTF-8 解码：这是实打实的 CPU 活，所以才要并发队列
      NSString* text = [[NSString alloc] initWithData:data
                                             encoding:NSUTF8StringEncoding]
                           ?: @"";
      const std::string json = EncodeJSON(text);
      dispatch_async(dispatch_get_main_queue(), ^{
        if (*engine) (*engine)->SettleJSON(callId, json);
      });
    } else if ([kind isEqualToString:@"blob"]) {
      // blob：字节压根不进 V8 堆，JS 侧只拿一个句柄
      NacreBlob* blob = [NacreBlob new];
      blob.data = data;
      blob.type = @"";
      dispatch_async(dispatch_get_main_queue(), ^{
        if (!*engine) return;
        (*engine)->SettleObject(
            callId, {(void*)CFAutorelease(CFBridgingRetain(blob)), "Blob"});
      });
    } else {
      // arrayBuffer：把 NSData 的内存直接交给 V8，零拷贝。
      // CFBridgingRetain 把所有权转过去，deleter 里再 release。
      const void* bytes = data.bytes;
      const size_t length = data.length;
      void* owned = (void*)CFBridgingRetain(data);
      dispatch_async(dispatch_get_main_queue(), ^{
        if (!*engine) {
          CFRelease(owned);
          return;
        }
        (*engine)->SettleBytes(
            callId, (void*)bytes, length,
            [](void* d, size_t len, void* info) { CFRelease(info); }, owned);
      });
    }
  });
}

// 按块读：把现在攒下的全部字节作为一块交出去。只在 _fetchQueue 上调。
// 调用方保证「有东西可给」——有字节，或者请求已经结束了（成功或失败）。
//
// 出错优先于剩下的字节：请求失败之后，还没读走的那一截不再给（和 Web 的流
// 出错时丢掉队列里的块一致）。
- (void)deliverChunk:(NacreFetchTask*)entry callId:(int)callId {
  auto engine = _engine;
  if (entry.error) {
    [self rejectCall:callId withError:entry.error];
    return;
  }
  if (entry.body.length == 0) {
    // 下完了，也读完了：用 null 表示没有了
    dispatch_async(dispatch_get_main_queue(), ^{
      if (*engine) (*engine)->SettleJSON(callId, "null");
    });
    return;
  }
  // 整块缓冲区交出去，这边换一个新的接着攒。交出去的那块之后没有人再改，
  // 所以直接让 V8 接管它的内存，不拷贝——和 arrayBuffer() 是同一条路。
  // 数据从系统的回调到这里只拷过一次（追加进缓冲区的那一次），不在主线程上
  NSMutableData* chunk = entry.body;
  entry.body = [NSMutableData data];
  if (entry.suspended) {
    // 读走了，接着收
    entry.suspended = NO;
    [entry.task resume];
  }
  const void* bytes = chunk.bytes;
  const size_t length = chunk.length;
  void* owned = (void*)CFBridgingRetain(chunk);
  dispatch_async(dispatch_get_main_queue(), ^{
    if (!*engine) {
      CFRelease(owned);
      return;
    }
    (*engine)->SettleBytes(
        callId, (void*)bytes, length,
        [](void* d, size_t len, void* info) { CFRelease(info); }, owned);
  });
}

// 把一个请求的任务停掉。只在 _fetchQueue 上调。
// 被我们 suspend 着的任务先 resume 再 cancel。macOS 上量过，暂停着直接 cancel
// 完成回调也会来、连接也会断；iOS 上没量，所以走「取消一个正在跑的任务」
// 这条系统最常走的路
- (void)stopTask:(NacreFetchTask*)entry {
  if (entry.suspended) {
    entry.suspended = NO;
    [entry.task resume];
  }
  [entry.task cancel];
}

- (void)fetchReadBody:(int)requestId kind:(const std::string&)kindText callId:(int)callId {
  NSString* kind = @(kindText.c_str());
  auto engine = _engine;
  dispatch_async(_fetchQueue, ^{
    NacreFetchTask* entry = self->_fetchTasks[@(requestId)];
    if (!entry) {
      dispatch_async(dispatch_get_main_queue(), ^{
        if (*engine) (*engine)->RejectCall(callId, "TypeError", "这个请求已经没了");
      });
      return;
    }
    if ([kind isEqualToString:@"chunk"]) {
      // 按块读。第一次来的时候，之前攒下的（可能已经是整个 body）一次给完
      entry.streaming = YES;
      if (entry.body.length > 0 || entry.completed) {
        [self deliverChunk:entry callId:callId];
      } else {
        entry.pendingBodyCallId = callId;
        entry.pendingBodyKind = kind;
      }
      return;
    }
    if (entry.completed) {
      [self deliverBody:entry kind:kind callId:callId];
    } else {
      // body 还在下，记下来等完成时再给
      entry.pendingBodyCallId = callId;
      entry.pendingBodyKind = kind;
    }
  });
}

- (void)fetchCancel:(int)requestId {
  dispatch_async(_fetchQueue, ^{
    NacreFetchTask* entry = self->_fetchTasks[@(requestId)];
    if (entry) [self stopTask:entry];
  });
}


// 这个请求的内容不会再有人读了：Response 被回收了，或者它的流被 cancel() 了。
//
// 前一种走到这里时不会有人在等 body（读取期间 JS 侧拿着 Response，见内置
// 脚本的 reading）。后一种可能有：read() 正等着下一块的时候流被取消。那个
// 调用在这里结算掉——记录一删，完成回调就找不到它了，不结算的话 JS 那边
// 会一直拿着 Response 等它
- (void)fetchRelease:(int)requestId {
  auto engine = _engine;
  dispatch_async(_fetchQueue, ^{
    NacreFetchTask* entry = self->_fetchTasks[@(requestId)];
    if (!entry) return;
    // 还没下完就没人要了：停掉下载，不然它会在后台下完再整个扔掉
    if (!entry.completed) [self stopTask:entry];
    if (entry.pendingBodyCallId != 0) {
      const int waiting = entry.pendingBodyCallId;
      entry.pendingBodyCallId = 0;
      dispatch_async(dispatch_get_main_queue(), ^{
        if (*engine) (*engine)->RejectCall(waiting, "AbortError", "The operation was aborted");
      });
    }
    [self->_fetchTasks removeObjectForKey:@(requestId)];
  });
}
@end
