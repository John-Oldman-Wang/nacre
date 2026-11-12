// 不可变的值类对象。UIColor 的颜色常量表、UIFont、UIImage、Blob。
//
// 属性分发按能力域拆开，这里只装这一个域；调用顺序在 NacreProperties.mm。

#import "NacreBridge.h"

namespace nacre_bridge {

id ReadResourceProperty(id object, NSString* key) {
  id value = nil;
  if (value == nil && [object isKindOfClass:UIImage.class]) {
    UIImage* image = (UIImage*)object;
    if ([key isEqualToString:@"size"]) {
      // 点，不是像素。像素 = size × scale
      value = SizeToJSON(image.size);
    } else if ([key isEqualToString:@"scale"]) {
      value = @(image.scale);
    } else if ([key isEqualToString:@"imageOrientation"]) {
      value = NameForImageOrientation(image.imageOrientation);
    } else if ([key isEqualToString:@"isSymbolImage"]) {
      value = @(image.isSymbolImage);
    } else if ([key isEqualToString:@"renderingMode"]) {
      value = NameForImageRenderingMode(image.renderingMode);
    } else if ([key isEqualToString:@"capInsets"]) {
      value = InsetsToJSON(image.capInsets);
    } else if ([key isEqualToString:@"resizingMode"]) {
      value = NameForImageResizingMode(image.resizingMode);
    } else if ([key isEqualToString:@"alignmentRectInsets"]) {
      value = InsetsToJSON(image.alignmentRectInsets);
    } else if ([key isEqualToString:@"duration"]) {
      value = @(image.duration);
    }
  }

  if (value == nil && [object isKindOfClass:NacreBlob.class]) {
    NacreBlob* blob = (NacreBlob*)object;
    if ([key isEqualToString:@"size"]) {
      value = @(blob.data.length);
    } else if ([key isEqualToString:@"type"]) {
      value = blob.type ?: @"";
    }
  }

  if (value == nil && [object isKindOfClass:UIFont.class]) {
    UIFont* font = (UIFont*)object;
    if ([key isEqualToString:@"familyName"]) {
      value = font.familyName;
    } else if ([key isEqualToString:@"fontName"]) {
      value = font.fontName;
    } else if ([key isEqualToString:@"pointSize"]) {
      value = @(font.pointSize);
    } else if ([key isEqualToString:@"ascender"]) {
      value = @(font.ascender);
    } else if ([key isEqualToString:@"descender"]) {
      value = @(font.descender);
    } else if ([key isEqualToString:@"capHeight"]) {
      value = @(font.capHeight);
    } else if ([key isEqualToString:@"xHeight"]) {
      value = @(font.xHeight);
    } else if ([key isEqualToString:@"lineHeight"]) {
      value = @(font.lineHeight);
    } else if ([key isEqualToString:@"leading"]) {
      value = @(font.leading);
    }
  }
  return value;
}

// 类级只读属性。目前只有 UIColor 的颜色常量，手写成表：
// 用名字拼 selector 再 performSelector 等于把任意 ObjC 调用的入口开给 JS，
// 通用的能力暴露方案做好之前不开这个口子。
NSDictionary<NSString*, UIColor*>* NamedColors() {
  static NSDictionary<NSString*, UIColor*>* colors = nil;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    colors = @{
      // UIColor.h：基础色
      @"blackColor": UIColor.blackColor,
      @"darkGrayColor": UIColor.darkGrayColor,
      @"lightGrayColor": UIColor.lightGrayColor,
      @"whiteColor": UIColor.whiteColor,
      @"grayColor": UIColor.grayColor,
      @"redColor": UIColor.redColor,
      @"greenColor": UIColor.greenColor,
      @"blueColor": UIColor.blueColor,
      @"cyanColor": UIColor.cyanColor,
      @"yellowColor": UIColor.yellowColor,
      @"magentaColor": UIColor.magentaColor,
      @"orangeColor": UIColor.orangeColor,
      @"purpleColor": UIColor.purpleColor,
      @"brownColor": UIColor.brownColor,
      @"clearColor": UIColor.clearColor,
      // UIInterface.h：系统色
      @"systemRedColor": UIColor.systemRedColor,
      @"systemGreenColor": UIColor.systemGreenColor,
      @"systemBlueColor": UIColor.systemBlueColor,
      @"systemOrangeColor": UIColor.systemOrangeColor,
      @"systemYellowColor": UIColor.systemYellowColor,
      @"systemPinkColor": UIColor.systemPinkColor,
      @"systemPurpleColor": UIColor.systemPurpleColor,
      @"systemTealColor": UIColor.systemTealColor,
      @"systemIndigoColor": UIColor.systemIndigoColor,
      @"systemBrownColor": UIColor.systemBrownColor,
      @"systemMintColor": UIColor.systemMintColor,
      @"systemCyanColor": UIColor.systemCyanColor,
      @"systemGrayColor": UIColor.systemGrayColor,
      // UIInterface.h：语义色，按绘制时的外观动态解析
      @"labelColor": UIColor.labelColor,
      @"secondaryLabelColor": UIColor.secondaryLabelColor,
      @"tertiaryLabelColor": UIColor.tertiaryLabelColor,
      @"quaternaryLabelColor": UIColor.quaternaryLabelColor,
      @"placeholderTextColor": UIColor.placeholderTextColor,
      @"separatorColor": UIColor.separatorColor,
      @"opaqueSeparatorColor": UIColor.opaqueSeparatorColor,
      @"linkColor": UIColor.linkColor,
      @"systemBackgroundColor": UIColor.systemBackgroundColor,
      @"secondarySystemBackgroundColor": UIColor.secondarySystemBackgroundColor,
      @"tertiarySystemBackgroundColor": UIColor.tertiarySystemBackgroundColor,
    };
  });
  return colors;
}


