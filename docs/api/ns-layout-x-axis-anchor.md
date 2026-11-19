---
type: reference
native: NSLayoutXAxisAnchor
---

# `NSLayoutXAxisAnchor`

**`NSLayoutXAxisAnchor`** 表示水平方向的位置锚点：视图或 layout guide 上的 `leadingAnchor`、`trailingAnchor`、`leftAnchor`、`rightAnchor`、`centerXAnchor`。它只能和另一个 `NSLayoutXAxisAnchor` 建约束。

**继承关系**：`EventTarget` → `NSObject` → [`NSLayoutAnchor`](ns-layout-anchor.md) → `NSLayoutXAxisAnchor`

## 构造函数

不能用 `new` 创建。从视图或 [`UILayoutGuide`](ui-layout-guide.md) 的锚点属性上读。

## 实例方法

还继承 [`NSLayoutAnchor`](ns-layout-anchor.md) 的 `constraintEqualToAnchor()`、`constraintGreaterThanOrEqualToAnchor()`、`constraintLessThanOrEqualToAnchor()`。

用系统标准间距建约束。标准间距是系统规定的间距，数值由系统按两端是什么决定，具体数值**未在模拟器验证**：

| 方法 | 得到的约束 |
| --- | --- |
| [`constraintEqualToSystemSpacingAfterAnchor()`](ns-layout-x-axis-anchor/constraintequaltosystemspacingafteranchor.md) | 这个锚点在 `other` 之后，距离 = 标准间距 × `multiplier` |
| [`constraintGreaterThanOrEqualToSystemSpacingAfterAnchor()`](ns-layout-x-axis-anchor/constraintgreaterthanorequaltosystemspacingafteranchor.md) | 这个锚点在 `other` 之后，距离 ≥ 标准间距 × `multiplier` |
| [`constraintLessThanOrEqualToSystemSpacingAfterAnchor()`](ns-layout-x-axis-anchor/constraintlessthanorequaltosystemspacingafteranchor.md) | 这个锚点在 `other` 之后，距离 ≤ 标准间距 × `multiplier` |

两个锚点之间的距离：

| 方法 | 说明 |
| --- | --- |
| [`anchorWithOffsetToAnchor()`](ns-layout-x-axis-anchor/anchorwithoffsettoanchor.md) | 返回一个 `NSLayoutDimension`，代表从这个锚点到 `other` 的距离 |

## 示例

```js
const parent = new UIView();
const left = new UIView();
const right = new UIView();
for (const v of [left, right]) {
  v.translatesAutoresizingMaskIntoConstraints = false;
  parent.addSubview(v);
}

const next = right.leadingAnchor.constraintEqualToSystemSpacingAfterAnchor(left.trailingAnchor);
next.isActive = true;
```

**效果**：`right` 排在 `left` 之后，中间隔一段系统标准间距。**未在模拟器验证。**

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[b.leadingAnchor constraintEqualToSystemSpacingAfterAnchor:a.trailingAnchor multiplier:1]` | `b.leadingAnchor.constraintEqualToSystemSpacingAfterAnchor(a.trailingAnchor)` |
| `[a.trailingAnchor anchorWithOffsetToAnchor:b.leadingAnchor]` | `a.trailingAnchor.anchorWithOffsetToAnchor(b.leadingAnchor)` |

## 参见

- [`NSLayoutAnchor`](ns-layout-anchor.md)：三种锚点共同的方法，以及锚点之间能不能建约束
- [`NSLayoutConstraint`](auto-layout.md)
