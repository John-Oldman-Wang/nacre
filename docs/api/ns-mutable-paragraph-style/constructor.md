---
type: reference
native: "-[NSMutableParagraphStyle init]"
---

# `NSMutableParagraphStyle()` 构造函数

**`NSMutableParagraphStyle()`** 构造函数创建一个可以改的段落样式。

## 语法

```
new NSMutableParagraphStyle()
```

### 参数

无。

### 返回值

新建的 `NSMutableParagraphStyle`，属性都是默认值，和 [`NSParagraphStyle.defaultParagraphStyle`](../ns-paragraph-style/defaultparagraphstyle.md) 相同。

### 异常

不能继承，`class X extends NSMutableParagraphStyle {}` 在 `new X()` 时抛 `TypeError`，见[原生类](../native-classes.md)。

## 示例

```js
const style = new NSMutableParagraphStyle();
style.firstLineHeadIndent = 32;
const text = new NSAttributedString('首行缩进两个字的一段文字。', {
  font: UIFont.systemFontOfSize(16),
  paragraphStyle: style,
});
```

**效果**：这段文字的第一行左边缩进 32 pt。**未在模拟器验证。**

## 对应的 iOS API

`[[NSMutableParagraphStyle alloc] init]`。

## 参见

- [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md)
