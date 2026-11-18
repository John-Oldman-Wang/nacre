# `@nacrejs/local-authentication`

Nacre 的面容 ID / 触控 ID 认证能力：全局的 `LAContext` 类。**装了才有。**

```
packages/local-authentication/
├─ index.d.ts                             类型：LAContext、LAPolicy、LABiometryType、LAError
├─ nacre-ios.json                         清单：这是一个能力包、它的 framework 叫什么、要项目写哪些键
└─ NacreLocalAuthentication.xcframework/  预编译的 framework（构建产物，不提交）
```

源码在 `ios/Capabilities/LocalAuthentication/`。

## 怎么用

见 [API 文档](../../docs/api/la-context.md)。三步：装上这个包；在 `nacre.config.json` 的 `ios.infoPlist` 里写 `NSFaceIDUsageDescription`；在入口文件顶上加一行类型引用。

## 它要项目写什么

清单里声明了 `requires.infoPlist: ["NSFaceIDUsageDescription"]`。这是面容 ID 第一次使用时系统提示框里的那句话，内容只有写 App 的人写得出来，所以包不带内容，只提要求。装了包而没写，生成 `ios/` 时报错并停下：

```
nacre: @nacrejs/local-authentication needs NSFaceIDUsageDescription in Info.plist: a sentence shown to the user explaining why the app needs this permission. Put it in ios.infoPlist in nacre.config.json
```

## 没装的时候

| | |
| --- | --- |
| 生成的工程 | 不嵌 `NacreLocalAuthentication.framework`，App 的二进制不链接系统的 LocalAuthentication 框架 |
| 运行时 | `typeof LAContext` 是 `'undefined'` |
| 类型检查 | `new LAContext()` 报 `Cannot find name 'LAContext'` |

---

← 返回[项目说明](../../docs/project.md) ・ [能力包是怎么搭的](../../docs/internals/capabilities.md)
