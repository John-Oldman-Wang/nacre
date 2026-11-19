---
type: reference
native: NSLocale.languageIdentifier
---

# `NSLocale`：`languageIdentifier` 属性

**`languageIdentifier`** 属性是这个地区的语言标识：语言加上文字和国家或地区，用短横线分隔。

## 值

字符串，形如 `'de-DE'`。

- 只读。给它赋值抛 `TypeError`，原值不变。
- 在 iPhone Air 模拟器（iOS 27.2，系统语言简体中文、地区中国）上，`NSLocale.currentLocale`读到 `'en-CN'`。

## 示例

```js
console.log(new NSLocale('de_DE').languageIdentifier);
```

**结果**：输出 `de-DE`。

## 对应的 iOS API

`NSLocale.languageIdentifier`。

## 参见

- [`NSLocale`](../ns-locale.md)
