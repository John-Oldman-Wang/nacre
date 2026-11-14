// WebSocket。
//
// 底下是 NSURLSessionWebSocketTask，上层给 Web 的 WebSocket——和 fetch 一个
// 分工：我们没暴露 NSURLSession，只给了 fetch。
//
// 两处要吞掉的差异：
//   拉 vs 推   原生是 receiveMessageWithCompletionHandler:，收一条就得自己
//              再续一次；Web 是 onmessage 推过来。这里自己循环
//   比 Web 多   headers（浏览器的构造器给不了）和 ping（协议级，RFC 6455
//              规定对端必须回 Pong，不需要服务端应用配合）。按原则 9，
//              iOS 有的能力就给，不照搬 Web 的限制
//
// 这个文件**不认识 NacreRuntime**：事件通过启动时塞进来的 emit 块出去，
// 和 NacreFileSystem.mm 的 done 块是同一个路子。
#import "NacreBridge.h"
#import <objc/runtime.h>

// 每个任务自己的状态。**readyState 不能用 NSURLSessionTask.state 代替**——
// 那个是 running / suspended / canceling / completed，和 WebSocket 的
// connecting / open / closing / closed 不是一回事。
@interface NacreWebSocketState : NSObject
@property(nonatomic) NSInteger readyState;   // 0 连接中 / 1 已开 / 2 关闭中 / 3 已关
@property(nonatomic, copy) NSString* url;
@property(nonatomic, copy) NSString* protocol;
@end

@implementation NacreWebSocketState
@end

@interface NacreWebSocketDelegate : NSObject <NSURLSessionWebSocketDelegate>
@end

static const void* kNacreWebSocketStateKey = &kNacreWebSocketStateKey;
static NacreWebSocketEmit g_webSocketEmit = nil;

static NacreWebSocketState* NacreWebSocketStateOf(NSURLSessionTask* task) {
  return objc_getAssociatedObject(task, kNacreWebSocketStateKey);
}

static NSURLSession* NacreWebSocketSession(void) {
  static NSURLSession* session;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    // delegate 队列交给系统建的串行队列：这里只转发，没有重活
    session = [NSURLSession sessionWithConfiguration:
                   NSURLSessionConfiguration.defaultSessionConfiguration
                                            delegate:[NacreWebSocketDelegate new]
                                       delegateQueue:nil];
  });
  return session;
}

static void NacreWebSocketEmitEvent(NSURLSessionWebSocketTask* task, NSString* type,
                                    id payload, NacreBlob* blob) {
  if (g_webSocketEmit == nil) return;
  NSString* json =
      payload == nil ? nil : @(nacre_bridge::EncodeJSON(payload).c_str());
  g_webSocketEmit(task, type, json, blob);
}

// 收一条就再续一次。出错就停——那时 didCompleteWithError 会把 close 发出去
static void NacreWebSocketReceiveNext(NSURLSessionWebSocketTask* task) {
  __weak NSURLSessionWebSocketTask* weakTask = task;
  [task receiveMessageWithCompletionHandler:^(NSURLSessionWebSocketMessage* message,
                                              NSError* error) {
    NSURLSessionWebSocketTask* strongTask = weakTask;
    if (strongTask == nil || error != nil) return;
    if (message.type == NSURLSessionWebSocketMessageTypeString) {
      NacreWebSocketEmitEvent(strongTask, @"message", message.string ?: @"", nil);
    } else if (message.data != nil) {
      // 二进制给 Blob，字节不进 V8 堆——和 fetch 的 blob() 同一条路
      NacreBlob* blob = [NacreBlob new];
      blob.data = message.data;
      blob.type = @"";
      NacreWebSocketEmitEvent(strongTask, @"message", nil, blob);
    }
    NacreWebSocketReceiveNext(strongTask);
  }];
}

@implementation NacreWebSocketDelegate

- (void)URLSession:(NSURLSession*)session
          webSocketTask:(NSURLSessionWebSocketTask*)task
    didOpenWithProtocol:(NSString*)protocol {
  NacreWebSocketState* state = NacreWebSocketStateOf(task);
  state.readyState = 1;
  state.protocol = protocol ?: @"";
  NacreWebSocketEmitEvent(task, @"open", nil, nil);
  NacreWebSocketReceiveNext(task);
}

