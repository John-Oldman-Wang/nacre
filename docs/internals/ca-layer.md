# 图层

CGColor 的代价、和 UIView 重叠的属性怎么取舍。

## 第 3d 步：CGColor 和重叠属性

**为什么只暴露 `UIView` 上没有的。** `CALayer` 和 `UIView` 有一大片重叠：`opacity` / `backgroundColor` / `masksToBounds` / `frame` / `bounds` / `isHidden`。一个都不开——同一件事两种写法正是[原则 1](../project.md#原则)要消灭的东西，而且两边的值还可能对不上（`view.alpha` 是 `CGFloat`，`layer.opacity` 是 `float`）。这不违背「能力完整」：能力在 `UIView` 上，只是入口只留一个。

**为什么 `layer` 上的颜色读两次不相等。** ObjC 那边 `borderColor` / `shadowColor` 的类型是 `CGColorRef`，不是 ObjC 对象。桥上用 `colorWithCGColor:` 包成 `UIColor`，而**它每次新建一个对象**——实测两次指针不同（`0x…880` / `0x…8a0`）。包装机制「同一个原生指针永远同一个 JS 对象」的保证因此失效：不是机制坏了，是我们每次造了个新原生对象。

底下的 `CGColor` 指针倒是**稳定的**，所以补法是按 `CGColorRef` 缓存 `UIColor`。

**动态色为什么会被定死。** `CGColor` 是解析后的值，没有 `UIColor` 那一层「`UITraitCollection → UIColor` 的函数」。写进去的那一刻就按当前外观解析完了。UIKit 自己的解法是在外观变化时重设一遍，那要等 `UITraitCollection` 暴露出来。和[颜色文档](../api/ui-color.md)里「读出不做成字符串」是同一个根因。

**`cornerCurve` 的默认值。** `CALayer.h` 写着「Defaults to `kCACornerCurveCircular`」，iOS 26 上实测**裸 `CALayer` 就是 `continuous`**，`UIView.layer` / `UILabel.layer` 也一样。文档和实际不符，以实际为准。

**位掩码的形状。** `maskedCorners` 是第一个位掩码属性，定下了这类属性的写法：JS 侧字符串数组，`NACRE_MASK_MAP` 宏双向拆合，「不是数组」和「名字不认识」报两种不同的错。往后 `autoresizingMask`、`UIControlEvents` 都照这个来。

---

← 返回[实现原理](README.md) ・ [项目说明](../project.md)
