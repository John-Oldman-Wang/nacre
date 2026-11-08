# `UILabel`

一段不可编辑的文字。

```js
const title = new UILabel();
title.text = 'Hello, Nacre';
title.font = UIFont.systemFontOfSize(34, { weight: 'bold' });
title.textColor = UIColor.labelColor;
title.textAlignment = 'center';
title.numberOfLines = 2;
parent.addSubview(title);
```

## 继承关系

```
EventTarget → NSObject → UIResponder → UIView → UILabel
```

[`UIView`](ui-view.md) 的成员全都能用。

> `UILabel` 把 `isUserInteractionEnabled` 的默认值改成了 `false`（`UIView` 是 `true`），所以标签默认不接收触摸。

## 文字

| 成员 | 类型 | 默认值 | 效果 |
| --- | --- | --- | --- |
| `text` | `string` \| `null` | `null` | |
| `font` | `UIFont` | 系统字体 17pt | 写 `null` 恢复默认，读出来永远非 `null` |
| `textColor` | `UIColor` | `labelColor` | |
| `textAlignment` | [枚举字符串](enums.md) | `'natural'` | `left` `center` `right` `justified` `natural` |
| `lineBreakMode` | [枚举字符串](enums.md) | `'byTruncatingTail'` | 放不下时怎么断 |
| `numberOfLines` | `number` | `1` | **`0` 表示不限行数** |

`lineBreakMode` 可选 `byWordWrapping` `byCharWrapping` `byClipping` `byTruncatingHead` `byTruncatingTail` `byTruncatingMiddle`。

## 量文字有多大

```js
label.text = 'Hello, Nacre';
label.intrinsicContentSize;                     // CGSize(188.33, 40.67)
label.sizeThatFits(new CGSize(402, 999));       // 同上
```

**同步拿到结果**，不是回调也不是 Promise。

行数限制会影响结果，同一段文字：

```
numberOfLines = 2   →  CGSize(343, 36)
numberOfLines = 0   →  CGSize(343, 71.67)
```

多行标签还要给一个宽度，否则算不出有意义的高度——同一段文字能排成一行很宽，也能排成很多行很窄：

```js
label.preferredMaxLayoutWidth = 320;
```

用 [Auto Layout](auto-layout.md) 的话一般不用管这个，约束已经把宽度定死了。

## 自适应

| 成员 | 类型 | 效果 |
| --- | --- | --- |
| `adjustsFontSizeToFitWidth` | `boolean` | 放不下时缩小字号而不是截断 |
| `minimumScaleFactor` | `number` | 最小能缩到原字号的几成 |
| `baselineAdjustment` | [枚举字符串](enums.md) | 缩小后怎么对齐：`alignBaselines` / `alignCenters` / `none` |
| `preferredMaxLayoutWidth` | `number` | 算多行固有高度时假定的宽度 |

## 状态和阴影

| 成员 | 类型 | 默认值 |
| --- | --- | --- |
| `isHighlighted` | `boolean` | `false` |
| `highlightedTextColor` | `UIColor` \| `null` | `null` |
| `isEnabled` | `boolean` | `true` |
| `shadowColor` | `UIColor` \| `null` | `null` |
| `shadowOffset` | `CGSize` | `(0, -1)`，也就是**上方**阴影 |

## 和原生的对照

| ObjC | JS |
| --- | --- |
| `[[UILabel alloc] init]` | `new UILabel()` |
| `label.textAlignment = NSTextAlignmentCenter` | `label.textAlignment = 'center'` |
| `label.lineBreakMode = NSLineBreakByTruncatingTail` | `label.lineBreakMode = 'byTruncatingTail'` |
| `label.numberOfLines = 0` | `label.numberOfLines = 0` |
| `label.highlighted = YES` | `label.isHighlighted = true` |
| `label.baselineAdjustment = UIBaselineAdjustmentAlignCenters` | `label.baselineAdjustment = 'alignCenters'` |
| `label.shadowOffset = CGSizeMake(0, -1)` | `label.shadowOffset = new CGSize(0, -1)` |
| `[label sizeThatFits:CGSizeMake(402, 999)]` | `label.sizeThatFits(new CGSize(402, 999))` |

## 还没做

| | |
| --- | --- |
| `adjustsFontForContentSizeCategory` | 系统文字大小变化时自动换字体。[动态字体](ui-font.md#动态字体)真正落地的那一半 |
| `attributedText` | 富文本，一个子系统，单独做 |
| `lineBreakStrategy`、`allowsDefaultTighteningForTruncation` | 细调排版 |
| 文字变化的事件 | `UILabel` 不可编辑，要监听输入得等 `UITextField` |

---

← 返回 [API 文档](README.md)
