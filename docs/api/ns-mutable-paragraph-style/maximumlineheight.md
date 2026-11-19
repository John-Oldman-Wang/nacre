---
type: reference
native: NSMutableParagraphStyle.maximumLineHeight
---

# `NSMutableParagraphStyle`：`maximumLineHeight` 属性

**`maximumLineHeight`** 属性是行高的上限。`0` 是不限。

## 值

数，单位 [pt](../units.md)。

- 可读，可写。
- 默认值是 `0`。
- 段落样式放进富文本时放的是当时的一份副本。之后再改这个属性，已经建好的富文本不变，要重新建一个富文本再交给视图。

### 写错时

写入的值按 `Number()` 转成数，转不成有限数的抛 `TypeError`。负数抛 `TypeError`：

```
TypeError: maximumLineHeight must be a non-negative number
```

## 示例

```js
const style = new NSMutableParagraphStyle();
style.maximumLineHeight = 8;
console.log(style.maximumLineHeight);
const text = new NSAttributedString('第一行\n第二行', { paragraphStyle: style });
```

**结果**：控制台输出 `8`。富文本里这两行按这个设置排版，屏幕上的效果**未在模拟器验证**。

## 对应的 iOS API

`NSMutableParagraphStyle.maximumLineHeight`。

## 参见

- [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md)
- [`NSParagraphStyle.maximumLineHeight`](../ns-paragraph-style/maximumlineheight.md)
