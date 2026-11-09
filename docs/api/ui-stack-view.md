# `UIStackView`

一维排列容器：把「排成一行 / 一列」翻译成约束。它自己不画东西。

```js
const row = new UIStackView([avatar, name, badge]);
row.axis = 'horizontal';
row.distribution = 'fillEqually';
row.spacing = 12;
parent.addSubview(row);
```

这四行相当于手写六条约束。它还能做一件[约束做不到的事](#隐藏即塌陷)：把某一项 `isHidden = true`，它会**塌陷**，其余项自动补位。

## 继承关系

```
EventTarget → NSObject → UIResponder → UIView → UIStackView
```

[`UIView`](ui-view.md) 的成员全都能用。

> 它是 UIKit 里的「非渲染」视图——`backgroundColor`、`layer.cornerRadius` 设了**看不见**。要底色和圆角就在外面套一层普通 `UIView`。

## 它不是 grid

`UIStackView` 是**一维**的，更接近 flexbox 的单行 / 单列：

| CSS | Nacre |
| --- | --- |
| `flex-direction: row \| column` | `axis = 'horizontal' \| 'vertical'` |
| `justify-content` | `distribution` |
| `align-items` | `alignment` |
| `gap` | `spacing` |
| **`flex-wrap`** | **没有**。放不下就按抗压缩优先级挤，不换行 |

嵌套 stack 能排出像表格的东西，但**列不会对齐**——每一行独立算宽度，第二行的第二项和第一行的第二项毫无关系。真要列对齐，把同一列各视图的 `widthAnchor` 互相[约束相等](auto-layout.md#锚点边的对象化)。

## 创建

```js
new UIStackView()                      // 空的，之后用 addArrangedSubview 加
new UIStackView([a, b, c])             // = initWithArrangedSubviews:
```

数组里的视图**同时也成为 subview**，不用自己再 `addSubview`。

> 加进排列的视图，`translatesAutoresizingMaskIntoConstraints` 会被 stack **自动关掉**（实测）。所以排列项不用自己写这一行，但 **stack 本身要写**——它和其他视图一样要靠约束定位。

## 排列

| 属性 | 类型 | 默认值 | 效果 |
| --- | --- | --- | --- |
| `axis` | `'horizontal'` \| `'vertical'` | `'horizontal'` | 排成一行还是一列 |
| `distribution` | [枚举字符串](enums.md) | `'fill'` | 沿轴怎么分配空间 |
| `alignment` | [枚举字符串](enums.md) | `'fill'` | 垂直于轴怎么对齐 |
| `spacing` | `number` \| `'system'` | `0` | 相邻两项的间距。负值可以让它们重叠 |
| `isBaselineRelativeArrangement` | `boolean` | `false` | 纵向排列时按基线算间距。横向排列**无效** |
| `isLayoutMarginsRelativeArrangement` | `boolean` | `false` | 边缘约束用 layout margins 而不是边框 |

### `distribution` 的五个值

| | 效果 |
| --- | --- |
| `fill` | 按固有尺寸排，多出或不够的部分按抱紧 / 抗压缩优先级分摊 |
| `fillEqually` | **所有项等大**，无视固有尺寸 |
| `fillProportionally` | 按固有尺寸的比例分摊多出或不够的部分 |
| `equalSpacing` | 项按固有尺寸，多出的空间**平分到间隙里** |
| `equalCentering` | 维持中心到中心的等距，`spacing` 作为最小边距 |

`spacing` 对 `fill*` 三种是**严格**间距，对 `equalSpacing` / `equalCentering` 是**最小**间距。

### `alignment` 有两个别名

```js
row.alignment = 'top';
row.alignment;          // 'leading'  ← 不是 'top'
```

`'leading'` 和 `'top'` 在 UIKit 里是**同一个数值**（`UIStackViewAlignmentTop = UIStackViewAlignmentLeading`），`'trailing'` 和 `'bottom'` 也是。两个名字都写得进去，但**读出来永远是 `'leading'` / `'trailing'`**——一个值反查不出两个名字，总得选一个，选的是头文件里的主名。

可选值：`fill` `leading`(=`top`) `firstBaseline` `center` `trailing`(=`bottom`) `lastBaseline`。

> `firstBaseline` / `lastBaseline` **只在横向排列时有效**。纵向排列要按基线对，用 `isBaselineRelativeArrangement`。

## 排列里的子视图

| 成员 | 效果 |
| --- | --- |
| `arrangedSubviews` 只读 | 排列顺序，**不是** `subviews` 的 z 序。是 `subviews` 的子集 |
| `addArrangedSubview(view)` | 加到末尾。不是 subview 的话顺带加进 `subviews` |
| `insertArrangedSubview(view, { atIndex })` | 插到指定位置。越界抛 `TypeError` |
| `removeArrangedSubview(view)` | 移出排列，但**仍然是 subview** |

### `removeArrangedSubview` 不是「移走」

这是最容易踩的一个坑：

```js
row.removeArrangedSubview(box);
box.superview === row;        // true   ← 还在
row.subviews.length;          // 3      ← 还是三个
row.arrangedSubviews.length;  // 2      ← 只是不再被排版
```

它只是**不再参与排版**，位置停在原地不动。要真的移走：

```js
box.removeFromSuperview();    // stack 会自动把它从 arrangedSubviews 里摘掉
```

反方向是自动的——`removeFromSuperview()` 之后 `arrangedSubviews` 里也没有它了，不用两边都调。

## 隐藏即塌陷

```js
middle.isHidden = true;
// 中间那块宽度变 0，左右两块自动平分整个宽度
```

这是手写约束做不到的事：约束只能停用，停用之后没有东西会自动补位。stack 监听排列项的 `isHidden`，自己重算。

**隐藏的项还在 `arrangedSubviews` 里**（`length` 不变），只是不占位。`isHidden = false` 就回来。

## 单独调某一项后面的间距

```js
row.setCustomSpacing(40, { afterView: avatar });
row.customSpacingAfterView(avatar);     // 40
```

优先于 `spacing`。三种取值：

| 值 | 含义 |
| --- | --- |
| 数字 | 就是这么多点 |
| `'system'` | 系统标准间距，由系统按上下文定 |
| `'default'` | 撤回，回到 `spacing` 属性的值 |

没设过就是 `'default'`。项在排列里换位置时自定义间距跟着走，被移出排列就丢了。

> `spacing` 属性只接受数字和 `'system'`，**不接受 `'default'`**——UIKit 里把 `spacing` 设成那个哨兵值的效果是 0，没有意义，所以运行时直接抛。

## 属性一览

| 属性 | 类型 | 读写 |
| --- | --- | --- |
| `axis` | `'horizontal' \| 'vertical'` | 读写 |
| `distribution` | 枚举字符串 | 读写 |
| `alignment` | 枚举字符串 | 读写 |
| `spacing` | `number \| 'system'` | 读写 |
| `isBaselineRelativeArrangement` | `boolean` | 读写 |
| `isLayoutMarginsRelativeArrangement` | `boolean` | 读写 |
| `arrangedSubviews` | `UIView[]` | 只读 |

## 和原生的对照

| ObjC | JS |
| --- | --- |
| `[[UIStackView alloc] init]` | `new UIStackView()` |
| `[[UIStackView alloc] initWithArrangedSubviews:@[a, b]]` | `new UIStackView([a, b])` |
| `stack.axis = UILayoutConstraintAxisVertical` | `stack.axis = 'vertical'` |
| `stack.distribution = UIStackViewDistributionFillEqually` | `stack.distribution = 'fillEqually'` |
| `stack.alignment = UIStackViewAlignmentCenter` | `stack.alignment = 'center'` |
| `stack.spacing = 12` | `stack.spacing = 12` |
| `stack.spacing = UIStackViewSpacingUseSystem` | `stack.spacing = 'system'` |
| `stack.baselineRelativeArrangement = YES` | `stack.isBaselineRelativeArrangement = true` |
| `stack.layoutMarginsRelativeArrangement = YES` | `stack.isLayoutMarginsRelativeArrangement = true` |
| `stack.arrangedSubviews` | `stack.arrangedSubviews` |
| `[stack addArrangedSubview:v]` | `stack.addArrangedSubview(v)` |
| `[stack insertArrangedSubview:v atIndex:1]` | `stack.insertArrangedSubview(v, { atIndex: 1 })` |
| `[stack removeArrangedSubview:v]` | `stack.removeArrangedSubview(v)` |
| `[stack setCustomSpacing:40 afterView:v]` | `stack.setCustomSpacing(40, { afterView: v })` |
| `[stack setCustomSpacing:UIStackViewSpacingUseDefault afterView:v]` | `stack.setCustomSpacing('default', { afterView: v })` |
| `[stack customSpacingAfterView:v]` | `stack.customSpacingAfterView(v)` |

## 还没做

| | |
| --- | --- |
| `layoutMargins` / `directionalLayoutMargins` | `isLayoutMarginsRelativeArrangement` 开得了，但**边距的值还读不到也写不了**，所以现在只能用系统默认的那一圈 |
| `viewForFirstBaselineLayout` / `viewForLastBaselineLayout` | 边缘能力，留给 bindgen |
| 滚动 | 不是它的事。长内容要滚，把它放进 [`UIScrollView`](ui-scroll-view.md) |
| 换行 / grid | UIKit 没有原生容器，等 `UICollectionView` |

---

← 返回 [API 文档](README.md) ・ [Auto Layout](auto-layout.md) ・ [实现原理](../internals/auto-layout.md)