// ---------------------------------------------------------------- 颜色 ↔ spec
//
// 上层的颜色是**字符串**，但字符串解析在 JS 侧做（纯文本运算），过桥的是一个
// 规范化的 spec。原生这边只管两件事：按 spec 造色，和把一个色还原成 spec。
//
// spec 的几种形状：
//   {"kind":"rgba","r":…,"g":…,"b":…,"a":…}
//   {"kind":"lightDark","light":{…},"dark":{…}}
//   {"kind":"name","name":"systemBlueColor"}     39 个常量之一
//   {"kind":"asset","name":"BrandBlue"}          Asset Catalog
//   {"kind":"opaque"}                            反查专用：表达不出来

namespace {

// 反查：指针 → 常量名。常量是原生单例，所以指针比对就够
NSString* NameForColor(UIColor* color) {
  static NSDictionary<NSValue*, NSString*>* reverse = nil;
  static dispatch_once_t once;
  dispatch_once(&once, ^{
    NSMutableDictionary<NSValue*, NSString*>* table = [NSMutableDictionary dictionary];
    [NamedColors() enumerateKeysAndObjectsUsingBlock:^(NSString* name, UIColor* c, BOOL* stop) {
      table[[NSValue valueWithPointer:(__bridge const void*)c]] = name;
    }];
    reverse = table;
  });
  return reverse[[NSValue valueWithPointer:(__bridge const void*)color]];
}

// 它是不是动态色——按任何一维解析出不同的值就是。
//
// 这一步**不能省**：动态色被问 RGBA 分量时不会失败，而是乖乖返回当前外观下的
// 值。所以不检测的话，深色模式下的 systemBackground 会被还原成 "#000000"，
// 换到浅色就全错了，而且**丢了不报错**。
BOOL IsDynamicColor(UIColor* color) {
  UITraitCollection* axes[][2] = {
    {[UITraitCollection traitCollectionWithUserInterfaceStyle:UIUserInterfaceStyleLight],
     [UITraitCollection traitCollectionWithUserInterfaceStyle:UIUserInterfaceStyleDark]},
    {[UITraitCollection traitCollectionWithAccessibilityContrast:UIAccessibilityContrastNormal],
     [UITraitCollection traitCollectionWithAccessibilityContrast:UIAccessibilityContrastHigh]},
    {[UITraitCollection traitCollectionWithUserInterfaceLevel:UIUserInterfaceLevelBase],
     [UITraitCollection traitCollectionWithUserInterfaceLevel:UIUserInterfaceLevelElevated]},
  };
  for (size_t i = 0; i < sizeof(axes) / sizeof(axes[0]); i++) {
    UIColor* a = [color resolvedColorWithTraitCollection:axes[i][0]];
    UIColor* b = [color resolvedColorWithTraitCollection:axes[i][1]];
    if (![a isEqual:b]) return YES;
  }
  return NO;
}

NSDictionary* RGBASpec(UIColor* color) {
  CGFloat r = 0, g = 0, b = 0, a = 0;
  if (![color getRed:&r green:&g blue:&b alpha:&a]) return nil;   // 图案色走这里
  return @{@"kind": @"rgba", @"r": @(r), @"g": @(g), @"b": @(b), @"a": @(a)};
}

}  // namespace

