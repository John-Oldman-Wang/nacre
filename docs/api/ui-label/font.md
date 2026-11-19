---
type: reference
native: UILabel.font
---

# `UILabel`：`font` 属性

**`font`** 属性是标签文字的字体，包含字号和粗细。

## 值

[`UIFont`](../ui-font.md)。

- 可读，可写。
- 默认值是系统字体，17 pt。
- 写 `null` 恢复默认值。读出来不会是 `null`。
- 读出来的对象就是写进去的那一个：`label.font === 写入的对象` 是 `true`。
- `UIFont` 不能修改。要换字号或粗细，创建一个新的 `UIFont` 再赋值。
- 标签的字号不会跟着用户在系统设置里调的文字大小自动变化，要跟随就在设置变化时重新赋值，见指南[设置字体](../../guides/fonts.md)。
- [`adjustsFontSizeToFitWidth`](adjustsfontsizetofitwidth.md) 缩小了字号时，`font` 读出来的仍然是原来的字体，不反映缩小后的字号。**未在模拟器验证。**

### 写错时

**`TypeError`**

写入的不是 `UIFont` 对象也不是 `null`，比如 `label.font = 'Helvetica'`。

## 示例

```js
const label = new UILabel();
label.text = '标题';
label.font = UIFont.systemFontOfSize(20, { weight: 'semibold' });
```

**效果**：文字变成 20 pt、半粗体的系统字体。

```js
const label = new UILabel();
label.text = '12:30';
label.font = UIFont.monospacedSystemFontOfSize(20, { weight: 'medium' });
```

**效果**：每个字符占相同的宽度，适合显示数字和代码。

## 对应的 iOS API

`UILabel.font`。

## 参见

- [`UIFont`](../ui-font.md)：字体的全部写法
