---
type: reference
native: "-[NSAttributedString attribute:atIndex:effectiveRange:]"
---

# `NSAttributedString`：`attribute()` 方法

**`attribute()`** 方法返回某个位置上的一个属性。

## 语法

```
attribute(name, { atIndex })
```

### 参数

**`name`**

属性的名字，见[富文本的属性](../ns-attributed-string.md#富文本的属性)。

**`options.atIndex`**

必填。位置，UTF-16 码元的下标。

### 返回值

这个属性的值；这个位置上没有这个属性时是 `null`。值的形状和 [`attributesAtIndex()`](attributesatindex.md) 读出来的相同。

### 异常

**`TypeError`**

- 没给 `atIndex`：`attribute needs { atIndex }`。
- 属性名不认识：`NSAttributedString has no attribute "colour"; expected one of: …`。
- `atIndex` 越界。

## 示例

```js
const text = new NSMutableAttributedString('合计 ¥128');
text.addAttribute('kern', { value: 2, range: new NSRange(3, 4) });
console.log(text.attribute('kern', { atIndex: 3 }));
console.log(text.attribute('font', { atIndex: 3 }));
```

**结果**：依次输出 `2` 和 `null`。

## 对应的 iOS API

`-[NSAttributedString attribute:atIndex:effectiveRange:]`。

## 参见

- [`attributesAtIndex()`](attributesatindex.md)
