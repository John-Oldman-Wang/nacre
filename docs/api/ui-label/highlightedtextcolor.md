---
type: reference
native: UILabel.highlightedTextColor
---

# `UILabel`：`highlightedTextColor` 属性

**`highlightedTextColor`** 属性是标签处于高亮状态时的文字颜色。

## 值

[颜色](../ui-color.md)字符串，或者 `null`。

- 可读，可写。
- 默认值是 `null`，表示高亮时颜色不变。
- 写入时接受颜色字符串，也接受 `UIColor` 对象。读出来的字符串和写入的相同。
- 只在 [`isHighlighted`](ishighlighted.md) 是 `true` 时起作用。

### 写错时

写入不合法的颜色时不抛异常。控制台输出一条警告，颜色保持原值：

```
[Nacre] highlightedTextColor: "#GGG" is not a valid color, ignored
```

## 示例

```js
const label = new UILabel();
label.highlightedTextColor = 'systemYellow';
console.log(label.highlightedTextColor);
```

**结果**：控制台输出 `systemYellow`。

## 对应的 iOS API

`UILabel.highlightedTextColor`。ObjC 里是 `UIColor` 对象，这里写成字符串。

## 参见

- [`isHighlighted`](ishighlighted.md)
- [`textColor`](textcolor.md)
