# App 包：实现说明

← [实现原理](README.md)

三样东西：`application.fileSystem.assets`、`NSBundle`、`UIFont.familyNames` 和 `fontNamesForFamilyName()`。客户反馈（2026-11-19）：随包的数据文件只能在构建时编进 JS，字体只能靠 `UIAppFonts` 盲写、看不到装上没有。

## 上层是 `fileSystem.assets`，不是整个包（2026-11-19 定）

`application.fileSystem` 原来有四个目录属性，读写函数收绝对路径。读包里的文件，最省事的是再给一个目录属性。比过三种：

| | 写法 | 没选的原因 |
| --- | --- | --- |
| `fs.assets` | `fs.readText(fs.assets + '/config/rates.json')` | 选了：路径和项目里的 `assets/` 一一对应 |
| `fs.bundle`（整个包） | `fs.readText(fs.bundle + '/JS/assets/config/rates.json')` | 要用户知道包里还有 `JS/` 这一层。project.md 原则 12：上层列出有什么，不讲换算规则 |
| 相对路径相对 App 包 | `fs.readText('JS/assets/config/rates.json')` | `writeText('x')` 也会指到包里，容易误用；而且一样要知道 `JS/` |

包里 `assets/` 以外的东西（Info.plist、字体、原生模块带的资源）交给底层的 `NSBundle`。

`assets` 的值是宿主传给 `startWithScriptsDirectory:` 的目录下面的 `assets/`。CLI 把项目的 `assets/` 拷到 `ios/JS/assets/`，模板把 `JS/` 交给运行时，所以两边对得上，运行时里不写死 `JS` 这个名字。`NacreRuntime.mm` 启动时调一次 `NacreSetScriptsDirectory`，文件读写那个域记下来。

`UIImage.imageNamed('JS/assets/logo')` 和网页的 `loadFile('JS/assets/…')` 还是带 `JS/` 的写法，这次没动。

### 包是只读的：真机上，不是模拟器上

Apple 的文件系统文档写明：App 包在安装时签了名，往里写会破坏签名、App 就启动不了，所以真机上写进去会被拒绝。**模拟器上写得进去**（实测：`writeText(fs.assets + '/…')` 成功了）。验收里这一条按实际结果分两支：被拒绝就断言，写进去了就删掉并记一处「未验证」。真机上被拒绝没有验过。

## `NSBundle`：手写，接了三组

bindgen 写不出（没有可用的无参构造，成员一大半是类方法），手写。

接了：拿到包（`mainBundle`、`bundleWithPath:`、`bundleWithIdentifier:`）、路径（`bundlePath`、`resourcePath`）、找资源（`pathForResource:…` 三个、`pathsForResourcesOfType:…` 两个）、信息（`bundleIdentifier`、`infoDictionary`、`localizedInfoDictionary`、`objectForInfoDictionaryKey:`）、本地化（`localizations`、`preferredLocalizations`、`developmentLocalization`、`localizedStringForKey:…` 两个、`localizedAttributedStringForKey:…`、`preferredLocalizationsFromArray:…` 两个）。

同名、参数越来越多的几个 selector 收成一个 JS 方法加 options：带了哪几个选项就调哪一个。`localizedStringForKey:value:table:localizations:` 要 iOS 18.4，我们最低 26，不用判断。

没接的和原因写在 `NacreBundle.mm` 的开头：加载代码的一组（iOS 上不能动态加载代码）、可执行文件和 frameworks 的路径、URL 那一组（和 path 那一组重复）、`allBundles`、`bundleForClass:`、`initWith…`、类方法版的找资源、两个已废弃的。

客户选界面语言该看的是 `preferredLocalizations`：它是系统从 App 支持的语言里按用户偏好挑出来的，和 `NSLocale.currentLocale` 的语言一致。`NSLocale.preferredLanguages` 是用户的偏好，不管 App 支持不支持。

## 字体的名字放在这个域里

`familyNames` 和 `fontNamesForFamilyName:` 是 `UIFont` 的两个类级成员。`UIFont` 是核心里已有的类，JS 和类型加在它原来的定义上（`11-resource.js`、`resources.d.ts`），原生的处理放在 `NacreBundle.mm`：登记过的域先于核心的分发器被问到，不用碰核心的 `NacreFactories.mm`。放这里是因为它回答的是「包里和系统里装了哪些字体」。

## 实测

iPhone Air 模拟器（iOS 27.2），系统语言简体中文；验收 App 没写 `ios.languages`。

| | 结果 |
| --- | --- |
| `fs.assets` | `mainBundle.bundlePath + '/JS/assets'` |
| `readText` / `readBytes` / `readDirectory` / `stat` 读 `assets` 里的文件 | 都读得到 |
| 往 `assets` 里写 | 模拟器上写得进去 |
| `mainBundle` 读两次 | 同一个包装 |
| `resourcePath` | 和 `bundlePath` 相同 |
| `localizations`、`preferredLocalizations`、`developmentLocalization` | `["en"]`、`["en"]`、`en` |
| `localizedStringForKey` 没有的键 | 给了 `value` 给 `value`，没给给键本身 |
| `localizedAttributedStringForKey` 没有的键 | `NSAttributedString`，文字是 `value` |
| `preferredLocalizationsFromArray(['en', 'zh-Hans'], { forPreferences: ['zh-Hans-CN'] })` | 第一项 `zh-Hans` |
| `familyNames` | 86 个家族，有 `Helvetica Neue` |

没验的：真机上往包里写被拒绝；写了 `ios.languages` 的 App 的 `localizations` 和 `preferredLocalizations`；读到真实的译文和 Markdown 译文；`forLocalization` 找到的文件。
