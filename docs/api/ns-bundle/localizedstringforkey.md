---
type: reference
native: "-[NSBundle localizedStringForKey:value:table:localizations:]"
---

# `NSBundle`：`localizedStringForKey()` 方法

**`localizedStringForKey()`** 方法读包里 `.strings` 表中一个键的译文。

## 语法

```
localizedStringForKey(key[, { value, table, localizations }])
```

## 参数

**`key`**

键，字符串。照字符串转换：数会转成字符串，`null` 和 `undefined` 当空串。

**`options.value`**

找不到这个键时给的值，字符串。不给或者是空串时，找不到就给键本身。

**`options.table`**

表的名字，不带 `.strings`。不给时是 `Localizable`。

**`options.localizations`**

按哪几种语言找，字符串数组。不给时按 App 在用的语言。

## 返回值

字符串：译文；找不到时是 `value` 或者键本身。

## 异常

**`TypeError`**

- `localizations` 不是数组：`localizations needs an array of strings`。

## 说明

Nacre 生成的工程里没有 `Localizable.strings`，App 的界面文案一般放在 JS 里。这个方法用来读原生模块或者第三方的包里带的译文。读到真实译文的情况**未在模拟器验证**。

## 示例

```js
const main = NSBundle.mainBundle;
console.log(main.localizedStringForKey('nacre.missing', { value: 'fallback' }));
console.log(main.localizedStringForKey('nacre.missing'));
```

**结果**：包里没有这个键，依次输出 `fallback`、`nacre.missing`。

## 对应的 iOS API

按带没带 `localizations` 调：`localizedStringForKey:value:table:`、`localizedStringForKey:value:table:localizations:`。ObjC 里常用的 `NSLocalizedString` 宏就是前一个。

## 参见

- [`NSBundle`](../ns-bundle.md)
