---
type: reference
native: UIFont.pointSize
---

# `UIFont`：`pointSize` 属性

**`pointSize`** 属性是字号。

## 值

数，单位 [pt](../units.md)。等于创建时给的字号；[`preferredFontForTextStyle()`](preferredfontfortextstyle.md) 得到的字体是当时的文字大小设置下的字号。

- 只读。给它赋值抛 `TypeError`。
- 字体对象不可变，这个值在对象存在期间不会变，所以没有变化通知。

## 示例

```js
const font = UIFont.systemFontOfSize(17);
console.log(font.pointSize);
console.log(UIFont.preferredFontForTextStyle('title1').pointSize);
```

**结果**：第一行输出 `17`；第二行输出当前设置下一级标题的字号。

## 对应的 iOS API

`UIFont.pointSize`。

## 参见

- [字体度量](../ui-font.md#字体度量)
