---
type: reference
native: "+[NSLocale characterDirectionForLanguage:]"
---

# `NSLocale.characterDirectionForLanguage()` 静态方法

**`characterDirectionForLanguage()`** 静态方法给出一种语言的文字在一行里朝哪个方向写。

## 语法

```
NSLocale.characterDirectionForLanguage(isoLangCode)
```

## 参数

**`isoLangCode`**

语言代码，形如 `'ar'`。字符串。照字符串转换：数会转成字符串，`null` 和 `undefined` 当空串。

## 返回值

字符串，取下面的值之一：

| 值 | 含义 |
| --- | --- |
| `'leftToRight'` | 从左往右 |
| `'rightToLeft'` | 从右往左 |
| `'topToBottom'` | 从上往下 |
| `'bottomToTop'` | 从下往上 |
| `'unknown'` | 不知道 |

## 异常

无。

## 说明

界面整体是从左往右还是从右往左排，读 [`application.layoutDirection`](../application/layoutdirection.md)，不用自己按语言算。

## 示例

```js
console.log(NSLocale.characterDirectionForLanguage('ar'));
console.log(NSLocale.characterDirectionForLanguage('en'));
```

**结果**：依次输出 `rightToLeft`、`leftToRight`。

## 对应的 iOS API

`+[NSLocale characterDirectionForLanguage:]`。

## 参见

- [`lineDirectionForLanguage()`](linedirectionforlanguage.md)
