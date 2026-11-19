---
type: reference
native: "+[UIFont systemFontOfSize:weight:]"
---

# `UIFont.systemFontOfSize()` 静态方法

**`UIFont.systemFontOfSize()`** 静态方法返回一个指定字号的系统字体，可以指定粗细。系统字体是 iOS 界面默认使用的字体。

## 语法

```
UIFont.systemFontOfSize(size, [{ weight }])
```

### 参数

**`size`**

字号，数，单位 [pt](../units.md)。

**`options.weight`**

可选。[字重](../ui-font.md#字重)名，下面九个之一，从细到粗：`'ultraLight'`、`'thin'`、`'light'`、`'regular'`、`'medium'`、`'semibold'`、`'bold'`、`'heavy'`、`'black'`。不传时是 `'regular'`。

### 返回值

`UIFont`，不会是 `null`。字号和粗细都相同时，每次返回同一个对象。

### 异常

**`TypeError`**

`weight` 不是九个名字之一，比如：

```
TypeError: weight has no value "extrabold"; expected one of: ultraLight / thin / light / regular / medium / semibold / bold / heavy / black
```

## 说明

同一组参数得到的是同一个对象：`UIFont.systemFontOfSize(17) === UIFont.systemFontOfSize(17)` 是 `true`。

## 示例

```js
const regular = UIFont.systemFontOfSize(17);
const heavy = UIFont.systemFontOfSize(28, { weight: 'heavy' });
console.log(regular.fontName, heavy.pointSize);
```

**结果**：控制台输出 `.SFUI-Regular 28`。

## 对应的 iOS API

`+[UIFont systemFontOfSize:weight:]`。字重常量去掉前缀、首字母小写：`UIFontWeightSemibold` 写成 `'semibold'`。

## 参见

- [字重](../ui-font.md#字重)
- [设置字体](../../guides/fonts.md)
