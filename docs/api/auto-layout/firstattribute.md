---
type: reference
native: NSLayoutConstraint.firstAttribute
---

# `NSLayoutConstraint`：`firstAttribute` 属性

**`firstAttribute`** 属性表示约束等式左边的锚点是哪一种。

## 值

字符串，取值如下：

| 取值 | 含义 |
| --- | --- |
| `'leading'`、`'trailing'` | 起始边、结束边 |
| `'left'`、`'right'` | 左边、右边 |
| `'top'`、`'bottom'` | 上边、下边 |
| `'centerX'`、`'centerY'` | 水平中心线、垂直中心线 |
| `'width'`、`'height'` | 宽、高 |
| `'firstBaseline'`、`'lastBaseline'` | 第一行文字的基线、最后一行文字的基线 |
| `'leftMargin'`、`'rightMargin'`、`'topMargin'`、`'bottomMargin'`、`'leadingMargin'`、`'trailingMargin'` | 对应的边向内缩进内边距之后的位置 |
| `'centerXWithinMargins'`、`'centerYWithinMargins'` | 缩进内边距之后的区域的中心线 |
| `'notAnAttribute'` | 没有锚点。约束到常数时，右边是这个值 |

带 `Margin` 的八个值只会出现在系统创建的约束上。用锚点创建的约束不会产生这些值。

- 只读。给它赋值抛 `TypeError`。

## 示例

```js
const parent = new UIView();
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

const c = box.leadingAnchor.constraintEqualToAnchor(parent.leadingAnchor, { constant: 16 });
console.log(c.firstAttribute, c.secondAttribute);
```

**结果**：输出 `leading leading`。

## 对应的 iOS API

`NSLayoutConstraint.firstAttribute`。`NSLayoutAttributeLeading` 写成 `'leading'`，其余同理。

## 参见

- [`secondAttribute`](secondattribute.md)
- [`firstAnchor`](firstanchor.md)
