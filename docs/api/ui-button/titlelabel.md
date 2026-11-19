---
type: reference
native: UIButton.titleLabel
---

# `UIButton`：`titleLabel` 属性

**`titleLabel`** 属性是按钮里负责显示文字的那个 [`UILabel`](../ui-label.md)。按钮自己没有字体、行数这类属性，要通过它来设。

## 值

[`UILabel`](../ui-label.md)，或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- `system` 按钮的 `titleLabel` 有值，它的 `text` 就是当前显示的文字。其他类型的按钮**未在模拟器验证**。
- 类型上它可能是 `null`，用之前先判断。

> **注意**：文字内容和颜色不要通过 `titleLabel` 改，用 [`setTitle()`](settitle.md) 和 [`setTitleColor()`](settitlecolor.md)。直接改 `titleLabel.text`，按钮下次切换状态时会把它换回去。

## 示例

```js
const button = UIButton.buttonWithType('system');
button.setTitle('提交', { forState: ['normal'] });
const label = button.titleLabel;
if (label) {
  label.font = UIFont.systemFontOfSize(20, { weight: 'semibold' });
}
```

**效果**：文字变成 20 pt 的半粗体。

## 对应的 iOS API

`UIButton.titleLabel`。

## 参见

- [`UILabel`](../ui-label.md)：字体、行数、截断方式
- [`imageView`](imageview.md)
