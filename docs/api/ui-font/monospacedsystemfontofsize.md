---
type: reference
native: "+[UIFont monospacedSystemFontOfSize:weight:]"
---

# `UIFont.monospacedSystemFontOfSize()` 静态方法

**`UIFont.monospacedSystemFontOfSize()`** 静态方法返回一个指定字号的系统等宽字体。等宽字体里每个字符占的宽度相同，适合显示代码、需要上下对齐成列的文字。

## 语法

```
UIFont.monospacedSystemFontOfSize(size, [{ weight }])
```

### 参数

**`size`**

字号，数，单位 [pt](../units.md)。

**`options.weight`**

可选。[字重](../ui-font.md#字重)名，下面九个之一，从细到粗：`'ultraLight'`、`'thin'`、`'light'`、`'regular'`、`'medium'`、`'semibold'`、`'bold'`、`'heavy'`、`'black'`。不传时是 `'regular'`。

### 返回值

`UIFont`，不会是 `null`。

### 异常

**`TypeError`**

`weight` 不是九个名字之一，比如：

```
TypeError: weight has no value "extrabold"; expected one of: ultraLight / thin / light / regular / medium / semibold / bold / heavy / black
```

## 说明

原生的这个方法必须传字重。这里 `weight` 可以省略，省略时是 `'regular'`。

## 示例

```js
const label = new UILabel();
label.text = '0123456789';
label.font = UIFont.monospacedSystemFontOfSize(20, { weight: 'medium' });
console.log(label.font.fontName);
```

**效果**

- 十个数字每个占的宽度相同。
- 控制台输出这个等宽字体的名字。具体是什么名字本文档没有记录。

## 对应的 iOS API

`+[UIFont monospacedSystemFontOfSize:weight:]`。字重常量去掉前缀、首字母小写：`UIFontWeightSemibold` 写成 `'semibold'`。

## 参见

- [字重](../ui-font.md#字重)
- [设置字体](../../guides/fonts.md)
