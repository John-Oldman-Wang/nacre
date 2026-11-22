// 一个域：识别图片里的条码。BarcodeDetector（JS 里的上层类，照 Web 的 Shape
// Detection API）。
//
// iOS 识别静态图片里的条码用的是 Vision 的 VNDetectBarcodesRequest。它的形状
// （request + handler + observation，坐标是左下原点的 0 到 1 比例）离 JS 开发者
// 太远，而 Web 已经有一个现成的标准，所以这里做的是上层，形状照 Web：
//   new BarcodeDetector({ formats })        要找哪几种，名字照 Web
//   BarcodeDetector.getSupportedFormats()   这台设备认得哪几种
//   detect(image)                           UIImage 或者装着图片字节的 Blob
//
// 识别在全局的并发队列上做，做完兑现。坐标在这边换算成 Web 的：图片的像素、
// 原点在左上。
//
// 格式名和 Vision 的符号体系不是一一对应的：Vision 把 Code 39 分成带不带校验、
// 是不是全 ASCII 四种，ITF 分成 ITF-14 和交叉 25 码。找的时候一个 Web 名字展开成
// 它对应的全部，报的时候合回一个名字。Vision 认得、Web 没有名字的（GS1 DataBar、
// MSI Plessey、Micro QR、Micro PDF417）不找，所以结果里不会出现 Web 没有的名字。
// UPC-A 在 Vision 里没有单独的符号体系（它被当成首位是 0 的 EAN-13），所以
// upc_a 可以写，但这台设备不认得它，getSupportedFormats() 里也没有它。
#import "NacreBridge.h"

#import <ImageIO/ImageIO.h>
#import <UIKit/UIKit.h>
#import <Vision/Vision.h>

namespace {

// Web 的名字 → Vision 的符号体系（一个名字可能对几个）
NSDictionary<NSString*, NSArray<VNBarcodeSymbology>*>* FormatTable(void) {
  static NSDictionary<NSString*, NSArray<VNBarcodeSymbology>*>* table;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    table = @{
      @"aztec": @[VNBarcodeSymbologyAztec],
      @"code_128": @[VNBarcodeSymbologyCode128],
      @"code_39": @[VNBarcodeSymbologyCode39, VNBarcodeSymbologyCode39Checksum,
                    VNBarcodeSymbologyCode39FullASCII, VNBarcodeSymbologyCode39FullASCIIChecksum],
      @"code_93": @[VNBarcodeSymbologyCode93, VNBarcodeSymbologyCode93i],
      @"codabar": @[VNBarcodeSymbologyCodabar],
      @"data_matrix": @[VNBarcodeSymbologyDataMatrix],
      @"ean_13": @[VNBarcodeSymbologyEAN13],
      @"ean_8": @[VNBarcodeSymbologyEAN8],
      @"itf": @[VNBarcodeSymbologyITF14, VNBarcodeSymbologyI2of5, VNBarcodeSymbologyI2of5Checksum],
      @"pdf417": @[VNBarcodeSymbologyPDF417],
      @"qr_code": @[VNBarcodeSymbologyQR],
      @"upc_a": @[],
      @"upc_e": @[VNBarcodeSymbologyUPCE],
    };
  });
  return table;
}

// 反查：Vision 的符号体系 → Web 的名字
NSString* FormatForSymbology(VNBarcodeSymbology symbology) {
  NSDictionary<NSString*, NSArray<VNBarcodeSymbology>*>* table = FormatTable();
  for (NSString* name in table) {
    if ([table[name] containsObject:symbology]) return name;
  }
  return nil;
}

// 这台设备上 Vision 认得的符号体系。只问一次
NSSet<VNBarcodeSymbology>* SupportedSymbologies(void) {
  static NSSet<VNBarcodeSymbology>* supported;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    NSArray<VNBarcodeSymbology>* list =
        [[VNDetectBarcodesRequest new] supportedSymbologiesAndReturnError:nil];
    supported = [NSSet setWithArray:list ?: @[]];
  });
  return supported;
}

NacreAsyncResult* TypeErrorResult(NSString* message) {
  NacreAsyncResult* r = [NacreAsyncResult new];
  r.isError = YES;
  r.errorName = @"TypeError";
  r.errorMessage = message;
  return r;
}

