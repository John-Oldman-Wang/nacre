---
type: reference
native: "+[NSAttributedString attributedStringWithAttachment:attributes:]"
---

# `NSAttributedString.attributedStringWithAttachment()` 静态方法

**`NSAttributedString.attributedStringWithAttachment()`** 静态方法创建一个只含一个附件的富文本。附件要先变成富文本，才能和文字拼在一起。

## 语法

```
NSAttributedString.attributedStringWithAttachment(attachment, [{ attributes }])
```

### 参数

**`attachment`**

[`NSTextAttachment`](../ns-text-attachment.md)。

**`options.attributes`**

可选。这个字符上另外带的一组[属性](../ns-attributed-string.md#富文本的属性)。给 `null` 等于没给。

### 返回值

新建的 `NSAttributedString`，长度是 1：一个占位字符 `'￼'`，带着 `attachment` 属性。

### 异常

**`TypeError`**

- `attachment` 不是 `NSTextAttachment`：`attributedStringWithAttachment attachment must be a NSTextAttachment, got …`。
- `attributes` 里的错误和[构造函数](constructor.md)相同。

## 示例

```js
const star = UIImage.systemImageNamed('star.fill');
if (star !== null) {
  const attachment = NSTextAttachment.textAttachmentWithImage(star);
  const text = NSAttributedString.attributedStringWithAttachment(attachment);
  console.log(text.length, text.attribute('attachment', { atIndex: 0 }) === attachment);
}
```

**结果**：控制台输出 `1 true`。

## 对应的 iOS API

`+[NSAttributedString attributedStringWithAttachment:]`、`+attributedStringWithAttachment:attributes:`。

## 参见

- [`NSTextAttachment`](../ns-text-attachment.md)
- [显示带样式的文字](../../guides/attributed-text.md)：文字里插一张图片
