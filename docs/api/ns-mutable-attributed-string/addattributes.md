---
type: reference
native: "-[NSMutableAttributedString addAttributes:range:]"
---

# `NSMutableAttributedString`：`addAttributes()` 方法

**`addAttributes()`** 方法给一段文字加一组属性。同名的被覆盖，其他属性不动。

## 语法

```
addAttributes(attributes, { range })
```

### 参数

**`attributes`**

一组[属性](../ns-attributed-string.md#富文本的属性)，一个对象。值是 `undefined` 的键视为没带。

**`options.range`**

必填。要改的范围，[`NSRange`](../ns-attributed-string.md#范围怎么写) 或 `{ location, length }`。

### 返回值

无（`undefined`）。

颜色字符串写错时不抛：打一条警告，这个键不生效，其他键照常。

### 异常

**`TypeError`**

- 没给 `range`：`addAttributes needs { range }`。
- 属性名写错、值的类型不对，和 [`addAttribute()`](addattribute.md) 相同。
- `range` 越界：`addAttributes range {8, 9} is out of bounds; the string length is 10`。

## 示例

```js
const text = new NSMutableAttributedString('实线 双线 虚线', {
  font: UIFont.systemFontOfSize(17),
});
text.addAttributes(
  { underlineStyle: ['single', 'patternDash'], underlineColor: 'systemRed' },
  { range: new NSRange(6, 2) },
);
```

**效果**：「虚线」两个字下面一条红色的虚线。

## 对应的 iOS API

`-[NSMutableAttributedString addAttributes:range:]`。

## 参见

- [`addAttribute()`](addattribute.md)
- [`setAttributes()`](setattributes.md)
