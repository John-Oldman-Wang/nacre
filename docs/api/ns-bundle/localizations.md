---
type: reference
native: NSBundle.localizations
---

# `NSBundle`：`localizations` 属性

**`localizations`** 属性是包支持的全部语言。

## 值

字符串数组，形如 `['en', 'zh-Hans']`。

- 只读。给它赋值抛 `TypeError`。
- 就是 `nacre.config.json` 里 `ios.languages` 写的那几种。在 iPhone Air 模拟器（iOS 27.2）上运行验收 App 时（没写 `ios.languages`）是 `['en']`。

## 示例

```js
console.log(JSON.stringify(NSBundle.mainBundle.localizations));
```

**结果**：在 iPhone Air 模拟器（iOS 27.2）上运行验收 App 时输出 `["en"]`。

## 对应的 iOS API

`NSBundle.localizations`。

## 参见

- [`NSBundle`](../ns-bundle.md)
- [`preferredLocalizations`](preferredlocalizations.md)
- [配置 App](../../guides/project-config.md)
