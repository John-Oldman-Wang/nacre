---
type: reference
native: "-[NSMutableAttributedString deleteCharactersInRange:]"
---

# `NSMutableAttributedString`：`deleteCharactersInRange()` 方法

**`deleteCharactersInRange()`** 方法删掉一段文字，连同它的属性。

## 语法

```
deleteCharactersInRange(range)
```

### 参数

**`range`**

要改的范围，[`NSRange`](../ns-attributed-string.md#范围怎么写) 或 `{ location, length }`。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

`range` 越界：`deleteCharactersInRange range {8, 9} is out of bounds; the string length is 10`。

## 示例

```js
const text = new NSMutableAttributedString('>abc');
text.deleteCharactersInRange(new NSRange(0, 1));
console.log(text.string);
```

**结果**：控制台输出 `abc`。

## 对应的 iOS API

`-[NSMutableAttributedString deleteCharactersInRange:]`。

## 参见

- [`replaceCharactersInRange()`](replacecharactersinrange.md)
