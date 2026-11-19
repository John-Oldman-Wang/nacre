---
type: reference
native: "-[NSMutableAttributedString appendAttributedString:]"
---

# `NSMutableAttributedString`：`appendAttributedString()` 方法

**`appendAttributedString()`** 方法把另一个富文本接在末尾，属性跟着走。

## 语法

```
appendAttributedString(other)
```

### 参数

**`other`**

一个 `NSAttributedString`。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

`other` 不是 `NSAttributedString`：`appendAttributedString needs an NSAttributedString, got "尾巴"`。

## 示例

```js
const text = new NSMutableAttributedString('评分 ');
text.appendAttributedString(new NSAttributedString('4.8', { kern: 1 }));
console.log(text.string);
```

**结果**：控制台输出 `评分 4.8`。

## 对应的 iOS API

`-[NSMutableAttributedString appendAttributedString:]`。

## 参见

- [`insertAttributedString()`](insertattributedstring.md)
