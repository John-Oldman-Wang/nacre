---
type: reference
native: NSLocale.localeIdentifier
---

# `NSLocale`：`localeIdentifier` 属性

**`localeIdentifier`** 属性是这个地区的标识。

## 值

字符串，形如 `'de_DE'`。

- 只读。给它赋值抛 `TypeError`，原值不变。
- 是建这个地区时写的标识，但用下划线写时，这个语言和地区默认的文字会被去掉：`new NSLocale('zh_Hans_CN')` 读到 `'zh_CN'`。
- 在 iPhone Air 模拟器（iOS 27.2，系统语言简体中文、地区中国）上，`NSLocale.currentLocale`读到 `'en_CN'`。

## 示例

```js
console.log(new NSLocale('zh_Hans_CN').localeIdentifier);
```

**结果**：输出 `zh_CN`。

## 对应的 iOS API

`NSLocale.localeIdentifier`。

## 参见

- [`NSLocale`](../ns-locale.md)