UIColor* ColorFromSpec(id spec) {
  if (![spec isKindOfClass:NSDictionary.class]) return nil;
  NSString* kind = spec[@"kind"];
  if ([kind isEqualToString:@"rgba"]) {
    return [UIColor colorWithRed:[spec[@"r"] doubleValue]
                           green:[spec[@"g"] doubleValue]
                            blue:[spec[@"b"] doubleValue]
                           alpha:[spec[@"a"] doubleValue]];
  }
  if ([kind isEqualToString:@"name"]) {
    return NamedColors()[spec[@"name"] ?: @""];
  }
  if ([kind isEqualToString:@"asset"]) {
    NSString* name = spec[@"name"];
    return [name isKindOfClass:NSString.class] ? [UIColor colorNamed:name] : nil;
  }
  if ([kind isEqualToString:@"lightDark"]) {
    UIColor* light = ColorFromSpec(spec[@"light"]);
    UIColor* dark = ColorFromSpec(spec[@"dark"]);
    if (light == nil || dark == nil) return nil;
    // provider 的 block **由原生层实现，不回 JS**，闭包里只捕获两个已经算好的
    // 颜色。所以这不需要「同步回调回 JS」那套机制（M1b）——和屏幕方向那条
    // 「系统要同步拿答案，就转成 JS 预先声明的状态」是同一个模式。
    return [UIColor colorWithDynamicProvider:^UIColor*(UITraitCollection* traits) {
      return traits.userInterfaceStyle == UIUserInterfaceStyleDark ? dark : light;
    }];
  }
  return nil;
}

NSDictionary* ColorToSpec(UIColor* color) {
  if (color == nil) return nil;
  NSString* name = NameForColor(color);
  if (name) return @{@"kind": @"name", @"name": name};
  if (!IsDynamicColor(color)) {
    NSDictionary* rgba = RGBASpec(color);
    if (rgba) return rgba;
  }
  // 没名字的动态色、图案色、HDR……表达不出来。**不编一个近似值**：
  // 那是静默丢精度，正是这一整套设计在拒绝的东西。JS 侧会给它一个
  // native(n) 的代号，保证往返，并且诚实地说「这个写不出来」。
  return @{@"kind": @"opaque"};
}

// 颜色的方法分发。单独一支，按「认不认领」返回
bool ColorCallMethod(id object, const std::string& name, std::string* out) {
  if (![object isKindOfClass:UIColor.class]) return false;
  if (name != "nacreSpec") return false;
  *out = EncodeJSON(ColorToSpec((UIColor*)object));
  return true;
}

// JS 跑在主线程，所以 currentRunLoop 永远等于 mainRunLoop，只给一个。
// 和 Keychain / FileSystem 那几个一样单独成函数——类级对象属性这条通道
// check-api.sh 还没覆盖（见 project.md 的 TODO），放进 ReadClassObjectProperty
// 里反而会被当成实例属性误报
static nacre::NativeObjectRef RunLoopClassObject(const std::string& className,
                                                 const std::string& name) {
  if (className == "NSRunLoop" && name == "mainRunLoop") {
    return {(__bridge void*)NSRunLoop.mainRunLoop, "NSRunLoop"};
  }
  return {};
}

nacre::NativeObjectRef ReadClassObjectProperty(const std::string& className,
                                               const std::string& name) {
  {
    nacre::NativeObjectRef loop = RunLoopClassObject(className, name);
    if (!loop.class_name.empty()) return loop;
  }
  nacre::NativeObjectRef device = DeviceClassObject(className, name);
  if (!device.class_name.empty()) return device;
  nacre::NativeObjectRef pasteboard = PasteboardClassObject(className, name);
  if (!pasteboard.class_name.empty()) return pasteboard;
  nacre::NativeObjectRef storage = StorageClassObject(className, name);
  if (!storage.class_name.empty()) return storage;
  nacre::NativeObjectRef files = FileSystemClassObject(className, name);
  if (!files.class_name.empty()) return files;
  nacre::NativeObjectRef keychain = KeychainClassObject(className, name);
  if (!keychain.class_name.empty()) return keychain;
  if (className == "UIColor") {
    UIColor* color = NamedColors()[@(name.c_str())];
    if (color != nil) return {(__bridge void*)color, "UIColor"};
  }
  return {};
}

}  // namespace nacre_bridge
