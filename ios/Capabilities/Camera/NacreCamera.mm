// 拍照：系统的拍照界面 UIImagePickerController。只做「相机」这一种来源、
// 只拍照片。
//
// 这是一个能力包（@nacrejs/camera），不在核心里：用它的 App 要在自己的
// Info.plist 里写 NSCameraUsageDescription，不是每个 App 都该被要求写这句话。
// 所以这个文件只用给能力包的那个头，不碰核心的内部头 NacreBridge.h。
//
// 它是一个页面，呈现和关闭走核心里现成的 presentViewController /
// dismissViewController，这里不碰。这个文件管四件事：
//   - 类方法：相机这种来源可不可用、有哪个摄像头、有没有闪光灯
//   - 构造，和四个属性（sourceType / allowsEditing / cameraDevice /
//     cameraFlashMode）
//   - 委托的两个方法 → 两个事件（pick / cancel）
//   - 这个页面上的事件订阅全部在这里认领（理由见 CameraSetSubscription）
//
// 没做的：从相册选图（另一个包）、录视频、自己画取景界面（cameraOverlayView /
// showsCameraControls / takePicture）。见 docs/internals/camera.md
#import <Nacre/NacreExtension.h>

#import <UIKit/UIKit.h>
#import <objc/runtime.h>

// 关联对象的 key：UIImagePickerController → NacreImagePickerDelegate。
// picker.delegate 是 weak，所以委托对象由关联对象来持有
static const void* kNacreImagePickerDelegateKey = &kNacreImagePickerDelegateKey;

// 拍到了（用户在拍照界面上点了「使用照片」）。名字照委托方法
// imagePickerController:didFinishPickingMediaWithInfo:，和导航的 show、
// 列表的 itemselect 是同一个取法
static NSString* const kNacreCameraFinishEvent = @"pick";
// 用户点了取消。imagePickerControllerDidCancel:
static NSString* const kNacreCameraCancelEvent = @"cancel";
// 运行时内部的事件：拍到了。JS 那一侧（camera.js）收到之后把图片取走，再派发
// 上面那个对外的事件。分两步是因为事件的负载过桥是 JSON，带不了图片
static NSString* const kNacreCameraPickedInternalEvent = @"@imagepicked";

// 拍照界面的委托。构造时就装上，一直装着：
//
// 头文件原话：The picker does not dismiss itself; the client dismisses it in
// these callbacks。所以两个方法都实现，关不关由 JS 的监听器决定——那是
// 「App 做什么」，不归原生层定。
//
// 协议里带 UINavigationControllerDelegate 是属性的类型要求的（UIImagePickerController
// 继承自 UINavigationController，delegate 是同一个槽位），导航的方法一个都不实现
@interface NacreImagePickerDelegate
    : NSObject <UINavigationControllerDelegate, UIImagePickerControllerDelegate>
/// 拍到了、JS 还没取走的结果：号 → 系统给的 info 字典（里面是 UIImage）。
/// 事件延后一轮才到 JS，这段时间图片由这里拿着；JS 取完就删
@property(nonatomic, strong) NSMutableDictionary<NSNumber*, NSDictionary*>* pending;
@property(nonatomic) NSInteger lastToken;
@end

@implementation NacreImagePickerDelegate

- (instancetype)init {
  if ((self = [super init])) _pending = [NSMutableDictionary dictionary];
  return self;
}

- (void)imagePickerController:(UIImagePickerController*)picker
    didFinishPickingMediaWithInfo:(NSDictionary<UIImagePickerControllerInfoKey, id>*)info {
  NSNumber* token = @(++_lastToken);
  self.pending[token] = info ?: @{};
  // 裁剪框是数，直接跟着事件走；图片留在 pending 里等 JS 来取。
  // 没开 allowsEditing 时 info 里没有这一项
  id crop = NSNull.null;
  NSValue* boxed = info[UIImagePickerControllerCropRect];
  if ([boxed isKindOfClass:NSValue.class]) {
    const CGRect rect = boxed.CGRectValue;
    if (isfinite(rect.origin.x) && isfinite(rect.origin.y) && isfinite(rect.size.width) &&
        isfinite(rect.size.height)) {
      crop = @{
        @"x": @(rect.origin.x),
        @"y": @(rect.origin.y),
        @"width": @(rect.size.width),
        @"height": @(rect.size.height),
      };
    }
  }
  NSData* data = [NSJSONSerialization dataWithJSONObject:@{@"token": token, @"cropRect": crop}
                                                 options:0
                                                   error:nil];
  NSString* json = data != nil ? [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding]
                               : nil;
  nacre_bridge::NacreEmitEventWithJSON(picker, "UIImagePickerController",
                                       kNacreCameraPickedInternalEvent, json);
}

