---
type: reference
native: UIFont.xHeight
---

# `UIFont`：`xHeight` 属性

**`xHeight`** 属性是小写字母 x 的高度。

## 值

数，单位 [pt](../units.md)，由字体和字号决定。

- 只读。给它赋值抛 `TypeError`。
- 字体对象不可变，这个值在对象存在期间不会变，所以没有变化通知。
- 具体取值**未在模拟器验证**。

## 示例

```js
const font = UIFont.systemFontOfSize(17);
console.log(font.xHeight);
```

**结果**：控制台输出 17 pt 系统字体里小写 x 的高度。

## 对应的 iOS API

`UIFont.xHeight`。

## 参见

- [字体度量](../ui-font.md#字体度量)
