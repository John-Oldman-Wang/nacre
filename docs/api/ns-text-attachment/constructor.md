---
type: reference
native: "-[NSTextAttachment init]"
---

# `NSTextAttachment()` 构造函数

**`NSTextAttachment()`** 构造函数创建一个空的附件。

## 语法

```
new NSTextAttachment()
```

### 参数

无。

### 返回值

新建的 `NSTextAttachment`。[`image`](image.md) 是 `null`，[`bounds`](bounds.md) 全是 `0`。

### 异常

不能继承，`class X extends NSTextAttachment {}` 在 `new X()` 时抛 `TypeError`，见[原生类](../native-classes.md)。

## 示例

```js
const attachment = new NSTextAttachment();
attachment.image = UIImage.systemImageNamed('star.fill');
console.log(attachment.image !== null);
```

**结果**：控制台输出 `true`。

## 对应的 iOS API

`[[NSTextAttachment alloc] init]`。

## 参见

- [`NSTextAttachment.textAttachmentWithImage()`](textattachmentwithimage.md)
