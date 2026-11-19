---
type: reference
native: UIDevice
status: partial
---

# `UIDevice`

**`UIDevice`** 表示运行 App 的这台设备。从它读到设备的种类、操作系统的名字和版本，以及一个用来区分设备的标识。

整个 App 只有一个 `UIDevice` 对象，由运行时提供，从 [`UIDevice.currentDevice`](ui-device/currentdevice.md) 取。

现在提供的七项信息全部只读，在 App 运行期间不会变化，所以没有变化通知，读一次保存下来即可。电量、设备的物理朝向这类会变化的状态还读不到，见[还不能做的](#还不能做的)。

**继承关系**：`EventTarget` → `NSObject` → `UIDevice`

判断系统版本、给设备一个标识的写法，见指南[读设备和系统的信息](../guides/device-info.md)。

## 构造函数

不能用 `new` 创建。`new UIDevice()` 抛 `TypeError: Illegal constructor: UIDevice is created by the runtime, not by new`。实例从 [`UIDevice.currentDevice`](ui-device/currentdevice.md) 取。

## 静态属性

[`UIDevice.currentDevice`](ui-device/currentdevice.md) <small>只读</small>

运行 App 的这台设备。每次读得到同一个对象。

## 实例属性

还继承 `NSObject` 的属性。下面的属性全部只读，在 App 运行期间不变。

| 属性 | 说明 |
| --- | --- |
| [`systemName`](ui-device/systemname.md) <small>只读</small> | 操作系统的名字，iPhone 上是 `'iOS'` |
| [`systemVersion`](ui-device/systemversion.md) <small>只读</small> | 操作系统的版本，字符串，形如 `'26.1'` |
| [`model`](ui-device/model.md) <small>只读</small> | 设备的种类，iPhone 上是 `'iPhone'`。不是具体的型号 |
| [`localizedModel`](ui-device/localizedmodel.md) <small>只读</small> | `model` 按系统语言翻译后的写法 |
| [`name`](ui-device/name.md) <small>只读</small> | 设备的名字。读不到用户给设备起的名字 |
| [`userInterfaceIdiom`](ui-device/userinterfaceidiom.md) <small>只读</small> | 界面的类型，iPhone 上是 `'phone'` |
| [`identifierForVendor`](ui-device/identifierforvendor.md) <small>只读</small> | 同一个开发者的 App 在这台设备上共用的 UUID，可能是 `null` |

## 示例

下面的代码输出设备和系统的信息。它不需要界面，写在 `main.js` 顶层。

```js
const device = UIDevice.currentDevice;

console.log(device.systemName + ' ' + device.systemVersion);
console.log(device.model);
console.log(device.userInterfaceIdiom);
```

**结果**：在 iPhone 上，控制台输出三行，形如：

```
iOS 26.1
iPhone
phone
```

验收用例是在 `sceneconnect` 的回调里读这些属性的。写在脚本顶层读**未在模拟器验证**。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `UIDevice.currentDevice` | `UIDevice.currentDevice` |
| `device.systemVersion` | `device.systemVersion` |
| `device.userInterfaceIdiom == UIUserInterfaceIdiomPhone` | `device.userInterfaceIdiom === 'phone'` |
| `device.identifierForVendor.UUIDString` | `device.identifierForVendor` |
| `if (@available(iOS 27.0, *))` | 取 `systemVersion` 的主版本号比较 |

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 读电量和充电状态，并在变化时收到通知 | `batteryLevel`、`batteryState`、`isBatteryMonitoringEnabled` |
| 读设备的物理朝向（竖着、横着、面朝上），并在变化时收到通知 | `orientation`、`beginGeneratingDeviceOrientationNotifications` |
| 知道设备是否贴近了脸 | `proximityState`、`isProximityMonitoringEnabled` |
| 读具体的型号（iPhone 14、iPhone Air） | `uname()` 的 `machine` 字段 |
| 读用户给设备起的名字 | 需要 Apple 单独批准的权限 |

## 参见

- [读设备和系统的信息](../guides/device-info.md)：比较系统版本、给设备一个标识
- [`application`](application.md)：App 自己的信息，版本号、包名
- [`crypto`](crypto.md)：`randomUUID()`，自己生成标识时用
- [本地存储](storage.md)、[Keychain](keychain.md)：保存自己生成的标识
- [`UITraitCollection`](ui-trait-collection.md)：屏幕是几倍的、深色还是浅色，这些不在 `UIDevice` 上