CGImagePropertyOrientation OrientationOf(UIImageOrientation o) {
  switch (o) {
    case UIImageOrientationUp: return kCGImagePropertyOrientationUp;
    case UIImageOrientationDown: return kCGImagePropertyOrientationDown;
    case UIImageOrientationLeft: return kCGImagePropertyOrientationLeft;
    case UIImageOrientationRight: return kCGImagePropertyOrientationRight;
    case UIImageOrientationUpMirrored: return kCGImagePropertyOrientationUpMirrored;
    case UIImageOrientationDownMirrored: return kCGImagePropertyOrientationDownMirrored;
    case UIImageOrientationLeftMirrored: return kCGImagePropertyOrientationLeftMirrored;
    case UIImageOrientationRightMirrored: return kCGImagePropertyOrientationRightMirrored;
  }
  return kCGImagePropertyOrientationUp;
}

// 转了 90 度的方向：摆正之后宽高对调
bool Rotated(CGImagePropertyOrientation o) {
  return o == kCGImagePropertyOrientationLeft || o == kCGImagePropertyOrientationRight ||
         o == kCGImagePropertyOrientationLeftMirrored ||
         o == kCGImagePropertyOrientationRightMirrored;
}

NSDictionary* Point(CGPoint p, CGFloat width, CGFloat height) {
  // Vision 的点是左下原点的比例，换成左上原点的像素
  return @{@"x": @(p.x * width), @"y": @((1 - p.y) * height)};
}

// 识别一张摆正之后宽 width、高 height 像素的图。在后台调
NacreAsyncResult* Detect(CGImageRef image, CGImagePropertyOrientation orientation,
                         NSArray<VNBarcodeSymbology>* symbologies) {
  const bool rotated = Rotated(orientation);
  const CGFloat width = rotated ? CGImageGetHeight(image) : CGImageGetWidth(image);
  const CGFloat height = rotated ? CGImageGetWidth(image) : CGImageGetHeight(image);
  VNDetectBarcodesRequest* request = [VNDetectBarcodesRequest new];
  request.symbologies = symbologies;
  VNImageRequestHandler* handler = [[VNImageRequestHandler alloc] initWithCGImage:image
                                                                      orientation:orientation
                                                                          options:@{}];
  NSError* error = nil;
  NacreAsyncResult* result = [NacreAsyncResult new];
  if (![handler performRequests:@[request] error:&error]) {
    result.isError = YES;
    result.errorName = @"Error";
    result.errorMessage = error.localizedDescription ?: @"barcode detection failed";
    result.errorCode = error.code;
    result.errorDomain = error.domain ?: @"";
    return result;
  }
  NSMutableArray* codes = [NSMutableArray array];
  for (VNBarcodeObservation* o in request.results ?: @[]) {
    NSString* format = FormatForSymbology(o.symbology);
    if (format == nil) continue;
    const CGRect box = o.boundingBox;
    [codes addObject:@{
      @"rawValue": o.payloadStringValue ?: @"",
      @"format": format,
      @"boundingBox": @{
        @"x": @(box.origin.x * width),
        @"y": @((1 - box.origin.y - box.size.height) * height),
        @"width": @(box.size.width * width),
        @"height": @(box.size.height * height),
      },
      // Web 的顺序：左上起，顺时针
      @"cornerPoints": @[
        Point(o.topLeft, width, height), Point(o.topRight, width, height),
        Point(o.bottomRight, width, height), Point(o.bottomLeft, width, height),
      ],
    }];
  }
  result.json = codes;
  return result;
}

}  // namespace

// 一个 BarcodeDetector 的原生那一半：只记着要找哪些符号体系
@interface NacreBarcodeDetector : NSObject
@property(nonatomic, copy) NSArray<VNBarcodeSymbology>* symbologies;
@end
@implementation NacreBarcodeDetector
@end

