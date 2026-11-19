---
type: reference
native: "-[NSAttributedString mutableCopy]"
---

# `NSAttributedString`：`mutableCopy()` 方法

**`mutableCopy()`** 方法返回一份内容相同、可以改的副本。

## 语法

```
mutableCopy()
```

### 参数

无。

### 返回值

[`NSMutableAttributedString`](../ns-mutable-attributed-string.md)，内容和原来的相同。改副本不影响原来的。

### 异常

无。

## 示例

```js
const text = new NSAttributedString('abc');
const editable = text.mutableCopy();
editable.appendAttributedString(new NSAttributedString('d'));
console.log(text.string, editable.string);
```

**结果**：控制台输出 `abc abcd`。

## 对应的 iOS API

`-[NSAttributedString mutableCopy]`。

## 参见

- [`copy()`](copy.md)
- [`NSMutableAttributedString`](../ns-mutable-attributed-string.md)
