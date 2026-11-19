---
type: reference
native: "+[UIFont boldSystemFontOfSize:]"
---

# `UIFont.boldSystemFontOfSize()` 静态方法

**`UIFont.boldSystemFontOfSize()`** 静态方法返回一个指定字号的粗体系统字体。

## 语法

```
UIFont.boldSystemFontOfSize(size)
```

### 参数

**`size`**

字号，数，单位 [pt](../units.md)。

### 返回值

`UIFont`，不会是 `null`。

### 异常

无。这个方法不接受 `weight`。

## 说明

要其他粗细，用 [`systemFontOfSize()`](systemfontofsize.md) 的 `weight`。

## 示例

```js
const label = new UILabel();
label.text = '粗体';
label.font = UIFont.boldSystemFontOfSize(17);
```

**效果**：文字变成 17 pt 的粗体。**未在模拟器验证。**

## 对应的 iOS API

`+[UIFont boldSystemFontOfSize:]`。

## 参见

- [字重](../ui-font.md#字重)
- [设置字体](../../guides/fonts.md)
