# Auto Layout

```js
const card = new UIView();
card.translatesAutoresizingMaskIntoConstraints = false;   // ← 先关掉，见下
root.addSubview(card);

NSLayoutConstraint.activateConstraints([
  card.leadingAnchor.constraintEqualToAnchor(guide.leadingAnchor, { constant: 16 }),
  card.trailingAnchor.constraintEqualToAnchor(guide.trailingAnchor, { constant: -16 }),
  card.heightAnchor.constraintEqualToConstant(60),
]);
```

一条约束就是一句等式：

```
item1.attr1  <关系>  multiplier × item2.attr2 + constant
```

求解器拿所有约束解出每个视图的 `frame`。**所以用了约束就别再写 `frame`**——两边在写同一个值，而且下次布局还会被求解器覆盖。

## 第一步：关掉 `translatesAutoresizingMaskIntoConstraints`

默认是 `true`，意思是「把我的 `frame` 翻译成一组约束」。翻译出来的是 **required 优先级**的，和你写的那些直接打架。

```js
view.translatesAutoresizingMaskIntoConstraints = false;
```

每个用约束摆放的视图都要设。漏一个的症状是「约束全写对了但位置不动」。

> 系统给的视图（`UIViewController.view`、`UIWindow`）不要动它——它们的位置本来就由系统用 frame 定。

## 锚点：边的对象化

```js
view.leadingAnchor      // 横向
view.topAnchor          // 纵向
view.widthAnchor        // 尺寸
```

