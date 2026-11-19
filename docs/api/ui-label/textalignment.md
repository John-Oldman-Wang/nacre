---
type: reference
native: UILabel.textAlignment
---

# `UILabel`：`textAlignment` 属性

**`textAlignment`** 属性决定文字在标签宽度内的水平对齐。

## 值

字符串，下面五个之一：

| 取值 | 效果 |
| --- | --- |
| `'left'` | 靠左 |
| `'center'` | 居中 |
| `'right'` | 靠右 |
| `'justified'` | 两端对齐：除最后一行外，每行的文字拉开到占满整行。只对多行文字有意义。**未在模拟器验证** |
| `'natural'` | 按系统语言的书写方向：从左往右的语言靠左，从右往左的语言（阿拉伯语、希伯来语）靠右 |

- 可读，可写。
- 默认值是 `'natural'`。
- 对齐是在标签自己的宽度内进行的。标签的宽度刚好等于文字宽度时，几种对齐看起来没有差别。要看出居中，标签要比文字宽，比如左右两边都用约束确定。

### 写错时

写入表外的值时不抛异常：属性保持原来的值，控制台输出一条警告，省略号处列出全部可用的值：

```
[Nacre] textAlignment has no value "middle"; expected one of: …, ignored
```

## 示例

```js
const label = new UILabel();
label.text = '居中的标题';
label.textAlignment = 'center';
```

**效果**：文字在标签的宽度内水平居中。

## 对应的 iOS API

`UILabel.textAlignment`。`NSTextAlignmentCenter` 写成 `'center'`，其余同理。

## 参见

- [枚举](../enums.md)：属性写错时为什么是警告而不是抛异常
