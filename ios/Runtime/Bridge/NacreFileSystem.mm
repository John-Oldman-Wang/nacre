// 文件读写。
//
// 全是 Promise，而且重活都派到后台队列——**决定性的理由是 JS 跑在主线程**：
// 同步读一个文件会直接卡住 UI。7a 的 UserDefaults 能同步，是因为那是内存
// 缓存；文件不是。
//
// 这个文件不认识 NacreRuntime：做完之后调一个 done 块，兑现成什么由调用方
// 决定。所以它可以单独测，也不用为了拿 settle 的入口去引运行时的私有头。
#import "NacreBridge.h"

#import <Foundation/Foundation.h>

@implementation NacreAsyncResult
@end

namespace nacre_bridge {

namespace {

// 后台队列。文件之间互不相干，所以用并发队列；QOS 用 utility——
// 这些活不该和界面抢优先级
dispatch_queue_t FileQueue() {
  static dispatch_queue_t queue;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    queue = dispatch_queue_create("com.nacre.filesystem",
                                  dispatch_queue_attr_make_with_qos_class(
                                      DISPATCH_QUEUE_CONCURRENT, QOS_CLASS_UTILITY, 0));
  });
  return queue;
}

// Cocoa 的文件错误码 → DOMException 的标准名字。借 Web 的名字是因为 JS
// 开发者认识它们，而且 Web 的 File System Access API 用的就是这一组。
// 映射盖不住的落进 FileError，但 code / domain 会原样交出去当逃生口。
NSString* FileErrorName(NSError* error) {
  if (![error.domain isEqualToString:NSCocoaErrorDomain]) return @"FileError";
  switch (error.code) {
    case NSFileNoSuchFileError:
    case NSFileReadNoSuchFileError:
      return @"NotFoundError";
    case NSFileReadNoPermissionError:
    case NSFileWriteNoPermissionError:
      return @"NotAllowedError";
    case NSFileWriteFileExistsError:
      return @"InvalidModificationError";
    case NSFileWriteOutOfSpaceError:
      return @"QuotaExceededError";
    case NSFileWriteVolumeReadOnlyError:
      return @"NoModificationAllowedError";
    case NSFileReadInvalidFileNameError:
      return @"TypeMismatchError";
    default:
      return @"FileError";
  }
}

NacreAsyncResult* Failure(NSError* error, NSString* fallback) {
  NacreAsyncResult* r = [NacreAsyncResult new];
  r.isError = YES;
  r.errorName = error ? FileErrorName(error) : @"FileError";
  r.errorMessage = error.localizedDescription ?: fallback;
  r.errorCode = error ? error.code : 0;
  r.errorDomain = error.domain ?: @"";
  return r;
}

NacreAsyncResult* Done(BOOL value) {
  NacreAsyncResult* r = [NacreAsyncResult new];
  r.boolValue = value;
  return r;
}

NacreAsyncResult* DoneJSON(id value) {
  NacreAsyncResult* r = [NacreAsyncResult new];
  r.json = value ?: NSNull.null;
  return r;
}

NSString* SearchPath(NSSearchPathDirectory directory) {
  NSArray<NSString*>* paths =
      NSSearchPathForDirectoriesInDomains(directory, NSUserDomainMask, YES);
  return paths.firstObject ?: @"";
}

}  // namespace

// 四个目录常量。走同步的属性通道——它们是进程里定死的字符串，不碰磁盘
id ReadFileSystemProperty(id object, NSString* key) {
  if (![object isKindOfClass:NSFileManager.class]) return nil;
  if ([key isEqualToString:@"documents"]) return SearchPath(NSDocumentDirectory);
  if ([key isEqualToString:@"caches"]) return SearchPath(NSCachesDirectory);
  if ([key isEqualToString:@"applicationSupport"]) {
    return SearchPath(NSApplicationSupportDirectory);
  }
  if ([key isEqualToString:@"temporary"]) {
    // tmp 没有 NSSearchPathDirectory 的常量，它是容器里固定的一层
    NSString* path = NSTemporaryDirectory();
    return path.length > 1 && [path hasSuffix:@"/"]
               ? [path substringToIndex:path.length - 1]
               : path;
  }
  return nil;
}

nacre::NativeObjectRef FileSystemClassObject(const std::string& className,
                                             const std::string& name) {
  // 类名用 FileSystem 而不是 NSFileManager：上层这个对象是**我们自己的**，
  // 因为「读写文件」这个能力在 iOS 里散在 NSFileManager / NSData / NSString
  // 三个类上，没有一个原生对象能直接当它用。底下接的仍然是 defaultManager。
  if (className == "FileSystem" && name == "default") {
    return {(__bridge void*)NSFileManager.defaultManager, "FileSystem"};
  }
  return {};
}

