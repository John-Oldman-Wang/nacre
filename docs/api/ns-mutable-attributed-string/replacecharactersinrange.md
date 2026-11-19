---
type: reference
native: "-[NSMutableAttributedString replaceCharactersInRange:withString:]"
---

# `NSMutableAttributedString`：`replaceCharactersInRange()` 方法

**`replaceCharactersInRange()`** 方法把一段文字换成一个字符串，或者换成另一个富文本。

## 语法

```
replaceCharactersInRange(range, { withString })
replaceCharactersInRange(range, { withAttributedString })
```

### 参数

**`range`**

要改的范围，[`NSRange`](../ns-attributed-string.md#范围怎么写) 或 `{ location, length }`。

**`options.withString`**

换上去的字符串。新文字沿用被换掉那一段第一个字符的属性；`range` 的长度是 0 时沿用前一个字符的。

**`options.withAttributedString`**

换上去的富文本，属性用它自己的。

两个选项给一个。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- 两个选项都没给：`replaceCharactersInRange needs { withString } or { withAttributedString }`。
- `withAttributedString` 不是 `NSAttributedString`：`replaceCharactersInRange withAttributedString needs an NSAttributedString, got …`。
- `range` 越界：`replaceCharactersInRange range {8, 9} is out of bounds; the string length is 10`。

## 示例

```js
const text = new NSMutableAttributedString('abc', { kern: 3 });
text.replaceCharactersInRange(new NSRange(1, 1), { withString: 'XYZ' });
console.log(text.string, text.attribute('kern', { atIndex: 2 }));
```

**结果**：控制台输出 `aXYZc 3`。新文字沿用了原来的 `kern`。

## 对应的 iOS API

`-[NSMutableAttributedString replaceCharactersInRange:withString:]`、`-replaceCharactersInRange:withAttributedString:`。第二段放进 options 对象。

## 参见

- [`deleteCharactersInRange()`](deletecharactersinrange.md)
