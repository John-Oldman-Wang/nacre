---
type: reference
native: "+[UIFont fontNamesForFamilyName:]"
---

# `UIFont.fontNamesForFamilyName()` 静态方法

**`fontNamesForFamilyName()`** 静态方法列出一个字体家族里各个字体的名字。

## 语法

```
UIFont.fontNamesForFamilyName(familyName)
```

## 参数

**`familyName`**

家族的名字，字符串，取 [`familyNames`](familynames.md) 里的一项。照字符串转换：`null` 和 `undefined` 当空串。

## 返回值

字符串数组：这个家族里各个字体的名字，可以传给 [`fontWithName()`](fontwithname.md)。不认识的家族给空数组。

## 异常

无。

## 示例

```js
const faces = UIFont.fontNamesForFamilyName('Helvetica Neue');
console.log(faces.includes('HelveticaNeue'));
const font = UIFont.fontWithName(faces[0], { size: 17 });
console.log(font !== null);
```

**结果**：依次输出 `true`、`true`。

## 对应的 iOS API

`+[UIFont fontNamesForFamilyName:]`。

## 参见

- [`familyNames`](familynames.md)
- [`fontWithName()`](fontwithname.md)