bool FileSystemCallAsync(id object, const std::string& name, const std::string& argsJSON,
                         const std::vector<void*>& argPtrs, NacreAsyncDone done) {
  if (![object isKindOfClass:NSFileManager.class]) return false;
  NSString* sel = @(name.c_str());
  id decoded = DecodeJSON(argsJSON);
  NSArray* args = [decoded isKindOfClass:NSArray.class] ? decoded : @[];
  NSString* path = args.count > 0 && [args[0] isKindOfClass:NSString.class]
                       ? (NSString*)args[0] : nil;
  NSString* second = args.count > 1 && [args[1] isKindOfClass:NSString.class]
                         ? (NSString*)args[1] : nil;
  id blobArg = argPtrs.size() > 1 ? (__bridge id)argPtrs[1] : nil;
  NSData* blobData = [blobArg isKindOfClass:NacreBlob.class] ? ((NacreBlob*)blobArg).data : nil;

  if (path == nil) {
    done([NacreAsyncResult new]);   // 不会走到：JS 侧先验过
    return true;
  }

  dispatch_async(FileQueue(), ^{
    NSFileManager* fm = NSFileManager.defaultManager;
    NSError* error = nil;
    NacreAsyncResult* result = nil;

    if ([sel isEqualToString:@"readText"]) {
      NSString* text = [NSString stringWithContentsOfFile:path
                                                 encoding:NSUTF8StringEncoding
                                                    error:&error];
      result = text ? DoneJSON(text) : Failure(error, @"read failed");
    } else if ([sel isEqualToString:@"readBytes"]) {
      NSData* data = [NSData dataWithContentsOfFile:path
                                            options:0
                                              error:&error];
      if (data) {
        result = [NacreAsyncResult new];
        result.bytes = data;
      } else {
        result = Failure(error, @"read failed");
      }
    } else if ([sel isEqualToString:@"writeText"]) {
      NSString* text = second ?: @"";
      BOOL ok = [text writeToFile:path
                       atomically:YES
                         encoding:NSUTF8StringEncoding
                            error:&error];
      result = ok ? Done(YES) : Failure(error, @"write failed");
    } else if ([sel isEqualToString:@"writeBytes"]) {
      if (blobData == nil) {
        result = Failure(nil, @"writeBytes: second argument must be a Blob");
      } else {
        BOOL ok = [blobData writeToFile:path
                                options:NSDataWritingAtomic
                                  error:&error];
        result = ok ? Done(YES) : Failure(error, @"write failed");
      }
    } else if ([sel isEqualToString:@"exists"]) {
      result = Done([fm fileExistsAtPath:path]);
    } else if ([sel isEqualToString:@"remove"]) {
      BOOL ok = [fm removeItemAtPath:path error:&error];
      result = ok ? Done(YES) : Failure(error, @"remove failed");
    } else if ([sel isEqualToString:@"makeDirectory"]) {
      BOOL ok = [fm createDirectoryAtPath:path
              withIntermediateDirectories:YES
                               attributes:nil
                                    error:&error];
      result = ok ? Done(YES) : Failure(error, @"makeDirectory failed");
    } else if ([sel isEqualToString:@"readDirectory"]) {
      NSArray<NSString*>* names = [fm contentsOfDirectoryAtPath:path error:&error];
      result = names ? DoneJSON(names) : Failure(error, @"readDirectory failed");
    } else if ([sel isEqualToString:@"stat"]) {
      NSDictionary* attrs = [fm attributesOfItemAtPath:path error:&error];
      if (attrs) {
        NSDate* modified = attrs[NSFileModificationDate];
        BOOL isDirectory = [attrs[NSFileType] isEqual:NSFileTypeDirectory];
        result = DoneJSON(@{
          @"size": attrs[NSFileSize] ?: @0,
          @"isDirectory": @(isDirectory),
          // 毫秒时间戳，JS 侧 new Date(n) 就能用。不给 NSDate：
          // 那个类还没暴露，该和 NSDateFormatter 一起做
          @"modified": @(modified ? llround(modified.timeIntervalSince1970 * 1000) : 0),
        });
      } else {
        result = Failure(error, @"stat failed");
      }
    } else if ([sel isEqualToString:@"move"] || [sel isEqualToString:@"copy"]) {
      if (second == nil) {
        result = Failure(nil, @"the destination path must be a string");
      } else {
        BOOL ok = [sel isEqualToString:@"move"]
                      ? [fm moveItemAtPath:path toPath:second error:&error]
                      : [fm copyItemAtPath:path toPath:second error:&error];
        result = ok ? Done(YES) : Failure(error, @"failed");
      }
    } else {
      result = Failure(nil, @"unknown file system method");
    }

    done(result);
  });
  return true;
}

}  // namespace nacre_bridge
