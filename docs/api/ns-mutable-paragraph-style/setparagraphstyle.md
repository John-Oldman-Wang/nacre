---
type: reference
native: "-[NSMutableParagraphStyle setParagraphStyle:]"
---

# `NSMutableParagraphStyle`：`setParagraphStyle()` 方法

**`setParagraphStyle()`** 方法把另一个段落样式的全部属性值抄过来。

## 语法

```
setParagraphStyle(other)
```

### 参数

**`other`**

一个 `NSParagraphStyle`（也可以是 `NSMutableParagraphStyle`）。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

`other` 不是段落样式：`setParagraphStyle style must be a NSParagraphStyle, got …`。

## 示例

```js
const a = new NSMutableParagraphStyle();
a.lineSpacing = 8;
const b = new NSMutableParagraphStyle();
b.setParagraphStyle(a);
console.log(b.lineSpacing);
```

**结果**：控制台输出 `8`。

## 对应的 iOS API

`-[NSMutableParagraphStyle setParagraphStyle:]`。

## 参见

- [`mutableCopy()`](../ns-paragraph-style/mutablecopy.md)：另一种得到同样值的做法
