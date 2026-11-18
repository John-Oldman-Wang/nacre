// 初稿是 bindgen 生成的（docs/internals/bindgen.md）。之后它是普通的手写文件：直接改，bindgen 不会再碰它。
//
// 一个域：UIColorWell。写法和手写的域一样，
// 见 docs/internals/adding-classes.md；哪些成员生成、哪些不生成见 docs/internals/bindgen.md。

#import "NacreBridge.h"

namespace nacre_bridge {

static bool SystemControlsText(id value, NSString* what, bool nullable, NSString** out,
                    std::string* error) {
  if ([value isKindOfClass:NSString.class]) { *out = value; return true; }
  if (nullable && (value == nil || value == NSNull.null)) { *out = nil; return true; }
  *error = [NSString stringWithFormat:@"%@ must be a string%@", what,
                                      nullable ? @" or null" : @""].UTF8String;
  return false;
}

static bool SystemControlsObject(id value, Class cls, const char* className, bool nullable,
                    const std::string& name, std::string* error) {
  if ([value isKindOfClass:cls] || (nullable && value == nil)) return true;
  ObjectTypeError(name, className, nullable, error);
  return false;
}

static id ReadSystemControlsProperty(id object, NSString* key) {
  if ([object isKindOfClass:UIColorWell.class]) {
    UIColorWell* o = (UIColorWell*)object;
    if ([key isEqualToString:@"title"]) return o.title ?: NSNull.null;
    if ([key isEqualToString:@"supportsAlpha"]) return @(o.supportsAlpha);
    if ([key isEqualToString:@"supportsEyedropper"]) return @(o.supportsEyedropper);
    if ([key isEqualToString:@"maximumLinearExposure"]) return @(o.maximumLinearExposure);
  }
  return nil;
}

static BOOL WriteSystemControlsProperty(id object, NSString* key, id value, std::string* error) {
  if ([object isKindOfClass:UIColorWell.class]) {
    UIColorWell* o = (UIColorWell*)object;
    if ([key isEqualToString:@"title"]) {
      NSString* text = nil;
      if (SystemControlsText(value, key, true, &text, error)) o.title = text;
      return YES;
    }
    if ([key isEqualToString:@"supportsAlpha"]) { o.supportsAlpha = NACRE_BOOL(value, key); return YES; }
    if ([key isEqualToString:@"supportsEyedropper"]) { o.supportsEyedropper = NACRE_BOOL(value, key); return YES; }
    if ([key isEqualToString:@"maximumLinearExposure"]) { o.maximumLinearExposure = NACRE_NUM(value, key); return YES; }
  }
  return NO;
}

static nacre::NativeObjectRef ReadSystemControlsObjectProperty(id object, const std::string& name) {
  if ([object isKindOfClass:UIColorWell.class]) {
    UIColorWell* o = (UIColorWell*)object;
    if (name == "selectedColor") return {NacreKeep(o.selectedColor), "UIColor"};
  }
  return {};
}

static bool WriteSystemControlsObjectProperty(id object, const std::string& name, id value,
                                        std::string* error) {
  if ([object isKindOfClass:UIColorWell.class]) {
    UIColorWell* o = (UIColorWell*)object;
    if (name == "selectedColor") {
      if (SystemControlsObject(value, UIColor.class, "UIColor", true, name, error)) o.selectedColor = value;
      return true;
    }
  }
  return false;
}

static bool SystemControlsConstruct(const std::string& className, const NacreArgs& args,
                             nacre::NativeObjectRef* out, std::string* error) {
  if (className == "UIColorWell") {
    *out = {NacreKeep([[UIColorWell alloc] init]), className};
    return true;
  }
  return false;
}

}  // namespace nacre_bridge

@interface NacreSystemControlsDomain : NSObject
@end
@implementation NacreSystemControlsDomain
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "system-controls";
  d.classes = {UIColorWell.class};
  d.read = nacre_bridge::ReadSystemControlsProperty;
  d.write = nacre_bridge::WriteSystemControlsProperty;
  d.readObject = nacre_bridge::ReadSystemControlsObjectProperty;
  d.writeObject = nacre_bridge::WriteSystemControlsObjectProperty;
  d.construct = nacre_bridge::SystemControlsConstruct;
  nacre_bridge::NacreRegisterDomain(d);
}
@end
