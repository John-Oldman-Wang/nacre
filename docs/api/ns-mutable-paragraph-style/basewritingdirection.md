---
type: reference
native: NSMutableParagraphStyle.baseWritingDirection
---

# `NSMutableParagraphStyle`：`baseWritingDirection` 属性

**`baseWritingDirection`** 属性是这一段从哪边开始排。

## 值

字符串。

| 取值 | 效果 |
| --- | --- |
| `'natural'` | 按文字内容判断 |
| `'leftToRight'` | 从左往右 |
| `'rightToLeft'` | 从右往左 |

- 可读，可写。
- 默认值是 `'natural'`。
- 段落样式放进富文本时放的是当时的一份副本。之后再改这个属性，已经建好的富文本不变，要重新建一个富文本再交给视图。

### 写错时

写入表里没有的值时不抛异常：属性保持原来的值，控制台输出一条警告：

```
[Nacre] baseWritingDirection has no value "up"; expected one of: natural / leftToRight / rightToLeft, ignored
```

## 示例

```js
const style = new NSMutableParagraphStyle();
style.baseWritingDirection = 'rightToLeft';
console.log(style.baseWritingDirection);
const text = new NSAttributedString('第一行\n第二行', { paragraphStyle: style });
```

**结果**：控制台输出 `rightToLeft`。富文本里这两行按这个设置排版，屏幕上的效果**未在模拟器验证**。

## 对应的 iOS API

`NSMutableParagraphStyle.baseWritingDirection`。

## 参见

- [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md)
- [`NSParagraphStyle.baseWritingDirection`](../ns-paragraph-style/basewritingdirection.md)
