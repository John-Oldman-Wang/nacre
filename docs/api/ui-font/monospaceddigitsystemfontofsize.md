---
type: reference
native: "+[UIFont monospacedDigitSystemFontOfSize:weight:]"
---

# `UIFont.monospacedDigitSystemFontOfSize()` 静态方法

**`UIFont.monospacedDigitSystemFontOfSize()`** 静态方法返回一个指定字号的系统字体，其中只有数字是等宽的，字母的样子和普通系统字体相同。

## 语法

```
UIFont.monospacedDigitSystemFontOfSize(size, [{ weight }])
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

计时器、倒计时、价格这类数字会不断变化。普通系统字体里各个数字的宽度不同，数字一变，整行文字的宽度跟着变（**未在模拟器验证**）。用这个方法取的字体避免这种跳动。

原生的这个方法必须传字重。这里 `weight` 可以省略，省略时是 `'regular'`。

## 示例

```js
const label = new UILabel();
label.text = '00:59';
label.font = UIFont.monospacedDigitSystemFontOfSize(17, { weight: 'regular' });
label.text = '01:11';
```

**效果**：文字的样子和普通系统字体相同。`text` 从 `'00:59'` 改成 `'01:11'`，文字的总宽度不变。**未在模拟器验证。**

## 对应的 iOS API

`+[UIFont monospacedDigitSystemFontOfSize:weight:]`。字重常量去掉前缀、首字母小写：`UIFontWeightSemibold` 写成 `'semibold'`。

## 参见

- [字重](../ui-font.md#字重)
- [设置字体](../../guides/fonts.md)
