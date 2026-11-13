// Session：网页的数据存在哪一份里，以及对那一份的操作——cookie、清数据。
//
// 形状照 Electron 的 session：一个分区一个 Session 对象，session.cookies
// 读写 cookie，session.clearStorageData 清数据。底下是 WKWebsiteDataStore
// 和它的 WKHTTPCookieStore，那两个类不暴露。
//
// 「分区名 → 数据存储」的换算也在这个文件里：WebView 建网页时要用，
// Session 也要用，两边必须拿到同一份。
//
// 这个文件**不认识 NacreRuntime**，事件通过启动时塞进来的 emit 块出去。
#import "NacreBridge.h"
#import <CommonCrypto/CommonDigest.h>
#import <WebKit/WebKit.h>

static NacreWebContentsEmit g_sessionEmit = nil;

// 一个分区一个。JS 的 Session 包的就是它
@interface NacreWebSession : NSObject <WKHTTPCookieStoreObserver>
@property(nonatomic, copy) NSString* partition;
@property(nonatomic, strong) WKWebsiteDataStore* store;
// 有没有在听 cookie 的变化。JS 那边 cookies 上第一次有监听器时才开始听
@property(nonatomic) BOOL observing;
@end

@implementation NacreWebSession

// 系统只说「有变化」，不说是哪一条、是加了还是删了（Electron 的 changed
// 事件带这些）。原样转出去：一个不带数据的通知，JS 自己重新读
- (void)cookiesDidChangeInCookieStore:(WKHTTPCookieStore*)cookieStore {
  if (g_sessionEmit != nil) g_sessionEmit(self, @"@cookies-changed", nil);
}

@end

// clearStorageData 的 storages 里能写的名字（照 Electron）→ 系统的数据类型。
// 名字到系统常量的换算留在原生层。check-api.sh 拿这张表和 d.ts 的
// SessionStorageType 对。
//   localstorage   连 sessionStorage 一起（Electron 里它们也是一类）
//   shadercache    iOS 上没有对应的东西。认这个名字、什么都不清——从
//                  Electron 搬过来的代码里写着它不该报错
static NSDictionary<NSString*, NSArray<NSString*>*>* SessionStorageTable(void) {
  static NSDictionary<NSString*, NSArray<NSString*>*>* table;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    table = @{
      @"cookies": @[ WKWebsiteDataTypeCookies ],
      @"localstorage": @[ WKWebsiteDataTypeLocalStorage, WKWebsiteDataTypeSessionStorage ],
      @"indexdb": @[ WKWebsiteDataTypeIndexedDBDatabases ],
      @"serviceworkers": @[ WKWebsiteDataTypeServiceWorkerRegistrations ],
      @"cachestorage": @[ WKWebsiteDataTypeFetchCache ],
      @"filesystem": @[ WKWebsiteDataTypeFileSystem ],
      @"shadercache": @[],
    };
  });
  return table;
}

// ---- 分区 ----
//
// partition 的三种写法照 Electron：
//   不写 / 空串        默认的存储，落盘
//   'persist:名字'     落盘，同名的网页共用一份
//   '名字'             只在内存里，同名的网页共用一份，进程退出就没了
//
// 落盘的分区用 dataStoreForIdentifier:，它要一个 UUID 而不是名字。所以从
// 名字**算**出一个固定的 UUID——同一个名字每次启动都得到同一个，数据才
// 接得上。不能随机生成再存起来：那就多了一份要自己管的映射表
static NSUUID* UUIDForPartitionName(NSString* name) {
  NSData* data = [[@"nacre.partition:" stringByAppendingString:name]
      dataUsingEncoding:NSUTF8StringEncoding];
  unsigned char digest[CC_SHA256_DIGEST_LENGTH];
  CC_SHA256(data.bytes, (CC_LONG)data.length, digest);
  // UUID 的版本位和变体位。标成第 5 版（由名字派生）
  digest[6] = (digest[6] & 0x0F) | 0x50;
  digest[8] = (digest[8] & 0x3F) | 0x80;
  return [[NSUUID alloc] initWithUUIDBytes:digest];
}

