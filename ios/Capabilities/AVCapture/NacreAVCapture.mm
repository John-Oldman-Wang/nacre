// 相机取景和扫码：AVCaptureSession 一组（@nacrejs/av-capture）。
//
// 这是一个能力包，不在核心里：用它的 App 要在自己的 Info.plist 里写
// NSCameraUsageDescription。所以这个文件只用给能力包的那个头，不碰核心的
// 内部头 NacreBridge.h。
//
// 接的类和它们在 JS 里的样子：
//   AVCaptureDevice             不能 new。类方法问授权、找摄像头；实例上是手电筒、
//                               变焦、对焦。写属性要先锁，没锁系统抛 NSGenericException，
//                               这里接住转成 JS 的 TypeError
//   AVCaptureDeviceInput        new AVCaptureDeviceInput(device)
//   AVCaptureSession            加减输入输出、画质、开和停（在后台串行队列上开和停，
//                               做完兑现）；五个通知转成五个事件
//   AVCaptureMetadataOutput     识别的种类、范围；委托的回调转成 detect 事件
//   AVCaptureVideoPreviewLayer  CALayer 的子类：会话、画面怎么填、四个坐标换算
//
// 识别出来的 AVMetadataObject 在 JS 那边是只读的值，不是原生对象的包装（字段是
// 系统一次给定的，之后不变）。但取景图层的 transformedMetadataObjectForMetadataObject:
// 要的是那个原生对象，所以这边把一帧识别出来的对象装进一个 NacreMetadataBatch，
// 随内部事件 @detect 交给 JS；JS 的值记着它从哪个批次的第几个来，换算时交回来。
// 批次由 JS 的值拿着，值被回收了批次才放开。
//
// 明确不做：拍照、录像、逐帧的像素输出、麦克风、多摄像头、AVCaptureConnection。
#import <Nacre/NacreExtension.h>

#import <AVFoundation/AVFoundation.h>
#import <UIKit/UIKit.h>
#import <objc/runtime.h>

// ---- 一帧识别出来的对象 ----
@interface NacreMetadataBatch : NSObject
@property(nonatomic, copy) NSArray<AVMetadataObject*>* objects;
@end
@implementation NacreMetadataBatch
@end

// 类方法 requestAccessForMediaType: 是异步的，而异步的通道要一个对象。JS 那边
// 拿它的包装当句柄，不暴露出去
@interface NacreAVCaptureAccess : NSObject
+ (instancetype)shared;
@end
@implementation NacreAVCaptureAccess
+ (instancetype)shared {
  static NacreAVCaptureAccess* shared;
  static dispatch_once_t once;
  dispatch_once(&once, ^{ shared = [NacreAVCaptureAccess new]; });
  return shared;
}
@end

namespace nacre_bridge {

NACRE_ENUM_MAP(CaptureAuthorizationStatus, AVAuthorizationStatus,
               @"notDetermined": @(AVAuthorizationStatusNotDetermined),
               @"restricted": @(AVAuthorizationStatusRestricted),
               @"denied": @(AVAuthorizationStatusDenied),
               @"authorized": @(AVAuthorizationStatusAuthorized))
NACRE_ENUM_MAP(CaptureDevicePosition, AVCaptureDevicePosition,
               @"unspecified": @(AVCaptureDevicePositionUnspecified),
               @"back": @(AVCaptureDevicePositionBack),
               @"front": @(AVCaptureDevicePositionFront))
NACRE_ENUM_MAP(CaptureTorchMode, AVCaptureTorchMode,
               @"off": @(AVCaptureTorchModeOff),
               @"on": @(AVCaptureTorchModeOn),
               @"auto": @(AVCaptureTorchModeAuto))
NACRE_ENUM_MAP(CaptureFocusMode, AVCaptureFocusMode,
               @"locked": @(AVCaptureFocusModeLocked),
               @"autoFocus": @(AVCaptureFocusModeAutoFocus),
               @"continuousAutoFocus": @(AVCaptureFocusModeContinuousAutoFocus))
NACRE_ENUM_MAP(CaptureRangeRestriction, AVCaptureAutoFocusRangeRestriction,
               @"none": @(AVCaptureAutoFocusRangeRestrictionNone),
               @"near": @(AVCaptureAutoFocusRangeRestrictionNear),
               @"far": @(AVCaptureAutoFocusRangeRestrictionFar))
NACRE_ENUM_MAP(CaptureInterruptionReason, AVCaptureSessionInterruptionReason,
               @"videoDeviceNotAvailableInBackground":
                   @(AVCaptureSessionInterruptionReasonVideoDeviceNotAvailableInBackground),
               @"audioDeviceInUseByAnotherClient":
                   @(AVCaptureSessionInterruptionReasonAudioDeviceInUseByAnotherClient),
               @"videoDeviceInUseByAnotherClient":
                   @(AVCaptureSessionInterruptionReasonVideoDeviceInUseByAnotherClient),
               @"videoDeviceNotAvailableWithMultipleForegroundApps":
                   @(AVCaptureSessionInterruptionReasonVideoDeviceNotAvailableWithMultipleForegroundApps),
               @"videoDeviceNotAvailableDueToSystemPressure":
                   @(AVCaptureSessionInterruptionReasonVideoDeviceNotAvailableDueToSystemPressure),
               @"sensitiveContentMitigationActivated":
                   @(AVCaptureSessionInterruptionReasonSensitiveContentMitigationActivated))

// ---- 值是 NSString 常量的枚举：JS 的名字 ↔ 系统的常量 ----
// 名字照规矩：常量去掉类型前缀、开头那一段缩写整段小写（QRCode → qrCode）。
// iOS 27 起才有的常量两层都包：SDK 认不认识、跑的机器有没有

static NSDictionary<NSString*, NSString*>* DeviceTypeTable(void) {
  static NSDictionary<NSString*, NSString*>* table;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    NSMutableDictionary<NSString*, NSString*>* t = [@{
      @"builtInWideAngleCamera": AVCaptureDeviceTypeBuiltInWideAngleCamera,
      @"builtInTelephotoCamera": AVCaptureDeviceTypeBuiltInTelephotoCamera,
      @"builtInUltraWideCamera": AVCaptureDeviceTypeBuiltInUltraWideCamera,
      @"builtInDualCamera": AVCaptureDeviceTypeBuiltInDualCamera,
      @"builtInDualWideCamera": AVCaptureDeviceTypeBuiltInDualWideCamera,
      @"builtInTripleCamera": AVCaptureDeviceTypeBuiltInTripleCamera,
      @"builtInTrueDepthCamera": AVCaptureDeviceTypeBuiltInTrueDepthCamera,
      @"builtInLiDARDepthCamera": AVCaptureDeviceTypeBuiltInLiDARDepthCamera,
      @"continuityCamera": AVCaptureDeviceTypeContinuityCamera,
      @"external": AVCaptureDeviceTypeExternal,
    } mutableCopy];
#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 270100
    if (@available(iOS 27.1, *)) {
      t[@"builtInOuterUltraWideCamera"] = AVCaptureDeviceTypeBuiltInOuterUltraWideCamera;
      t[@"builtInInnerUltraWideCamera"] = AVCaptureDeviceTypeBuiltInInnerUltraWideCamera;
    }
#endif
    table = t;
  });
  return table;
}

