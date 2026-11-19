# 地区：实现说明

← [实现原理](README.md)

`NSLocale` 一个类，加上 `application` 上的 `localechange` 事件。客户反馈（2026-11-19）要读系统的首选语言和地区：首次启动按系统语言选界面语言，金额和日期按地区写。之前他们只能从 `Intl.NumberFormat().resolvedOptions().locale` 去猜。

## 不做 `navigator`

Web 上拿语言的地方是 `navigator.language` / `navigator.languages`，变化事件 `languagechange` 派发在 `window` 上。定下来不仿这一套（2026-11-19），理由：

- `navigator` 代表「用户代理」，也就是浏览器这个夹在用户和网页中间的程序。Nacre 里没有这一层，App 自己就是那个程序。「这个 App」有 `application`，「这台设备」有 `UIDevice`，再加一个 `navigator`，没人说得清它和这两个的区别。
- Web 的 `navigator` 上什么都挂（语言、剪贴板、定位、分享、震动、存储……），这正是原则 1 要避开的东西。这些能力在 Nacre 里已经按名词分开放了。
- 不少 npm 库用 `typeof navigator !== 'undefined'` 判断自己是不是在浏览器里，判断成立就去碰 DOM。React Native 为此在 `navigator.product` 上写了 `'ReactNative'`。我们不定义 `navigator`，就不会骗到这些库。
- Web 只有语言列表，地区只是语言标签的一部分。iOS 把语言和地区分成两项设置（可以是「语言英文、地区中国」），`navigator.languages` 装不下这层语义。

Web 标准里不经过 `navigator` 拿用户地区的写法是 `new Intl.DateTimeFormat().resolvedOptions().locale`，这在 Nacre 上本来就对：`Intl` 不传地区时用首选语言里的第一个（见 [Intl](intl.md#默认地区跟系统不照网页)）。

## 事件挂在 `application` 上，叫 `localechange`

`NSCurrentLocaleDidChangeNotification` 是全局的通知，不属于哪个对象。Web 把同类的通知（`languagechange`）派发在全局对象上，我们全局对象的对应物是 `application`。`application` 上已经有同类的 `significanttimechange`、`contentsizecategorychange`，都是系统级的状态变化。所以加在 `NacreRuntime.mm` 的通知表里，一行。

另一种做法是挂在 `NSLocale.autoupdatingCurrentLocale` 那个对象上，只加新文件、不碰共享文件。没选它：iOS 的通知本身不属于任何对象，挂在一个具体的地区对象上，读的人得先知道是哪个对象。

名字不借 Web 的 `languagechange`：这个通知说的是**地区设置变了**（国家或地区、日历、温度单位），不是首选语言的列表变了。按事件名的规矩，含义不同就不借。用户改系统语言时，iOS 会结束正在运行的 App，所以 App 运行中收不到「语言变了」（**未实测**）。

## 手写，没用 bindgen

`bindgen scaffold` 写不出这个类：`init` 标着不可用，成员一大半是类属性和类方法（它还写不出这两种）。照它的格式手写：

- 字符串数组的类属性（`preferredLanguages` 和四个 ISO 列表）没有现成的「类级标量」通道，走没有参数的类方法（`classCall`，`nativeClassCallValue`）。
- 三个系统的地区（`currentLocale`、`autoupdatingCurrentLocale`、`systemLocale`）走类级的对象属性（`classObject`）。
- 可空的字符串属性返回 `NSNull`：读属性的通道上 `nil` 的意思是「不认领」。
- 字符串参数在 JS 一侧照字符串转换（`toText`：`null` 和 `undefined` 当空串），原生只校验。

三边核对按字面读 part：一开始用循环往原型上挂 18 个 getter，核对认不出，改成逐个写出来。

## 没接的

记在 `overrides.json` 的 `exclude` 里（它管 `scaffold` 不生成这些成员；`report` 里它们还是列在「还没接」，那一行就是这张清单）：

| 成员 | 为什么 |
| --- | --- |
| `countryCode` | Apple 打算废弃，值和 `regionCode` 一样 |
| `exemplarCharacterSet` | 返回 `NSCharacterSet`，那个类没接 |
| `objectForKey:`、`displayNameForKey:value:` | 按 `NSLocaleKey` 常量取值，和各个属性、`localizedStringFor…` 重复 |
| `componentsFromLocaleIdentifier:`、`localeIdentifierFromComponents:` | 字典的键是一组字符串常量（`kCFLocaleLanguageCodeKey` 这种）。拆用 `new NSLocale(id)` 的属性，拼用 `canonicalLocaleIdentifierFromString:`，能力没丢 |
| Windows 区域代码的一对 | App 用不到 |
| `supportsSecureCoding`、`encodeWithCoder:`、`copyWithZone:`、`initWithCoder:` | 归档和复制的协议成员 |

App 实际在用、支持的语言列表（`NSBundle.preferredLocalizations`）在 `NSBundle` 上，和「读 App 包里的文件」一起做。

## 实测

iPhone Air 模拟器（iOS 27.2），系统语言简体中文、地区中国。下划线去掉文字那一条先在 Mac（macOS 27.2.1）上试出规律，再写进验收在模拟器上验了；`sr_Cyrl_RS` 只在 Mac 上试过。

| | 结果 |
| --- | --- |
| `preferredLanguages` | `['zh-Hans-CN']` |
| `currentLocale` | `en_CN`：验收 App 没写 `ios.languages`，只有英文，所以语言是英文；地区是用户设的中国。Apple 的文档写明了这一条：App 不支持用户的语言时，`currentLocale` 给 App 支持的语言 |
| `currentLocale` 的 `languageIdentifier`、`currencyCode` | `en-CN`、`CNY` |
| `systemLocale` 的 `localeIdentifier` | 空串 |
| 下划线写的标识 | 去掉这个语言和地区**默认的文字**，`localeIdentifier` 跟着变：`zh_Hans_CN` → `zh_CN`（`scriptCode` 是 `null`），`zh_Hant_TW` → `zh_TW`（`scriptCode` 是 `null`），Mac 上 `sr_Cyrl_RS` → `sr_RS`。不是默认的留着：`zh_Hant_CN` 的 `scriptCode` 是 `Hant` |
| 短横线写的标识 | 文字留着：`zh-Hant-TW` 的 `scriptCode` 是 `Hant`，`zh-Hans-CN` 是 `Hans`。`preferredLanguages` 给的就是这种写法 |
| 没指定排序规则时的 `collationIdentifier` | `standard`，不是 `null`（头文件标着可空） |
| `canonicalLocaleIdentifierFromString` | 改大小写，不换分隔符：`en-US` → `en-US`，`en_us` → `en_US`，`zh-hans-cn` → `zh-Hans-CN` |
| `localizedStringForScriptCode('Hans')`（`en_US`） | `Simplified Han`。Apple 文档的例子是 `Hant` → `Traditional Han` |

写用例时有五条预期是凭印象写的，跑出来不对：上表里下划线去掉文字、`standard`、`Simplified Han`、分隔符那几条。查过 Apple 的文档，只有 `Simplified Han` 有文档的例子作证，别的文档没写，以实测为准。

没验的：`localechange` 真的派发（要在系统设置里改地区）、改系统语言时 App 是不是被结束、`autoupdatingCurrentLocale` 跟着设置变。
