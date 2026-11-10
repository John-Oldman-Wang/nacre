// Keychain：令牌和密码的安全存放。
//
// 和前两步的区别：**安全语义是 API 的一部分**。存的东西什么时候能读到、
// 换了新设备还在不在，由 accessible 决定，而这个属性存进去就改不了。
//
// 全是 Promise。Keychain 读写走 securityd 的 XPC，是进程间通信不是内存读写，
// 设备锁着时还会阻塞——而 JS 在主线程。
#import "NacreBridge.h"

#import <Foundation/Foundation.h>
#import <Security/Security.h>

@implementation NacreKeychain
+ (NacreKeychain*)shared {
  static NacreKeychain* shared;
  static dispatch_once_t once;
  dispatch_once(&once, ^{ shared = [NacreKeychain new]; });
  return shared;
}
@end

namespace nacre_bridge {

namespace {

dispatch_queue_t KeychainQueue() {
  static dispatch_queue_t queue;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    queue = dispatch_queue_create("com.nacre.keychain",
                                  dispatch_queue_attr_make_with_qos_class(
                                      DISPATCH_QUEUE_SERIAL, QOS_CLASS_USER_INITIATED, 0));
  });
  return queue;
}

// 序号 → CFStringRef。顺序和 NacreKeychainAccessible 一一对应
CFStringRef AccessibleConstant(NacreKeychainAccessible value) {
  switch (value) {
    case NacreKeychainAccessibleWhenUnlocked:
      return kSecAttrAccessibleWhenUnlocked;
    case NacreKeychainAccessibleWhenUnlockedThisDeviceOnly:
      return kSecAttrAccessibleWhenUnlockedThisDeviceOnly;
    case NacreKeychainAccessibleAfterFirstUnlock:
      return kSecAttrAccessibleAfterFirstUnlock;
    case NacreKeychainAccessibleAfterFirstUnlockThisDeviceOnly:
      return kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly;
    case NacreKeychainAccessibleWhenPasscodeSetThisDeviceOnly:
      return kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly;
  }
  return kSecAttrAccessibleWhenUnlockedThisDeviceOnly;
}

// 条目按 bundle id 分组，和别的 App 隔开
NSString* ServiceName() {
  NSString* bundleId = NSBundle.mainBundle.bundleIdentifier;
  return bundleId.length ? bundleId : @"com.nacre.app";
}

// OSStatus → 一组名字。借 DOMException 的写法和文件那边一致：
// 上层给好用的分类，底层把 code 原样交出去当逃生口。
NSString* KeychainErrorName(OSStatus status) {
  switch (status) {
    case errSecInteractionNotAllowed:   // 设备锁着
    case errSecAuthFailed:
      return @"NotAllowedError";
    case errSecMissingEntitlement:
      return @"SecurityError";
    case errSecParam:
      return @"TypeMismatchError";
    case errSecDuplicateItem:
      return @"InvalidModificationError";
    default:
      return @"KeychainError";
  }
}

NacreAsyncResult* Failure(OSStatus status, NSString* what) {
  NacreAsyncResult* r = [NacreAsyncResult new];
  r.isError = YES;
  r.errorName = KeychainErrorName(status);
  NSString* detail = (__bridge_transfer NSString*)SecCopyErrorMessageString(status, NULL);
  r.errorMessage = detail.length
                       ? [NSString stringWithFormat:@"%@: %@", what, detail]
                       : [NSString stringWithFormat:@"%@ failed (OSStatus %d)", what,
                                                    (int)status];
  r.errorCode = status;
  r.errorDomain = @"NSOSStatusErrorDomain";
  return r;
}

NacreAsyncResult* DoneBool(BOOL value) {
  NacreAsyncResult* r = [NacreAsyncResult new];
  r.boolValue = value;
  return r;
}

NacreAsyncResult* DoneJSON(id value) {
  NacreAsyncResult* r = [NacreAsyncResult new];
  r.json = value ?: NSNull.null;
  return r;
}

NSMutableDictionary* BaseQuery(NSString* account) {
  NSMutableDictionary* query = [@{
    (__bridge id)kSecClass: (__bridge id)kSecClassGenericPassword,
    (__bridge id)kSecAttrService: ServiceName(),
  } mutableCopy];
  if (account) query[(__bridge id)kSecAttrAccount] = account;
  return query;
}

// 写：先试 update，没有再 add。errSecDuplicateItem 对调用方透明
NacreAsyncResult* WriteItem(NSString* account, NSData* data,
                            NacreKeychainAccessible accessible) {
  NSMutableDictionary* query = BaseQuery(account);
  NSDictionary* changes = @{(__bridge id)kSecValueData: data};
  OSStatus status = SecItemUpdate((__bridge CFDictionaryRef)query,
                                  (__bridge CFDictionaryRef)changes);
  if (status == errSecItemNotFound) {
    query[(__bridge id)kSecValueData] = data;
    query[(__bridge id)kSecAttrAccessible] = (__bridge id)AccessibleConstant(accessible);
    status = SecItemAdd((__bridge CFDictionaryRef)query, NULL);
  }
  return status == errSecSuccess ? DoneBool(YES) : Failure(status, @"set");
}

// 读。没有这一条不是错误——和 storage.get 一致，给 null
NSData* ReadItem(NSString* account, OSStatus* statusOut) {
  NSMutableDictionary* query = BaseQuery(account);
  query[(__bridge id)kSecReturnData] = @YES;
  query[(__bridge id)kSecMatchLimit] = (__bridge id)kSecMatchLimitOne;
  CFTypeRef found = NULL;
  *statusOut = SecItemCopyMatching((__bridge CFDictionaryRef)query, &found);
  return *statusOut == errSecSuccess ? (__bridge_transfer NSData*)found : nil;
}

}  // namespace

