---
type: reference
native: "-[NSMutableAttributedString insertAttributedString:atIndex:]"
---

# `NSMutableAttributedString`：`insertAttributedString()` 方法

**`insertAttributedString()`** 方法把另一个富文本插在某个位置前面。

## 语法

```
insertAttributedString(other, { atIndex })
```

### 参数

**`other`**

一个 `NSAttributedString`。

**`options.atIndex`**

必填。插在第几个码元前面，按整数转。等于 `length` 时是接在末尾。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- `other` 不是 `NSAttributedString`：`insertAttributedString needs an NSAttributedString, got …`。
- 没给 `atIndex`：`insertAttributedString needs { atIndex }`。
- `atIndex` 越界：`insertAttributedString atIndex 99 is out of bounds; the string length is 10`。

## 示例

```js
const text = new NSMutableAttributedString('abc');
text.insertAttributedString(new NSAttributedString('>'), { atIndex: 0 });
console.log(text.string);
```

**结果**：控制台输出 `>abc`。

## 对应的 iOS API

`-[NSMutableAttributedString insertAttributedString:atIndex:]`。第二段 `atIndex:` 放进 options 对象。

## 参见

- [`appendAttributedString()`](appendattributedstring.md)
