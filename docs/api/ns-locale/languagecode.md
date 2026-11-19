---
type: reference
native: NSLocale.languageCode
---

# `NSLocale`：`languageCode` 属性

**`languageCode`** 属性是这个地区的语言代码。

## 值

字符串，ISO 639 代码，形如 `'de'`、`'zh'`。

- 只读。给它赋值抛 `TypeError`，原值不变。

## 示例

```js
console.log(new NSLocale('de_DE').languageCode);
```

**结果**：输出 `de`。

## 对应的 iOS API

`NSLocale.languageCode`。

## 参见

- [`NSLocale`](../ns-locale.md)
- [`localizedStringForLanguageCode()`](localizedstringforlanguagecode.md)
