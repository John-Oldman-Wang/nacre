# `@nacrejs/camera`

Nacre 的拍照能力：用系统的拍照界面拍一张照片。**装了才有 `UIImagePickerController`。**

```
packages/camera/
├─ index.d.ts                类型：UIImagePickerController、三个枚举、事件带的数据
├─ nacre-ios.json            清单：这是一个能力包、它的 framework 叫什么、它要项目写哪个键
└─ NacreCamera.xcframework/  预编译的 framework（构建产物，不提交）
```

源码不在这里，在 `ios/Capabilities/Camera/`——`ios/` 下是源码，`packages/` 下是交付出去的东西。

## 怎么用

见 [API 文档](../../docs/api/ui-image-picker-controller.md)。三步：装上这个包；在 `nacre.config.json` 的 `ios.infoPlist` 里写 `NSCameraUsageDescription`；入口文件顶上加一行类型引用。

## 它要项目写什么

清单里声明了 `requires.infoPlist: ["NSCameraUsageDescription"]`。这是系统第一次向用户申请相机权限时显示的那句话，只有写 App 的人写得出来，所以包不带内容。装了这个包却没写，生成工程时就报错，点名是这个包要这个键。

## 没装的时候

| | |
| --- | --- |
| 生成的工程 | 不嵌 `NacreCamera.framework`，产物里没有它；Info.plist 里也不需要相机的那句话 |
| 运行时 | 全局没有 `UIImagePickerController` 这个类 |
| 类型检查 | `UIImagePickerController` 报 `Cannot find name` |

## 只做拍照

从相册选图是另一个包（`@nacrejs/photos`）；录视频、扫码、自己画取景界面都还没有。见 API 文档的「还不能做的」。

---

← 返回[项目说明](../../docs/project.md) ・ [能力包是怎么搭的](../../docs/internals/capabilities.md) ・ [拍照的实现原理](../../docs/internals/camera.md)
