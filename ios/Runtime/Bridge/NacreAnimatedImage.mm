// 动图：GIF、APNG、动画 WebP。
//
// UIKit 自己不认动图——+imageWithData: 遇到多帧文件只给第一帧（实测
// images 是空的、duration 是 0）。这里补的是三件事：
//
//   1. 取图的时候用 ImageIO 把帧、每帧时长、循环次数读出来，**挂在那张
//      UIImage 上**。图本身还是 UIKit 给的那一张（第一帧），所以它在任何
//      收 UIImage 的地方都照常能用，只是不动。
//   2. 这样的图交给 UIImageView 时，在它的图层上挂一条 contents 的关键帧
//      动画。播放由渲染进程完成，不经过主线程，JS 再忙也不会停。
//   3. prepareForDisplay 把所有帧放到后台解码。
//
// 为什么不用 +animatedImageWithImages:duration:：它只有一个总时长（每帧
// 等长），也没有循环次数。实测 UIImageView 播它的办法正是在图层上挂
// CAKeyframeAnimation（keyPath = contents，discrete，keyTimes 为空），我们
// 挂的是同一种东西，只是把 keyTimes 和 repeatCount 填成了文件里的值。
#import "NacreBridge.h"

#import <ImageIO/ImageIO.h>
#import <objc/runtime.h>

@implementation NacreImageFrames
@end