static NSDictionary<NSString*, NSString*>* PresetTable(void) {
  static NSDictionary<NSString*, NSString*>* table;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    table = @{
      @"photo": AVCaptureSessionPresetPhoto,
      @"high": AVCaptureSessionPresetHigh,
      @"medium": AVCaptureSessionPresetMedium,
      @"low": AVCaptureSessionPresetLow,
      @"352x288": AVCaptureSessionPreset352x288,
      @"640x480": AVCaptureSessionPreset640x480,
      @"1280x720": AVCaptureSessionPreset1280x720,
      @"1920x1080": AVCaptureSessionPreset1920x1080,
      @"3840x2160": AVCaptureSessionPreset3840x2160,
      @"iFrame960x540": AVCaptureSessionPresetiFrame960x540,
      @"iFrame1280x720": AVCaptureSessionPresetiFrame1280x720,
      @"inputPriority": AVCaptureSessionPresetInputPriority,
    };
  });
  return table;
}

static NSDictionary<NSString*, NSString*>* MetadataTypeTable(void) {
  static NSDictionary<NSString*, NSString*>* table;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    NSMutableDictionary<NSString*, NSString*>* t = [@{
      @"qrCode": AVMetadataObjectTypeQRCode,
      @"microQRCode": AVMetadataObjectTypeMicroQRCode,
      @"aztecCode": AVMetadataObjectTypeAztecCode,
      @"dataMatrixCode": AVMetadataObjectTypeDataMatrixCode,
      @"pdf417Code": AVMetadataObjectTypePDF417Code,
      @"microPDF417Code": AVMetadataObjectTypeMicroPDF417Code,
      @"code128Code": AVMetadataObjectTypeCode128Code,
      @"code39Code": AVMetadataObjectTypeCode39Code,
      @"code39Mod43Code": AVMetadataObjectTypeCode39Mod43Code,
      @"code93Code": AVMetadataObjectTypeCode93Code,
      @"codabarCode": AVMetadataObjectTypeCodabarCode,
      @"ean13Code": AVMetadataObjectTypeEAN13Code,
      @"ean8Code": AVMetadataObjectTypeEAN8Code,
      @"upceCode": AVMetadataObjectTypeUPCECode,
      @"interleaved2of5Code": AVMetadataObjectTypeInterleaved2of5Code,
      @"itf14Code": AVMetadataObjectTypeITF14Code,
      @"gs1DataBarCode": AVMetadataObjectTypeGS1DataBarCode,
      @"gs1DataBarExpandedCode": AVMetadataObjectTypeGS1DataBarExpandedCode,
      @"gs1DataBarLimitedCode": AVMetadataObjectTypeGS1DataBarLimitedCode,
      @"face": AVMetadataObjectTypeFace,
      @"humanBody": AVMetadataObjectTypeHumanBody,
      @"humanFullBody": AVMetadataObjectTypeHumanFullBody,
      @"catHead": AVMetadataObjectTypeCatHead,
      @"catBody": AVMetadataObjectTypeCatBody,
      @"dogHead": AVMetadataObjectTypeDogHead,
      @"dogBody": AVMetadataObjectTypeDogBody,
      @"salientObject": AVMetadataObjectTypeSalientObject,
    } mutableCopy];
#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 270000
    if (@available(iOS 27.0, *)) {
      t[@"focusTrackedObject"] = AVMetadataObjectTypeFocusTrackedObject;
      t[@"cinematicVideoMetadata"] = AVMetadataObjectTypeCinematicVideoMetadata;
    }
#endif
    table = t;
  });
  return table;
}

static NSDictionary<NSString*, NSString*>* GravityTable(void) {
  static NSDictionary<NSString*, NSString*>* table;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    table = @{
      @"resize": AVLayerVideoGravityResize,
      @"resizeAspect": AVLayerVideoGravityResizeAspect,
      @"resizeAspectFill": AVLayerVideoGravityResizeAspectFill,
    };
  });
  return table;
}

static NSString* ConstantNamed(NSDictionary<NSString*, NSString*>* table, id name) {
  return [name isKindOfClass:NSString.class] ? table[name] : nil;
}

static NSString* NameOfConstant(NSDictionary<NSString*, NSString*>* table, NSString* value) {
  for (NSString* name in table) {
    if ([table[name] isEqualToString:value]) return name;
  }
  return nil;
}

static NSString* ChoicesOf(NSDictionary<NSString*, NSString*>* table) {
  return [[table.allKeys sortedArrayUsingSelector:@selector(compare:)] componentsJoinedByString:@", "];
}

// 系统常量的数组 → 名字的数组。这个运行时还不认识的（以后的系统新加的）不给
static NSArray<NSString*>* NamesOfConstants(NSDictionary<NSString*, NSString*>* table,
                                            NSArray<NSString*>* values) {
  NSMutableArray<NSString*>* names = [NSMutableArray array];
  for (NSString* value in values) {
    NSString* name = NameOfConstant(table, value);
    if (name != nil) [names addObject:name];
  }
  return names;
}

// 这个包只做视频。别的媒体类型（audio、muxed……）一律报错
static bool RequireVideo(id mediaType, NSString* what, std::string* error) {
  if ([mediaType isKindOfClass:NSString.class] && [mediaType isEqualToString:@"video"]) return true;
  *error = EnumError(what, mediaType, @"video");
  return false;
}

