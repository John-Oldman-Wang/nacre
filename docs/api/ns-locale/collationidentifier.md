---
type: reference
native: NSLocale.collationIdentifier
---

# `NSLocale`：`collationIdentifier` 属性

**`collationIdentifier`** 属性是这个地区排序文字用的规则。

## 值

字符串或 `null`，形如 `'phonebook'`。

- 只读。给它赋值抛 `TypeError`，原值不变。
- 标识里用 `@collation=` 指定的规则优先：`new NSLocale('de_DE@collation=phonebook')` 读到 `'phonebook'`。
- 没指定时实测读到 `'standard'`，不是 `null`。什么情况下是 `null` **未在模拟器验证**。

## 示例

```js
console.log(new NSLocale('de_DE@collation=phonebook').collationIdentifier);
```

**结果**：输出 `phonebook`。

## 对应的 iOS API

`NSLocale.collationIdentifier`。

## 参见

- [`NSLocale`](../ns-locale.md)
- [`localizedStringForCollationIdentifier()`](localizedstringforcollationidentifier.md)
