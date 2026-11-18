// 本地存储：NSUserDefaults。
//
// 单独成文件而不是塞进 NacreMethods.mm，两个理由都成立：那个文件已经 817 行，
// 过了约定的 800 行线；而「本地存储」和视图的方法毫不相干。
//
// 这条分发链是新写的，所以按已定的规矩**返回「认不认领」**，不靠「在同一个
// 函数里往下掉」——那样将来拆文件才是纯搬家，不用新增返回约定。
#import "NacreBridge.h"

#import <Foundation/Foundation.h>

namespace nacre_bridge {

// 读类级属性：NSUserDefaults.standardUserDefaults
nacre::NativeObjectRef StorageClassObject(const std::string& className,
                                          const std::string& name) {
  if (className == "NSUserDefaults" && name == "standardUserDefaults") {
    return {NacreKeep(NSUserDefaults.standardUserDefaults), "NSUserDefaults"};
  }
  return {};
}

bool StorageCallMethod(id object, const std::string& name, const std::string& argsJSON,
                       std::string* out, std::string* error) {
  if (![object isKindOfClass:NSUserDefaults.class]) return false;
  NSUserDefaults* defaults = (NSUserDefaults*)object;
  NSString* sel = @(name.c_str());
  id decoded = DecodeJSON(argsJSON);
  NSArray* args = [decoded isKindOfClass:NSArray.class] ? decoded : @[];

  auto keyArg = [&](NSUInteger i) -> NSString* {
    id v = i < args.count ? args[i] : nil;
    return [v isKindOfClass:NSString.class] ? (NSString*)v : nil;
  };

  // 键必须是字符串。JS 侧已经拦了一道，这里是第二道——写不进去又不报错
  // 是这个项目一路在拒绝的那种错
  NSString* key = keyArg(0);
  if ([sel isEqualToString:@"objectForKey:"] ||
      [sel isEqualToString:@"removeObjectForKey:"] ||
      [sel isEqualToString:@"stringForKey:"] ||
      [sel isEqualToString:@"integerForKey:"] ||
      [sel isEqualToString:@"doubleForKey:"] ||
      [sel isEqualToString:@"boolForKey:"] ||
      [sel isEqualToString:@"arrayForKey:"] ||
      [sel isEqualToString:@"dictionaryForKey:"] ||
      [sel isEqualToString:@"stringArrayForKey:"] ||
      [sel isEqualToString:@"setObject:forKey:"]) {
    NSUInteger keyIndex = [sel isEqualToString:@"setObject:forKey:"] ? 1 : 0;
    key = keyArg(keyIndex);
    if (key == nil) {
      *error = [NSString stringWithFormat:@"%@: key must be a string", sel].UTF8String;
      return true;
    }
  }

  if ([sel isEqualToString:@"objectForKey:"]) {
    *out = EncodeJSON([defaults objectForKey:key]);
  } else if ([sel isEqualToString:@"setObject:forKey:"]) {
    id value = args.count > 0 ? args[0] : nil;
    if (value == nil || value == NSNull.null) {
      // 和 ObjC 的 setObject:nil 一致：写 null 等于删除
      [defaults removeObjectForKey:key];
      *out = "null";
      return true;
    }
    // 存非 plist 对象 ObjC 会抛 NSException，那在我们这里就是崩溃。
    // JS 侧已经逐层验过一遍，这里兜底
    if (![NSPropertyListSerialization propertyList:value
                                  isValidForFormat:NSPropertyListBinaryFormat_v1_0]) {
      *error = [NSString stringWithFormat:
                    @"set: value for '%@' is not storable; only strings, finite numbers, "
                     "booleans, arrays and plain objects of those", key].UTF8String;
      return true;
    }
    [defaults setObject:value forKey:key];
    *out = "null";
  } else if ([sel isEqualToString:@"removeObjectForKey:"]) {
    [defaults removeObjectForKey:key];
    *out = "null";
  } else if ([sel isEqualToString:@"registerDefaults:"]) {
    id table = args.count > 0 ? args[0] : nil;
    if (![table isKindOfClass:NSDictionary.class]) {
      *error = "registerDefaults: needs an object";
      return true;
    }
    for (id k in (NSDictionary*)table) {
      if (![k isKindOfClass:NSString.class]) {
        *error = "registerDefaults: every key must be a string";
        return true;
      }
    }
    if (![NSPropertyListSerialization propertyList:table
                                  isValidForFormat:NSPropertyListBinaryFormat_v1_0]) {
      *error = "registerDefaults: the table contains values that are not storable";
      return true;
    }
    [defaults registerDefaults:(NSDictionary*)table];
    *out = "null";
  }
  // ---- 带类型的取值器 ----
  // 和 objectForKey: **行为不同**：它们会做 plist 的类型强制，比如存进去的是
  // 字符串 "42"，integerForKey: 给 42 而 objectForKey: 给 "42"。所以这不是
  // 「同一件事两种写法」，两边都要留。
  //
  // 对应的带类型 setter（setInteger:forKey: 等）**不暴露**：JS 的数字就是
  // double，setInteger: 和 setObject:@(n) 存进去的东西一样，那才是同一件事
  // 两种写法。floatForKey: 同理不暴露——JS 没有单精度。
  else if ([sel isEqualToString:@"stringForKey:"]) {
    *out = EncodeJSON([defaults stringForKey:key]);
  } else if ([sel isEqualToString:@"integerForKey:"]) {
    *out = EncodeJSON(@([defaults integerForKey:key]));
  } else if ([sel isEqualToString:@"doubleForKey:"]) {
    *out = EncodeJSON(@([defaults doubleForKey:key]));
  } else if ([sel isEqualToString:@"boolForKey:"]) {
    *out = EncodeJSON(@([defaults boolForKey:key]));
  } else if ([sel isEqualToString:@"arrayForKey:"]) {
    *out = EncodeJSON([defaults arrayForKey:key]);
  } else if ([sel isEqualToString:@"dictionaryForKey:"]) {
    *out = EncodeJSON([defaults dictionaryForKey:key]);
  } else if ([sel isEqualToString:@"stringArrayForKey:"]) {
    *out = EncodeJSON([defaults stringArrayForKey:key]);
  } else {
    return false;   // 不是我认识的，交回给总的分发表
  }
  return true;
}

}  // namespace nacre_bridge