// 系统抛出来的异常 → 给 JS 的错：成员名加系统给的原因，不猜是什么原因。
// 没锁就写、没有手电筒写 torchMode、摄像头不支持的对焦方式，系统抛的都是 NSGenericException，
// 按异常名分不开；系统的原因里自己会说清楚（没锁时它说要先 lockForConfiguration，实测）。
// 抛哪个类按异常名：
//   NSRangeException    → RangeError（变焦超出范围，实测）
//   NSGenericException  → DOMException InvalidStateError（现在这个状态做不了）
//   其余                → TypeError（NSInvalidArgumentException 就是参数不对）
static std::string Refusal(NSString* what, NSException* e) {
  NSString* message = [NSString stringWithFormat:@"%@: the system refused (%@)", what,
                                                 e.reason ?: e.name];
  if ([e.name isEqualToString:NSRangeException]) return NacreNamedError(@"RangeError", message);
  if ([e.name isEqualToString:NSGenericException]) {
    return NacreNamedError(@"InvalidStateError", message);
  }
  return message.UTF8String;
}

static NSDictionary* PointJSON(CGPoint p) { return @{@"x": @(p.x), @"y": @(p.y)}; }
static NSDictionary* RectJSON(CGRect r) {
  return @{@"x": @(r.origin.x), @"y": @(r.origin.y), @"width": @(r.size.width),
           @"height": @(r.size.height)};
}

// JS 那边已经按结构体的字段转成了数（structArg），这里只校验
static bool PointFrom(id value, NSString* what, CGPoint* out, std::string* error) {
  if (![value isKindOfClass:NSDictionary.class]) {
    *error = [NSString stringWithFormat:@"%@ needs a point { x, y }", what].UTF8String;
    return false;
  }
  NSDictionary* d = value;
  if (!RequireNumber(d[@"x"], what, error) || !RequireNumber(d[@"y"], what, error)) return false;
  *out = CGPointMake([(NSNumber*)d[@"x"] doubleValue], [(NSNumber*)d[@"y"] doubleValue]);
  return true;
}
static bool RectFrom(id value, NSString* what, CGRect* out, std::string* error) {
  if (![value isKindOfClass:NSDictionary.class]) {
    *error = [NSString stringWithFormat:@"%@ needs a rect { x, y, width, height }", what].UTF8String;
    return false;
  }
  NSDictionary* d = value;
  for (NSString* f in @[@"x", @"y", @"width", @"height"]) {
    if (!RequireNumber(d[f], what, error)) return false;
  }
  *out = CGRectMake([(NSNumber*)d[@"x"] doubleValue], [(NSNumber*)d[@"y"] doubleValue],
                    [(NSNumber*)d[@"width"] doubleValue], [(NSNumber*)d[@"height"] doubleValue]);
  return true;
}

// 一个元数据对象 → 给 JS 建值用的数据。认不出种类的返回 nil
static NSDictionary* DescribeMetadata(AVMetadataObject* object) {
  NSString* type = NameOfConstant(MetadataTypeTable(), object.type);
  if (type == nil) return nil;
  NSMutableDictionary* d = [@{@"type": type, @"bounds": RectJSON(object.bounds)} mutableCopy];
  if ([object isKindOfClass:AVMetadataMachineReadableCodeObject.class]) {
    AVMetadataMachineReadableCodeObject* code = (AVMetadataMachineReadableCodeObject*)object;
    d[@"stringValue"] = code.stringValue ?: (id)NSNull.null;
    NSMutableArray* corners = [NSMutableArray array];
    for (NSDictionary* corner in code.corners) {
      CGPoint p = CGPointZero;
      if (CGPointMakeWithDictionaryRepresentation((__bridge CFDictionaryRef)corner, &p)) {
        [corners addObject:PointJSON(p)];
      }
    }
    d[@"corners"] = corners;
  }
  return d;
}

// JS 的类名：只能由这个包加进会话的那几种
static const char* InputClassName(id input) {
  return [input isKindOfClass:AVCaptureDeviceInput.class] ? "AVCaptureDeviceInput" : "AVCaptureInput";
}
static const char* OutputClassName(id output) {
  return [output isKindOfClass:AVCaptureMetadataOutput.class] ? "AVCaptureMetadataOutput"
                                                              : "AVCaptureOutput";
}

}  // namespace nacre_bridge

// ---- 会话的五个通知 → 五个事件 ----
// 订了哪个才派发哪个。通知可能在任意线程上来，转到主线程再派发
@interface NacreCaptureSessionEvents : NSObject
@property(nonatomic, weak) AVCaptureSession* session;
@property(nonatomic, strong) NSMutableSet<NSString*>* wanted;
@end

static const void* kNacreSessionEventsKey = &kNacreSessionEventsKey;

@implementation NacreCaptureSessionEvents

