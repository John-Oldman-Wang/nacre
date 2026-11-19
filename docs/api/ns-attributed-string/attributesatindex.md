---
type: reference
native: "-[NSAttributedString attributesAtIndex:effectiveRange:]"
---

# `NSAttributedString`：`attributesAtIndex()` 方法

**`attributesAtIndex()`** 方法返回某个位置上的全部属性。

## 语法

```
attributesAtIndex(index)
```

### 参数

**`index`**

位置，UTF-16 码元的下标。按整数转。

### 返回值

一个对象，键是属性的名字，见[富文本的属性](../ns-attributed-string.md#富文本的属性)。没有的属性不出现在里面；一个属性都没有时是 `{}`。

读出来的值：颜色是字符串；字体和附件是写进去的那个对象；段落样式和阴影是副本。

### 异常

**`TypeError`**

- `index` 越界：`attributesAtIndex index 99 is out of bounds; the string length is 10`。
- `index` 转不成有限数。

## 示例

```js
const text = new NSMutableAttributedString('合计 ¥128');
text.addAttribute('kern', { value: 2, range: new NSRange(3, 4) });
console.log(JSON.stringify(text.attributesAtIndex(0)));
console.log(JSON.stringify(text.attributesAtIndex(3)));
```

**结果**：依次输出 `{}` 和 `{"kern":2}`。

## 对应的 iOS API

`-[NSAttributedString attributesAtIndex:effectiveRange:]`。出参 `effectiveRange` 没有提供，要知道一个属性连续生效的范围，用 [`enumerateAttributesInRange()`](enumerateattributesinrange.md)。

## 参见

- [`attribute()`](attribute.md)
