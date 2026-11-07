# `UILabel`

一段不可编辑的文字。

```js
const title = new UILabel();
title.text = 'Hello, Nacre';
title.font = UIFont.systemFontOfSize(34, { weight: 'bold' });
title.textColor = UIColor.labelColor;
title.textAlignment = 'center';

const fit = title.intrinsicContentSize;        // CGSize(188.33, 40.67)
title.frame = new CGRect(0, 80, parent.bounds.width, fit.height);
parent.addSubview(title);
```

## 继承关系

```
EventTarget
└─ NSObject
   └─ UIResponder
      └─ UIView
         └─ UILabel
```

`UIView` 的所有成员都能用——`frame`、`backgroundColor`、`addSubview` 等见 [`UIView` 文档](ui-view.md)。

> `UILabel` 把 `isUserInteractionEnabled` 的默认值改成了 `false`（`UIView` 是 `true`）。

## 文字

| 成员 | 类型 | 默认值 |
| --- | --- | --- |
| `text` | `string` \| `null` | `null` |
| `font` | `UIFont` | 系统字体 17pt |
| `textColor` | `UIColor` | `labelColor` |
| `textAlignment` | 枚举字符串 | `'natural'` |
| `lineBreakMode` | 枚举字符串 | `'byTruncatingTail'` |
| `numberOfLines` | `number` | `1`；`0` 表示不限 |

`textAlignment` 可选 `left` `center` `right` `justified` `natural`。`lineBreakMode` 可选 `byWordWrapping` `byCharWrapping` `byClipping` `byTruncatingHead` `byTruncatingTail` `byTruncatingMiddle`。详见[枚举文档](enums.md)。

## 自适应

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `adjustsFontSizeToFitWidth` | `boolean` | 放不下时缩小字号 |
| `minimumScaleFactor` | `number` | 最小能缩到原字号的几成 |
| `baselineAdjustment` | 枚举字符串 | 缩小后怎么对齐，`alignBaselines` / `alignCenters` / `none` |
| `preferredMaxLayoutWidth` | `number` | 算多行固有高度时假定的宽度 |

`preferredMaxLayoutWidth` 不设的话，多行标签的 `intrinsicContentSize` 算不出有意义的高度——文字能排成一行很宽，也能排成很多行很窄，不给宽度就无解。

## 状态和阴影

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `isHighlighted` | `boolean` | |
| `highlightedTextColor` | `UIColor` \| `null` | 高亮时的文字颜色 |
| `isEnabled` | `boolean` | 影响绘制 |
| `shadowColor` | `UIColor` \| `null` | |
| `shadowOffset` | `CGSize` | 默认 `(0, -1)`，也就是上方阴影 |

## 固有尺寸：同步读布局

`intrinsicContentSize` 和 `sizeThatFits()` 是这一步最值得看的东西：

```js
label.text = 'Hello, Nacre';
label.intrinsicContentSize;                     // CGSize(188.33, 40.67)
label.sizeThatFits(new CGSize(402, 999));       // 同上
```

文字多宽多高，只有排版引擎算得出来。JS **同步**拿到这个答案，不是回调、不是 Promise。

这就是[技术选型](../project.md)里「JS 必须跑在主线程」那条决定的具体形态——Auto Layout 和文字排版都在 UIKit 里、只在主线程，JS 要同步问它们，就只能和它们同线程。

行数限制对它是有影响的，实测：

```
限两行  = CGSize(343, 36)
不限行数 = CGSize(343, 71.67)
```

## 还没做

- **`adjustsFontForContentSizeCategory`**：设成 `true` 后标签会在系统文字大小变化时自动重新取字体。这是[动态字体](ui-font.md#动态字体)真正落地的那一半，优先级比下面几条都高
- **`attributedText` / `NSAttributedString`**：富文本，一个子系统，单独做
- **`lineBreakStrategy`、`allowsDefaultTighteningForTruncation`、`showsExpansionTextWhenTruncated`**：细调排版
- **`preferredVibrancy`**（iOS 17）：在毛玻璃背景上的活力效果
- **文字变化的事件**：`UILabel` 自己不发事件（它不可编辑），要监听输入得等 `UITextField`

---

← 返回 [API 文档](README.md)
