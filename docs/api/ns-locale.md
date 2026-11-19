---
type: reference
native: NSLocale
---

# `NSLocale`

**`NSLocale`** 表示一个地区：一种语言，加上国家或地区，以及跟着它们走的格式——货币、小数点和千分位、日历、引号、公制还是英制。

用户的设置从三个静态属性读：

- [`NSLocale.preferredLanguages`](ns-locale/preferredlanguages.md)：用户在系统设置里排好序的语言。
- [`NSLocale.currentLocale`](ns-locale/currentlocale.md)：App 所用的地区。语言是 App 实际在用的语言，从 App 声明支持的语言里挑；国家或地区和各种格式是用户在系统设置里设的。
- [`NSLocale.autoupdatingCurrentLocale`](ns-locale/autoupdatingcurrentlocale.md)：同上，但值跟着用户的设置变。

iOS 把语言和地区分成两项设置，用户可以设成「语言英文、地区中国」。所以「用什么语言显示界面」和「用什么格式写金额和日期」要分开取：前者看 `currentLocale` 的语言，后者看它的地区和格式。

用户改了地区设置，[`application`](application.md) 上派发 [`localechange`](application/localechange-event.md) 事件。

**继承关系**：`EventTarget` → `NSObject` → `NSLocale`

## 构造函数

[`NSLocale()`](ns-locale/constructor.md)

按地区标识建一个地区，比如 `new NSLocale('de_DE')`。

## 静态属性

| 属性 | 说明 |
| --- | --- |
| [`preferredLanguages`](ns-locale/preferredlanguages.md) <small>只读</small> | 用户在系统设置里排好序的语言 |
| [`currentLocale`](ns-locale/currentlocale.md) <small>只读</small> | App 所用的地区，读的那一刻的值 |
| [`autoupdatingCurrentLocale`](ns-locale/autoupdatingcurrentlocale.md) <small>只读</small> | App 所用的地区，值跟着设置变 |
| [`systemLocale`](ns-locale/systemlocale.md) <small>只读</small> | 不属于任何语言和地区的通用地区 |
| [`availableLocaleIdentifiers`](ns-locale/availablelocaleidentifiers.md) <small>只读</small> | 系统认得的全部地区标识 |
| [`ISOLanguageCodes`](ns-locale/isolanguagecodes.md) <small>只读</small> | 全部语言代码 |
| [`ISOCountryCodes`](ns-locale/isocountrycodes.md) <small>只读</small> | 全部国家和地区代码 |
| [`ISOCurrencyCodes`](ns-locale/isocurrencycodes.md) <small>只读</small> | 全部货币代码 |
| [`commonISOCurrencyCodes`](ns-locale/commonisocurrencycodes.md) <small>只读</small> | 常用的货币代码 |

## 静态方法

| 方法 | 说明 |
| --- | --- |
| [`localeWithLocaleIdentifier()`](ns-locale/localewithlocaleidentifier.md) | 按地区标识建一个地区，和 `new` 一样 |
| [`canonicalLocaleIdentifierFromString()`](ns-locale/canonicallocaleidentifierfromstring.md) | 把地区标识改成标准的大小写 |
| [`canonicalLanguageIdentifierFromString()`](ns-locale/canonicallanguageidentifierfromstring.md) | 把地区标识改成标准的语言标识 |
| [`characterDirectionForLanguage()`](ns-locale/characterdirectionforlanguage.md) | 一种语言的文字在一行里朝哪个方向写 |
| [`lineDirectionForLanguage()`](ns-locale/linedirectionforlanguage.md) | 一种语言的行朝哪个方向排 |

## 实例属性

还继承 `NSObject` 的属性。下面的属性全部只读。

语言和地区：

| 属性 | 说明 |
| --- | --- |
| [`localeIdentifier`](ns-locale/localeidentifier.md) | 地区标识，形如 `'de_DE'` |
| [`languageCode`](ns-locale/languagecode.md) | 语言代码，形如 `'de'` |
| [`languageIdentifier`](ns-locale/languageidentifier.md) | 语言标识，形如 `'de-DE'` |
| [`regionCode`](ns-locale/regioncode.md) | 国家或地区代码，形如 `'DE'`，可能是 `null` |
| [`scriptCode`](ns-locale/scriptcode.md) | 文字代码，形如 `'Hant'`，可能是 `null` |
| [`variantCode`](ns-locale/variantcode.md) | 变体代码，可能是 `null` |

格式：

| 属性 | 说明 |
| --- | --- |
| [`currencyCode`](ns-locale/currencycode.md) | 货币代码，形如 `'EUR'`，可能是 `null` |
| [`currencySymbol`](ns-locale/currencysymbol.md) | 货币符号，形如 `'€'` |
| [`decimalSeparator`](ns-locale/decimalseparator.md) | 小数点 |
| [`groupingSeparator`](ns-locale/groupingseparator.md) | 千分位分隔符 |
| [`usesMetricSystem`](ns-locale/usesmetricsystem.md) | 是否用公制 |
| [`calendarIdentifier`](ns-locale/calendaridentifier.md) | 日历，形如 `'gregorian'` |
| [`collationIdentifier`](ns-locale/collationidentifier.md) | 排序文字的规则 |
| [`collatorIdentifier`](ns-locale/collatoridentifier.md) | 排序文字时用的标识 |
| [`quotationBeginDelimiter`](ns-locale/quotationbegindelimiter.md) | 开引号 |
| [`quotationEndDelimiter`](ns-locale/quotationenddelimiter.md) | 闭引号 |
| [`alternateQuotationBeginDelimiter`](ns-locale/alternatequotationbegindelimiter.md) | 引号里套引号时的开引号 |
| [`alternateQuotationEndDelimiter`](ns-locale/alternatequotationenddelimiter.md) | 引号里套引号时的闭引号 |

