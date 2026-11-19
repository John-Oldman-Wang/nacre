---
type: reference
native: NSBundle
---

# `NSBundle`

**`NSBundle`** 表示一个包：磁盘上一个装着程序和资源的目录。App 自己的包是一个以 `.app` 结尾的目录，里面有 App 的程序、`Info.plist`、打包进去的 JS 和项目的 `assets/`。

App 的包从 [`NSBundle.mainBundle`](ns-bundle/mainbundle.md) 拿。它给出包的路径、按名字找包里的资源、读 `Info.plist`，还给出 App 支持哪些语言、这一次实际在用哪种。

App 的包是只读的：真机上往里写会被拒绝。要改的数据放在 [`application.fileSystem`](filesystem.md) 的几个目录里。

读项目自己 `assets/` 里的文件，直接用 [`application.fileSystem.assets`](filesystem/assets.md) 拼路径更简单。

**继承关系**：`EventTarget` → `NSObject` → `NSBundle`

## 构造函数

不能用 `new` 创建：`new NSBundle()` 抛 `TypeError: Illegal constructor: NSBundle is created by the runtime, not by new`。App 的包从 `mainBundle` 拿，别的包用 `bundleWithPath()`。

## 静态属性

| 属性 | 说明 |
| --- | --- |
| [`mainBundle`](ns-bundle/mainbundle.md) <small>只读</small> | App 自己的包 |

## 静态方法

| 方法 | 说明 |
| --- | --- |
| [`bundleWithPath()`](ns-bundle/bundlewithpath.md) | 按目录的路径拿一个包 |
| [`bundleWithIdentifier()`](ns-bundle/bundlewithidentifier.md) | 按包名拿一个已经加载的包 |
| [`preferredLocalizationsFromArray()`](ns-bundle/preferredlocalizationsfromarray.md) | 从一组语言里挑出最合用户偏好的 |

## 实例属性

全部只读，在 App 运行期间不变。

| 属性 | 说明 |
| --- | --- |
| [`bundlePath`](ns-bundle/bundlepath.md) | 包的绝对路径 |
| [`resourcePath`](ns-bundle/resourcepath.md) | 放资源的目录的绝对路径 |
| [`bundleIdentifier`](ns-bundle/bundleidentifier.md) | 包名 |
| [`infoDictionary`](ns-bundle/infodictionary.md) | 包的 Info.plist |
| [`localizedInfoDictionary`](ns-bundle/localizedinfodictionary.md) | Info.plist 里翻译过的那几项 |
| [`localizations`](ns-bundle/localizations.md) | 包支持的全部语言 |
| [`preferredLocalizations`](ns-bundle/preferredlocalizations.md) | 这一次实际在用的语言，最合的在前 |
| [`developmentLocalization`](ns-bundle/developmentlocalization.md) | 开发时用的语言 |

## 实例方法

| 方法 | 说明 |
| --- | --- |
| [`pathForResource()`](ns-bundle/pathforresource.md) | 按名字找一个资源的绝对路径 |
| [`pathsForResourcesOfType()`](ns-bundle/pathsforresourcesoftype.md) | 一种扩展名的全部资源 |
| [`objectForInfoDictionaryKey()`](ns-bundle/objectforinfodictionarykey.md) | Info.plist 里一个键的值 |
| [`localizedStringForKey()`](ns-bundle/localizedstringforkey.md) | `.strings` 表里一个键的译文 |
| [`localizedAttributedStringForKey()`](ns-bundle/localizedattributedstringforkey.md) | 同上，Markdown 变成富文本 |

## 事件

没有事件：包的内容在 App 运行期间不变。

## 示例

### App 在用哪种语言

```js
const main = NSBundle.mainBundle;
console.log(JSON.stringify(main.localizations));
console.log(main.preferredLocalizations[0]);
```

**结果**：在 iPhone Air 模拟器（iOS 27.2）上运行验收 App 时（系统语言简体中文，验收 App 没写 `ios.languages`），依次输出 `["en"]`、`en`：App 只支持英文，系统就用英文。

`nacre.config.json` 里写了 `"languages": ["en", "zh-Hans"]` 的 App，在系统语言是简体中文的手机上，第一行是两种语言，第二行是 `zh-Hans`。**未在模拟器验证。**

### 找包里的一个文件

```js
const path = NSBundle.mainBundle.pathForResource('data', { ofType: 'json', inDirectory: 'JS/assets/web' });
console.log(path === application.fileSystem.assets + '/web/data.json');
```

**结果**：项目里有 `assets/web/data.json` 时，输出 `true`。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `NSBundle.mainBundle` | `NSBundle.mainBundle` |
| `[bundle pathForResource:@"data" ofType:@"json"]` | `bundle.pathForResource('data', { ofType: 'json' })` |
| `[bundle pathForResource:@"data" ofType:@"json" inDirectory:@"web"]` | `bundle.pathForResource('data', { ofType: 'json', inDirectory: 'web' })` |
| `NSLocalizedString(@"key", nil)` | `NSBundle.mainBundle.localizedStringForKey('key')` |
| `[bundle URLForResource:@"data" withExtension:@"json"]` | `bundle.pathForResource('data', { ofType: 'json' })`，得到路径 |

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 以 URL 的形式拿资源 | `URLForResource:withExtension:` 一组。用 `pathForResource()` 拿路径 |
| 加载包里的代码 | `load`、`principalClass`、`classNamed:`。iOS 上不能动态加载代码 |
| 读程序文件、frameworks 和插件的路径 | `executablePath`、`privateFrameworksPath`、`builtInPlugInsPath` |
| 列出所有加载了的包 | `allBundles`、`allFrameworks` |
| 按需下载的资源 | `NSBundleResourceRequest` |

## 参见

- [`application.fileSystem`](filesystem.md)：读写文件；`assets` 是项目 `assets/` 在包里的位置
- [`application.info`](application/info.md)：App 的 Info.plist
- [`NSLocale`](ns-locale.md)：用户的语言偏好和地区
- [`UIFont.familyNames`](ui-font/familynames.md)：包里和系统里有哪些字体
