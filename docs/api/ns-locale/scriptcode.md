---
type: reference
native: NSLocale.scriptCode
---

# `NSLocale`：`scriptCode` 属性

**`scriptCode`** 属性是这个地区的文字代码。

## 值

字符串或 `null`。字符串是 ISO 15924 代码，形如 `'Hant'`、`'Latn'`。

- 只读。给它赋值抛 `TypeError`，原值不变。
- 标识里没有写文字时是 `null`。
- 用下划线写、写的又是这个语言和地区默认的文字时，系统会把它去掉，也是 `null`：`'zh_Hans_CN'` 和 `'zh_Hant_TW'` 都读到 `null`，`'zh_Hant_CN'` 读到 `'Hant'`，用短横线写的 `'zh-Hant-TW'` 读到 `'Hant'`。这是实测的行为。

要知道简体还是繁体，不能只看这个属性是不是 `null`，要同时看语言和地区。

## 示例

```js
console.log(new NSLocale('zh_Hant_CN').scriptCode);
console.log(new NSLocale('zh_Hans_CN').scriptCode);
```

**结果**：依次输出 `Hant`、`null`。

## 对应的 iOS API

`NSLocale.scriptCode`。

## 参见

- [`NSLocale`](../ns-locale.md)
- [`localizedStringForScriptCode()`](localizedstringforscriptcode.md)