## 实例方法

用这个地区的语言说出一个代码的名字：

| 方法 | 说明 |
| --- | --- |
| [`localizedStringForLocaleIdentifier()`](ns-locale/localizedstringforlocaleidentifier.md) | 地区标识的名字：`'fr_FR'` → `'French (France)'` |
| [`localizedStringForLanguageCode()`](ns-locale/localizedstringforlanguagecode.md) | 语言的名字：`'de'` → `'German'` |
| [`localizedStringForCountryCode()`](ns-locale/localizedstringforcountrycode.md) | 国家或地区的名字：`'JP'` → `'Japan'` |
| [`localizedStringForScriptCode()`](ns-locale/localizedstringforscriptcode.md) | 文字的名字：`'Hant'` → `'Traditional Han'` |
| [`localizedStringForVariantCode()`](ns-locale/localizedstringforvariantcode.md) | 变体的名字 |
| [`localizedStringForCalendarIdentifier()`](ns-locale/localizedstringforcalendaridentifier.md) | 日历的名字：`'gregorian'` → `'Gregorian Calendar'` |
| [`localizedStringForCollationIdentifier()`](ns-locale/localizedstringforcollationidentifier.md) | 排序规则的名字 |
| [`localizedStringForCurrencyCode()`](ns-locale/localizedstringforcurrencycode.md) | 货币的名字：`'EUR'` → `'Euro'` |
| [`localizedStringForCollatorIdentifier()`](ns-locale/localizedstringforcollatoridentifier.md) | 排序标识的名字 |

## 事件

`NSLocale` 自己不派发事件。用户改了地区设置时派发的是 [`application`](application.md) 上的 [`localechange`](application/localechange-event.md)。

## 示例

### 读用户的语言和地区

```js
const locale = NSLocale.currentLocale;
console.log(JSON.stringify(NSLocale.preferredLanguages));
console.log(locale.languageCode, locale.regionCode, locale.currencyCode);
console.log(locale.decimalSeparator, locale.usesMetricSystem);
```

**结果**：在 iPhone Air 模拟器（iOS 27.2，系统语言简体中文、地区中国）上运行验收 App（它只支持英文），输出三行：

```
["zh-Hans-CN"]
en CN CNY
. true
```

首选语言是中文，`currentLocale` 的语言却是英文：App 只支持英文，系统就给了英文。

### 选界面语言

App 自己带了几种语言的文案、要按用户的偏好挑一种时，从 `preferredLanguages` 里按顺序找第一个自己有的：

```js
const supported = ['en', 'zh-Hans', 'ja'];
function pickLanguage() {
  for (const tag of NSLocale.preferredLanguages) {
    const locale = new NSLocale(tag);
    const script = locale.scriptCode;
    const candidates = [script === null ? locale.languageCode : locale.languageCode + '-' + script, locale.languageCode];
    for (const c of candidates) {
      if (supported.includes(c)) return c;
    }
  }
  return supported[0];
}
console.log(pickLanguage());
```

**结果**：首选语言是 `zh-Hans-CN` 时，`new NSLocale('zh-Hans-CN')` 的 `scriptCode` 是 `'Hans'`，输出 `zh-Hans`。**未在模拟器验证。**

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[NSLocale preferredLanguages]` | `NSLocale.preferredLanguages` |
| `[NSLocale currentLocale]` | `NSLocale.currentLocale` |
| `[[NSLocale alloc] initWithLocaleIdentifier:@"de_DE"]` | `new NSLocale('de_DE')` |
| `locale.regionCode` | `locale.regionCode` |
| `locale.countryCode` | `locale.regionCode` |
| `[locale objectForKey:NSLocaleCurrencyCode]` | `locale.currencyCode` |
| `[locale displayNameForKey:NSLocaleLanguageCode value:@"de"]` | `locale.localizedStringForLanguageCode('de')` |
| `NSLocaleLanguageDirectionRightToLeft` | `'rightToLeft'` |
| `NSCurrentLocaleDidChangeNotification` | `application.addEventListener('localechange', …)` |

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 读这个地区常用的字符 | `exemplarCharacterSet`（`NSCharacterSet` 没有提供） |
| 把地区标识拆成各段的字典、从字典拼回来 | `componentsFromLocaleIdentifier:`、`localeIdentifierFromComponents:`。拆用 `new NSLocale(id)` 的各项属性，拼用 `canonicalLocaleIdentifierFromString()` |
| 和 Windows 的区域代码互换 | `localeIdentifierFromWindowsLocaleCode:`、`windowsLocaleCodeFromLocaleIdentifier:` |
| 读 App 实际支持、正在用的语言列表 | `NSBundle.preferredLocalizations` |

## 参见

- [`Intl.NumberFormat`](intl.md)、[`Intl.DateTimeFormat`](intl-date.md)：按地区把数字和日期写成文字
- [`localechange`](application/localechange-event.md)：用户改了地区设置
- [配置 App](../guides/project-config.md)：`ios.languages` 声明 App 支持哪些语言
- [`application.layoutDirection`](application/layoutdirection.md)：界面从左往右还是从右往左