锚点**不能构造**，只能从 `UIView`（12 个）或 [`UILayoutGuide`](#uilayoutguide)（10 个）上取。同一个视图上取两次是同一个对象。

分三类，**不能互连**：

| 类 | 有哪些 | 能做什么 |
| --- | --- | --- |
| `NSLayoutXAxisAnchor` | `leading` `trailing` `left` `right` `centerX` | 和横向锚点比，系统标准间距 |
| `NSLayoutYAxisAnchor` | `top` `bottom` `centerY` `firstBaseline` `lastBaseline` | 和纵向锚点比，系统标准间距 |
| `NSLayoutDimension` | `width` `height` | 和常数比、和尺寸锚点按倍数比 |

连错了抛 `TypeError`。TypeScript 那一层也挡得住，所以多半在编辑器里就红了。

```js
card.topAnchor.constraintEqualToAnchor(card.leadingAnchor);   // TypeError
```

> `leading` / `trailing` 跟书写方向走，`left` / `right` 是物理左右。除非真的是「屏幕左边」，否则用 `leading` / `trailing`。

### 三种关系 × 可选项

```js
a.topAnchor.constraintEqualToAnchor(b.bottomAnchor)
a.topAnchor.constraintEqualToAnchor(b.bottomAnchor, { constant: 8 })
a.widthAnchor.constraintEqualToAnchor(b.widthAnchor, { multiplier: 0.5 })
a.widthAnchor.constraintEqualToAnchor(b.widthAnchor, { multiplier: 0.5, constant: -8 })
a.widthAnchor.constraintEqualToConstant(60)
```

把 `Equal` 换成 `GreaterThanOrEqual` / `LessThanOrEqual` 就是另外两种关系。`multiplier` 只有尺寸锚点有——「leading 的一半」没有意义。

### 系统标准间距

```js
b.leadingAnchor.constraintEqualToSystemSpacingAfterAnchor(a.trailingAnchor)
```

差多少由系统按上下文决定（8pt 起步，但靠近屏幕边缘、不同控件之间都不一样）。这是 iOS 独有的东西，Web 里没有对应物，所以原样暴露。`multiplier` 省略时按 `1`。

纵向那个叫 `constraintEqualToSystemSpacingBelowAnchor`，和 ObjC 的 selector 一致。

## 建和激活是两件事

```js
const c = a.topAnchor.constraintEqualToAnchor(b.bottomAnchor);
c.isActive;        // false ← 建出来是不生效的
c.isActive = true; // 这一步才装到视图树上
```

激活时约束被装到**两端的最近公共祖先**上。所以：

- 约束子视图之间的位置，约束对象出现在**父视图**的 `constraints` 里
- 约束自己的宽高，出现在**自己**的 `constraints` 里
- 两端没有公共祖先 → 抛 `TypeError`

```js
NSLayoutConstraint.activateConstraints([c1, c2, c3]);
NSLayoutConstraint.deactivateConstraints([c1]);
```

批量比逐个 `isActive = true` 好：中间态不会短暂地不可满足。

## 约束建好之后能改什么

| 成员 | | |
| --- | --- | --- |
| `isActive` | 读写 | 唯一的开关 |
| `constant` | 读写 | **唯一可写的数值**，做动画改的就是它 |
| `priority` | 读写 | 写接受名字或数字，**读永远是数字** |
| `identifier` | 读写 | 调试用，冲突日志里会打出来 |
| `multiplier` | 只读 | |
| `relation` | 只读 | `'equal'` / `'lessThanOrEqual'` / `'greaterThanOrEqual'` |
| `firstAttribute` / `secondAttribute` | 只读 | `'width'`、`'leading'`、`'notAnAttribute'`… |
| `firstAnchor` / `secondAnchor` | 只读 | 就是建它的那两个锚点对象 |

```js
cardHeight.constant = 84;
root.layoutIfNeeded();     // 不调这句要等下一轮布局
```

`firstItem` / `secondItem` **不暴露**。它们在 ObjC 里是 `assign`，视图一死就是野指针，头文件自己写着「Access to these properties is not recommended」。要两端的视图，从锚点走。

### 优先级：写名字或数字，读永远是数字

七个具名值：

| 名字 | 值 |
| --- | --- |
| `'required'` | 1000 |
| `'defaultHigh'` | 750 |
| `'dragThatCanResizeScene'` | 510 |
| `'sceneSizeStayPut'` | 500 |
| `'dragThatCannotResizeScene'` | 490 |
| `'defaultLow'` | 250 |
| `'fittingSizeLevel'` | 50 |

中间的值（749 之类）合法但**没有名字**，所以读出来统一是数字：

```js
c.priority = 'defaultHigh';   c.priority;   // 750
c.priority = 749;             c.priority;   // 749
c.priority = 'veryImportant';               // TypeError
```

## 内容抱紧和抗压缩

同一条线的两个方向，说的都是「固有尺寸有多坚持」：

| | 挡的是 |
| --- | --- |
| 内容抱紧（hugging） | 别把我**拉得比固有尺寸大** |
| 抗压缩（compression resistance） | 别把我**压得比固有尺寸小** |

```js
label.setContentHuggingPriority('defaultLow', { forAxis: 'horizontal' });
label.contentHuggingPriorityForAxis('horizontal');   // 250
```

**`flex: 1` 就是把抱紧优先级调低**：一排控件里谁的抱紧最低，剩余空间就归谁。`flex-shrink` 对应的是抗压缩。

**实测的默认值**：`UILabel` 和普通 `UIView` 都是抱紧 250、抗压缩 750，两者**没有差别**——「标签抱得更紧」是以讹传讹。差别来自固有尺寸：`UILabel` 有，普通 `UIView` 是 `(-1, -1)`，抱紧和抗压缩都没有东西可抱。

> 没有 `display: flex`，也没有 `flex-direction` / `flex-wrap`。方向是你写约束时自己定的。

## `UILayoutGuide`

不画东西的矩形。占位、分组、做间距，比塞一个透明 `UIView` 省一个图层。

```js
const spacer = new UILayoutGuide();
card.addLayoutGuide(spacer);
NSLayoutConstraint.activateConstraints([
  spacer.leadingAnchor.constraintEqualToAnchor(left.trailingAnchor),
  spacer.trailingAnchor.constraintEqualToAnchor(middle.leadingAnchor),
]);
spacer.layoutFrame;    // 求解之后它占的位置，在 owningView 的坐标系里
```

比 `UIView` 少两个锚点：**没有基线**，因为它没有文字。

系统现成的三个：

| | |
| --- | --- |
| `view.safeAreaLayoutGuide` | 刘海、Home 指示条、状态栏让出来的那块 |
| `view.layoutMarginsGuide` | 系统边距 |
| `view.readableContentGuide` | 一行字的舒适宽度。长文本用它比用 safeArea 好读 |

## 排版调试

**UIKit 在这个运行时里对约束冲突一声不吭**——stdout、stderr、os_log 三路实测全空。JS 开发者也没有 Xcode 控制台可看，所以这三个是唯一的自查手段：

```js
view.hasAmbiguousLayout;                              // 约束不够，有多个合法解
view.exerciseAmbiguityInLayout();                     // 在几个解之间跳一下，肉眼可见
view.constraintsAffectingLayoutForAxis('horizontal'); // 到底是哪几条在管
```

配合 `identifier` 用：

```js
c.identifier = 'card-height';
for (const c of box.constraintsAffectingLayoutForAxis('vertical')) {
  console.log(c.identifier, c.constant, c.priority);
}
```

## 算尺寸

```js
view.systemLayoutSizeFittingSize(new CGSize(0, 0));
view.systemLayoutSizeFittingSize(size, {
  withHorizontalFittingPriority: 'required',
  verticalFittingPriority: 'fittingSizeLevel',
});
```

和 [`sizeThatFits`](ui-view.md#几何) 的区别：`sizeThatFits` 问的是视图**自己**的意见，这个解的是**整棵子树的约束**。

固有尺寸变了要主动说一声，否则求解器还用着上一次的值：

```js
view.invalidateIntrinsicContentSize();
```

## 拿着锚点就等于拿着视图

```js
let v = new UIView();
const a = v.widthAnchor;
v = null;                                        // 只留锚点，不留 view
a.constraintEqualToConstant(50).isActive = true; // 照样能用
```

锚点持有它的视图，约束持有两端的锚点。**不用自己留引用。**

## 不用手写约束的那一半

排成一行或一列不必自己建约束，[`UIStackView`](ui-stack-view.md) 就是干这个的——它是约束的**工厂**，不是第二套布局引擎。上面那段「三个等距的块」手写了六条约束，用 stack 是四行属性。

## 还没做

| | 为什么 |
| --- | --- |
| VFL（`constraintsWithVisualFormat:`） | 字符串 DSL，运行时才报错，Apple 自己也不推荐了 |
| 7 参的 `constraintWithItem:…` | 锚点完全覆盖它，而且不用暴露 21 个值的 `NSLayoutAttribute` |
| `addConstraint:` / `removeConstraint:` | 头文件写明 should be avoided，用 `isActive` |
| `updateConstraints` 系列 | 是覆写点，要先能用 JS 子类化原生类 |
| `alignmentRectForFrame:`、`viewForFirstBaselineLayout` | 边缘能力，留给 bindgen |

## 和原生的对照

| ObjC | JS |
| --- | --- |
| `view.translatesAutoresizingMaskIntoConstraints = NO` | `view.translatesAutoresizingMaskIntoConstraints = false` |
| `[a.leadingAnchor constraintEqualToAnchor:b.trailingAnchor]` | `a.leadingAnchor.constraintEqualToAnchor(b.trailingAnchor)` |
| `[a.topAnchor constraintEqualToAnchor:b.bottomAnchor constant:8]` | `a.topAnchor.constraintEqualToAnchor(b.bottomAnchor, { constant: 8 })` |
| `[a.widthAnchor constraintEqualToAnchor:b.widthAnchor multiplier:0.5]` | `a.widthAnchor.constraintEqualToAnchor(b.widthAnchor, { multiplier: 0.5 })` |
| `[v.widthAnchor constraintEqualToConstant:60]` | `v.widthAnchor.constraintEqualToConstant(60)` |
| `[b.leadingAnchor constraintEqualToSystemSpacingAfterAnchor:a.trailingAnchor multiplier:1]` | `b.leadingAnchor.constraintEqualToSystemSpacingAfterAnchor(a.trailingAnchor)` |
| `c.active = YES` | `c.isActive = true` |
| `[NSLayoutConstraint activateConstraints:@[c1, c2]]` | `NSLayoutConstraint.activateConstraints([c1, c2])` |
| `c.priority = UILayoutPriorityDefaultLow` | `c.priority = 'defaultLow'` |
| `[v setContentHuggingPriority:250 forAxis:UILayoutConstraintAxisHorizontal]` | `v.setContentHuggingPriority('defaultLow', { forAxis: 'horizontal' })` |
| `[v systemLayoutSizeFittingSize:s]` | `v.systemLayoutSizeFittingSize(s)` |
| `[v constraintsAffectingLayoutForAxis:UILayoutConstraintAxisHorizontal]` | `v.constraintsAffectingLayoutForAxis('horizontal')` |
| `view.safeAreaLayoutGuide` | `view.safeAreaLayoutGuide` |

ObjC 的 `getter=isActive` 在 JS 侧用 getter 的名字。位掩码和枚举都用字符串。

---

实现原理见[实现说明](../internals/auto-layout.md)。

← 返回 [API 文档](README.md)