+ (instancetype)eventsFor:(AVCaptureSession*)session {
  NacreCaptureSessionEvents* events = objc_getAssociatedObject(session, kNacreSessionEventsKey);
  if (events != nil) return events;
  events = [NacreCaptureSessionEvents new];
  events.session = session;
  events.wanted = [NSMutableSet set];
  NSNotificationCenter* center = NSNotificationCenter.defaultCenter;
  [center addObserver:events selector:@selector(started:)
                 name:AVCaptureSessionDidStartRunningNotification object:session];
  [center addObserver:events selector:@selector(stopped:)
                 name:AVCaptureSessionDidStopRunningNotification object:session];
  [center addObserver:events selector:@selector(interrupted:)
                 name:AVCaptureSessionWasInterruptedNotification object:session];
  [center addObserver:events selector:@selector(interruptionEnded:)
                 name:AVCaptureSessionInterruptionEndedNotification object:session];
  [center addObserver:events selector:@selector(runtimeError:)
                 name:AVCaptureSessionRuntimeErrorNotification object:session];
  objc_setAssociatedObject(session, kNacreSessionEventsKey, events, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
  return events;
}

- (void)emit:(NSString*)type json:(NSString*)json {
  dispatch_async(dispatch_get_main_queue(), ^{
    AVCaptureSession* session = self.session;
    if (session == nil || ![self.wanted containsObject:type]) return;
    if (json != nil) {
      nacre_bridge::NacreEmitEventWithJSON(session, "AVCaptureSession", type, json);
    } else {
      nacre_bridge::NacreEmitEvent(session, "AVCaptureSession", type);
    }
  });
}

- (void)started:(NSNotification*)note { [self emit:@"start" json:nil]; }
- (void)stopped:(NSNotification*)note { [self emit:@"stop" json:nil]; }
- (void)interruptionEnded:(NSNotification*)note { [self emit:@"interruptend" json:nil]; }

- (void)interrupted:(NSNotification*)note {
  NSNumber* reason = note.userInfo[AVCaptureSessionInterruptionReasonKey];
  NSString* name = [reason isKindOfClass:NSNumber.class]
                       ? nacre_bridge::NameForCaptureInterruptionReason(
                             (AVCaptureSessionInterruptionReason)reason.integerValue)
                       : nil;
  NSDictionary* payload = @{@"reason": name ?: (id)NSNull.null};
  [self emit:@"interrupt" json:@(nacre_bridge::EncodeJSON(payload).c_str())];
}

- (void)runtimeError:(NSNotification*)note {
  NSError* error = note.userInfo[AVCaptureSessionErrorKey];
  NSDictionary* payload = @{
    @"message": [error isKindOfClass:NSError.class] ? (error.localizedDescription ?: @"") : @"",
    @"code": @([error isKindOfClass:NSError.class] ? error.code : 0),
  };
  [self emit:@"runtimeerror" json:@(nacre_bridge::EncodeJSON(payload).c_str())];
}

@end

// ---- 元数据输出的委托 → detect ----
// 委托的回调排在主队列上。一帧一个批次，交给 JS（见文件开头）
@interface NacreMetadataDelegate : NSObject <AVCaptureMetadataOutputObjectsDelegate>
@end

static const void* kNacreMetadataDelegateKey = &kNacreMetadataDelegateKey;

@implementation NacreMetadataDelegate
- (void)captureOutput:(AVCaptureOutput*)output
    didOutputMetadataObjects:(NSArray<__kindof AVMetadataObject*>*)metadataObjects
              fromConnection:(AVCaptureConnection*)connection {
  NSMutableArray<AVMetadataObject*>* known = [NSMutableArray array];
  for (AVMetadataObject* object in metadataObjects) {
    if (nacre_bridge::NameOfConstant(nacre_bridge::MetadataTypeTable(), object.type) != nil) {
      [known addObject:object];
    }
  }
  if (known.count == 0) return;
  NacreMetadataBatch* batch = [NacreMetadataBatch new];
  batch.objects = known;
  nacre_bridge::NacreEmitEventWithObject(output, "AVCaptureMetadataOutput", @"@detect", batch,
                                         "NacreMetadataBatch");
}
@end

namespace nacre_bridge {

// 开和停：系统的 startRunning / stopRunning 是同步的、要几百毫秒，不能在主线程上调。
// 一个串行队列，开和停按调用的先后做
static dispatch_queue_t SessionQueue(void) {
  static dispatch_queue_t queue;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    queue = dispatch_queue_create("nacre.avcapture.session", DISPATCH_QUEUE_SERIAL);
  });
  return queue;
}

// ---------------------------------------------------------------- 属性

static id ReadAVCaptureProperty(id object, NSString* key) {
  if ([object isKindOfClass:AVCaptureDevice.class]) {
    AVCaptureDevice* device = (AVCaptureDevice*)object;
    if ([key isEqualToString:@"uniqueID"]) return device.uniqueID ?: @"";
    if ([key isEqualToString:@"localizedName"]) return device.localizedName ?: @"";
    if ([key isEqualToString:@"position"]) {
      return NameForCaptureDevicePosition(device.position) ?: @"unspecified";
    }
    if ([key isEqualToString:@"hasTorch"]) return @(device.hasTorch);
    if ([key isEqualToString:@"isTorchAvailable"]) return @(device.isTorchAvailable);
    if ([key isEqualToString:@"torchMode"]) return NameForCaptureTorchMode(device.torchMode) ?: @"off";
    if ([key isEqualToString:@"videoZoomFactor"]) return @(device.videoZoomFactor);
    if ([key isEqualToString:@"minAvailableVideoZoomFactor"]) return @(device.minAvailableVideoZoomFactor);
    if ([key isEqualToString:@"maxAvailableVideoZoomFactor"]) return @(device.maxAvailableVideoZoomFactor);
    if ([key isEqualToString:@"focusMode"]) {
      return NameForCaptureFocusMode(device.focusMode) ?: @"locked";
    }
    if ([key isEqualToString:@"isFocusPointOfInterestSupported"]) {
      return @(device.isFocusPointOfInterestSupported);
    }
    if ([key isEqualToString:@"focusPointOfInterest"]) return PointJSON(device.focusPointOfInterest);
    if ([key isEqualToString:@"autoFocusRangeRestriction"]) {
      return NameForCaptureRangeRestriction(device.autoFocusRangeRestriction) ?: @"none";
    }
    return nil;
  }
  if ([object isKindOfClass:AVCaptureSession.class]) {
    AVCaptureSession* session = (AVCaptureSession*)object;
    if ([key isEqualToString:@"sessionPreset"]) {
      return NameOfConstant(PresetTable(), session.sessionPreset) ?: session.sessionPreset;
    }
    if ([key isEqualToString:@"isRunning"]) return @(session.isRunning);
    if ([key isEqualToString:@"isInterrupted"]) return @(session.isInterrupted);
    return nil;
  }
  if ([object isKindOfClass:AVCaptureMetadataOutput.class]) {
    AVCaptureMetadataOutput* output = (AVCaptureMetadataOutput*)object;
    if ([key isEqualToString:@"availableMetadataObjectTypes"]) {
      return NamesOfConstants(MetadataTypeTable(), output.availableMetadataObjectTypes);
    }
    if ([key isEqualToString:@"metadataObjectTypes"]) {
      return NamesOfConstants(MetadataTypeTable(), output.metadataObjectTypes ?: @[]);
    }
    if ([key isEqualToString:@"rectOfInterest"]) return RectJSON(output.rectOfInterest);
    return nil;
  }
  if ([object isKindOfClass:AVCaptureVideoPreviewLayer.class]) {
    AVCaptureVideoPreviewLayer* layer = (AVCaptureVideoPreviewLayer*)object;
    if ([key isEqualToString:@"videoGravity"]) {
      return NameOfConstant(GravityTable(), layer.videoGravity) ?: @"resizeAspect";
    }
    return nil;
  }
  return nil;
}

