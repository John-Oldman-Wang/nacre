---
type: reference
native: NSTextAttachment
status: partial
---

# `NSTextAttachment`

**`NSTextAttachment`** 表示富文本里的一个附件：在一个字符的位置上显示一张图片。

附件要先变成富文本才能和文字拼在一起：用 [`NSAttributedString.attributedStringWithAttachment()`](ns-attributed-string/attributedstringwithattachment.md) 建一个只有一个字符的富文本，再拼到文字中间。

`NSTextAttachment` 不派发事件。它的值只会被 App 自己的代码修改，所以没有变化通知。

**继承关系**：`EventTarget` → `NSObject` → `NSTextAttachment`

## 构造函数

[`NSTextAttachment()`](ns-text-attachment/constructor.md)

创建一个空的附件，之后设 `image`。

## 静态方法

[`NSTextAttachment.textAttachmentWithImage()`](ns-text-attachment/textattachmentwithimage.md)

创建一个显示指定图片的附件。

## 实例属性

还继承 `NSObject` 的属性。

| 属性 | 说明 |
| --- | --- |
| [`image`](ns-text-attachment/image.md) | 显示的图片 |
| [`bounds`](ns-text-attachment/bounds.md) | 图片画在哪、画多大 |

## 实例方法

`NSTextAttachment` 没有自己的实例方法。

## 示例

### 文字里插一颗星

```js
const star = UIImage.systemImageNamed('star.fill');
if (star !== null) {
  const attachment = NSTextAttachment.textAttachmentWithImage(star);
  attachment.bounds = new CGRect(0, -3, 18, 18);

  const text = new NSMutableAttributedString('评分 ', { font: UIFont.systemFontOfSize(17) });
  text.appendAttributedString(NSAttributedString.attributedStringWithAttachment(attachment));
  text.appendAttributedString(new NSAttributedString(' 4.8'));

  const label = new UILabel();
  label.attributedText = text;
}
```

**效果**（未在模拟器验证）：「评分」和「4.8」之间有一颗 18 × 18 pt 的星，比文字的基线低 3 pt。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[NSTextAttachment textAttachmentWithImage:image]` | `NSTextAttachment.textAttachmentWithImage(image)` |
| `[NSAttributedString attributedStringWithAttachment:attachment]` | `NSAttributedString.attributedStringWithAttachment(attachment)` |

## 参见

- [`NSAttributedString`](ns-attributed-string.md)：`attachment` 属性
- [`UIImage`](ui-image.md)：附件里的图片
- [显示带样式的文字](../guides/attributed-text.md)