// 一条 cookie 给 JS 的样子。字段名照 Electron 的 Cookie。
//   hostOnly         domain 不以点开头：只发给这一个主机，不发给子域名
//   expirationDate   秒。没有过期时间的（session 为 true）不带这个字段
//   sameSite         系统只分得出三种。没写 SameSite 的 cookie 读出来和
//                    None 一样，所以这里不会有 Electron 的 'unspecified'
static NSDictionary* CookieForJS(NSHTTPCookie* cookie) {
  NSMutableDictionary* out = [NSMutableDictionary dictionary];
  NSString* domain = cookie.domain ?: @"";
  out[@"name"] = cookie.name ?: @"";
  out[@"value"] = cookie.value ?: @"";
  out[@"domain"] = domain;
  out[@"hostOnly"] = @(![domain hasPrefix:@"."]);
  out[@"path"] = cookie.path ?: @"/";
  out[@"secure"] = @(cookie.isSecure);
  out[@"httpOnly"] = @(cookie.isHTTPOnly);
  out[@"session"] = @(cookie.isSessionOnly || cookie.expiresDate == nil);
  if (!cookie.isSessionOnly && cookie.expiresDate != nil) {
    out[@"expirationDate"] = @(cookie.expiresDate.timeIntervalSince1970);
  }
  NSHTTPCookieStringPolicy policy = cookie.sameSitePolicy;
  out[@"sameSite"] = [policy isEqualToString:NSHTTPCookieSameSiteLax]      ? @"lax"
                     : [policy isEqualToString:NSHTTPCookieSameSiteStrict] ? @"strict"
                                                                           : @"no_restriction";
  return out;
}

static void Settle(NacreAsyncDone done, id json) {
  NacreAsyncResult* r = [NacreAsyncResult new];
  if (json != nil) {
    r.json = json;
  } else {
    r.boolValue = YES;
  }
  done(r);
}

static void Refuse(NacreAsyncDone done, NSString* message) {
  NacreAsyncResult* r = [NacreAsyncResult new];
  r.isError = YES;
  r.errorName = @"TypeError";
  r.errorMessage = message;
  done(r);
}

// JS 给的那一条 → NSHTTPCookie。值已经在 JS 侧转过类型、补过默认值，
// 这里只校验。建不出来返回 nil
static NSHTTPCookie* CookieFromJS(NSDictionary* details) {
  id name = details[@"name"], value = details[@"value"], url = details[@"url"];
  id domain = details[@"domain"], path = details[@"path"];
  if (![name isKindOfClass:NSString.class] || ![value isKindOfClass:NSString.class] ||
      ![url isKindOfClass:NSString.class] || ![path isKindOfClass:NSString.class]) {
    return nil;
  }
  NSURL* origin = [NSURL URLWithString:url];
  if (origin.host.length == 0) return nil;
  NSMutableDictionary* props = [NSMutableDictionary dictionary];
  props[NSHTTPCookieName] = name;
  props[NSHTTPCookieValue] = value;
  props[NSHTTPCookiePath] = path;
  // 给了 domain 就用它（JS 那边已经补上了开头的点：对子域名也有效）；
  // 没给就只属于 url 的那个主机
  if ([domain isKindOfClass:NSString.class] && [domain length] > 0) {
    props[NSHTTPCookieDomain] = domain;
  } else {
    props[NSHTTPCookieOriginURL] = origin;
  }
  if ([details[@"secure"] isEqual:@YES]) props[NSHTTPCookieSecure] = @"TRUE";
  // 这个键 Foundation 没给常量，名字就是首部里的那个词
  if ([details[@"httpOnly"] isEqual:@YES]) props[@"HttpOnly"] = @"TRUE";
  id expires = details[@"expirationDate"];
  if ([expires isKindOfClass:NSNumber.class]) {
    NSNumber* seconds = (NSNumber*)expires;
    props[NSHTTPCookieExpires] = [NSDate dateWithTimeIntervalSince1970:seconds.doubleValue];
  }
  id sameSite = details[@"sameSite"];
  if ([sameSite isEqual:@"lax"]) props[NSHTTPCookieSameSitePolicy] = NSHTTPCookieSameSiteLax;
  if ([sameSite isEqual:@"strict"]) props[NSHTTPCookieSameSitePolicy] = NSHTTPCookieSameSiteStrict;
  return [NSHTTPCookie cookieWithProperties:props];
}

