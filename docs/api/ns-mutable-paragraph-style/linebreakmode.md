---
type: reference
native: NSMutableParagraphStyle.lineBreakMode
---

# `NSMutableParagraphStyle`：`lineBreakMode` 属性

**`lineBreakMode`** 属性是一行放不下时怎么处理。取值和 [`UILabel.lineBreakMode`](../ui-label/linebreakmode.md) 相同：`'byWordWrapping'`、`'byCharWrapping'`、`'byClipping'`、`'byTruncatingHead'`、`'byTruncatingTail'`、`'byTruncatingMiddle'`。

## 值

字符串。

- 可读，可写。
- 默认值是 `'byWordWrapping'`。
- 段落样式放进富文本时放的是当时的一份副本。之后再改这个属性，已经建好的富文本不变，要重新建一个富文本再交给视图。

### 写错时

写入不认识的值时不抛异常：属性保持原来的值，控制台输出一条警告，列出全部可选的值。

## 示例

```js
const style = new NSMutableParagraphStyle();
style.lineBreakMode = 'byTruncatingTail';
console.log(style.lineBreakMode);
const text = new NSAttributedString('第一行\n第二行', { paragraphStyle: style });
```

**结果**：控制台输出 `byTruncatingTail`。富文本里这两行按这个设置排版，屏幕上的效果**未在模拟器验证**。

## 对应的 iOS API

`NSMutableParagraphStyle.lineBreakMode`。

## 参见

- [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md)
- [`NSParagraphStyle.lineBreakMode`](../ns-paragraph-style/linebreakmode.md)
