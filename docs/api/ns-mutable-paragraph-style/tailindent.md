---
type: reference
native: NSMutableParagraphStyle.tailIndent
---

# `NSMutableParagraphStyle`：`tailIndent` 属性

**`tailIndent`** 属性是行的右边界。正数从左边量起；`0` 或负数从右边量起，`-16` 是右边留 16 pt。

## 值

数，单位 [pt](../units.md)。

- 可读，可写。
- 默认值是 `0`。
- 段落样式放进富文本时放的是当时的一份副本。之后再改这个属性，已经建好的富文本不变，要重新建一个富文本再交给视图。

### 写错时

写入的值按 `Number()` 转成数，转不成有限数的抛 `TypeError`。可以是负数。

## 示例

```js
const style = new NSMutableParagraphStyle();
style.tailIndent = -16;
console.log(style.tailIndent);
const text = new NSAttributedString('第一行\n第二行', { paragraphStyle: style });
```

**结果**：控制台输出 `-16`。富文本里这两行按这个设置排版，屏幕上的效果**未在模拟器验证**。

## 对应的 iOS API

`NSMutableParagraphStyle.tailIndent`。

## 参见

- [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md)
- [`NSParagraphStyle.tailIndent`](../ns-paragraph-style/tailindent.md)