- (void)URLSession:(NSURLSession*)session
       webSocketTask:(NSURLSessionWebSocketTask*)task
    didCloseWithCode:(NSURLSessionWebSocketCloseCode)code
              reason:(NSData*)reason {
  NacreWebSocketState* state = NacreWebSocketStateOf(task);
  state.readyState = 3;
  NSString* text =
      reason.length ? ([[NSString alloc] initWithData:reason
                                             encoding:NSUTF8StringEncoding] ?: @"") : @"";
  NacreWebSocketEmitEvent(
      task, @"close",
      @{@"code" : @((NSInteger)code), @"reason" : text, @"wasClean" : @YES}, nil);
}

// 握手失败、连接断了都走这里，而且那时 didCloseWithCode **不会**被调
- (void)URLSession:(NSURLSession*)session
                    task:(NSURLSessionTask*)task
    didCompleteWithError:(NSError*)error {
  if (![task isKindOfClass:NSURLSessionWebSocketTask.class]) return;
  NSURLSessionWebSocketTask* ws = (NSURLSessionWebSocketTask*)task;
  NacreWebSocketState* state = NacreWebSocketStateOf(ws);
  if (state == nil || state.readyState == 3) return;   // didCloseWithCode 处理过了
  state.readyState = 3;
  if (error != nil) {
    NacreWebSocketEmitEvent(ws, @"error",
                            error.localizedDescription ?: @"websocket failed", nil);
  }
  // 1006 是「异常关闭」：RFC 6455 规定它只能由端自己生成，不会出现在线上
  NacreWebSocketEmitEvent(
      ws, @"close", @{@"code" : @1006, @"reason" : @"", @"wasClean" : @NO}, nil);
}

@end

