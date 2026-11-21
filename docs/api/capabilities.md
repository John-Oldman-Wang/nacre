---
type: concept
---

# 核心和能力包

Nacre 的 API 分成两部分：**核心**和**能力包**。

- **核心**是每个 Nacre 项目都有的部分，由 `@nacrejs/ios` 提供，不用另外安装。界面、布局、文字和图片、动画、输入、网络、本地存储、文件读写、网页都在核心里。
- **能力包**是一个单独的 npm 包，提供一项核心里没有的系统能力，比如定位、拍照、面容 ID。项目装了哪个包，App 里才有哪项能力。

分开的原因在 App 的使用者一侧：定位、相机这类能力，iOS 要求 App 写明一句给用户看的话，说明为什么要用。不用定位的 App 不应该被要求写这句话，所以这些能力不放在核心里。

## 有哪些能力包

| 包 | 提供什么 | 装了之后要在 `nacre.config.json` 里写的 | 文档 |
| --- | --- | --- | --- |
| `@nacrejs/keychain` | `application.keychain`：加密保存令牌和密码 | 不用写 | [Keychain](keychain.md) |
| `@nacrejs/local-authentication` | `LAContext`：面容 ID、触控 ID 认证 | `NSFaceIDUsageDescription` | [`LAContext`](la-context.md) |
| `@nacrejs/core-location` | `CLLocationManager`、`CLLocation`：App 使用期间的定位 | `NSLocationWhenInUseUsageDescription` | [定位](cl-location-manager.md) |
| `@nacrejs/user-notifications` | `UNUserNotificationCenter`：发本地通知，得知通知到了、被点了 | 不用写 | [通知](un-user-notification-center.md) |
| `@nacrejs/push` | `application.remoteNotifications`：注册远程推送、拿设备令牌、收到静默推送 | `ios.entitlements` 里的 `aps-environment` | [远程推送](remote-notifications.md) |
| `@nacrejs/camera` | `UIImagePickerController`：用系统的界面拍照 | `NSCameraUsageDescription` | [拍照](ui-image-picker-controller.md) |
| `@nacrejs/photos` | `PHPickerViewController` 选图，`PHPhotoLibrary` 把图存进相册 | `NSPhotoLibraryAddUsageDescription` | [相册](photos.md) |
| `@nacrejs/contacts` | `CNContactPickerViewController`、`CNContact`：让用户选联系人 | 不用写 | [通讯录选择器](contacts.md) |
| `@nacrejs/app-tracking-transparency` | `ATTrackingManager`、`ASIdentifierManager`：跟踪授权和广告标识 | `NSUserTrackingUsageDescription` | [跟踪授权和广告标识](app-tracking-transparency.md) |

第三列里的名字是 iOS 规定的键名，值是一句给 App 的用户看的话。这句话由你来写，写法见[配置 App](../guides/project-config.md)。`aps-environment` 不是一句话，是一条 entitlement，值是 `development` 或 `production`，见[远程推送](../guides/push-notifications.md)。

没有列在这张表里的 API 都在核心里。

## 用一个能力包要做什么

三件事，以定位为例。

**1. 安装这个包。**

```bash
npm install @nacrejs/core-location
```

**效果**：下次生成 `ios/` 时，App 里包含定位这项能力。只认项目自己的 `package.json` 里写的包；项目依赖的某个库用到了能力包，不算数，要用就自己装。

**2. 在入口文件顶上引入它的类型。**

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/core-location" />
```

**效果**：编辑器和类型检查认识 `CLLocationManager`。少了第二行，类型检查报 `Cannot find name 'CLLocationManager'`。

**3. 这个包要求了权限文案的，在 `nacre.config.json` 里写上。**

```json
{
  "ios": {
    "infoPlist": {
      "NSLocationWhenInUseUsageDescription": "用来显示你附近的门店"
    }
  }
}
```

**效果**：系统向用户申请定位权限时，提示框里显示这句话。上面表里第三列是「不用写」的包没有这一步。

每个包的文档开头都有它自己的这三步。从零开始的完整过程见[建一个自己的 App](../guides/your-own-app.md)。

## 没装就用会怎样

没装的能力包，它的类和属性在 JS 里不存在：

- 读它的类名抛 `ReferenceError`，比如 `new CLLocationManager()`。
- 它加在已有对象上的属性不存在。没装 `@nacrejs/keychain` 时，`'keychain' in application` 是 `false`，`application.keychain` 是 `undefined`。
- 类型检查会先报出来：找不到这个类名，或者对象上没有这个属性。

要在运行时判断某项能力在不在，用 `typeof`：

```js
if (typeof CLLocationManager === 'undefined') {
  console.log('这个 App 没有装定位');
}
```

**结果**

- 没装 `@nacrejs/core-location` 的 App 输出这一行；装了的不输出。

## 装了但没写权限文案会怎样

生成 `ios/` 时报错并停下，报错里写明是哪个包要哪个键：

```
nacre: @nacrejs/local-authentication needs NSFaceIDUsageDescription in Info.plist: a sentence shown to the user explaining why the app needs this permission. Put it in ios.infoPlist in nacre.config.json
```

照报错写上那一句，再生成一次。

## 参见

- [配置 App](../guides/project-config.md)：权限文案写在哪，怎么按语言各写一句。
- [建一个自己的 App](../guides/your-own-app.md)：从建项目到装能力包的完整步骤。
- [`application`](application.md)：核心里 App 级的入口。
- [原生模块](native-modules.md)：App 自己的原生代码和第三方原生 SDK。它们也是以包的形式装进项目的，装法和能力包相同，从 `application.nativeModules` 调。
