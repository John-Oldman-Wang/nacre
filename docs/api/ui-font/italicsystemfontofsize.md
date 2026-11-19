---
type: reference
native: "+[UIFont italicSystemFontOfSize:]"
---

# `UIFont.italicSystemFontOfSize()` 静态方法

**`UIFont.italicSystemFontOfSize()`** 静态方法返回一个指定字号的斜体系统字体，粗细是常规。

## 语法

```
UIFont.italicSystemFontOfSize(size)
```

### 参数

**`size`**

字号，数，单位 [pt](../units.md)。

### 返回值

`UIFont`，不会是 `null`。

### 异常

无。这个方法不接受 `weight`。

## 说明

不能同时指定斜体和粗细，对应的原生能力 `UIFontDescriptor` 还没有提供。

## 示例

```js
const label = new UILabel();
label.text = 'The quick brown fox';
label.font = UIFont.italicSystemFontOfSize(17);
```

**效果**：文字变成 17 pt 的斜体，字形向右倾斜。**未在模拟器验证。**

## 对应的 iOS API

`+[UIFont italicSystemFontOfSize:]`。

## 参见

- [字重](../ui-font.md#字重)
- [设置字体](../../guides/fonts.md)
