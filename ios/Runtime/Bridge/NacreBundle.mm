// NSBundle：App 包的路径、按名字找资源、Info.plist、App 支持和在用的语言。
// 另外两个字体的类级成员也在这里：UIFont.familyNames 和 fontNamesForFamilyName:
// ——「包里和系统里有哪些字体」，和读包里的东西是一件事。
//
// 一个域一个文件，手写的（bindgen 写不出：没有可用的无参构造，类方法多）。
//
// 没接的：加载代码的一组（load、unload、isLoaded、principalClass、classNamed:、
// preflightAndReturnError:、loadAndReturnError:、executableArchitectures）——iOS 上
// 不能动态加载代码；可执行文件和 frameworks、插件的路径；URL 那一组（URLFor…、
// bundleURL、resourceURL…，和 path 那一组重复）；allBundles、allFrameworks；
// bundleForClass:（要传 Class）；initWithPath:、initWithURL:、bundleWithURL:（用
// bundleWithPath:）；类方法版的 pathForResource:ofType:inDirectory: 和
// pathsForResourcesOfType:inDirectory:（第三个参数是包的路径，和实例方法重复）；
// 按需资源的 preservationPriority 一对（已废弃）；appStoreReceiptURL（已废弃）。

#import "NacreBridge.h"

namespace nacre_bridge {

// 可空的值：nil 给 NSNull（过桥是 JS 的 null）；直接返回 nil 会被当成「不认领」
static id OrNull(id value) { return value != nil ? value : (id)NSNull.null; }

// 字符串参数。JS 一侧已经照字符串转换过，这里只校验。可空的参数：null 给 nil
static bool StringArg(const NacreArgs& args, NSUInteger i, bool nullable, const char* what,
                      NSString** out, std::string* error) {
  id given = args.value(i);
  if ([given isKindOfClass:NSString.class]) {
    *out = given;
    return true;
  }
  if (nullable && (given == nil || given == NSNull.null)) {
    *out = nil;
    return true;
  }
  *error = std::string(what) + (nullable ? " needs a string or null" : " needs a string");
  return false;
}

// 字符串数组参数。可空的：null 给 nil
static bool StringArrayArg(const NacreArgs& args, NSUInteger i, bool nullable, const char* what,
                           NSArray<NSString*>** out, std::string* error) {
  id given = args.value(i);
  if (nullable && (given == nil || given == NSNull.null)) {
    *out = nil;
    return true;
  }
  if ([given isKindOfClass:NSArray.class]) {
    for (id item in (NSArray*)given) {
      if (![item isKindOfClass:NSString.class]) {
        *error = std::string(what) + " needs an array of strings";
        return false;
      }
    }
    *out = given;
    return true;
  }
  *error = std::string(what) + " needs an array of strings";
  return false;
}

static id ReadBundleProperty(id object, NSString* key) {
  if (![object isKindOfClass:NSBundle.class]) return nil;
  NSBundle* b = (NSBundle*)object;
  if ([key isEqualToString:@"bundlePath"]) return b.bundlePath;
  if ([key isEqualToString:@"resourcePath"]) return OrNull(b.resourcePath);
  if ([key isEqualToString:@"bundleIdentifier"]) return OrNull(b.bundleIdentifier);
  if ([key isEqualToString:@"infoDictionary"]) return OrNull(b.infoDictionary);
  if ([key isEqualToString:@"localizedInfoDictionary"]) return OrNull(b.localizedInfoDictionary);
  if ([key isEqualToString:@"localizations"]) return b.localizations;
  if ([key isEqualToString:@"preferredLocalizations"]) return b.preferredLocalizations;
  if ([key isEqualToString:@"developmentLocalization"]) return OrNull(b.developmentLocalization);
  return nil;
}

// ---- 实例方法（值） ----
static bool CallBundle(id object, NSString* sel, const NacreArgs& args, std::string* out,
                       std::string* error) {
  if (![object isKindOfClass:NSBundle.class]) return false;
  NSBundle* b = (NSBundle*)object;

  if ([sel isEqualToString:@"objectForInfoDictionaryKey:"]) {
    *out = "null";
    NSString* key = nil;
    if (StringArg(args, 0, false, "objectForInfoDictionaryKey", &key, error)) {
      *out = EncodeJSON([b objectForInfoDictionaryKey:key]);
    }
    return true;
  }

  // pathForResource(name, { ofType, inDirectory, forLocalization })：JS 一侧按带了
  // 哪几个选项挑 selector，参数个数跟着 selector 走
  if ([sel isEqualToString:@"pathForResource:ofType:"] ||
      [sel isEqualToString:@"pathForResource:ofType:inDirectory:"] ||
      [sel isEqualToString:@"pathForResource:ofType:inDirectory:forLocalization:"]) {
    *out = "null";
    NSString *name = nil, *type = nil, *dir = nil, *loc = nil;
    if (!StringArg(args, 0, true, "pathForResource", &name, error)) return true;
    if (!StringArg(args, 1, true, "ofType", &type, error)) return true;
    if (!StringArg(args, 2, true, "inDirectory", &dir, error)) return true;
    if (!StringArg(args, 3, true, "forLocalization", &loc, error)) return true;
    NSString* path = nil;
    if ([sel isEqualToString:@"pathForResource:ofType:"]) {
      path = [b pathForResource:name ofType:type];
    } else if ([sel isEqualToString:@"pathForResource:ofType:inDirectory:"]) {
      path = [b pathForResource:name ofType:type inDirectory:dir];
    } else {
      path = [b pathForResource:name ofType:type inDirectory:dir forLocalization:loc];
    }
    *out = EncodeJSON(path);
    return true;
  }

  if ([sel isEqualToString:@"pathsForResourcesOfType:inDirectory:"] ||
      [sel isEqualToString:@"pathsForResourcesOfType:inDirectory:forLocalization:"]) {
    *out = "[]";
    NSString *type = nil, *dir = nil, *loc = nil;
    if (!StringArg(args, 0, true, "pathsForResourcesOfType", &type, error)) return true;
    if (!StringArg(args, 1, true, "inDirectory", &dir, error)) return true;
    if (!StringArg(args, 2, true, "forLocalization", &loc, error)) return true;
    NSArray<NSString*>* paths =
        [sel isEqualToString:@"pathsForResourcesOfType:inDirectory:"]
            ? [b pathsForResourcesOfType:type inDirectory:dir]
            : [b pathsForResourcesOfType:type inDirectory:dir forLocalization:loc];
    *out = EncodeJSON(paths);
    return true;
  }

  if ([sel isEqualToString:@"localizedStringForKey:value:table:"] ||
      [sel isEqualToString:@"localizedStringForKey:value:table:localizations:"]) {
    *out = "null";
    NSString *key = nil, *value = nil, *table = nil;
    if (!StringArg(args, 0, false, "localizedStringForKey", &key, error)) return true;
    if (!StringArg(args, 1, true, "value", &value, error)) return true;
    if (!StringArg(args, 2, true, "table", &table, error)) return true;
    if ([sel isEqualToString:@"localizedStringForKey:value:table:"]) {
      *out = EncodeJSON([b localizedStringForKey:key value:value table:table]);
      return true;
    }
    NSArray<NSString*>* locs = nil;
    if (!StringArrayArg(args, 3, false, "localizations", &locs, error)) return true;
    *out = EncodeJSON([b localizedStringForKey:key value:value table:table localizations:locs]);
    return true;
  }
  return false;
}

// ---- 实例方法（对象） ----
static bool CallBundleObject(id object, NSString* sel, const NacreArgs& args,
                             nacre::NativeObjectRef* out, std::string* error) {
  if (![object isKindOfClass:NSBundle.class]) return false;
  if (![sel isEqualToString:@"localizedAttributedStringForKey:value:table:"]) return false;
  NSString *key = nil, *value = nil, *table = nil;
  if (!StringArg(args, 0, false, "localizedAttributedStringForKey", &key, error)) return true;
  if (!StringArg(args, 1, true, "value", &value, error)) return true;
  if (!StringArg(args, 2, true, "table", &table, error)) return true;
  NSAttributedString* text =
      [(NSBundle*)object localizedAttributedStringForKey:key value:value table:table];
  *out = {NacreKeep(text), "NSAttributedString"};
  return true;
}

// ---- 类属性（对象）：App 自己的包 ----
static nacre::NativeObjectRef BundleClassObject(const std::string& className,
                                                const std::string& name) {
  if (className == "NSBundle" && name == "mainBundle") {
    return {NacreKeep(NSBundle.mainBundle), "NSBundle"};
  }
  return {};
}

// ---- 类方法（对象）：按路径、按包名拿一个包 ----
static bool BundleClassCallObject(const std::string& className, NSString* sel,
                                  const NacreArgs& args, nacre::NativeObjectRef* out,
                                  std::string* error) {
  if (className != "NSBundle") return false;
  if ([sel isEqualToString:@"bundleWithPath:"]) {
    NSString* path = nil;
    if (StringArg(args, 0, false, "bundleWithPath", &path, error)) {
      NSBundle* b = [NSBundle bundleWithPath:path];
      if (b != nil) *out = {NacreKeep(b), "NSBundle"};
    }
    return true;
  }
  if ([sel isEqualToString:@"bundleWithIdentifier:"]) {
    NSString* identifier = nil;
    if (StringArg(args, 0, false, "bundleWithIdentifier", &identifier, error)) {
      NSBundle* b = [NSBundle bundleWithIdentifier:identifier];
      if (b != nil) *out = {NacreKeep(b), "NSBundle"};
    }
    return true;
  }
  return false;
}

// ---- 类方法和类属性（值） ----
static bool BundleClassCall(const std::string& className, NSString* sel, const NacreArgs& args,
                            std::string* out, std::string* error) {
  if (className == "NSBundle" &&
      ([sel isEqualToString:@"preferredLocalizationsFromArray:"] ||
       [sel isEqualToString:@"preferredLocalizationsFromArray:forPreferences:"])) {
    *out = "[]";
    NSArray<NSString*>* list = nil;
    if (!StringArrayArg(args, 0, false, "preferredLocalizationsFromArray", &list, error)) {
      return true;
    }
    if ([sel isEqualToString:@"preferredLocalizationsFromArray:"]) {
      *out = EncodeJSON([NSBundle preferredLocalizationsFromArray:list]);
      return true;
    }
    NSArray<NSString*>* prefs = nil;
    if (!StringArrayArg(args, 1, true, "forPreferences", &prefs, error)) return true;
    *out = EncodeJSON([NSBundle preferredLocalizationsFromArray:list forPreferences:prefs]);
    return true;
  }
  // 字体：包里和系统里有哪些
  if (className == "UIFont" && [sel isEqualToString:@"familyNames"]) {
    *out = EncodeJSON(UIFont.familyNames);
    return true;
  }
  if (className == "UIFont" && [sel isEqualToString:@"fontNamesForFamilyName:"]) {
    *out = "[]";
    NSString* family = nil;
    if (StringArg(args, 0, false, "fontNamesForFamilyName", &family, error)) {
      *out = EncodeJSON([UIFont fontNamesForFamilyName:family]);
    }
    return true;
  }
  return false;
}

}  // namespace nacre_bridge

@interface NacreBundleDomain : NSObject
@end
@implementation NacreBundleDomain
+ (void)load {
  nacre_bridge::NacreDomain d;
  d.name = "bundle";
  d.classes = {NSBundle.class};
  d.read = nacre_bridge::ReadBundleProperty;
  d.call = nacre_bridge::CallBundle;
  d.callObject = nacre_bridge::CallBundleObject;
  d.classObject = nacre_bridge::BundleClassObject;
  d.classCall = nacre_bridge::BundleClassCall;
  d.classCallObject = nacre_bridge::BundleClassCallObject;
  nacre_bridge::NacreRegisterDomain(d);
}
@end
