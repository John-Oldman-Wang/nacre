---
type: reference
native: UIFont.ascender
---

# `UIFont`：`ascender` 属性

**`ascender`** 属性是基线到字体最高处的距离。基线是字母站立的那条线。

## 值

数，单位 [pt](../units.md)，由字体和字号决定。

- 只读。给它赋值抛 `TypeError`。
- 字体对象不可变，这个值在对象存在期间不会变，所以没有变化通知。
- 具体取值**未在模拟器验证**。

## 示例

```js
const font = UIFont.systemFontOfSize(17);
console.log(font.ascender, font.descender);
```

**结果**：控制台输出基线以上和基线以下的高度。

## 对应的 iOS API

`UIFont.ascender`。

## 参见

- [字体度量](../ui-font.md#字体度量)
