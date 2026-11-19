---
type: reference
native: NSLayoutYAxisAnchor
---

# `NSLayoutYAxisAnchor`

**`NSLayoutYAxisAnchor`** 表示垂直方向的位置锚点：视图或 layout guide 上的 `topAnchor`、`bottomAnchor`、`centerYAnchor`、`firstBaselineAnchor`、`lastBaselineAnchor`。它只能和另一个 `NSLayoutYAxisAnchor` 建约束。

**继承关系**：`EventTarget` → `NSObject` → [`NSLayoutAnchor`](ns-layout-anchor.md) → `NSLayoutYAxisAnchor`

## 构造函数

不能用 `new` 创建。从视图或 [`UILayoutGuide`](ui-layout-guide.md) 的锚点属性上读。

## 实例方法

还继承 [`NSLayoutAnchor`](ns-layout-anchor.md) 的 `constraintEqualToAnchor()`、`constraintGreaterThanOrEqualToAnchor()`、`constraintLessThanOrEqualToAnchor()`。

用系统标准间距建约束。标准间距是系统规定的间距，数值由系统按两端是什么决定，具体数值**未在模拟器验证**：

| 方法 | 得到的约束 |
| --- | --- |
| [`constraintEqualToSystemSpacingBelowAnchor()`](ns-layout-y-axis-anchor/constraintequaltosystemspacingbelowanchor.md) | 这个锚点在 `other` 下方，距离 = 标准间距 × `multiplier` |
| [`constraintGreaterThanOrEqualToSystemSpacingBelowAnchor()`](ns-layout-y-axis-anchor/constraintgreaterthanorequaltosystemspacingbelowanchor.md) | 这个锚点在 `other` 下方，距离 ≥ 标准间距 × `multiplier` |
| [`constraintLessThanOrEqualToSystemSpacingBelowAnchor()`](ns-layout-y-axis-anchor/constraintlessthanorequaltosystemspacingbelowanchor.md) | 这个锚点在 `other` 下方，距离 ≤ 标准间距 × `multiplier` |

两个锚点之间的距离：

| 方法 | 说明 |
| --- | --- |
| [`anchorWithOffsetToAnchor()`](ns-layout-y-axis-anchor/anchorwithoffsettoanchor.md) | 返回一个 `NSLayoutDimension`，代表从这个锚点到 `other` 的距离 |

## 示例

```js
const parent = new UIView();
const left = new UIView();
const right = new UIView();
for (const v of [left, right]) {
  v.translatesAutoresizingMaskIntoConstraints = false;
  parent.addSubview(v);
}

const next = right.topAnchor.constraintEqualToSystemSpacingBelowAnchor(left.bottomAnchor);
next.isActive = true;
```

**效果**：`right` 排在 `left` 下方，中间隔一段系统标准间距。**未在模拟器验证。**

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[b.topAnchor constraintEqualToSystemSpacingBelowAnchor:a.bottomAnchor multiplier:1]` | `b.topAnchor.constraintEqualToSystemSpacingBelowAnchor(a.bottomAnchor)` |
| `[a.bottomAnchor anchorWithOffsetToAnchor:b.topAnchor]` | `a.bottomAnchor.anchorWithOffsetToAnchor(b.topAnchor)` |

## 参见

- [`NSLayoutAnchor`](ns-layout-anchor.md)：三种锚点共同的方法，以及锚点之间能不能建约束
- [`NSLayoutConstraint`](auto-layout.md)
