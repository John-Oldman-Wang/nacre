// 相册：从相册选图（PhotosUI 的 PHPickerViewController 一组）、把图片存进
// 相册（Photos 的 PHPhotoLibrary）。
//
// 这是一个能力包，编进的是 NacrePhotos.framework，不在核心里：存图要项目在
// Info.plist 里写一句 NSPhotoLibraryAddUsageDescription，不是每个 App 都用得到
// （见 docs/project.md 3.8 节）。所以只用给能力包的那个头，不碰核心的内部头。
//
// 六个类：
//   PHPickerFilter           选图界面里显示哪些类型
//   PHPickerConfiguration    选图界面的配置
//   PHPickerViewController   选图界面。它是一个页面，呈现和关闭走核心现成的
//                            presentViewController / dismissViewController
//   PHPickerResult           选中的一项
//   NSItemProvider           一项内容的提供者，图片从它身上取
//   PHPhotoLibrary           相册。只接了「添加」那条路
//
// 选图界面在系统自己的进程里运行，App 只拿到用户选中的那几项，所以选图
// **不需要相册权限**。这里也没有用任何要完整相册权限的接口——那会要求项目
// 再写一句 NSPhotoLibraryUsageDescription。
//
// PhotosUI 的这一组是用 Swift 写的，参数不对时不是抛 ObjC 异常，而是断言失败、
// 进程直接终止，桥的入口保护接不住。量到的两处（macOS 上的命令行探针）：
// 组合筛选条件时给空数组、selectionLimit 是负数时建选择器。两处都在到达系统
// 之前拦掉。
#import <Nacre/NacreExtension.h>

#import <Photos/Photos.h>
#import <PhotosUI/PhotosUI.h>
#import <UIKit/UIKit.h>
#import <objc/runtime.h>

// 关联对象的 key：PHPickerViewController → 它的委托。选择器对委托是弱引用，
// 所以由选择器自己通过关联对象拿着
static const void* kNacrePhotosPickerDelegateKey = &kNacrePhotosPickerDelegateKey;

// 项目要在 Info.plist 里写的那一句。包的清单（packages/photos/nacre-ios.json）
// 里声明了这个要求，CLI 生成工程时会核对
static NSString* const kAddUsageKey = @"NSPhotoLibraryAddUsageDescription";

// 选图结束时发的内部事件。@ 开头的事件不派发给监听器，交给 part 里登记的
// 处理函数，它取走结果、建出 pick 事件再派发
static NSString* const kPickedInternalEvent = @"@photos-picked";
// JS 那一侧的事件名
static NSString* const kPickedEventName = @"pick";

