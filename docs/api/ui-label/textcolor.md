---
type: reference
native: UILabel.textColor
---

# `UILabel`：`textColor` 属性

**`textColor`** 属性是标签文字的颜色。

## 值

[颜色](../ui-color.md)字符串。

- 可读，可写。
- 默认值是语义色 `'label'`：浅色模式下是黑色，深色模式下是白色，自动切换。
- 写入时接受颜色字符串，也接受 `UIColor` 对象。
- 读出来的字符串和写入的字符串相同：写 `'#336699'`，读回 `'#336699'`。
- 写 `null` 恢复默认值（**未在模拟器验证**）。读出来不会是 `null`。
- 系统颜色名（`'systemRed'`、`'label'` 这类）随深色模式自动变化。

### 写错时

写入不合法的颜色时不抛异常。控制台输出一条警告，颜色保持原值：

```
[Nacre] textColor: "#GGG" is not a valid color, ignored
```

## 示例

```js
const label = new UILabel();
label.text = '警告';
label.textColor = '#FF3B30';
```

**效果**：文字变成红色。

```js
const label = new UILabel();
label.textColor = '#336699';
console.log(label.textColor);
```

**结果**：控制台输出 `#336699`。

## 对应的 iOS API

`UILabel.textColor`。ObjC 里是 `UIColor` 对象，这里写成字符串。

## 参见

- [`UIColor`](../ui-color.md)：颜色字符串的全部写法
- [`highlightedTextColor`](highlightedtextcolor.md)：高亮时的文字颜色
