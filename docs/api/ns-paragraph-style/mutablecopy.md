---
type: reference
native: "-[NSParagraphStyle mutableCopy]"
---

# `NSParagraphStyle`：`mutableCopy()` 方法

**`mutableCopy()`** 方法返回一份值相同、可以改的副本。

## 语法

```
mutableCopy()
```

### 参数

无。

### 返回值

[`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md)，属性值和原来的相同。改副本不影响原来的。

### 异常

无。

## 示例

```js
const style = NSParagraphStyle.defaultParagraphStyle.mutableCopy();
style.alignment = 'center';
console.log(style.alignment);
```

**结果**：控制台输出 `center`。

## 对应的 iOS API

`-[NSParagraphStyle mutableCopy]`。

## 参见

- [`copy()`](copy.md)