- (void)imagePickerControllerDidCancel:(UIImagePickerController*)picker {
  nacre_bridge::NacreEmitEvent(picker, "UIImagePickerController", kNacreCameraCancelEvent);
}

@end

namespace nacre_bridge {

// 三个值都列，因为 sourceType 读出来和 isSourceTypeAvailable 问的都是事实：
// 刚建好的拍照界面，系统给的默认来源就是 photoLibrary。**写**只收 camera，
// 见 WriteCameraProperty
NACRE_ENUM_MAP(ImagePickerSourceType, UIImagePickerControllerSourceType,
               @"photoLibrary": @(UIImagePickerControllerSourceTypePhotoLibrary),
               @"camera": @(UIImagePickerControllerSourceTypeCamera),
               @"savedPhotosAlbum": @(UIImagePickerControllerSourceTypeSavedPhotosAlbum))

NACRE_ENUM_MAP(ImagePickerCameraDevice, UIImagePickerControllerCameraDevice,
               @"rear": @(UIImagePickerControllerCameraDeviceRear),
               @"front": @(UIImagePickerControllerCameraDeviceFront))

NACRE_ENUM_MAP(ImagePickerCameraFlashMode, UIImagePickerControllerCameraFlashMode,
               @"off": @(UIImagePickerControllerCameraFlashModeOff),
               @"auto": @(UIImagePickerControllerCameraFlashModeAuto),
               @"on": @(UIImagePickerControllerCameraFlashModeOn))

// 页面出现和消失的四个事件（核心的 appearance 域）。这四个名字放行给它
static BOOL IsAppearanceEventName(NSString* type) {
  return [@[@"beforeappear", @"appear", @"beforedisappear", @"disappear"]
      containsObject:type];
}

// JS 给的布尔。转换在 JS 一侧做完了（toBoolean），这里只校验：过桥是 JSON，
// true / false 解出来就是这两个单例，别的都不是布尔
static bool BoolFromJS(id value, NSString* what, BOOL* out, std::string* error) {
  if (value == (__bridge id)kCFBooleanTrue) {
    *out = YES;
    return true;
  }
  if (value == (__bridge id)kCFBooleanFalse) {
    *out = NO;
    return true;
  }
  *error = [NSString stringWithFormat:@"%@ must be a boolean", what].UTF8String;
  return false;
}

// 系统在读写属性时抛了 ObjC 异常。核心的入口有保底，但读属性那条通道没有
// 报错的出口（保底之后 JS 拿到的是空值）；而这几个属性在哪些硬件状态下会抛
// 没有量全——模拟器上相机这种来源可用、摄像头却一个都没有。所以在这里就地
// 接住，变成一句带着系统原话的报错
static NSString* SystemRefusal(NSString* key, NSException* e) {
  return [NSString stringWithFormat:@"%@: the system refused (%@: %@)", key, e.name,
                                    e.reason ?: @"no reason given"];
}

static std::string CameraOnlyError(NSString* key) {
  return [NSString stringWithFormat:
                       @"%@ is only available when sourceType is \"camera\"; set sourceType first",
                       key]
      .UTF8String;
}

// ---- 类方法：这台设备能做什么 ----
static bool CameraClassCall(const std::string& className, NSString* sel, const NacreArgs& args,
                            std::string* out, std::string* error) {
  if (className != "UIImagePickerController") return false;
  if ([sel isEqualToString:@"isSourceTypeAvailable:"]) {
    UIImagePickerControllerSourceType type;
    if (!ImagePickerSourceTypeFromName(args.value(0), &type)) {
      *error = EnumError(@"isSourceTypeAvailable", args.value(0),
                         NamesForImagePickerSourceType());
      return true;
    }
    *out = [UIImagePickerController isSourceTypeAvailable:type] ? "true" : "false";
    return true;
  }
  if ([sel isEqualToString:@"isCameraDeviceAvailable:"]) {
    UIImagePickerControllerCameraDevice device;
    if (!ImagePickerCameraDeviceFromName(args.value(0), &device)) {
      *error = EnumError(@"isCameraDeviceAvailable", args.value(0),
                         NamesForImagePickerCameraDevice());
      return true;
    }
    *out = [UIImagePickerController isCameraDeviceAvailable:device] ? "true" : "false";
    return true;
  }
  if ([sel isEqualToString:@"isFlashAvailableForCameraDevice:"]) {
    UIImagePickerControllerCameraDevice device;
    if (!ImagePickerCameraDeviceFromName(args.value(0), &device)) {
      *error = EnumError(@"isFlashAvailableForCameraDevice", args.value(0),
                         NamesForImagePickerCameraDevice());
      return true;
    }
    *out = [UIImagePickerController isFlashAvailableForCameraDevice:device] ? "true" : "false";
    return true;
  }
  return false;
}

// ---- 构造 ----
// ＝ [[UIImagePickerController alloc] init]。和硬件无关，哪台设备上都建得
// 出来：来源这时是系统的默认值 photoLibrary，要切到相机才是拍照界面
static bool CameraConstruct(const std::string& className, const NacreArgs& args,
                            nacre::NativeObjectRef* out, std::string* error) {
  if (className != "UIImagePickerController") return false;
  UIImagePickerController* picker = [[UIImagePickerController alloc] init];
  NacreImagePickerDelegate* hop = [NacreImagePickerDelegate new];
  objc_setAssociatedObject(picker, kNacreImagePickerDelegateKey, hop,
                           OBJC_ASSOCIATION_RETAIN_NONATOMIC);
  picker.delegate = hop;
  *out = {NacreKeep(picker), className};
  return true;
}

// ---- 属性 ----
// cameraDevice 和 cameraFlashMode 只在来源是相机时有意义（头文件：camera
// additions available only if sourceType is …Camera）。读的通道没有报错的
// 出口，所以用返回值说话，JS 那一侧据此抛：来源不是相机给 null；系统抛了
// 异常给 { error }
static id ReadCameraProperty(id object, NSString* key) {
  if (![object isKindOfClass:UIImagePickerController.class]) return nil;
  UIImagePickerController* picker = (UIImagePickerController*)object;
  if ([key isEqualToString:@"sourceType"]) {
    return NameForImagePickerSourceType(picker.sourceType) ?: NSNull.null;
  }
  if ([key isEqualToString:@"allowsEditing"]) return @(picker.allowsEditing);
  const BOOL isCamera = picker.sourceType == UIImagePickerControllerSourceTypeCamera;
  if ([key isEqualToString:@"cameraDevice"]) {
    if (!isCamera) return NSNull.null;
    @try {
      return NameForImagePickerCameraDevice(picker.cameraDevice) ?: NSNull.null;
    } @catch (NSException* e) {
      return @{@"error": SystemRefusal(key, e)};
    }
  }
  if ([key isEqualToString:@"cameraFlashMode"]) {
    if (!isCamera) return NSNull.null;
    @try {
      return NameForImagePickerCameraFlashMode(picker.cameraFlashMode) ?: NSNull.null;
    } @catch (NSException* e) {
      return @{@"error": SystemRefusal(key, e)};
    }
  }
  return nil;
}

static BOOL WriteCameraProperty(id object, NSString* key, id value, std::string* error) {
  if (![object isKindOfClass:UIImagePickerController.class]) return NO;
  UIImagePickerController* picker = (UIImagePickerController*)object;
  if ([key isEqualToString:@"sourceType"]) {
    UIImagePickerControllerSourceType type;
    // 能写的只有 camera，所以写错时列出来的也只有它
    if (!ImagePickerSourceTypeFromName(value, &type)) {
      *error = EnumError(key, value, @"camera");
      return YES;
    }
    // 另外两种是从相册选图。那是另一个包的事；系统也已经把这两个值标成
    // 将废弃（头文件：Will be removed in a future release, use PHPicker）
    if (type != UIImagePickerControllerSourceTypeCamera) {
      *error = [NSString stringWithFormat:
                             @"sourceType \"%@\" is not supported: @nacrejs/camera only takes "
                             @"photos with the camera (sourceType \"camera\"). Picking from the "
                             @"photo library is a separate package, @nacrejs/photos",
                             value]
                   .UTF8String;
      return YES;
    }
    // 来源不可用时系统在这一句抛 NSInvalidArgumentException（Apple 文档的
    // 说法，没有量到：模拟器上相机这种来源是可用的，尽管它一个摄像头都没有）。
    // 先查，给一句说得清原因的话；查过了系统还是抛，就地接住
    if (![UIImagePickerController isSourceTypeAvailable:type]) {
      *error = "sourceType \"camera\" is not available on this device. Check "
               "UIImagePickerController.isSourceTypeAvailable(\"camera\") first";
      return YES;
    }
    @try {
      picker.sourceType = type;
    } @catch (NSException* e) {
      *error = SystemRefusal(key, e).UTF8String;
    }
    return YES;
  }
  if ([key isEqualToString:@"allowsEditing"]) {
    BOOL allows = NO;
    if (BoolFromJS(value, key, &allows, error)) picker.allowsEditing = allows;
    return YES;
  }
  if ([key isEqualToString:@"cameraDevice"]) {
    if (picker.sourceType != UIImagePickerControllerSourceTypeCamera) {
      *error = CameraOnlyError(key);
      return YES;
    }
    UIImagePickerControllerCameraDevice device;
    if (!ImagePickerCameraDeviceFromName(value, &device)) {
      *error = EnumError(key, value, NamesForImagePickerCameraDevice());
      return YES;
    }
    if (![UIImagePickerController isCameraDeviceAvailable:device]) {
      *error = [NSString stringWithFormat:
                             @"cameraDevice \"%@\" is not available on this device. Check "
                             @"UIImagePickerController.isCameraDeviceAvailable(\"%@\") first",
                             value, value]
                   .UTF8String;
      return YES;
    }
    @try {
      picker.cameraDevice = device;
    } @catch (NSException* e) {
      *error = SystemRefusal(key, e).UTF8String;
    }
    return YES;
  }
  if ([key isEqualToString:@"cameraFlashMode"]) {
    if (picker.sourceType != UIImagePickerControllerSourceTypeCamera) {
      *error = CameraOnlyError(key);
      return YES;
    }
    UIImagePickerControllerCameraFlashMode mode;
    if (!ImagePickerCameraFlashModeFromName(value, &mode)) {
      *error = EnumError(key, value, NamesForImagePickerCameraFlashMode());
      return YES;
    }
    @try {
      picker.cameraFlashMode = mode;
    } @catch (NSException* e) {
      *error = SystemRefusal(key, e).UTF8String;
    }
    return YES;
  }
  return NO;
}

// ---- 运行时自己用的两个方法：JS 来取拍到的图片 ----
//
// 拍到之后图片留在委托对象的 pending 里（见上），事件只带一个号。JS 那一侧
// 收到内部事件之后按号来取：原图、裁剪后的图各取一次，取完把这一条删掉。
static NSDictionary* PendingResult(id object, id token) {
  if (![token isKindOfClass:NSNumber.class]) return nil;
  NacreImagePickerDelegate* hop = objc_getAssociatedObject(object, kNacreImagePickerDelegateKey);
  return hop.pending[(NSNumber*)token];
}

// [号, 'original' | 'edited'] → UIImage，没有就是 null
static bool CameraCallObject(id object, NSString* sel, const NacreArgs& args,
                             nacre::NativeObjectRef* out, std::string* error) {
  if (![object isKindOfClass:UIImagePickerController.class]) return false;
  if ([sel isEqualToString:@"nacre:takeImage:"]) {
    NSDictionary* info = PendingResult(object, args.value(0));
    id which = args.value(1);
    id image = nil;
    if ([which isEqual:@"original"]) image = info[UIImagePickerControllerOriginalImage];
    if ([which isEqual:@"edited"]) image = info[UIImagePickerControllerEditedImage];
    if (![image isKindOfClass:UIImage.class]) image = nil;
    *out = {NacreKeep(image), "UIImage"};
    return true;
  }
  return false;
}

// [号]：这一条取完了，放开那两张图
static bool CameraCallMethod(id object, NSString* sel, const NacreArgs& args, std::string* out,
                             std::string* error) {
  if (![object isKindOfClass:UIImagePickerController.class]) return false;
  if ([sel isEqualToString:@"nacre:dropResult:"]) {
    *out = "null";
    id token = args.value(0);
    if ([token isKindOfClass:NSNumber.class]) {
      NacreImagePickerDelegate* hop =
          objc_getAssociatedObject(object, kNacreImagePickerDelegateKey);
      [hop.pending removeObjectForKey:(NSNumber*)token];
    }
    return true;
  }
  return false;
}

// ---- 订阅 ----
//
// 拍照界面上的订阅**全部在这里认领**，落到核心去的只有页面出现和消失的那
// 四个名字。理由是它在 ObjC 里是 UINavigationController 的子类，核心按原生
// 的类认它：
//
//   - 导航的事件（beforeshow / show）核心会接，接法是 nav.delegate = 它自己
//     的对象。而拍照界面的 delegate 和导航的是同一个槽位，那一写就把上面
//     装的委托挤掉了，之后拍到的照片和取消都到不了 JS。所以这两个名字在
//     这里拒掉
//   - 模态的三个事件（beforedismiss / dismiss / dismissattempt）和运行时
//     自己订的 @dismissed，核心的接法是给这一页的 presentationController 挂
//     委托。系统的页面不一定许动这个委托（提示框就不许，一动就抛，见
//     docs/internals/alerts.md）；拍照界面许不许没有量到。
//     所以不碰：@dismissed 认领下来什么都不做，那三个名字拒掉。
//     不需要它们也说得通：系统不会自己关掉拍照界面（见上面委托的注释），
//     它只会被 JS 的 dismissViewController() 关掉，而那条路上核心自己会按
//     原生的真相放开「呈现者持有它」那条边
static NacreSubscribed CameraSetSubscription(id object, NSString* type, BOOL on, std::string* error) {
  if (![object isKindOfClass:UIImagePickerController.class]) return false;
  // 委托构造时就装好了，一直在发；这里没有要开关的东西
  if ([type isEqualToString:kNacreCameraFinishEvent] ||
      [type isEqualToString:kNacreCameraCancelEvent]) {
    return true;
  }
  if ([type isEqualToString:@"@dismissed"]) return true;
  if (IsAppearanceEventName(type)) return false;
  return NacreSubscribed::UnknownEvent;
}

}  // namespace nacre_bridge

// ---- 登记 ----
//
// +load 在类被加载时自动调用：framework 被嵌进 App 就一定会走到，宿主不用
// 写任何代码。放在文件末尾是因为要取上面那些函数的地址
@interface NacreCameraRegistration : NSObject
@end

@implementation NacreCameraRegistration
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "camera";
  d.classes = {UIImagePickerController.class};
  d.read = nacre_bridge::ReadCameraProperty;
  d.write = nacre_bridge::WriteCameraProperty;
  d.call = nacre_bridge::CameraCallMethod;
  d.callObject = nacre_bridge::CameraCallObject;
  d.construct = nacre_bridge::CameraConstruct;
  d.classCall = nacre_bridge::CameraClassCall;
  d.subscribe = nacre_bridge::CameraSetSubscription;
  nacre_bridge::NacreRegisterDomain(d);
  // JS 那一半（UIImagePickerController 类）在这个 framework 自己的
  // Builtin/parts/ 下
  nacre_bridge::NacreRegisterBuiltinParts(self);
}
@end
