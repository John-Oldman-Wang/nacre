---
type: reference
native: NSMutableParagraphStyle.alignment
---

# `NSMutableParagraphStyle`：`alignment` 属性

**`alignment`** 属性是段落里文字的对齐方式。

## 值

字符串。

| 取值 | 效果 |
| --- | --- |
| `'left'` | 靠左 |
| `'center'` | 居中 |
| `'right'` | 靠右 |
| `'justified'` | 两端对齐 |
| `'natural'` | 按文字的书写方向：从左往右的语言靠左，从右往左的语言靠右 |

- 可读，可写。
- 默认值是 `'natural'`。
- 段落样式放进富文本时放的是当时的一份副本。之后再改这个属性，已经建好的富文本不变，要重新建一个富文本再交给视图。

### 写错时

写入表里没有的值时不抛异常：属性保持原来的值，控制台输出一条警告：

```
[Nacre] alignment has no value "middle"; expected one of: left / center / right / justified / natural, ignored
```

## 示例

```js
const style = new NSMutableParagraphStyle();
style.alignment = 'center';
console.log(style.alignment);
const text = new NSAttributedString('第一行\n第二行', { paragraphStyle: style });
```

**结果**：控制台输出 `center`。富文本里这两行按这个设置排版，屏幕上的效果**未在模拟器验证**。

## 对应的 iOS API

`NSMutableParagraphStyle.alignment`。

## 参见

- [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md)
- [`NSParagraphStyle.alignment`](../ns-paragraph-style/alignment.md)
