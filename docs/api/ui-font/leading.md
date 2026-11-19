---
type: reference
native: UIFont.leading
---

# `UIFont`：`leading` 属性

**`leading`** 属性是字体建议的行与行之间的额外间距。

## 值

数，单位 [pt](../units.md)，由字体和字号决定。

- 只读。给它赋值抛 `TypeError`。
- 字体对象不可变，这个值在对象存在期间不会变，所以没有变化通知。
- 具体取值**未在模拟器验证**。

## 示例

```js
const font = UIFont.systemFontOfSize(17);
console.log(font.leading);
```

**结果**：控制台输出这个字体建议的行间额外间距。

## 对应的 iOS API

`UIFont.leading`。

## 参见

- [字体度量](../ui-font.md#字体度量)
