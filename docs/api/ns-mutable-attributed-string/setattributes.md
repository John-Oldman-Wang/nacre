---
type: reference
native: "-[NSMutableAttributedString setAttributes:range:]"
---

# `NSMutableAttributedString`：`setAttributes()` 方法

**`setAttributes()`** 方法把一段文字的属性整个换成给的这一组。原来有、这一组里没有的属性被去掉。

## 语法

```
setAttributes(attributes, { range })
```

### 参数

**`attributes`**

一组[属性](../ns-attributed-string.md#富文本的属性)。给 `null` 是清空这一段的全部属性。

**`options.range`**

必填。要改的范围，[`NSRange`](../ns-attributed-string.md#范围怎么写) 或 `{ location, length }`。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- 没给 `range`：`setAttributes needs { range }`。
- 属性名写错、值的类型不对，和 [`addAttribute()`](addattribute.md) 相同。
- `range` 越界：`setAttributes range {8, 9} is out of bounds; the string length is 10`。

## 示例

```js
const text = new NSMutableAttributedString('abc', { kern: 3 });
text.setAttributes({ ligature: 0 }, { range: new NSRange(0, 3) });
console.log(JSON.stringify(text.attributesAtIndex(0)));
```

**结果**：控制台输出 `{"ligature":0}`。原来的 `kern` 被去掉了。

## 对应的 iOS API

`-[NSMutableAttributedString setAttributes:range:]`。

## 参见

- [`addAttributes()`](addattributes.md)：只加，不去掉别的
