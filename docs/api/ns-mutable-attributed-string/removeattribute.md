---
type: reference
native: "-[NSMutableAttributedString removeAttribute:range:]"
---

# `NSMutableAttributedString`：`removeAttribute()` 方法

**`removeAttribute()`** 方法去掉一段文字里的一个属性。这一段本来没有这个属性也不报错。

## 语法

```
removeAttribute(name, { range })
```

### 参数

**`name`**

属性的名字，见[富文本的属性](../ns-attributed-string.md#富文本的属性)。

**`options.range`**

必填。要改的范围，[`NSRange`](../ns-attributed-string.md#范围怎么写) 或 `{ location, length }`。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- 没给 `range`：`removeAttribute needs { range }`。
- 属性名写错：`NSAttributedString has no attribute "colour"; expected one of: …`。
- `range` 越界：`removeAttribute range {8, 9} is out of bounds; the string length is 10`。

## 示例

```js
const text = new NSMutableAttributedString('abc', { kern: 3 });
text.removeAttribute('kern', { range: new NSRange(0, 1) });
console.log(text.attribute('kern', { atIndex: 0 }), text.attribute('kern', { atIndex: 1 }));
```

**结果**：控制台输出 `null 3`。

## 对应的 iOS API

`-[NSMutableAttributedString removeAttribute:range:]`。

## 参见

- [`addAttribute()`](addattribute.md)