static BOOL WriteAVCaptureProperty(id object, NSString* key, id value, std::string* error) {
  if ([object isKindOfClass:AVCaptureDevice.class]) {
    AVCaptureDevice* device = (AVCaptureDevice*)object;
    if ([key isEqualToString:@"torchMode"]) {
      AVCaptureTorchMode mode;
      if (!CaptureTorchModeFromName(value, &mode)) {
        *error = EnumError(key, value, NamesForCaptureTorchMode());
        return YES;
      }
      @try {
        device.torchMode = mode;
      } @catch (NSException* e) {
        *error = Refusal(key, e);
      }
      return YES;
    }
    if ([key isEqualToString:@"videoZoomFactor"]) {
      const double factor = NACRE_NUM(value, key);
      @try {
        device.videoZoomFactor = factor;
      } @catch (NSException* e) {
        *error = Refusal(key, e);
      }
      return YES;
    }
    if ([key isEqualToString:@"focusMode"]) {
      AVCaptureFocusMode mode;
      if (!CaptureFocusModeFromName(value, &mode)) {
        *error = EnumError(key, value, NamesForCaptureFocusMode());
        return YES;
      }
      @try {
        device.focusMode = mode;
      } @catch (NSException* e) {
        *error = Refusal(key, e);
      }
      return YES;
    }
    if ([key isEqualToString:@"focusPointOfInterest"]) {
      CGPoint point;
      if (!PointFrom(value, key, &point, error)) return YES;
      @try {
        device.focusPointOfInterest = point;
      } @catch (NSException* e) {
        *error = Refusal(key, e);
      }
      return YES;
    }
    if ([key isEqualToString:@"autoFocusRangeRestriction"]) {
      AVCaptureAutoFocusRangeRestriction restriction;
      if (!CaptureRangeRestrictionFromName(value, &restriction)) {
        *error = EnumError(key, value, NamesForCaptureRangeRestriction());
        return YES;
      }
      @try {
        device.autoFocusRangeRestriction = restriction;
      } @catch (NSException* e) {
        *error = Refusal(key, e);
      }
      return YES;
    }
    return NO;
  }
  if ([object isKindOfClass:AVCaptureSession.class]) {
    AVCaptureSession* session = (AVCaptureSession*)object;
    if ([key isEqualToString:@"sessionPreset"]) {
      NSString* preset = ConstantNamed(PresetTable(), value);
      if (preset == nil) {
        *error = EnumError(key, value, ChoicesOf(PresetTable()));
        return YES;
      }
      if (![session canSetSessionPreset:preset]) {
        *error = [NSString stringWithFormat:@"sessionPreset \"%@\" is not supported by this "
                                            @"session's current inputs and outputs",
                                            value]
                     .UTF8String;
        return YES;
      }
      @try {
        session.sessionPreset = preset;
      } @catch (NSException* e) {
        *error = Refusal(key, e);
      }
      return YES;
    }
    return NO;
  }
  if ([object isKindOfClass:AVCaptureMetadataOutput.class]) {
    AVCaptureMetadataOutput* output = (AVCaptureMetadataOutput*)object;
    if ([key isEqualToString:@"metadataObjectTypes"]) {
      if (![value isKindOfClass:NSArray.class]) {
        *error = "metadataObjectTypes must be an array of type names";
        return YES;
      }
      // 先把名字全认一遍：有一个不认识，整次不生效（和位掩码数组一样，打警告）
      NSMutableArray<NSString*>* types = [NSMutableArray array];
      for (id name in (NSArray*)value) {
        NSString* type = ConstantNamed(MetadataTypeTable(), name);
        if (type == nil) {
          *error = EnumError(key, name, ChoicesOf(MetadataTypeTable()));
          return YES;
        }
        [types addObject:type];
      }
      // 认识、但现在识别不了的（没加进有摄像头的会话、这台设备没有）：系统会抛
      // NSInvalidArgumentException。先查，说清楚原因
      NSArray<NSString*>* available = output.availableMetadataObjectTypes;
      for (NSUInteger i = 0; i < types.count; i++) {
        if (![available containsObject:types[i]]) {
          *error = [NSString stringWithFormat:
                                 @"metadataObjectTypes \"%@\" is not available now; read "
                                 @"availableMetadataObjectTypes first (it is empty until the output "
                                 @"is added to a session that has a camera input)",
                                 ((NSArray*)value)[i]]
                       .UTF8String;
          return YES;
        }
      }
      @try {
        output.metadataObjectTypes = types;
      } @catch (NSException* e) {
        *error = Refusal(key, e);
      }
      return YES;
    }
    if ([key isEqualToString:@"rectOfInterest"]) {
      CGRect rect;
      if (!RectFrom(value, key, &rect, error)) return YES;
      @try {
        output.rectOfInterest = rect;
      } @catch (NSException* e) {
        *error = Refusal(key, e);
      }
      return YES;
    }
    return NO;
  }
  if ([object isKindOfClass:AVCaptureVideoPreviewLayer.class]) {
    AVCaptureVideoPreviewLayer* layer = (AVCaptureVideoPreviewLayer*)object;
    if ([key isEqualToString:@"videoGravity"]) {
      NSString* gravity = ConstantNamed(GravityTable(), value);
      if (gravity == nil) {
        *error = EnumError(key, value, ChoicesOf(GravityTable()));
        return YES;
      }
      layer.videoGravity = gravity;
      return YES;
    }
    return NO;
  }
  return NO;
}

static nacre::NativeObjectRef ReadAVCaptureObjectProperty(id object, const std::string& name) {
  if ([object isKindOfClass:AVCaptureDeviceInput.class] && name == "device") {
    return {NacreKeep(((AVCaptureDeviceInput*)object).device), "AVCaptureDevice"};
  }
  if ([object isKindOfClass:AVCaptureVideoPreviewLayer.class] && name == "session") {
    return {NacreKeep(((AVCaptureVideoPreviewLayer*)object).session), "AVCaptureSession"};
  }
  return {};
}

static bool WriteAVCaptureObjectProperty(id object, const std::string& name, id value,
                                         std::string* error) {
  if ([object isKindOfClass:AVCaptureVideoPreviewLayer.class] && name == "session") {
    if (value != nil && ![value isKindOfClass:AVCaptureSession.class]) {
      *error = "session needs an AVCaptureSession or null";
      return true;
    }
    ((AVCaptureVideoPreviewLayer*)object).session = (AVCaptureSession*)value;
    return true;
  }
  return false;
}

