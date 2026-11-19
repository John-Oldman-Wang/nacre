---
type: reference
native: NSMutableParagraphStyle.hyphenationFactor
---

# `NSMutableParagraphStyle`：`hyphenationFactor` 属性

**`hyphenationFactor`** 属性是断字的积极程度。`0` 不断字，`1` 尽量断。

## 值

数，0 到 1 的比例。

- 可读，可写。
- 默认值是 `0`。
- 段落样式放进富文本时放的是当时的一份副本。之后再改这个属性，已经建好的富文本不变，要重新建一个富文本再交给视图。

### 写错时

写入的值按 `Number()` 转成数，转不成有限数的抛 `TypeError`。超出 0 到 1 抛 `TypeError`：

```
TypeError: hyphenationFactor must be between 0 and 1
```

## 示例

```js
const style = new NSMutableParagraphStyle();
style.hyphenationFactor = 1;
console.log(style.hyphenationFactor);
const text = new NSAttributedString('第一行\n第二行', { paragraphStyle: style });
```

**结果**：控制台输出 `1`。富文本里这两行按这个设置排版，屏幕上的效果**未在模拟器验证**。

## 对应的 iOS API

`NSMutableParagraphStyle.hyphenationFactor`。

## 参见

- [`NSMutableParagraphStyle`](../ns-mutable-paragraph-style.md)
- [`NSParagraphStyle.hyphenationFactor`](../ns-paragraph-style/hyphenationfactor.md)
