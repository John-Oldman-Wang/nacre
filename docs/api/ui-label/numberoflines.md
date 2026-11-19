---
type: reference
native: UILabel.numberOfLines
---

# `UILabel`：`numberOfLines` 属性

**`numberOfLines`** 属性是标签最多显示几行。

## 值

整数，单位是行。

- 可读，可写。
- 默认值是 `1`：文字不换行，放不下的部分按 [`lineBreakMode`](linebreakmode.md) 处理。
- `0` 表示不限行数，不是「零行」。文字需要几行就排几行。
- 大于 1 的数：文字在标签的宽度内自动换行，最多显示这么多行。放不下时，最后一行按 `lineBreakMode` 处理。文字不足这么多行时，有几行显示几行。
- 标签的高度不够显示这么多行时，只显示放得下的行数。**未在模拟器验证。**
- 它影响标签的固有尺寸和 `sizeThatFits()` 的结果，见[固有尺寸](../ui-label.md#固有尺寸)。

同一段文字、15 pt 系统字体、同一个宽度上限，实测 `sizeThatFits()` 的结果：

| `numberOfLines` | `sizeThatFits()` 的结果 |
| --- | --- |
| `2` | 宽 343，高 36 |
| `0` | 宽 343，高 71.67 |

### 写错时

写入的值先转成数再向零取整：`'2'` 得到 `2`。转不成有限数的值（`'abc'`、`undefined`）抛 `TypeError`。

## 示例

```js
const label = new UILabel();
label.text = '一段比较长的文字，一行放不下，需要换行显示。';
label.numberOfLines = 3;
```

**效果**：文字在标签的宽度内自动换行，最多显示 3 行。3 行放不下时，第 3 行的末尾显示「…」。

## 对应的 iOS API

`UILabel.numberOfLines`。

## 参见

- [行数、换行和截断](../ui-label.md#行数换行和截断)
- [显示文字](../../guides/labels.md)：多行文字的推荐写法