nacre::NativeObjectRef KeychainClassObject(const std::string& className,
                                           const std::string& name) {
  if (className == "Keychain" && name == "default") {
    return {(__bridge void*)NacreKeychain.shared, "Keychain"};
  }
  return {};
}

bool KeychainCallAsync(id object, const std::string& name, const std::string& argsJSON,
                       const std::vector<void*>& argPtrs, NacreAsyncDone done) {
  if (![object isKindOfClass:NacreKeychain.class]) return false;
  NSString* sel = @(name.c_str());
  id decoded = DecodeJSON(argsJSON);
  NSArray* args = [decoded isKindOfClass:NSArray.class] ? decoded : @[];
  NSString* key = args.count > 0 && [args[0] isKindOfClass:NSString.class]
                      ? (NSString*)args[0] : nil;
  NSString* text = args.count > 1 && [args[1] isKindOfClass:NSString.class]
                       ? (NSString*)args[1] : nil;
  NSString* accessibleName = args.count > 2 && [args[2] isKindOfClass:NSString.class]
                                 ? (NSString*)args[2] : nil;
  id blobArg = argPtrs.size() > 1 ? (__bridge id)argPtrs[1] : nil;
  NSData* blobData = [blobArg isKindOfClass:NacreBlob.class] ? ((NacreBlob*)blobArg).data : nil;

  // 枚举在后台队列之外先验：认不出的值当场填错误，和别处一致
  NacreKeychainAccessible accessible = NacreKeychainAccessibleWhenUnlockedThisDeviceOnly;
  if (accessibleName != nil && !KeychainAccessibleFromName(accessibleName, &accessible)) {
    NacreAsyncResult* r = [NacreAsyncResult new];
    r.isError = YES;
    r.errorName = @"TypeMismatchError";
    // EnumError 给的是 std::string，这里要 NSString
    r.errorMessage = @(EnumError(@"accessible", accessibleName,
                                 NamesForKeychainAccessible()).c_str());
    r.errorCode = 0;
    r.errorDomain = @"";
    done(r);
    return true;
  }

  dispatch_async(KeychainQueue(), ^{
    NacreAsyncResult* result = nil;
    OSStatus status = errSecSuccess;

    if ([sel isEqualToString:@"get"]) {
      NSData* data = ReadItem(key, &status);
      if (data) {
        NSString* value = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
        result = DoneJSON(value ?: NSNull.null);
      } else {
        result = status == errSecItemNotFound ? DoneJSON(NSNull.null)
                                              : Failure(status, @"get");
      }
    } else if ([sel isEqualToString:@"getBytes"]) {
      NSData* data = ReadItem(key, &status);
      if (data) {
        result = [NacreAsyncResult new];
        result.bytes = data;
      } else if (status == errSecItemNotFound) {
        result = DoneJSON(NSNull.null);   // JS 侧把 null 翻成 null
      } else {
        result = Failure(status, @"getBytes");
      }
    } else if ([sel isEqualToString:@"set"]) {
      NSData* data = [(text ?: @"") dataUsingEncoding:NSUTF8StringEncoding];
      result = WriteItem(key, data, accessible);
    } else if ([sel isEqualToString:@"setBytes"]) {
      result = blobData ? WriteItem(key, blobData, accessible)
                        : Failure(errSecParam, @"setBytes");
    } else if ([sel isEqualToString:@"remove"]) {
      status = SecItemDelete((__bridge CFDictionaryRef)BaseQuery(key));
      // 本来就没有也算删成功——和 storage.remove 一致
      result = (status == errSecSuccess || status == errSecItemNotFound)
                   ? DoneBool(YES) : Failure(status, @"remove");
    } else if ([sel isEqualToString:@"has"]) {
      NSMutableDictionary* query = BaseQuery(key);
      query[(__bridge id)kSecMatchLimit] = (__bridge id)kSecMatchLimitOne;
      status = SecItemCopyMatching((__bridge CFDictionaryRef)query, NULL);
      result = status == errSecSuccess    ? DoneBool(YES)
               : status == errSecItemNotFound ? DoneBool(NO)
                                              : Failure(status, @"has");
    } else if ([sel isEqualToString:@"keys"]) {
      NSMutableDictionary* query = BaseQuery(nil);
      query[(__bridge id)kSecMatchLimit] = (__bridge id)kSecMatchLimitAll;
      query[(__bridge id)kSecReturnAttributes] = @YES;
      CFTypeRef found = NULL;
      status = SecItemCopyMatching((__bridge CFDictionaryRef)query, &found);
      if (status == errSecItemNotFound) {
        result = DoneJSON(@[]);
      } else if (status == errSecSuccess) {
        NSArray* items = (__bridge_transfer NSArray*)found;
        NSMutableArray<NSString*>* names = [NSMutableArray array];
        for (NSDictionary* item in items) {
          id account = item[(__bridge id)kSecAttrAccount];
          if ([account isKindOfClass:NSString.class]) [names addObject:account];
        }
        result = DoneJSON(names);
      } else {
        result = Failure(status, @"keys");
      }
    } else if ([sel isEqualToString:@"clear"]) {
      status = SecItemDelete((__bridge CFDictionaryRef)BaseQuery(nil));
      result = (status == errSecSuccess || status == errSecItemNotFound)
                   ? DoneBool(YES) : Failure(status, @"clear");
    } else {
      result = Failure(errSecParam, @"unknown keychain method");
    }

    done(result);
  });
  return true;
}

}  // namespace nacre_bridge