namespace nacre_bridge {

// new BarcodeDetector({ formats })：formats 已经由 JS 那边认过名字、判过空。
// null 是没写：找这台设备认得的全部
static bool BarcodeDetectorConstruct(const std::string& className, const NacreArgs& args,
                                     nacre::NativeObjectRef* out, std::string* error) {
  if (className != "BarcodeDetector") return false;
  id formats = args.value(0);
  NSMutableOrderedSet<VNBarcodeSymbology>* wanted = [NSMutableOrderedSet orderedSet];
  NSArray<NSString*>* names = [formats isKindOfClass:NSArray.class] ? formats : FormatTable().allKeys;
  if (formats != nil && formats != NSNull.null && ![formats isKindOfClass:NSArray.class]) {
    *error = "BarcodeDetector formats must be an array";
    return true;
  }
  for (id name in names) {
    NSArray<VNBarcodeSymbology>* list =
        [name isKindOfClass:NSString.class] ? FormatTable()[name] : nil;
    if (list == nil) {
      *error = EnumError(@"BarcodeDetector formats", name,
                         [[FormatTable().allKeys sortedArrayUsingSelector:@selector(compare:)]
                             componentsJoinedByString:@", "]);
      return true;
    }
    for (VNBarcodeSymbology s in list) {
      if ([SupportedSymbologies() containsObject:s]) [wanted addObject:s];
    }
  }
  NacreBarcodeDetector* detector = [NacreBarcodeDetector new];
  detector.symbologies = wanted.array;
  *out = {NacreKeep(detector), className};
  return true;
}

// BarcodeDetector.getSupportedFormats() 的同步那一半：JS 那边包成 Promise
static bool BarcodeDetectorClassCall(const std::string& className, NSString* sel,
                                     const NacreArgs& args, std::string* out, std::string* error) {
  if (className != "BarcodeDetector") return false;
  if ([sel isEqualToString:@"supportedFormats"]) {
    NSMutableArray<NSString*>* formats = [NSMutableArray array];
    NSDictionary<NSString*, NSArray<VNBarcodeSymbology>*>* table = FormatTable();
    for (NSString* name in [table.allKeys sortedArrayUsingSelector:@selector(compare:)]) {
      for (VNBarcodeSymbology s in table[name]) {
        if ([SupportedSymbologies() containsObject:s]) {
          [formats addObject:name];
          break;
        }
      }
    }
    *out = EncodeJSON(formats);
    return true;
  }
  return false;
}

// detect(image)：image 是 UIImage 或 Blob（图片文件的字节）
// 图片只在这一次识别里用，识别完就放开，不建立持有
static bool BarcodeDetectorCallAsync(id object, const std::string& name, const std::string& argsJSON,
                                     const std::vector<void*>& argPtrs, NacreAsyncDone done) {
  if (![object isKindOfClass:NacreBarcodeDetector.class]) return false;
  if (name != "detect") return false;
  NSArray<VNBarcodeSymbology>* symbologies = ((NacreBarcodeDetector*)object).symbologies;
  id image = argPtrs.empty() || argPtrs[0] == nullptr ? nil : (__bridge id)argPtrs[0];
  // 要找的格式这台设备一种都不认得（只写了 upc_a）：不去问 Vision——给它空的
  // 符号体系列表等于「全都找」
  if (symbologies.count == 0 &&
      ([image isKindOfClass:UIImage.class] || [image isKindOfClass:NacreBlob.class])) {
    NacreAsyncResult* r = [NacreAsyncResult new];
    r.json = @[];
    done(r);
    return true;
  }
  if ([image isKindOfClass:UIImage.class]) {
    UIImage* picture = image;
    CGImageRef cg = picture.CGImage;
    if (cg == NULL) {
      done(TypeErrorResult(@"detect needs a UIImage backed by a bitmap"));
      return true;
    }
    CGImageRetain(cg);
    const CGImagePropertyOrientation orientation = OrientationOf(picture.imageOrientation);
    dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
      NacreAsyncResult* r = Detect(cg, orientation, symbologies);
      CGImageRelease(cg);
      done(r);
    });
    return true;
  }
  if ([image isKindOfClass:NacreBlob.class]) {
    NSData* data = ((NacreBlob*)image).data;
    dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
      CGImageSourceRef source = CGImageSourceCreateWithData((__bridge CFDataRef)data, NULL);
      CGImageRef cg = source != NULL ? CGImageSourceCreateImageAtIndex(source, 0, NULL) : NULL;
      CGImagePropertyOrientation orientation = kCGImagePropertyOrientationUp;
      if (cg != NULL) {
        NSDictionary* props =
            CFBridgingRelease(CGImageSourceCopyPropertiesAtIndex(source, 0, NULL));
        NSNumber* value = props[(NSString*)kCGImagePropertyOrientation];
        if ([value isKindOfClass:NSNumber.class] && value.intValue >= 1 && value.intValue <= 8) {
          orientation = (CGImagePropertyOrientation)value.intValue;
        }
      }
      if (source != NULL) CFRelease(source);
      if (cg == NULL) {
        done(TypeErrorResult(@"detect could not decode the Blob as an image"));
        return;
      }
      NacreAsyncResult* r = Detect(cg, orientation, symbologies);
      CGImageRelease(cg);
      done(r);
    });
    return true;
  }
  done(TypeErrorResult(@"detect needs a UIImage or a Blob"));
  return true;
}

}  // namespace nacre_bridge

@interface NacreBarcodeDetectorDomain : NSObject
@end
@implementation NacreBarcodeDetectorDomain
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "barcode-detector";
  d.classes = {NacreBarcodeDetector.class};
  d.construct = nacre_bridge::BarcodeDetectorConstruct;
  d.classCall = nacre_bridge::BarcodeDetectorClassCall;
  d.callAsync = nacre_bridge::BarcodeDetectorCallAsync;
  nacre_bridge::NacreRegisterDomain(d);
}
@end
