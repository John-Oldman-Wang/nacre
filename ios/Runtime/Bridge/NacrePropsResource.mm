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

nacre::NativeObjectRef ReadClassObjectProperty(const std::string& className,
                                               const std::string& name) {
  if (className == "UIColor") {
    UIColor* color = NamedColors()[@(name.c_str())];
    if (color != nil) return {(__bridge void*)color, "UIColor"};
  }
  return {};
}

}  // namespace nacre_bridge