static void ReadAVCaptureObjectArray(id object, const std::string& name,
                                     std::vector<nacre::NativeObjectRef>& refs) {
  if (![object isKindOfClass:AVCaptureSession.class]) return;
  AVCaptureSession* session = (AVCaptureSession*)object;
  if (name == "inputs") {
    for (AVCaptureInput* input in session.inputs) refs.push_back({NacreKeep(input), InputClassName(input)});
  }
  if (name == "outputs") {
    for (AVCaptureOutput* output in session.outputs) {
      refs.push_back({NacreKeep(output), OutputClassName(output)});
    }
  }
}

// ---------------------------------------------------------------- 方法

static bool AVCaptureCall(id object, NSString* sel, const NacreArgs& args, std::string* out,
                          std::string* error) {
  if ([object isKindOfClass:AVCaptureSession.class]) {
    AVCaptureSession* session = (AVCaptureSession*)object;
    // 这个档位现在能不能设（取决于接上的摄像头和输出）。名字不认识是参数写错，抛
    if ([sel isEqualToString:@"canSetSessionPreset:"]) {
      NSString* preset = ConstantNamed(PresetTable(), args.value(0));
      if (preset == nil) {
        *error = EnumError(@"canSetSessionPreset", args.value(0), ChoicesOf(PresetTable()));
        return true;
      }
      *out = EncodeJSON(@([session canSetSessionPreset:preset]));
      return true;
    }
    // nacre:ownership-exempt canAddInput: —— 只问能不能加，不持有
    if ([sel isEqualToString:@"canAddInput:"]) {
      id input = args.object(0);
      if (![input isKindOfClass:AVCaptureInput.class]) {
        *error = "canAddInput needs an AVCaptureInput";
        return true;
      }
      *out = EncodeJSON(@([session canAddInput:input]));
      return true;
    }
    if ([sel isEqualToString:@"addInput:"]) {
      id input = args.object(0);
      if (![input isKindOfClass:AVCaptureInput.class]) {
        *error = "addInput needs an AVCaptureInput";
        return true;
      }
      if (![session canAddInput:input]) {
        *error = "addInput: this input cannot be added to the session (check canAddInput() first)";
        return true;
      }
      @try {
        [session addInput:input];
      } @catch (NSException* e) {
        *error = Refusal(@"addInput", e);
      }
      *out = "null";
      return true;
    }
    // nacre:ownership-exempt removeInput: —— 解除持有，不是建立持有
    if ([sel isEqualToString:@"removeInput:"]) {
      id input = args.object(0);
      if (![input isKindOfClass:AVCaptureInput.class]) {
        *error = "removeInput needs an AVCaptureInput";
        return true;
      }
      [session removeInput:input];
      *out = "null";
      return true;
    }
    // nacre:ownership-exempt canAddOutput: —— 只问能不能加，不持有
    if ([sel isEqualToString:@"canAddOutput:"]) {
      id output = args.object(0);
      if (![output isKindOfClass:AVCaptureOutput.class]) {
        *error = "canAddOutput needs an AVCaptureOutput";
        return true;
      }
      *out = EncodeJSON(@([session canAddOutput:output]));
      return true;
    }
    if ([sel isEqualToString:@"addOutput:"]) {
      id output = args.object(0);
      if (![output isKindOfClass:AVCaptureOutput.class]) {
        *error = "addOutput needs an AVCaptureOutput";
        return true;
      }
      if (![session canAddOutput:output]) {
        *error = "addOutput: this output cannot be added to the session (check canAddOutput() first)";
        return true;
      }
      @try {
        [session addOutput:output];
      } @catch (NSException* e) {
        *error = Refusal(@"addOutput", e);
      }
      *out = "null";
      return true;
    }
    // nacre:ownership-exempt removeOutput: —— 解除持有，不是建立持有
    if ([sel isEqualToString:@"removeOutput:"]) {
      id output = args.object(0);
      if (![output isKindOfClass:AVCaptureOutput.class]) {
        *error = "removeOutput needs an AVCaptureOutput";
        return true;
      }
      [session removeOutput:output];
      *out = "null";
      return true;
    }
    if ([sel isEqualToString:@"beginConfiguration"]) {
      [session beginConfiguration];
      *out = "null";
      return true;
    }
    if ([sel isEqualToString:@"commitConfiguration"]) {
      @try {
        [session commitConfiguration];
      } @catch (NSException* e) {
        *error = Refusal(@"commitConfiguration", e);
      }
      *out = "null";
      return true;
    }
    return false;
  }
  if ([object isKindOfClass:AVCaptureDevice.class]) {
    AVCaptureDevice* device = (AVCaptureDevice*)object;
    // 拿不到时把系统的 NSError 交给 JS（JS 那边抛 NSError，不是 TypeError：参数没有错）
    if ([sel isEqualToString:@"lockForConfiguration"]) {
      NSError* failure = nil;
      if ([device lockForConfiguration:&failure]) {
        *out = "null";
      } else {
        *out = EncodeJSON(@{@"message" : failure.localizedDescription ?: @"lockForConfiguration failed",
                            @"domain" : failure.domain ?: @"",
                            @"code" : @(failure.code)});
      }
      return true;
    }
    if ([sel isEqualToString:@"unlockForConfiguration"]) {
      [device unlockForConfiguration];
      *out = "null";
      return true;
    }
    if ([sel isEqualToString:@"isFocusModeSupported:"]) {
      AVCaptureFocusMode mode;
      if (!CaptureFocusModeFromName(args.value(0), &mode)) {
        *error = EnumError(@"isFocusModeSupported", args.value(0), NamesForCaptureFocusMode());
        return true;
      }
      *out = EncodeJSON(@([device isFocusModeSupported:mode]));
      return true;
    }
    if ([sel isEqualToString:@"rampToVideoZoomFactor:withRate:"]) {
      const double factor = NACRE_NUM(args.value(0), @"rampToVideoZoomFactor");
      const double rate = NACRE_NUM(args.value(1), @"withRate");
      @try {
        [device rampToVideoZoomFactor:factor withRate:(float)rate];
      } @catch (NSException* e) {
        *error = Refusal(@"rampToVideoZoomFactor", e);
      }
      *out = "null";
      return true;
    }
    if ([sel isEqualToString:@"cancelVideoZoomRamp"]) {
      @try {
        [device cancelVideoZoomRamp];
      } @catch (NSException* e) {
        *error = Refusal(@"cancelVideoZoomRamp", e);
      }
      *out = "null";
      return true;
    }
    return false;
  }
  if ([object isKindOfClass:AVCaptureVideoPreviewLayer.class]) {
    AVCaptureVideoPreviewLayer* layer = (AVCaptureVideoPreviewLayer*)object;
    if ([sel isEqualToString:@"captureDevicePointOfInterestForPoint:"]) {
      CGPoint p;
      if (!PointFrom(args.value(0), @"captureDevicePointOfInterestForPoint", &p, error)) return true;
      *out = EncodeJSON(PointJSON([layer captureDevicePointOfInterestForPoint:p]));
      return true;
    }
    if ([sel isEqualToString:@"pointForCaptureDevicePointOfInterest:"]) {
      CGPoint p;
      if (!PointFrom(args.value(0), @"pointForCaptureDevicePointOfInterest", &p, error)) return true;
      *out = EncodeJSON(PointJSON([layer pointForCaptureDevicePointOfInterest:p]));
      return true;
    }
    if ([sel isEqualToString:@"metadataOutputRectOfInterestForRect:"]) {
      CGRect r;
      if (!RectFrom(args.value(0), @"metadataOutputRectOfInterestForRect", &r, error)) return true;
      *out = EncodeJSON(RectJSON([layer metadataOutputRectOfInterestForRect:r]));
      return true;
    }
    return false;
  }
  if ([object isKindOfClass:NacreMetadataBatch.class]) {
    // 一帧里的对象，给 JS 建值
    if ([sel isEqualToString:@"nacre:describe"]) {
      NSMutableArray* list = [NSMutableArray array];
      for (AVMetadataObject* o in ((NacreMetadataBatch*)object).objects) {
        [list addObject:DescribeMetadata(o) ?: (id)NSNull.null];
      }
      *out = EncodeJSON(list);
      return true;
    }
    return false;
  }
  return false;
}

