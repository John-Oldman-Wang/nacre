---
type: reference
native: UILabel.text
---

# `UILabel`：`text` 属性

**`text`** 属性是标签显示的文字。整段文字用 [`font`](font.md) 和 [`textColor`](textcolor.md) 给出的同一种字体和颜色。

## 值

字符串，或者 `null`。

- 可读，可写。
- 默认值是 `null`，表示没有文字。
- 写入后屏幕上的文字立刻更新。用约束定位时，标签的大小跟着新文字重新计算，不需要手动刷新布局。大小自动变化这一点**未在模拟器验证**。
- 写入不是字符串的值时按 `String()` 转成字符串：`label.text = 5` 显示「5」。`null` 和 `undefined` 表示没有文字。
- 写过 [`attributedText`](attributedtext.md) 之后，`text` 读出来是富文本里的纯文字。

> **注意**：标签显示过富文本（写过 `attributedText`）之后再写 `text`，文字换成新的，但原来富文本里的样式会留着，比如下划线还在。这种标签要改内容就继续写 `attributedText`。

## 示例

### 改文字

```js
const label = new UILabel();
label.text = '新的标题';
```

**效果**：标签显示的文字换成「新的标题」。

### 清空文字

```js
const label = new UILabel();
label.text = '临时';
label.text = null;
console.log(label.text);
```

**效果**：标签不显示任何文字，控制台输出 `null`。屏幕上的效果**未在模拟器验证**。

## 对应的 iOS API

`UILabel.text`。

## 参见

- [`attributedText`](attributedtext.md)：混用多种字体和颜色的文字
- [`font`](font.md)、[`textColor`](textcolor.md)
