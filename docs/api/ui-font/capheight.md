---
type: reference
native: UIFont.capHeight
---

# `UIFont`：`capHeight` 属性

**`capHeight`** 属性是大写字母的高度。

## 值

数，单位 [pt](../units.md)，由字体和字号决定。

- 只读。给它赋值抛 `TypeError`。
- 字体对象不可变，这个值在对象存在期间不会变，所以没有变化通知。
- 具体取值**未在模拟器验证**。

## 示例

```js
const font = UIFont.systemFontOfSize(17);
console.log(font.capHeight);
```

**结果**：控制台输出 17 pt 系统字体里大写字母的高度。

## 对应的 iOS API

`UIFont.capHeight`。

## 参见

- [字体度量](../ui-font.md#字体度量)
