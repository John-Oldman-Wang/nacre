---
type: reference
native: UIFont.fontName
---

# `UIFont`：`fontName` 属性

**`fontName`** 属性是具体的字体名。系统字体是 `.SFUI-Regular`、`.SFUI-Bold` 这类以点开头的名字。

## 值

字符串，由字体决定。

系统字体的 `fontName` 不保证能用 [`fontWithName()`](fontwithname.md) 取回（**未在模拟器验证**）。指定名字的字体可以用它的 `fontName` 再取一个不同字号的。

- 只读。给它赋值抛 `TypeError`。
- 字体对象不可变，这个值在对象存在期间不会变，所以没有变化通知。

## 示例

```js
const font = UIFont.systemFontOfSize(34, { weight: 'bold' });
console.log(font.fontName);
```

**结果**：控制台输出 `.SFUI-Bold`。

## 对应的 iOS API

`UIFont.fontName`。

## 参见

- [字体度量](../ui-font.md#字体度量)