namespace nacre_bridge {

// ---- 枚举 ----

NACRE_ENUM_MAP(PickerAssetRepresentationMode, PHPickerConfigurationAssetRepresentationMode,
               @"automatic": @(PHPickerConfigurationAssetRepresentationModeAutomatic),
               @"current": @(PHPickerConfigurationAssetRepresentationModeCurrent),
               @"compatible": @(PHPickerConfigurationAssetRepresentationModeCompatible))

NACRE_ENUM_MAP(PickerSelection, PHPickerConfigurationSelection,
               @"default": @(PHPickerConfigurationSelectionDefault),
               @"ordered": @(PHPickerConfigurationSelectionOrdered),
               @"continuous": @(PHPickerConfigurationSelectionContinuous),
               @"continuousAndOrdered": @(PHPickerConfigurationSelectionContinuousAndOrdered))

NACRE_ENUM_MAP(PickerMode, PHPickerMode,
               @"default": @(PHPickerModeDefault),
               @"compact": @(PHPickerModeCompact))

// 访问级别。PHAccessLevelReadWrite **不在表里**：它是读整个相册的权限，要项目
// 写另一句权限文案（NSPhotoLibraryUsageDescription），而这个包只声明了
// 「添加」那一句。没有那一句就去申请，系统会直接终止 App
NACRE_ENUM_MAP(PhotoAccessLevel, PHAccessLevel,
               @"addOnly": @(PHAccessLevelAddOnly))

NACRE_ENUM_MAP(PhotoAuthorizationStatus, PHAuthorizationStatus,
               @"notDetermined": @(PHAuthorizationStatusNotDetermined),
               @"restricted": @(PHAuthorizationStatusRestricted),
               @"denied": @(PHAuthorizationStatusDenied),
               @"authorized": @(PHAuthorizationStatusAuthorized),
               @"limited": @(PHAuthorizationStatusLimited))

// ---- 暂存：等 JS 来取的原生对象 ----
//
// 两处要把原生对象交给 JS、而现成的通道带不了：
//   - 异步调用的结果（NacreAsyncResult）只能是布尔、JSON 或字节，带不了对象，
//     而取图要兑现成一个 UIImage
//   - 事件只能带一个对象，而选图的结果是一组 PHPickerResult
// 做法是把对象存在这里、把号交给 JS，JS 紧接着用一次同步调用按号取走。
// 取一次就清。只在主线程上用
static NSMutableDictionary<NSNumber*, id>* Parcels() {
  static NSMutableDictionary<NSNumber*, id>* parcels;
  static dispatch_once_t once;
  dispatch_once(&once, ^{ parcels = [NSMutableDictionary dictionary]; });
  return parcels;
}

static NSInteger DepositParcel(id object) {
  static NSInteger next = 0;
  next += 1;
  Parcels()[@(next)] = object;
  return next;
}

static id TakeParcel(id token) {
  if (![token isKindOfClass:NSNumber.class]) return nil;
  id object = Parcels()[token];
  [Parcels() removeObjectForKey:token];
  return object;
}

// ---- 取参 ----
// 类型转换全在 JS 一侧做完了，这里只校验。核心里做这件事的 NACRE_INT 在
// 内部头里，能力包用不到，所以这个文件自己带一个整数的

// JSON 里的 true / false 解出来也是 NSNumber，要和数分开
static bool IsBoolean(id value) {
  return [value isKindOfClass:NSNumber.class] &&
         CFGetTypeID((__bridge CFTypeRef)value) == CFBooleanGetTypeID();
}

// 不小于 0 的整数。不是就填报错并返回 false
static bool NonNegativeInteger(id value, NSString* what, NSInteger* out, std::string* error) {
  if (![value isKindOfClass:NSNumber.class] || IsBoolean(value)) {
    *error = [NSString stringWithFormat:@"%@ must be an integer", what].UTF8String;
    return false;
  }
  NSNumber* number = (NSNumber*)value;
  const double asDouble = number.doubleValue;
  if (asDouble != (double)(NSInteger)asDouble) {
    *error = [NSString stringWithFormat:@"%@ must be an integer", what].UTF8String;
    return false;
  }
  if (asDouble < 0) {
    *error = [NSString stringWithFormat:@"%@ must not be negative, got %@", what, number]
                 .UTF8String;
    return false;
  }
  *out = (NSInteger)asDouble;
  return true;
}

// ---- 异步结果 ----

static NacreAsyncResult* Failure(NSString* name, NSString* message, NSInteger code,
                                 NSString* domain) {
  NacreAsyncResult* r = [NacreAsyncResult new];
  r.isError = YES;
  r.errorName = name;
  r.errorMessage = message;
  r.errorCode = code;
  r.errorDomain = domain ?: @"";
  return r;
}

static NacreAsyncResult* DoneJSON(id value) {
  NacreAsyncResult* r = [NacreAsyncResult new];
  r.json = value ?: NSNull.null;
  return r;
}

// Info.plist 里有没有那一句权限文案。没有的话系统不是报错，而是在申请权限的
// 那一刻直接终止 App，所以在碰相册之前先看一眼。CLI 生成工程时会拦住缺这
// 一句的项目，这里接的是绕过 CLI 的情况
static NacreAsyncResult* MissingUsageDescription() {
  id text = [NSBundle.mainBundle objectForInfoDictionaryKey:kAddUsageKey];
  if ([text isKindOfClass:NSString.class] && ((NSString*)text).length > 0) return nil;
  return Failure(@"InvalidStateError",
                 [NSString stringWithFormat:
                               @"%@ is missing from Info.plist; add it under ios.infoPlist in "
                               @"nacre.config.json",
                               kAddUsageKey],
                 0, @"");
}

// 存图失败的错误。没有权限的两种给 NotAllowedError，其余给 PhotosError，
// code 和 domain 原样交出去
static NacreAsyncResult* PhotosFailure(NSError* error, NSString* what) {
  NSString* name = @"PhotosError";
  if ([error.domain isEqualToString:PHPhotosErrorDomain] &&
      (error.code == PHPhotosErrorAccessUserDenied ||
       error.code == PHPhotosErrorAccessRestricted)) {
    name = @"NotAllowedError";
  }
  NSString* detail = error.localizedDescription;
  return Failure(name,
                 detail.length ? [NSString stringWithFormat:@"%@: %@", what, detail]
                               : [NSString stringWithFormat:@"%@ failed", what],
                 error.code, error.domain);
}

}  // namespace nacre_bridge

