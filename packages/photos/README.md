# `@nacrejs/photos`

Nacre 的相册能力：从相册选图、把图片存进相册。**装了才有 `PHPickerViewController`、`PHPhotoLibrary` 这几个类。**

```
packages/photos/
├─ index.d.ts                类型：六个类、五个枚举、事件带的数据
├─ nacre-ios.json            清单：这是一个能力包、它的 framework 叫什么、要项目写哪个 Info.plist 键
└─ NacrePhotos.xcframework/  预编译的 framework（构建产物，不提交）
```

源码不在这里，在 `ios/Capabilities/Photos/`——和 `ios/` 对 `packages/ios/` 的关系一样：`ios/` 下是源码，`packages/` 下是交付出去的东西。

## 怎么用

见 [API 文档](../../docs/api/photos.md)。装上、加一行类型引用、在 `nacre.config.json` 里写一句存图的权限文案，就能用。

## 要项目写什么

清单里声明了一个要求：

```json
"requires": { "infoPlist": ["NSPhotoLibraryAddUsageDescription"] }
```

这一句是存图时系统的权限提示框里给用户看的话，只有写 App 的人写得出来，所以包不带内容，由项目写在 `nacre.config.json` 的 `ios.infoPlist` 里。没写的话生成工程时就报错，点名是这个包要这个键。写法见[配置 App](../../docs/guides/project-config.md#写权限文案)。

选图不需要任何权限。但装了这个包就得写这一句：App Store 上传时的检查看的是二进制里有没有相册的符号，不看代码用没用到。

## 没装的时候

| | |
| --- | --- |
| 生成的工程 | 不嵌 `NacrePhotos.framework`，产物里没有它，也不链接 PhotosUI 和 Photos |
| 运行时 | 全局上没有 `PHPickerViewController`、`PHPhotoLibrary` 等六个类（`typeof PHPickerViewController` 是 `'undefined'`） |
| 类型检查 | `new PHPickerConfiguration()` 报 `Cannot find name 'PHPickerConfiguration'` |

三处是一致的。

## 它为什么不自己引 `@nacrejs/types`

和 `@nacrejs/keychain` 同一个原因：`index.d.ts` 用到的 `NSObject`、`UIViewController`、`UIImage` 是 `@nacrejs/types` 声明的全局类型，用 Nacre 的入口文件本来就引了它；在这里再写一行三斜线引用，包是用 `file:` 或 workspace 链接进来的时候 TypeScript 找不到（`TS2688`）。两个包的关系写在 `peerDependencies` 里。

---

← 返回[项目说明](../../docs/project.md) ・ [相册是怎么接的](../../docs/internals/photos.md) ・ [能力包是怎么搭的](../../docs/internals/capabilities.md)