static bool AVCaptureCallObject(id object, NSString* sel, const NacreArgs& args,
                                nacre::NativeObjectRef* out, std::string* error) {
  if (![object isKindOfClass:AVCaptureVideoPreviewLayer.class]) return false;
  // 参数是 JS 的值记着的那个批次和下标。换算出来的对象装进一个新的批次
  // nacre:ownership-exempt transformedMetadataObjectForMetadataObject: —— 只拿来换算，不持有
  if ([sel isEqualToString:@"transformedMetadataObjectForMetadataObject:"]) {
    id batch = args.object(0);
    id index = args.value(1);
    if (![batch isKindOfClass:NacreMetadataBatch.class] || ![index isKindOfClass:NSNumber.class]) {
      *error = "transformedMetadataObjectForMetadataObject needs an object from a detect event";
      return true;
    }
    NSArray<AVMetadataObject*>* objects = ((NacreMetadataBatch*)batch).objects;
    const NSInteger i = NACRE_INT(index, @"transformedMetadataObjectForMetadataObject");
    if (i < 0 || i >= (NSInteger)objects.count) {
      *error = "transformedMetadataObjectForMetadataObject needs an object from a detect event";
      return true;
    }
    AVMetadataObject* moved =
        [(AVCaptureVideoPreviewLayer*)object transformedMetadataObjectForMetadataObject:objects[i]];
    NacreMetadataBatch* result = nil;
    if (moved != nil && DescribeMetadata(moved) != nil) {
      result = [NacreMetadataBatch new];
      result.objects = @[moved];
    }
    *out = {NacreKeep(result), "NacreMetadataBatch"};
    return true;
  }
  return false;
}

static bool AVCaptureCallAsync(id object, const std::string& name, const std::string& argsJSON,
                               const std::vector<void*>& argPtrs, NacreAsyncDone done) {
  if ([object isKindOfClass:AVCaptureSession.class]) {
    AVCaptureSession* session = (AVCaptureSession*)object;
    if (name == "startRunning") {
      dispatch_async(SessionQueue(), ^{
        [session startRunning];
        done([NacreAsyncResult new]);
      });
      return true;
    }
    if (name == "stopRunning") {
      dispatch_async(SessionQueue(), ^{
        [session stopRunning];
        done([NacreAsyncResult new]);
      });
      return true;
    }
    return false;
  }
  if ([object isKindOfClass:NacreAVCaptureAccess.class] && name == "requestAccessForMediaType:") {
    NSArray* args = DecodeJSON(argsJSON);
    id mediaType = [args isKindOfClass:NSArray.class] && args.count > 0 ? args[0] : nil;
    std::string error;
    if (!RequireVideo(mediaType, @"requestAccessForMediaType", &error)) {
      NacreAsyncResult* r = [NacreAsyncResult new];
      r.isError = YES;
      r.errorName = @"TypeError";
      r.errorMessage = @(error.c_str());
      done(r);
      return true;
    }
    [AVCaptureDevice requestAccessForMediaType:AVMediaTypeVideo
                             completionHandler:^(BOOL granted) {
                               NacreAsyncResult* r = [NacreAsyncResult new];
                               r.boolValue = granted;
                               done(r);
                             }];
    return true;
  }
  return false;
}

// ---------------------------------------------------------------- 构造

static bool AVCaptureConstruct(const std::string& className, const NacreArgs& args,
                               nacre::NativeObjectRef* out, std::string* error) {
  if (className == "AVCaptureSession") {
    *out = {NacreKeep([AVCaptureSession new]), className};
    return true;
  }
  if (className == "AVCaptureMetadataOutput") {
    *out = {NacreKeep([AVCaptureMetadataOutput new]), className};
    return true;
  }
  if (className == "AVCaptureDeviceInput") {
    id device = args.object(0);
    if (![device isKindOfClass:AVCaptureDevice.class]) {
      *error = "AVCaptureDeviceInput needs an AVCaptureDevice";
      return true;
    }
    NSError* failure = nil;
    AVCaptureDeviceInput* input = [AVCaptureDeviceInput deviceInputWithDevice:device error:&failure];
    if (input == nil) {
      *error = (failure.localizedDescription ?: @"cannot open this camera").UTF8String;
      return true;
    }
    *out = {NacreKeep(input), className};
    return true;
  }
  if (className == "AVCaptureVideoPreviewLayer") {
    id session = args.object(0);
    if (![session isKindOfClass:AVCaptureSession.class]) {
      *error = "AVCaptureVideoPreviewLayer needs an AVCaptureSession";
      return true;
    }
    *out = {NacreKeep([[AVCaptureVideoPreviewLayer alloc] initWithSession:session]), className};
    return true;
  }
  return false;
}