namespace nacre_bridge {

// 一张动图解码后最多占多少内存。超过就只给第一帧，并打一条警告。
//
// 所有帧都要解成位图常驻内存（宽 × 高 × 4 × 帧数）：一张 600×600、300 帧
// 的 GIF 是 412 MB，文件本身可能只有几 MB，从网络上拿到什么不由 App 决定。
// 不拦的话后果是进程被系统杀掉，而且没有任何报错。
static const size_t kFrameBudgetBytes = 64 * 1024 * 1024;

NSString* const NacreImageFramesAnimationKey = @"nacreImageFrames";

static char kFramesAssociationKey;

NacreImageFrames* NacreFramesOfImage(UIImage* image) {
  if (image == nil) return nil;
  return objc_getAssociatedObject(image, &kFramesAssociationKey);
}

// 每帧时长放在各格式自己的字典里，键名也各是各的。只收实测过的三种。
//
// 取的是 DelayTime 而不是 UnclampedDelayTime：实测文件里写 0.01 秒的帧，
// DelayTime 给的是 0.1——系统把过短的时长抬到 0.1 秒，和浏览器的做法
// 一致（那种文件是按「浏览器会抬」的前提做出来的，照原值播会快得离谱）。
static BOOL FrameTiming(CFStringRef type, CFStringRef* dictKey, CFStringRef* delayKey,
                        CFStringRef* loopKey) {
  if (type == NULL) return NO;
  if (CFEqual(type, CFSTR("com.compuserve.gif"))) {
    *dictKey = kCGImagePropertyGIFDictionary;
    *delayKey = kCGImagePropertyGIFDelayTime;
    *loopKey = kCGImagePropertyGIFLoopCount;
    return YES;
  }
  if (CFEqual(type, CFSTR("public.png"))) {
    *dictKey = kCGImagePropertyPNGDictionary;
    *delayKey = kCGImagePropertyAPNGDelayTime;
    *loopKey = kCGImagePropertyAPNGLoopCount;
    return YES;
  }
  if (CFEqual(type, CFSTR("org.webmproject.webp"))) {
    *dictKey = kCGImagePropertyWebPDictionary;
    *delayKey = kCGImagePropertyWebPDelayTime;
    *loopKey = kCGImagePropertyWebPLoopCount;
    return YES;
  }
  return NO;
}

UIImage* NacreAttachFrames(UIImage* image, NSData* data) {
  if (image == nil || data.length == 0) return image;
  // imageNamed 有缓存，同一个名字给的是同一个对象：挂过就不再解一遍
  if (NacreFramesOfImage(image) != nil) return image;

  CGImageSourceRef source = CGImageSourceCreateWithData((__bridge CFDataRef)data, NULL);
  if (source == NULL) return image;
  size_t count = CGImageSourceGetCount(source);
  CFStringRef dictKey = NULL, delayKey = NULL, loopKey = NULL;
  // 多帧不等于动图：多页 TIFF、带辅助图的 HEIC 也是多帧。认格式，不认帧数
  if (count < 2 || !FrameTiming(CGImageSourceGetType(source), &dictKey, &delayKey, &loopKey)) {
    CFRelease(source);
    return image;
  }

  NSMutableArray<UIImage*>* images = [NSMutableArray arrayWithCapacity:count];
  NSMutableArray<NSNumber*>* durations = [NSMutableArray arrayWithCapacity:count];
  NSTimeInterval total = 0;
  for (size_t i = 0; i < count; i++) {
    // 这里建的是「还没解码」的图：像素要到第一次显示（或者 prepareForDisplay）
    // 才解。所以下面的预算检查发生在真正占内存之前
    CGImageRef frame = CGImageSourceCreateImageAtIndex(source, i, NULL);
    if (frame == NULL) continue;
    if (images.count == 0) {
      size_t bytes = CGImageGetWidth(frame) * CGImageGetHeight(frame) * 4 * count;
      if (bytes > kFrameBudgetBytes) {
        WriteRuntimeLog([NSString
            stringWithFormat:@"animated image not played: %zu frames of %zux%zu need "
                             @"%.0f MB decoded, over the %.0f MB budget; showing the "
                             @"first frame only",
                             count, CGImageGetWidth(frame), CGImageGetHeight(frame),
                             bytes / 1048576.0, kFrameBudgetBytes / 1048576.0]);
        CGImageRelease(frame);
        CFRelease(source);
        return image;
      }
    }
    NSDictionary* props =
        (__bridge_transfer NSDictionary*)CGImageSourceCopyPropertiesAtIndex(source, i, NULL);
    NSDictionary* timing = props[(__bridge NSString*)dictKey];
    NSNumber* delay = [timing isKindOfClass:NSDictionary.class]
                          ? timing[(__bridge NSString*)delayKey]
                          : nil;
    // 读不到时长的帧按 0.1 秒算——和系统对过短时长的处理是同一个数
    NSTimeInterval seconds =
        [delay isKindOfClass:NSNumber.class] && delay.doubleValue > 0 ? delay.doubleValue
                                                                      : 0.1;
    [images addObject:[UIImage imageWithCGImage:frame
                                          scale:image.scale
                                    orientation:image.imageOrientation]];
    [durations addObject:@(seconds)];
    total += seconds;
    CGImageRelease(frame);
  }

  NSDictionary* top = (__bridge_transfer NSDictionary*)CGImageSourceCopyProperties(source, NULL);
  NSDictionary* timing = top[(__bridge NSString*)dictKey];
  NSNumber* loop =
      [timing isKindOfClass:NSDictionary.class] ? timing[(__bridge NSString*)loopKey] : nil;
  CFRelease(source);
  if (images.count < 2) return image;

  NacreImageFrames* frames = [[NacreImageFrames alloc] init];
  frames.images = images;
  frames.durations = durations;
  frames.duration = total;
  // 实测 ImageIO 给的已经是「一共播几遍」，0 是一直播：GIF 里写「再重复 3 次」
  // 读出来是 4，没写循环信息的 GIF 读出来是 1。读不到时按一直播算
  frames.loopCount = [loop isKindOfClass:NSNumber.class] ? MAX(0, loop.integerValue) : 0;
  objc_setAssociatedObject(image, &kFramesAssociationKey, frames,
                           OBJC_ASSOCIATION_RETAIN_NONATOMIC);
  return image;
}

// imageNamed 不告诉我们它最后用了哪个文件，这里按它的规则再找一遍：
// 名字里可以带子目录；不带扩展名的当 .png；@2x / @3x 看那张图的 scale
// （系统已经替我们挑过了）。Asset Catalog 里的图没有文件，找不到，不动。
NSData* NacreDataForNamedImage(NSString* name, UIImage* image) {
  if (name.length == 0 || image == nil) return nil;
  NSString* ext = name.pathExtension.length > 0 ? name.pathExtension : @"png";
  NSString* stem = name.pathExtension.length > 0 ? name.stringByDeletingPathExtension : name;
  NSString* root = NSBundle.mainBundle.resourcePath;
  NSMutableArray<NSString*>* candidates = [NSMutableArray array];
  NSInteger scale = (NSInteger)llround(image.scale);
  if (scale > 1 && ![stem hasSuffix:[NSString stringWithFormat:@"@%ldx", (long)scale]]) {
    [candidates addObject:[NSString stringWithFormat:@"%@@%ldx.%@", stem, (long)scale, ext]];
  }
  [candidates addObject:[stem stringByAppendingPathExtension:ext]];
  for (NSString* relative in candidates) {
    NSString* path = [root stringByAppendingPathComponent:relative];
    if ([NSFileManager.defaultManager fileExistsAtPath:path]) {
      // 映射进来而不是读进来：帧是按需解码的，文件的字节要一直留着
      return [NSData dataWithContentsOfFile:path options:NSDataReadingMappedIfSafe error:nil];
    }
  }
  return nil;
}

// 图片视图现在该显示的那张图上有没有帧，有就挂动画，没有就摘掉。
// 每次写 image / highlightedImage / isHighlighted 之后调。
void NacreSyncFrameAnimation(UIImageView* view) {
  CALayer* layer = view.layer;
  [layer removeAnimationForKey:NacreImageFramesAnimationKey];
  UIImage* shown =
      view.isHighlighted && view.highlightedImage != nil ? view.highlightedImage : view.image;
  NacreImageFrames* frames = NacreFramesOfImage(shown);
  if (frames == nil || frames.duration <= 0) return;

  NSMutableArray* values = [NSMutableArray arrayWithCapacity:frames.images.count];
  // discrete 模式下 keyTimes 比 values 多一个：第 i 个值从 keyTimes[i] 显示到
  // keyTimes[i+1]，首尾必须是 0 和 1（头文件的要求）
  NSMutableArray<NSNumber*>* keyTimes =
      [NSMutableArray arrayWithCapacity:frames.images.count + 1];
  NSTimeInterval elapsed = 0;
  for (NSUInteger i = 0; i < frames.images.count; i++) {
    CGImageRef cg = frames.images[i].CGImage;
    if (cg == NULL) return;
    [values addObject:(__bridge id)cg];
    [keyTimes addObject:@(elapsed / frames.duration)];
    elapsed += frames.durations[i].doubleValue;
  }
  [keyTimes addObject:@1];

  CAKeyframeAnimation* anim = [CAKeyframeAnimation animationWithKeyPath:@"contents"];
  anim.values = values;
  anim.keyTimes = keyTimes;
  anim.calculationMode = kCAAnimationDiscrete;
  anim.duration = frames.duration;
  anim.repeatCount = frames.loopCount == 0 ? HUGE_VALF : (float)frames.loopCount;
  // 默认是 YES，而系统会在视图离开窗口时把这样的动画摘掉——实测移出父视图
  // 0.3 秒后就没了，加回去也不会回来。设成 NO 之后，移出再加回、被全屏模态
  // 盖住、退后台再回来，都还在
  anim.removedOnCompletion = NO;
  // 播完有限的几遍之后停在最后一帧，不弹回第一帧——和浏览器一致
  anim.fillMode = kCAFillModeForwards;
  [layer addAnimation:anim forKey:NacreImageFramesAnimationKey];
}

// 把所有帧放到后台解码。完成时在后台线程上调 done，给的是一张新图：
// 它是解码过的第一帧，身上挂着解码过的所有帧。
void NacrePrepareFramesForDisplay(UIImage* image, void (^done)(UIImage* ready)) {
  NacreImageFrames* frames = NacreFramesOfImage(image);
  dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
    NSMutableArray<UIImage*>* decoded = [NSMutableArray arrayWithCapacity:frames.images.count];
    for (UIImage* frame in frames.images) {
      // 解不出来的那一帧留着原样，显示时再由系统解
      [decoded addObject:[frame imageByPreparingForDisplay] ?: frame];
    }
    UIImage* first = decoded.firstObject;
    // 每一帧自己还会被当成 images 的成员交给 JS，不能把帧信息挂在它身上
    // （否则 images[0].images 又是一整套）。所以第一帧另包一个 UIImage
    UIImage* ready = first.CGImage != NULL
                         ? [UIImage imageWithCGImage:first.CGImage
                                               scale:first.scale
                                         orientation:first.imageOrientation]
                         : nil;
    if (ready != nil) {
      NacreImageFrames* copy = [[NacreImageFrames alloc] init];
      copy.images = decoded;
      copy.durations = frames.durations;
      copy.duration = frames.duration;
      copy.loopCount = frames.loopCount;
      objc_setAssociatedObject(ready, &kFramesAssociationKey, copy,
                               OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    }
    done(ready);
  });
}

}  // namespace nacre_bridge