// 一条数据记录属不属于这个主机。系统的记录是按域名记的（不分协议和
// 端口），名字有时带开头的点（cookie 的 domain 就是那样记的）
static BOOL RecordBelongsToHost(WKWebsiteDataRecord* record, NSString* host) {
  NSString* name = record.displayName ?: @"";
  if ([name hasPrefix:@"."]) name = [name substringFromIndex:1];
  if (name.length == 0) return NO;
  return [host isEqualToString:name] || [host hasSuffix:[@"." stringByAppendingString:name]];
}

namespace nacre_bridge {

void WebSessionSetEmitter(NacreWebContentsEmit emit) { g_sessionEmit = [emit copy]; }

WKWebsiteDataStore* WebStoreForPartition(NSString* partition) {
  if (partition.length == 0) return WKWebsiteDataStore.defaultDataStore;
  if ([partition hasPrefix:@"persist:"]) {
    NSString* name = [partition substringFromIndex:8];
    if (name.length == 0) return WKWebsiteDataStore.defaultDataStore;
    return [WKWebsiteDataStore dataStoreForIdentifier:UUIDForPartitionName(name)];
  }
  // 内存分区：系统每次给的都是一份新的，「同名共用」要自己记。记到进程
  // 结束为止——和 Electron 的内存 session 一样长
  static NSMutableDictionary<NSString*, WKWebsiteDataStore*>* memory;
  static dispatch_once_t once;
  dispatch_once(&once, ^{ memory = [NSMutableDictionary dictionary]; });
  WKWebsiteDataStore* store = memory[partition];
  if (store == nil) {
    store = WKWebsiteDataStore.nonPersistentDataStore;
    memory[partition] = store;
  }
  return store;
}

// Session.fromPartition(partition)。同一个分区名永远给同一个对象，留到
// 进程结束（Electron 的 session 也是）
bool WebSessionClassCall(const std::string& className, NSString* sel, NSArray* args,
                         nacre::NativeObjectRef* out, std::string* error) {
  if (className != "Session" || ![sel isEqualToString:@"fromPartition:"]) return false;
  id partition = args.count > 0 ? args[0] : nil;
  if (![partition isKindOfClass:NSString.class]) {
    *error = "fromPartition needs the partition as a string";
    return true;
  }
  static NSMutableDictionary<NSString*, NacreWebSession*>* sessions;
  static dispatch_once_t once;
  dispatch_once(&once, ^{ sessions = [NSMutableDictionary dictionary]; });
  NacreWebSession* session = sessions[partition];
  if (session == nil) {
    session = [NacreWebSession new];
    session.partition = partition;
    session.store = WebStoreForPartition(partition);
    sessions[partition] = session;
  }
  *out = {(__bridge void*)session, "Session"};
  return true;
}

bool WebSessionCallMethod(id object, NSString* sel, const NacreArgs& args,
                          std::string* out, std::string* error) {
  if (![object isKindOfClass:NacreWebSession.class]) return false;
  NacreWebSession* session = (NacreWebSession*)object;
  // 开始或停止听 cookie 的变化
  if ([sel isEqualToString:@"observeCookies"]) {
    BOOL on = NACRE_BOOL(args.value(0), @"on");
    if (on != session.observing) {
      session.observing = on;
      if (on) {
        [session.store.httpCookieStore addObserver:session];
      } else {
        [session.store.httpCookieStore removeObserver:session];
      }
    }
    *out = "null";
    return true;
  }
  if ([sel isEqualToString:@"isPersistent"]) {
    *out = session.store.isPersistent ? "true" : "false";
    return true;
  }
  return false;
}

bool WebSessionCallAsync(id object, const std::string& name, const std::string& argsJSON,
                         const std::vector<void*>& argPtrs, NacreAsyncDone done) {
  if (![object isKindOfClass:NacreWebSession.class]) return false;
  NacreWebSession* session = (NacreWebSession*)object;
  WKWebsiteDataStore* store = session.store;
  WKHTTPCookieStore* jar = store.httpCookieStore;
  id decoded = DecodeJSON(argsJSON);
  NSArray* values = [decoded isKindOfClass:NSArray.class] ? decoded : @[];
  id first = values.count > 0 ? values[0] : nil;

  // 读全部。系统只有这一种读法，按 url / name 那些条件筛是 JS 的事
  if (name == "cookiesGet") {
    [jar getAllCookies:^(NSArray<NSHTTPCookie*>* cookies) {
      NSMutableArray* out = [NSMutableArray arrayWithCapacity:cookies.count];
      for (NSHTTPCookie* cookie in cookies) [out addObject:CookieForJS(cookie)];
      Settle(done, out);
    }];
    return true;
  }

  if (name == "cookiesSet") {
    NSHTTPCookie* cookie =
        [first isKindOfClass:NSDictionary.class] ? CookieFromJS(first) : nil;
    if (cookie == nil) {
      Refuse(done, @"cookies.set: these details do not make a valid cookie");
      return true;
    }
    [jar setCookie:cookie completionHandler:^{ Settle(done, nil); }];
    return true;
  }

  // 删。参数是一组 { name, domain, path }，三样都对上的才删——那是一条
  // cookie 的身份
  if (name == "cookiesDelete") {
    NSArray* targets = [first isKindOfClass:NSArray.class] ? first : @[];
    [jar getAllCookies:^(NSArray<NSHTTPCookie*>* cookies) {
      dispatch_group_t group = dispatch_group_create();
      for (NSHTTPCookie* cookie in cookies) {
        for (id target in targets) {
          if (![target isKindOfClass:NSDictionary.class]) continue;
          if ([cookie.name isEqual:target[@"name"]] && [cookie.domain isEqual:target[@"domain"]] &&
              [cookie.path isEqual:target[@"path"]]) {
            dispatch_group_enter(group);
            [jar deleteCookie:cookie completionHandler:^{ dispatch_group_leave(group); }];
            break;
          }
        }
      }
      dispatch_group_notify(group, dispatch_get_main_queue(), ^{ Settle(done, nil); });
    }];
    return true;
  }

  // clearStorageData(storages, host)。两个都可以是 null：
  //   storages 为 null   全部类型，连 HTTP 缓存一起
  //   host 为 null       整个分区；给了就只清属于这个主机的记录
  if (name == "clearData") {
    NSSet<NSString*>* types = nil;
    if ([first isKindOfClass:NSArray.class]) {
      NSMutableSet<NSString*>* chosen = [NSMutableSet set];
      for (id storage in (NSArray*)first) {
        NSArray<NSString*>* mapped =
            [storage isKindOfClass:NSString.class] ? SessionStorageTable()[storage] : nil;
        if (mapped == nil) {
          NSArray* names =
              [SessionStorageTable().allKeys sortedArrayUsingSelector:@selector(compare:)];
          Refuse(done, @(EnumError(@"clearStorageData storages", storage,
                                   [names componentsJoinedByString:@" / "])
                             .c_str()));
          return true;
        }
        [chosen addObjectsFromArray:mapped];
      }
      types = chosen;
    } else {
      types = WKWebsiteDataStore.allWebsiteDataTypes;
    }
    if (types.count == 0) {   // 只写了 shadercache 这种没有对应物的
      Settle(done, nil);
      return true;
    }
    id host = values.count > 1 ? values[1] : nil;
    if (![host isKindOfClass:NSString.class]) {
      [store removeDataOfTypes:types
                 modifiedSince:NSDate.distantPast
             completionHandler:^{ Settle(done, nil); }];
      return true;
    }
    [store fetchDataRecordsOfTypes:types
                 completionHandler:^(NSArray<WKWebsiteDataRecord*>* records) {
                   NSMutableArray<WKWebsiteDataRecord*>* matching = [NSMutableArray array];
                   for (WKWebsiteDataRecord* record in records) {
                     if (RecordBelongsToHost(record, host)) [matching addObject:record];
                   }
                   [store removeDataOfTypes:types
                             forDataRecords:matching
                          completionHandler:^{ Settle(done, nil); }];
                 }];
    return true;
  }
  return false;
}

}  // namespace nacre_bridge
