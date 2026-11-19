---
type: reference
native: "-[NSBundle localizedAttributedStringForKey:value:table:]"
---

# `NSBundle`：`localizedAttributedStringForKey()` 方法

**`localizedAttributedStringForKey()`** 方法和 [`localizedStringForKey()`](localizedstringforkey.md) 一样读译文，但译文里的 Markdown 变成富文本。

## 语法

```
localizedAttributedStringForKey(key[, { value, table }])
```

## 参数

**`key`**

键，字符串。照字符串转换：数会转成字符串，`null` 和 `undefined` 当空串。

**`options.value`**、**`options.table`**

和 `localizedStringForKey()` 相同。

## 返回值

[`NSAttributedString`](../ns-attributed-string.md)。

## 异常

无。

## 说明

译文里的 Markdown 变成了哪些属性**未在模拟器验证**：验收只读过没有 Markdown 的值。

## 示例

```js
const text = NSBundle.mainBundle.localizedAttributedStringForKey('nacre.missing', { value: 'plain' });
console.log(text.string);
```

**结果**：输出 `plain`。

## 对应的 iOS API

`-[NSBundle localizedAttributedStringForKey:value:table:]`。

## 参见

- [`NSBundle`](../ns-bundle.md)
