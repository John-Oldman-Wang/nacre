---
type: reference
native: UILabel.attributedText
---

# `UILabel`：`attributedText` 属性

**`attributedText`** 属性是标签显示的带样式的文字。一段[富文本](../ns-attributed-string.md)里不同的段可以有不同的字体、颜色、下划线。

## 值

[`NSAttributedString`](../ns-attributed-string.md)，或者 `null`。

- 可读，可写。
- 没有内容时是 `null`。
- 写入后，[`text`](text.md) 读出来是其中的纯文字。
- 标签拿走的是赋值那一刻的内容。之后再改同一个 [`NSMutableAttributedString`](../ns-mutable-attributed-string.md)，标签上显示的不变，要重新赋值一次。
- 读出来的是一份不可改的快照，每次读可能是不同的对象。比较内容用 [`isEqualToAttributedString()`](../ns-attributed-string/isequaltoattributedstring.md)，不要用 `===`。

写过 `attributedText` 之后再写 `text`：文字换成新的，**原来富文本里的样式留着**。比如原来带下划线，新文字也带下划线。所以标签显示过富文本之后，要改内容就继续写 `attributedText`：赋一个新的富文本，内容和样式一起换掉。先写 `attributedText = null` 再写 `text` 能不能去掉样式，**未在模拟器验证**。

### 写错时

**`TypeError`**

- 写入的值不是富文本：`attributedText needs a native object or null, got "纯文字"`。
- 写入的是别的原生对象：`attributedText needs a NSAttributedString or null`。

## 示例

### 显示一段带下划线的文字

```js
const label = new UILabel();
label.attributedText = new NSAttributedString('促销', { underlineStyle: ['single'] });
console.log(label.text);
```

**效果**：标签显示带下划线的「促销」，控制台输出 `促销`。下划线在屏幕上的样子**未在模拟器验证**。

### 再写 `text` 时样式留着

```js
const label = new UILabel();
label.attributedText = new NSAttributedString('促销', { underlineStyle: ['single'] });
label.text = '已结束';
const now = label.attributedText;
console.log(now === null ? 'null' : (now.attributesAtIndex(0).underlineStyle || []).join(','));
```

**结果**：控制台输出 `single`。标签上的字换成了「已结束」，下划线还在。

## 对应的 iOS API

`UILabel.attributedText`。

## 参见

- [`NSAttributedString`](../ns-attributed-string.md)：富文本怎么建、有哪些属性
- [显示带样式的文字](../../guides/attributed-text.md)
- [`text`](text.md)
