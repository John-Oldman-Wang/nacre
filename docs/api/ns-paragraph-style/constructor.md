---
type: reference
native: "-[NSParagraphStyle init]"
---

# `NSParagraphStyle()` 构造函数

**`NSParagraphStyle()`** 构造函数创建一个默认的段落样式。它的属性全部只读。

## 语法

```
new NSParagraphStyle()
```

### 参数

无。

### 返回值

新建的 `NSParagraphStyle`，值和 [`NSParagraphStyle.defaultParagraphStyle`](defaultparagraphstyle.md) 相同。

要设值，用 [`new NSMutableParagraphStyle()`](../ns-mutable-paragraph-style/constructor.md)。

### 异常

不能继承，`class X extends NSParagraphStyle {}` 在 `new X()` 时抛 `TypeError`，见[原生类](../native-classes.md)。

## 示例

```js
const style = new NSParagraphStyle();
console.log(style.alignment, style.lineSpacing);
```

**结果**：控制台输出 `natural 0`。

## 对应的 iOS API

`[[NSParagraphStyle alloc] init]`。

## 参见

- [`NSMutableParagraphStyle()`](../ns-mutable-paragraph-style/constructor.md)