// ---------------------------------------------------------------- 类方法

static bool AVCaptureClassCall(const std::string& className, NSString* sel, const NacreArgs& args,
                               std::string* out, std::string* error) {
  if (className != "AVCaptureDevice") return false;
  if ([sel isEqualToString:@"authorizationStatusForMediaType:"]) {
    if (!RequireVideo(args.value(0), @"authorizationStatusForMediaType", error)) return true;
    AVAuthorizationStatus status = [AVCaptureDevice authorizationStatusForMediaType:AVMediaTypeVideo];
    *out = EncodeJSON(NameForCaptureAuthorizationStatus(status) ?: @"notDetermined");
    return true;
  }
  return false;
}

static bool AVCaptureClassCallObject(const std::string& className, NSString* sel,
                                     const NacreArgs& args, nacre::NativeObjectRef* out,
                                     std::string* error) {
  if (className != "AVCaptureDevice") return false;
  if ([sel isEqualToString:@"defaultDeviceWithMediaType:"]) {
    if (!RequireVideo(args.value(0), @"defaultDeviceWithMediaType", error)) return true;
    *out = {NacreKeep([AVCaptureDevice defaultDeviceWithMediaType:AVMediaTypeVideo]), "AVCaptureDevice"};
    return true;
  }
  // 参数：种类、媒体类型（null 是不限）、朝向。JS 那边已经补好了默认值
  if ([sel isEqualToString:@"defaultDeviceWithDeviceType:mediaType:position:"]) {
    NSString* type = ConstantNamed(DeviceTypeTable(), args.value(0));
    if (type == nil) {
      *error = EnumError(@"defaultDeviceWithDeviceType", args.value(0), ChoicesOf(DeviceTypeTable()));
      return true;
    }
    id mediaType = args.value(1);
    if (mediaType != nil && mediaType != NSNull.null &&
        !RequireVideo(mediaType, @"defaultDeviceWithDeviceType mediaType", error)) {
      return true;
    }
    AVCaptureDevicePosition position;
    if (!CaptureDevicePositionFromName(args.value(2), &position)) {
      *error = EnumError(@"defaultDeviceWithDeviceType position", args.value(2),
                         NamesForCaptureDevicePosition());
      return true;
    }
    AVMediaType media = (mediaType == nil || mediaType == NSNull.null) ? nil : AVMediaTypeVideo;
    *out = {NacreKeep([AVCaptureDevice defaultDeviceWithDeviceType:type mediaType:media position:position]),
            "AVCaptureDevice"};
    return true;
  }
  return false;
}

static nacre::NativeObjectRef AVCaptureClassObject(const std::string& className, const std::string& name) {
  if (className == "AVCaptureDevice" && name == "nacre:access") {
    return {NacreKeep(NacreAVCaptureAccess.shared), "NacreAVCaptureAccess"};
  }
  return {};
}

// ---------------------------------------------------------------- 事件

static NacreSubscribed AVCaptureSubscribe(id object, NSString* type, BOOL on, std::string* error) {
  if ([object isKindOfClass:AVCaptureSession.class]) {
    static NSSet<NSString*>* names =
        [NSSet setWithObjects:@"start", @"stop", @"interrupt", @"interruptend", @"runtimeerror", nil];
    if (![names containsObject:type]) return NacreSubscribed::UnknownEvent;
    NacreCaptureSessionEvents* events = [NacreCaptureSessionEvents eventsFor:(AVCaptureSession*)object];
    if (on) {
      [events.wanted addObject:type];
    } else {
      [events.wanted removeObject:type];
    }
    return true;
  }
  if ([object isKindOfClass:AVCaptureMetadataOutput.class]) {
    if (![type isEqualToString:@"detect"]) return NacreSubscribed::UnknownEvent;
    AVCaptureMetadataOutput* output = (AVCaptureMetadataOutput*)object;
    if (on) {
      NacreMetadataDelegate* delegate = [NacreMetadataDelegate new];
      // 委托由关联对象拿着：输出对委托不一定是强引用
      objc_setAssociatedObject(output, kNacreMetadataDelegateKey, delegate,
                               OBJC_ASSOCIATION_RETAIN_NONATOMIC);
      [output setMetadataObjectsDelegate:delegate queue:dispatch_get_main_queue()];
    } else {
      [output setMetadataObjectsDelegate:nil queue:nil];
      objc_setAssociatedObject(output, kNacreMetadataDelegateKey, nil, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    }
    return true;
  }
  if ([object isKindOfClass:AVCaptureDevice.class] || [object isKindOfClass:AVCaptureInput.class] ||
      [object isKindOfClass:AVCaptureOutput.class]) {
    return NacreSubscribed::UnknownEvent;
  }
  return false;
}

}  // namespace nacre_bridge

// ---- 登记 ----
@interface NacreAVCaptureRegistration : NSObject
@end
@implementation NacreAVCaptureRegistration
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "av-capture";
  d.classes = {AVCaptureDevice.class, AVCaptureInput.class, AVCaptureOutput.class,
               AVCaptureSession.class, AVCaptureVideoPreviewLayer.class, NacreMetadataBatch.class,
               NacreAVCaptureAccess.class};
  d.read = nacre_bridge::ReadAVCaptureProperty;
  d.write = nacre_bridge::WriteAVCaptureProperty;
  d.readObject = nacre_bridge::ReadAVCaptureObjectProperty;
  d.writeObject = nacre_bridge::WriteAVCaptureObjectProperty;
  d.readObjectArray = nacre_bridge::ReadAVCaptureObjectArray;
  d.call = nacre_bridge::AVCaptureCall;
  d.callObject = nacre_bridge::AVCaptureCallObject;
  d.callAsync = nacre_bridge::AVCaptureCallAsync;
  d.construct = nacre_bridge::AVCaptureConstruct;
  d.classCall = nacre_bridge::AVCaptureClassCall;
  d.classCallObject = nacre_bridge::AVCaptureClassCallObject;
  d.classObject = nacre_bridge::AVCaptureClassObject;
  d.subscribe = nacre_bridge::AVCaptureSubscribe;
  nacre_bridge::NacreRegisterDomain(d);
  nacre_bridge::NacreRegisterBuiltinParts(self);
}
@end