namespace nacre_bridge {

void WebSocketSetEmitter(NacreWebSocketEmit emit) { g_webSocketEmit = [emit copy]; }

// new WebSocket(url, { protocols, headers })
//
// 用 webSocketTaskWithRequest: 而不是 withURL:protocols:，因为**只有它能带
// 首部**。浏览器的构造器给不了首部，那是 Web 的历史限制不是协议的限制；
// 真实业务里 Authorization 是刚需。
nacre::NativeObjectRef WebSocketConstruct(id urlValue, id options) {
  NSString* text = [urlValue isKindOfClass:NSString.class] ? urlValue : nil;
  NSURL* url = text.length ? [NSURL URLWithString:text] : nil;
  if (url == nil) return {};

  NSMutableURLRequest* request = [NSMutableURLRequest requestWithURL:url];
  NSDictionary* opts = [options isKindOfClass:NSDictionary.class] ? options : @{};
  id headers = opts[@"headers"];
  if ([headers isKindOfClass:NSDictionary.class]) {
    for (id key in (NSDictionary*)headers) {
      id value = ((NSDictionary*)headers)[key];
      if ([key isKindOfClass:NSString.class] && [value isKindOfClass:NSString.class]) {
        [request setValue:value forHTTPHeaderField:key];
      }
    }
  }
  id protocols = opts[@"protocols"];
  if ([protocols isKindOfClass:NSArray.class] && ((NSArray*)protocols).count > 0) {
    // 原生没有「既带 request 又带 protocols」的入口，所以自己写这个首部
    [request setValue:[(NSArray*)protocols componentsJoinedByString:@", "]
        forHTTPHeaderField:@"Sec-WebSocket-Protocol"];
  }

  NSURLSessionWebSocketTask* task =
      [NacreWebSocketSession() webSocketTaskWithRequest:request];
  NacreWebSocketState* state = [NacreWebSocketState new];
  state.readyState = 0;
  state.url = url.absoluteString;
  state.protocol = @"";
  objc_setAssociatedObject(task, kNacreWebSocketStateKey, state,
                           OBJC_ASSOCIATION_RETAIN_NONATOMIC);
  [task resume];
  return {NacreKeep(task), "WebSocket"};
}

id ReadWebSocketProperty(id object, NSString* key) {
  if (![object isKindOfClass:NSURLSessionWebSocketTask.class]) return nil;
  NSURLSessionWebSocketTask* task = (NSURLSessionWebSocketTask*)object;
  NacreWebSocketState* state = NacreWebSocketStateOf(task);
  if ([key isEqualToString:@"readyState"]) return @(state.readyState);
  if ([key isEqualToString:@"url"]) return state.url ?: @"";
  if ([key isEqualToString:@"protocol"]) return state.protocol ?: @"";
  if ([key isEqualToString:@"maximumMessageSize"]) return @(task.maximumMessageSize);
  return nil;
}

BOOL WriteWebSocketProperty(id object, NSString* key, id value, std::string* error) {
  if (![object isKindOfClass:NSURLSessionWebSocketTask.class]) return NO;
  if ([key isEqualToString:@"maximumMessageSize"]) {
    ((NSURLSessionWebSocketTask*)object).maximumMessageSize = NACRE_INT(value, key);
    return YES;
  }
  return NO;
}

bool WebSocketCallMethod(id object, NSString* sel, const NacreArgs& args,
                         std::string* out, std::string* error) {
  if (![object isKindOfClass:NSURLSessionWebSocketTask.class]) return false;
  if (![sel isEqualToString:@"close"]) return false;
  NSURLSessionWebSocketTask* task = (NSURLSessionWebSocketTask*)object;
  NacreWebSocketState* state = NacreWebSocketStateOf(task);
  if (state.readyState >= 2) {   // 已经在关或关完了，再调是空操作，和 Web 一致
    *out = "null";
    return true;
  }
  // 关闭码可以不给（null），给了就得是整数
  id codeValue = args.value(0);
  NSInteger code = NSURLSessionWebSocketCloseCodeNormalClosure;
  if (codeValue != nil && codeValue != NSNull.null) code = NACRE_INT(codeValue, @"code");
  id reason = args.value(1);
  NSData* reasonData = [reason isKindOfClass:NSString.class]
                           ? [reason dataUsingEncoding:NSUTF8StringEncoding]
                           : nil;
  state.readyState = 2;
  [task cancelWithCloseCode:(NSURLSessionWebSocketCloseCode)code reason:reasonData];
  *out = "null";
  return true;
}

// send 和 ping 都是「发出去，等一个回音」——一次性的请求-响应，
// 所以 JS 侧是 Promise（原则 5）
bool WebSocketCallAsync(id object, const std::string& name, const std::string& argsJSON,
                        const std::vector<void*>& argPtrs, NacreAsyncDone done) {
  if (![object isKindOfClass:NSURLSessionWebSocketTask.class]) return false;
  NSURLSessionWebSocketTask* task = (NSURLSessionWebSocketTask*)object;

  void (^settle)(NSError*) = ^(NSError* error) {
    NacreAsyncResult* r = [NacreAsyncResult new];
    if (error != nil) {
      r.isError = YES;
      r.errorName = @"NetworkError";
      r.errorMessage = error.localizedDescription ?: @"websocket failed";
      r.errorCode = error.code;
      r.errorDomain = error.domain;
    } else {
      r.boolValue = YES;
    }
    done(r);
  };
  void (^fail)(NSString*) = ^(NSString* message) {
    NacreAsyncResult* r = [NacreAsyncResult new];
    r.isError = YES;
    r.errorName = @"InvalidStateError";
    r.errorMessage = message;
    done(r);
  };

  if (name == "ping") {
    [task sendPingWithPongReceiveHandler:settle];
    return true;
  }
  if (name != "send") return false;

  if (NacreWebSocketStateOf(task).readyState != 1) {
    fail(@"send: the socket is not open");
    return true;
  }
  id blobArg = argPtrs.empty() ? nil : (__bridge id)argPtrs[0];
  id decoded = DecodeJSON(argsJSON);
  NSArray* values = [decoded isKindOfClass:NSArray.class] ? decoded : @[];
  id text = values.count > 0 ? values[0] : nil;

  NSURLSessionWebSocketMessage* message = nil;
  if ([blobArg isKindOfClass:NacreBlob.class]) {
    message = [[NSURLSessionWebSocketMessage alloc]
        initWithData:((NacreBlob*)blobArg).data ?: NSData.data];
  } else if ([text isKindOfClass:NSString.class]) {
    message = [[NSURLSessionWebSocketMessage alloc] initWithString:text];
  } else {
    fail(@"send: expects a string or a Blob");
    return true;
  }
  [task sendMessage:message completionHandler:settle];
  return true;
}

}  // namespace nacre_bridge
