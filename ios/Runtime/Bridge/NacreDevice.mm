// UIDevice：这台设备的静态信息。
//
// 一个域一个文件。现在只有读不变的那几项——电量、设备朝向、距离感应都
// 带变化通知，要各自把「读、写、通知」做齐，没有夹在这一步里。

#import "NacreBridge.h"

namespace nacre_bridge {

// 没有 unspecified 以外的别名，但数值不连续（mac = 5、vision = 6），
// 所以这张表和别的枚举一样只能在原生层
NACRE_ENUM_MAP(UserInterfaceIdiom, UIUserInterfaceIdiom,
               @"unspecified": @(UIUserInterfaceIdiomUnspecified),
               @"phone": @(UIUserInterfaceIdiomPhone),
               @"pad": @(UIUserInterfaceIdiomPad),
               @"tv": @(UIUserInterfaceIdiomTV),
               @"carPlay": @(UIUserInterfaceIdiomCarPlay),
               @"mac": @(UIUserInterfaceIdiomMac),
               @"vision": @(UIUserInterfaceIdiomVision))

// 类级的单例：UIDevice.currentDevice
nacre::NativeObjectRef DeviceClassObject(const std::string& className,
                                         const std::string& name) {
  if (className == "UIDevice" && name == "currentDevice") {
    return {(__bridge void*)UIDevice.currentDevice, "UIDevice"};
  }
  return {};
}

id ReadDeviceProperty(id object, NSString* key) {
  if (![object isKindOfClass:UIDevice.class]) return nil;
  UIDevice* device = (UIDevice*)object;
  if ([key isEqualToString:@"name"]) return device.name;
  if ([key isEqualToString:@"model"]) return device.model;
  if ([key isEqualToString:@"localizedModel"]) return device.localizedModel;
  if ([key isEqualToString:@"systemName"]) return device.systemName;
  if ([key isEqualToString:@"systemVersion"]) return device.systemVersion;
  if ([key isEqualToString:@"userInterfaceIdiom"]) {
    return NameForUserInterfaceIdiom(device.userInterfaceIdiom);
  }
  if ([key isEqualToString:@"identifierForVendor"]) {
    // NSUUID → 字符串。头文件标着 nullable：设备重启后第一次解锁之前读不到，
    // 那时给 null（NSNull 过桥就是 JS 的 null）
    NSUUID* uuid = device.identifierForVendor;
    return uuid != nil ? (id)uuid.UUIDString : (id)NSNull.null;
  }
  return nil;
}

}  // namespace nacre_bridge
