---
type: reference
native: "-[NSAttributedString size]"
---

# `NSAttributedString`：`size()` 方法

**`size()`** 方法返回这段富文本排成一行需要多大。

## 语法

```
size()
```

### 参数

无。

### 返回值

[`CGSize`](../structs.md)，单位 [pt](../units.md)。结果带小数，用作视图的大小时向上取整。

限定宽度、让文字折行时的大小，用 [`boundingRectWithSize()`](boundingrectwithsize.md)。

### 异常

无。

## 示例

```js
const text = new NSAttributedString('一段文字', { font: UIFont.systemFontOfSize(17) });
const oneLine = text.size();
console.log(Math.ceil(oneLine.width), Math.ceil(oneLine.height));
```

**结果**：控制台输出排成一行时的宽和高，单位 pt。具体数值**未在模拟器验证**。

## 对应的 iOS API

`-[NSAttributedString size]`。

## 参见

- [`boundingRectWithSize()`](boundingrectwithsize.md)
