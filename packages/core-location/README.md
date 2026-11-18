# `@nacrejs/core-location`

Nacre 的定位能力：使用 App 期间的位置。**装了才有 `CLLocationManager`。**

```
packages/core-location/
├─ index.d.ts                       类型：CLLocationManager、CLLocation、CLLocationCoordinate2D
├─ nacre-ios.json                   清单：这是一个能力包、它的 framework 叫什么、要项目写哪个键
└─ NacreCoreLocation.xcframework/   预编译的 framework（构建产物，不提交）
```

源码不在这里，在 `ios/Capabilities/CoreLocation/`：`ios/` 下是源码，`packages/` 下是交付出去的东西。

## 怎么用

见 [API 文档](../../docs/api/cl-location-manager.md)。三步：

1. 装上这个包。
2. 在 `nacre.config.json` 的 `ios.infoPlist` 里写 `NSLocationWhenInUseUsageDescription`：系统问用户同不同意定位时，提示框里显示这句话。没写的话生成工程时报错。
3. 在入口文件顶上加一行 `/// <reference types="@nacrejs/core-location" />`。

## 它为什么是一个包

用定位的 App 要在自己的 Info.plist 里写一句给用户看的话。Apple 上传时的检查扫的是二进制里的符号：定位放在核心里的话，每一个用 Nacre 的 App 都得写这一句，哪怕它不用定位。判据见[项目说明 3.8 节](../../docs/project.md#38-核心和能力包)。

## 没装的时候

| | |
| --- | --- |
| 生成的工程 | 不嵌 `NacreCoreLocation.framework`，产物里没有它，也不链 CoreLocation |
| 运行时 | 全局上没有 `CLLocationManager`、`CLLocation`、`CLLocationCoordinate2D` |
| 类型检查 | `new CLLocationManager()` 报 `Cannot find name 'CLLocationManager'` |

---

← 返回[项目说明](../../docs/project.md) ・ [能力包是怎么搭的](../../docs/internals/capabilities.md) ・ [定位的实现原理](../../docs/internals/core-location.md)