// ---- 选择器的委托 ----
//
// 系统在用户选完、或者点了取消时调（取消时 results 是空数组）。它不会自己把
// 选图界面关掉，关是 JS 的事。
//
// 结果是一组对象，事件带不了，所以先暂存、把号放进事件里（见 Parcels）。
// 委托从构造起就装着、每次都发，不看 JS 订没订：没人订的时候 part 里的处理
// 函数照样把结果取走，暂存的不会留下
@interface NacrePhotosPickerDelegate : NSObject <PHPickerViewControllerDelegate>
@end

@implementation NacrePhotosPickerDelegate
- (void)picker:(PHPickerViewController*)picker
    didFinishPicking:(NSArray<PHPickerResult*>*)results {
  NSInteger token = nacre_bridge::DepositParcel([results copy] ?: @[]);
  nacre_bridge::NacreEmitEventWithJSON(
      picker, "PHPickerViewController", kPickedInternalEvent,
      [NSString stringWithFormat:@"{\"token\":%ld}", (long)token]);
}
@end

namespace nacre_bridge {

// ---- 属性 ----

static id ReadPhotosProperty(id object, NSString* key) {
  if ([object isKindOfClass:PHPickerConfiguration.class]) {
    PHPickerConfiguration* config = (PHPickerConfiguration*)object;
    if ([key isEqualToString:@"selectionLimit"]) return @(config.selectionLimit);
    if ([key isEqualToString:@"preferredAssetRepresentationMode"]) {
      return NameForPickerAssetRepresentationMode(config.preferredAssetRepresentationMode);
    }
    if ([key isEqualToString:@"selection"]) return NameForPickerSelection(config.selection);
    if ([key isEqualToString:@"mode"]) return NameForPickerMode(config.mode);
    return nil;
  }
  if ([object isKindOfClass:NSItemProvider.class]) {
    NSItemProvider* provider = (NSItemProvider*)object;
    if ([key isEqualToString:@"registeredTypeIdentifiers"]) {
      return provider.registeredTypeIdentifiers ?: @[];
    }
    if ([key isEqualToString:@"suggestedName"]) return provider.suggestedName ?: NSNull.null;
    return nil;
  }
  return nil;
}

static BOOL WritePhotosProperty(id object, NSString* key, id value, std::string* error) {
  if (![object isKindOfClass:PHPickerConfiguration.class]) return NO;
  PHPickerConfiguration* config = (PHPickerConfiguration*)object;
  if ([key isEqualToString:@"selectionLimit"]) {
    // 负数存得进配置，但拿它建选择器时进程直接终止，所以在这里就拒
    NSInteger limit = 0;
    if (NonNegativeInteger(value, key, &limit, error)) config.selectionLimit = limit;
    return YES;
  }
  if ([key isEqualToString:@"preferredAssetRepresentationMode"]) {
    PHPickerConfigurationAssetRepresentationMode mode;
    if (!PickerAssetRepresentationModeFromName(value, &mode)) {
      *error = EnumError(key, value, NamesForPickerAssetRepresentationMode());
      return YES;
    }
    config.preferredAssetRepresentationMode = mode;
    return YES;
  }
  if ([key isEqualToString:@"selection"]) {
    PHPickerConfigurationSelection selection;
    if (!PickerSelectionFromName(value, &selection)) {
      *error = EnumError(key, value, NamesForPickerSelection());
      return YES;
    }
    config.selection = selection;
    return YES;
  }
  if ([key isEqualToString:@"mode"]) {
    PHPickerMode mode;
    if (!PickerModeFromName(value, &mode)) {
      *error = EnumError(key, value, NamesForPickerMode());
      return YES;
    }
    config.mode = mode;
    return YES;
  }
  return NO;
}

static nacre::NativeObjectRef ReadPhotosObjectProperty(id object, const std::string& name) {
  if ([object isKindOfClass:PHPickerConfiguration.class]) {
    // copy 属性：读出来的不是写进去的那个对象，是系统存的副本
    if (name == "filter") {
      return {NacreKeep(((PHPickerConfiguration*)object).filter), "PHPickerFilter"};
    }
    return {};
  }
  if ([object isKindOfClass:PHPickerViewController.class]) {
    // 构造时复制的那一份。量到两次读是同一个对象
    if (name == "configuration") {
      return {NacreKeep(((PHPickerViewController*)object).configuration),
              "PHPickerConfiguration"};
    }
    return {};
  }
  if ([object isKindOfClass:PHPickerResult.class]) {
    if (name == "itemProvider") {
      return {NacreKeep(((PHPickerResult*)object).itemProvider), "NSItemProvider"};
    }
    return {};
  }
  return {};
}

static bool WritePhotosObjectProperty(id object, const std::string& name, id value,
                                      std::string* error) {
  if (![object isKindOfClass:PHPickerConfiguration.class]) return false;
  if (name == "filter") {
    // nil 是「所有类型都显示」
    if (value != nil && ![value isKindOfClass:PHPickerFilter.class]) {
      *error = "filter needs a PHPickerFilter or null";
      return true;
    }
    ((PHPickerConfiguration*)object).filter = (PHPickerFilter*)value;
    return true;
  }
  return false;
}

// ---- 方法：返回标量 ----
static bool PhotosCallMethod(id object, NSString* sel, const NacreArgs& args,
                             std::string* out, std::string* error) {
  if ([object isKindOfClass:PHPickerFilter.class]) {
    // 系统每次给的筛选条件都是新对象，要比较只能靠它
    // nacre:ownership-exempt isEqual: —— 只比较，不持有
    if ([sel isEqualToString:@"isEqual:"]) {
      *out = [object isEqual:args.object(0)] ? "true" : "false";
      return true;
    }
    return false;
  }
  if ([object isKindOfClass:NSItemProvider.class]) {
    NSItemProvider* provider = (NSItemProvider*)object;
    if ([sel isEqualToString:@"hasItemConformingToTypeIdentifier:"]) {
      id type = args.value(0);
      if (![type isKindOfClass:NSString.class]) {
        *error = "hasItemConformingToTypeIdentifier needs a string";
        return true;
      }
      *out = [provider hasItemConformingToTypeIdentifier:type] ? "true" : "false";
      return true;
    }
    if ([sel isEqualToString:@"canLoadObjectOfClass:"]) {
      // 现在只认 UIImage。JS 那一侧已经拦过，这里是原生层自己的校验
      if (![args.value(0) isEqual:@"UIImage"]) {
        *error = "canLoadObjectOfClass supports only UIImage for now";
        return true;
      }
      *out = [provider canLoadObjectOfClass:UIImage.class] ? "true" : "false";
      return true;
    }
    return false;
  }
  return false;
}

// ---- 方法：返回原生对象 ----
// 运行时自己用的：取图兑现之后，part 按号把那张图取走
static bool PhotosCallObject(id object, NSString* sel, const NacreArgs& args,
                             nacre::NativeObjectRef* out, std::string* error) {
  if (![object isKindOfClass:NSItemProvider.class]) return false;
  if ([sel isEqualToString:@"nacre:takeLoadedObject"]) {
    id loaded = TakeParcel(args.value(0));
    if (![loaded isKindOfClass:UIImage.class]) {
      *error = "the loaded object is gone";
      return true;
    }
    *out = {NacreKeep(loaded), "UIImage"};
    return true;
  }
  return false;
}

// ---- 方法：返回原生对象的数组 ----
// 运行时自己用的：选图结束之后，part 按号把那一组结果取走
static bool PhotosCallObjectArray(id object, NSString* sel, const NacreArgs& args,
                                  std::vector<nacre::NativeObjectRef>* out,
                                  std::string* error) {
  if (![object isKindOfClass:PHPickerViewController.class]) return false;
  if ([sel isEqualToString:@"nacre:takeResults"]) {
    id results = TakeParcel(args.value(0));
    if (![results isKindOfClass:NSArray.class]) return true;   // 没有就是空数组
    for (id result in (NSArray*)results) {
      if ([result isKindOfClass:PHPickerResult.class]) {
        out->push_back({NacreKeep(result), "PHPickerResult"});
      }
    }
    return true;
  }
  return false;
}

// ---- 方法：异步 ----
// done 可以在任何线程调，回主线程兑现是核心的事
static bool PhotosCallAsync(id object, const std::string& name, const std::string& argsJSON,
                            const std::vector<void*>& argPtrs, NacreAsyncDone done) {
  if ([object isKindOfClass:NSItemProvider.class]) {
    if (name != "loadObjectOfClass:completionHandler:") return false;
    NSItemProvider* provider = (NSItemProvider*)object;
    if (![provider canLoadObjectOfClass:UIImage.class]) {
      done(Failure(@"NotSupportedError",
                   @"loadObjectOfClass: this item cannot be loaded as a UIImage; check "
                   @"canLoadObjectOfClass(UIImage) first",
                   0, @""));
      return true;
    }
    // 完成回调在系统自己的队列上来。图片先回主线程暂存，再把号兑现给 JS，
    // part 紧接着按号取走（见 Parcels）
    [provider loadObjectOfClass:UIImage.class
              completionHandler:^(id<NSItemProviderReading> loaded, NSError* loadError) {
                dispatch_async(dispatch_get_main_queue(), ^{
                  if (![(id)loaded isKindOfClass:UIImage.class]) {
                    NSString* detail = loadError.localizedDescription;
                    done(Failure(@"NotReadableError",
                                 detail.length
                                     ? [@"loadObjectOfClass: " stringByAppendingString:detail]
                                     : @"loadObjectOfClass failed",
                                 loadError.code, loadError.domain));
                    return;
                  }
                  done(DoneJSON(@(DepositParcel(loaded))));
                });
              }];
    return true;
  }
  if ([object isKindOfClass:PHPhotoLibrary.class]) {
    PHPhotoLibrary* library = (PHPhotoLibrary*)object;
    if (name == "requestAuthorizationForAccessLevel:handler:") {
      id decoded = DecodeJSON(argsJSON);
      id levelName = [decoded isKindOfClass:NSArray.class] ? [(NSArray*)decoded firstObject] : nil;
      PHAccessLevel level;
      if (!PhotoAccessLevelFromName(levelName, &level)) {
        done(Failure(@"TypeMismatchError",
                     @(EnumError(@"accessLevel", levelName, NamesForPhotoAccessLevel()).c_str()),
                     0, @""));
        return true;
      }
      NacreAsyncResult* missing = MissingUsageDescription();
      if (missing != nil) {
        done(missing);
        return true;
      }
      // 已经问过的话系统不再弹提示框，直接把现在的状态给回来
      [PHPhotoLibrary requestAuthorizationForAccessLevel:level
                                                 handler:^(PHAuthorizationStatus status) {
                                                   done(DoneJSON(
                                                       NameForPhotoAuthorizationStatus(status)));
                                                 }];
      return true;
    }
    if (name == "performChanges:completionHandler:") {
      id given = argPtrs.empty() ? nil : (__bridge id)argPtrs[0];
      if (![given isKindOfClass:UIImage.class]) {
        done(Failure(@"TypeMismatchError",
                     @"performChanges: creationRequestForAssetFromImage must be a UIImage", 0,
                     @""));
        return true;
      }
      UIImage* image = (UIImage*)given;
      NacreAsyncResult* missing = MissingUsageDescription();
      if (missing != nil) {
        done(missing);
        return true;
      }
      // 只在已经拿到「添加」权限时才往下走。performChanges 自己也会在没问过
      // 时弹提示框，但它申请的是哪个级别不由这里说了算；part 里先按「添加」
      // 申请过了，到这里还不是已授权就是用户没同意
      PHAuthorizationStatus status =
          [PHPhotoLibrary authorizationStatusForAccessLevel:PHAccessLevelAddOnly];
      if (status != PHAuthorizationStatusAuthorized && status != PHAuthorizationStatusLimited) {
        const BOOL restricted = status == PHAuthorizationStatusRestricted;
        done(Failure(@"NotAllowedError",
                     [NSString stringWithFormat:
                                   @"performChanges: adding to the photo library is not "
                                   @"allowed (authorization status: %@)",
                                   NameForPhotoAuthorizationStatus(status)],
                     restricted ? PHPhotosErrorAccessRestricted : PHPhotosErrorAccessUserDenied,
                     PHPhotosErrorDomain));
        return true;
      }
      // 修改相册的那段代码系统在它自己的队列上执行，不在主线程，所以它不能是
      // 一段 JS：JS 那一侧给的是「要做哪种修改」，这段代码由这里来写
      [library performChanges:^{
        [PHAssetChangeRequest creationRequestForAssetFromImage:image];
      }
            completionHandler:^(BOOL success, NSError* changeError) {
              if (success) {
                NacreAsyncResult* r = [NacreAsyncResult new];
                r.boolValue = YES;
                done(r);
              } else {
                done(PhotosFailure(changeError, @"performChanges"));
              }
            }];
      return true;
    }
    return false;
  }
  return false;
}

// ---- 构造 ----
static bool PhotosConstruct(const std::string& className, const NacreArgs& args,
                            nacre::NativeObjectRef* out, std::string* error) {
  if (className == "PHPickerConfiguration") {
    // init：用系统的相册，结果里不带相册里的标识符。initWithPhotoLibrary:
    // 没有接，它给的标识符要完整的相册权限才用得上
    *out = {NacreKeep([[PHPickerConfiguration alloc] init]), className};
    return true;
  }
  if (className == "PHPickerViewController") {
    id given = args.object(0);
    if (![given isKindOfClass:PHPickerConfiguration.class]) {
      *error = "new PHPickerViewController needs a PHPickerConfiguration";
      return true;
    }
    PHPickerConfiguration* config = (PHPickerConfiguration*)given;
    // 属性那一侧已经拦过负数，这里再看一眼：拿负的上限建选择器，进程直接终止
    if (config.selectionLimit < 0) {
      *error = "new PHPickerViewController: selectionLimit must not be negative";
      return true;
    }
    // 选择器把配置复制了一份，不持有传进来的那个，所以 JS 那一侧不记所有权边
    PHPickerViewController* picker =
        [[PHPickerViewController alloc] initWithConfiguration:config];
    NacrePhotosPickerDelegate* delegate = [NacrePhotosPickerDelegate new];
    objc_setAssociatedObject(picker, kNacrePhotosPickerDelegateKey, delegate,
                             OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    picker.delegate = delegate;
    *out = {NacreKeep(picker), className};
    return true;
  }
  if (className == "NSItemProvider") {
    // initWithObject:。现在只收 UIImage
    id given = args.object(0);
    if (![given isKindOfClass:UIImage.class]) {
      *error = "new NSItemProvider supports only a UIImage for now";
      return true;
    }
    *out = {NacreKeep([[NSItemProvider alloc] initWithObject:(UIImage*)given]), className};
    return true;
  }
  return false;
}

// ---- 类方法：返回标量 ----
static bool PhotosClassCall(const std::string& className, NSString* sel, const NacreArgs& args,
                            std::string* out, std::string* error) {
  if (className != "PHPhotoLibrary") return false;
  if ([sel isEqualToString:@"authorizationStatusForAccessLevel:"]) {
    PHAccessLevel level;
    id name = args.value(0);
    if (!PhotoAccessLevelFromName(name, &level)) {
      if ([name isEqual:@"readWrite"]) {
        *error = "accessLevel \"readWrite\" is not supported: reading the photo library needs "
                 "a different usage description; expected one of: addOnly. To let the user "
                 "choose photos, use PHPickerViewController, which needs no permission";
      } else {
        *error = EnumError(@"accessLevel", name, NamesForPhotoAccessLevel());
      }
      return true;
    }
    // 只是读状态，不会弹提示框
    NSString* status =
        NameForPhotoAuthorizationStatus([PHPhotoLibrary authorizationStatusForAccessLevel:level]);
    *out = status != nil ? std::string("\"") + status.UTF8String + "\"" : "null";
    return true;
  }
  return false;
}

// ---- 类方法：返回原生对象 ----
static bool PhotosClassCallObject(const std::string& className, NSString* sel,
                                  const NacreArgs& args, nacre::NativeObjectRef* out,
                                  std::string* error) {
  if (className != "PHPickerFilter") return false;
  const BOOL any = [sel isEqualToString:@"anyFilterMatchingSubfilters:"];
  const BOOL all = [sel isEqualToString:@"allFilterMatchingSubfilters:"];
  if (any || all) {
    // 子条件一项一个参数
    NSMutableArray<PHPickerFilter*>* subfilters = [NSMutableArray array];
    const NSUInteger count = args.values.count;
    for (NSUInteger i = 0; i < count; i++) {
      id given = args.object(i);
      if (![given isKindOfClass:PHPickerFilter.class]) {
        *error = [NSString stringWithFormat:@"subfilters[%lu] must be a PHPickerFilter",
                                            (unsigned long)i]
                     .UTF8String;
        return true;
      }
      [subfilters addObject:given];
    }
    // 空数组在系统里是断言失败，进程直接终止，接不住
    if (subfilters.count == 0) {
      *error = "subfilters needs at least one PHPickerFilter";
      return true;
    }
    // nacre:ownership-exempt anyFilterMatchingSubfilters: —— 返回一个新的筛选条件，调用方不持有子条件
    // nacre:ownership-exempt allFilterMatchingSubfilters: —— 同上
    PHPickerFilter* filter = any ? [PHPickerFilter anyFilterMatchingSubfilters:subfilters]
                                 : [PHPickerFilter allFilterMatchingSubfilters:subfilters];
    *out = {NacreKeep(filter), "PHPickerFilter"};
    return true;
  }
  if ([sel isEqualToString:@"notFilterOfSubfilter:"]) {
    id given = args.object(0);
    if (![given isKindOfClass:PHPickerFilter.class]) {
      *error = "notFilterOfSubfilter needs a PHPickerFilter";
      return true;
    }
    // nacre:ownership-exempt notFilterOfSubfilter: —— 返回一个新的筛选条件，调用方不持有子条件
    *out = {NacreKeep([PHPickerFilter notFilterOfSubfilter:(PHPickerFilter*)given]),
            "PHPickerFilter"};
    return true;
  }
  return false;
}

// ---- 类级的属性 ----
static nacre::NativeObjectRef PhotosClassObject(const std::string& className,
                                                const std::string& name) {
  if (className == "PHPhotoLibrary") {
    if (name == "sharedPhotoLibrary") {
      return {NacreKeep(PHPhotoLibrary.sharedPhotoLibrary), "PHPhotoLibrary"};
    }
    return {};
  }
  if (className != "PHPickerFilter") return {};
  PHPickerFilter* filter = nil;
  if (name == "imagesFilter") filter = PHPickerFilter.imagesFilter;
  else if (name == "videosFilter") filter = PHPickerFilter.videosFilter;
  else if (name == "livePhotosFilter") filter = PHPickerFilter.livePhotosFilter;
  else if (name == "depthEffectPhotosFilter") filter = PHPickerFilter.depthEffectPhotosFilter;
  else if (name == "burstsFilter") filter = PHPickerFilter.burstsFilter;
  else if (name == "panoramasFilter") filter = PHPickerFilter.panoramasFilter;
  else if (name == "screenshotsFilter") filter = PHPickerFilter.screenshotsFilter;
  else if (name == "screenRecordingsFilter") filter = PHPickerFilter.screenRecordingsFilter;
  else if (name == "cinematicVideosFilter") filter = PHPickerFilter.cinematicVideosFilter;
  else if (name == "slomoVideosFilter") filter = PHPickerFilter.slomoVideosFilter;
  else if (name == "timelapseVideosFilter") filter = PHPickerFilter.timelapseVideosFilter;
  else if (name == "spatialMediaFilter") filter = PHPickerFilter.spatialMediaFilter;
  if (filter == nil) return {};
  return {NacreKeep(filter), "PHPickerFilter"};
}

// ---- 订阅 ----
// 只认领选择器自己的那一个事件。委托从构造起就装着，这里没有要开关的东西。
// 别的名字（页面的关闭事件、出现和消失、运行时自己订的 @dismissed）一律
// 不认领，留给核心和别的域：选择器是一个普通的页面
static NacreSubscribed PhotosSetSubscription(id object, NSString* type, BOOL on, std::string* error) {
  if (![object isKindOfClass:PHPickerViewController.class]) return false;
  return [type isEqualToString:kPickedEventName];
}

}  // namespace nacre_bridge

// ---- 登记 ----
//
// +load 在 framework 被加载时自动调用：项目装了 @nacrejs/photos，生成的工程就
// 嵌了这个 framework，宿主不用写任何代码。
@interface NacrePhotosRegistration : NSObject
@end

@implementation NacrePhotosRegistration
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "photos";
  d.classes = {PHPickerFilter.class,   PHPickerConfiguration.class,
               PHPickerViewController.class, PHPickerResult.class,
               NSItemProvider.class,   PHPhotoLibrary.class};
  d.read = nacre_bridge::ReadPhotosProperty;
  d.write = nacre_bridge::WritePhotosProperty;
  d.readObject = nacre_bridge::ReadPhotosObjectProperty;
  d.writeObject = nacre_bridge::WritePhotosObjectProperty;
  d.call = nacre_bridge::PhotosCallMethod;
  d.callObject = nacre_bridge::PhotosCallObject;
  d.callObjectArray = nacre_bridge::PhotosCallObjectArray;
  d.callAsync = nacre_bridge::PhotosCallAsync;
  d.construct = nacre_bridge::PhotosConstruct;
  d.classCall = nacre_bridge::PhotosClassCall;
  d.classCallObject = nacre_bridge::PhotosClassCallObject;
  d.classObject = nacre_bridge::PhotosClassObject;
  d.subscribe = nacre_bridge::PhotosSetSubscription;
  nacre_bridge::NacreRegisterDomain(d);
  // JS 那一半（六个类）在这个 framework 自己的 Builtin/parts/ 下
  nacre_bridge::NacreRegisterBuiltinParts(self);
}
@end
