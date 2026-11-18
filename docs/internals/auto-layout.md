# Auto Layout

约束子系统的实现细节和实测。

## 第 3c 步新增的机制

只加了**一条**通道，其余全是复用：

| 通道 | 用途 |
| --- | --- |
| `call_object_array_method` | 方法返回原生对象数组。此前只有「属性是对象数组」（`subviews`），没有「方法返回对象数组」。`constraintsAffectingLayoutForAxis:` 要它 |

`NSLayoutConstraint.activateConstraints([...])` **没有**开新通道：约束按「每个参数一个对象」摊在 `argPtrs` 里传，原生侧把整个 `argPtrs` 收成数组。现成的类方法通道够用，不必为「数组参数」再发明一种编码。

三条值得记住的事实：

1. **`UILabel` 和普通 `UIView` 的抱紧 / 抗压缩默认值一样**，都是 250 / 750（横纵都是）。「标签抱得更紧」是以讹传讹——差别在固有尺寸：`UILabel` 有，普通 `UIView` 是 `(-1, -1)`，没有东西可抱。
2. **没有公共祖先时激活约束，原生抛 `NSGenericException`**。不接住整个 App 就没了，而这是 JS 写错了，所以桥上 `@try/@catch` 转成 `TypeError`。这是**少数几处接 `NSException` 的地方**，判据是「不接的代价是崩溃，而错误来自调用方」。跨轴连接（`NSInvalidArgumentException`）则是在桥上**先查类型**，不等它抛。
3. **优先级是第一个「写接受两种形态、读只有一种」的属性**。`UILayoutPriority` 是 `float`，具名值只有七个，749 合法但没名字——读出来硬编成字符串只能编一个。这和「枚举一律用字符串」不矛盾：那条管的是取值有限的枚举。

## `UIStackView`：一条新通道都没开

它是**第一个完全靠现成通道落地的类**。四件事分别复用了已有的机制：

| 要什么 | 复用了什么 |
| --- | --- |
| `initWithArrangedSubviews:` 的数组参数 | 「每个参数一个句柄」——`argPtrs` 本来就是一维数组，原生侧自己收成 `NSArray`。`activateConstraints:` 立的规矩 |
| `arrangedSubviews` | `read_object_array_property`（`subviews` 那条） |
| `setCustomSpacing:afterView:` | `call_method`，值和对象混在一次调用里 |
| 隐藏项塌陷 | 什么都不用做——`isHidden` 早就暴露了，塌陷是 UIKit 自己在监听 |

### 别名枚举：第一次遇到一个值两个名字

头文件原话：

```objc
UIStackViewAlignmentLeading,
UIStackViewAlignmentTop = UIStackViewAlignmentLeading,     // 都是 1
UIStackViewAlignmentTrailing,
UIStackViewAlignmentBottom = UIStackViewAlignmentTrailing,  // 都是 5
```

在此之前 17 张枚举表**没有一张有重复值**。而 `NACRE_ENUM_MAP` 的 `NameFor` 是**遍历 `NSDictionary`** 找第一个值相等的 key——字典无序，同一个值挂两个 key，读出来的字符串就是**不确定**的。不是「读回 top 还是 leading」的审美问题，是同一个进程里两次读可能不一样。

所以 `StackAlignment` 不走宏，改用**有序的 pairs 数组**（和 `CornerCurvePairs`、`TextStylePairs` 同一个形状）：主名在前、别名在后，`NameFor` 取第一个命中的。于是

- 写入：六个名字全认，照 Apple 文档写 `.top` 不会抛
- 读出：永远是 `leading` / `trailing`

主名选 `leading` 那一侧，依据是头文件里 `Top = Leading`——前者是声明，后者是别名。

被否掉的第三个方案是**按 `axis` 决定读回 `top` 还是 `leading`**。它发明了 UIKit 没有的语义：底下那个数值根本不随轴改变，翻一下 `axis` 字符串却变了，等于凭空造出一个会自己变的属性。

### 间距的哨兵值不进 JS

```objc
static const CGFloat UIStackViewSpacingUseDefault = FLT_MAX;   // 3.4e38
static const CGFloat UIStackViewSpacingUseSystem  = FLT_MIN;    // 1.17e-38
```

这两个是**令牌不是数量**，原样存进属性、不参与算术，所以原生侧用 `==` 比浮点是对的（UIKit 自己也这么比）。

JS 侧给字符串 `'system'` / `'default'`，映射留在原生层——和[枚举](enums.md)同一个理由：把 `1.1754943508222875e-38` 硬编进 JS，换个 CGFloat 宽度就全错。

另一条路是照 Swift 的样子暴露 `UIStackView.spacingUseSystem` 两个类级常量，但那要新开一条「类级**标量**属性」通道（现在只有类级对象属性，服务 `UIColor` 的颜色常量）。为两个常量开一条通道不划算。

代价是 `spacing` 的类型成了 `number | 'system'`。联合类型不漂亮，但它如实反映了这个属性确实能存一个令牌。

### 所有权镜像：`removeArrangedSubview` 不断边

`addArrangedSubview:` 在原生侧**同时**做了两件事（进排列、进 `subviews`），而 `removeArrangedSubview:` 只做第一件。所以 JS 侧：

- `addArrangedSubview` / `insertArrangedSubview` 走和 `addSubview` 一模一样的 `disown` + `ownOne(this, 'subviews', view)`
- `removeArrangedSubview` **什么都不动**——原生的强引用还在，镜像就不能断

`arrangedSubviews` 的取值器用的是另一条边名（`'arrangedSubviews'`），不是 `'subviews'`。因为 `ownAll` 会按原生真相**整层重建**那一条边，如果两者共用一个名字，读一次 `arrangedSubviews` 就会把非排列的 subview 从镜像里抹掉。

构造函数里也要补这一笔，而且**旧的 superview 必须在 `constructNative` 之前读**——之后它们已经挂到 stack 上了。

## 内边距：属性在 `UIView` 上，不在 `UIStackView` 上

试用者要的是「`UIStackView` 的 padding」，查头文件才发现 `UIStackView.h` 里只有一个开关（`layoutMarginsRelativeArrangement`），边距本身是 `UIView` 的 `layoutMargins` / `directionalLayoutMargins`。所以这一步改的是 `NacrePropsView.mm`，`UIStackView` 一行没动——开关在第 3e 步就暴露了，只是当时边距写不了，开了也只能用默认的 8 pt。

定下来的几条：

| | 做法 | 理由 |
| --- | --- | --- |
| 两个边距属性 | 都暴露 | 底层的承诺是和 Apple 文档一一对上。它们是同一份数据的两个视图，成本只是多一对取值器 |
| `NSDirectionalEdgeInsets` | 新增结构体，写法和 `UIEdgeInsets` 完全一样 | 不拿 `UIEdgeInsets` 顶替：字段名不同（`leading` / `trailing`），顶替就得讲「`left` 其实是 `leading`」这种换算规则 |
| `insetsLayoutMarginsFromSafeArea` | 一起暴露 | 它默认是 `true`，不暴露的话贴着屏幕边的容器写 16 读回来是 84，而且 JS 关不掉——写进去和看到的不一样 |
| `preservesSuperviewLayoutMargins` | 一起暴露 | 同一组的第四个，一个布尔 |
| `UIViewController` 的 `systemMinimumLayoutMargins` / `viewRespectsSystemMinimumLayoutMargins` | **没做** | 只影响控制器根视图自己，放在它里面的容器不受影响。记在 API 文档的「还不能做的」里 |
| 变化通知 | **没有** | `layoutMarginsDidChange` 是覆写点，要 M2。系统会改它的场合只有两种：安全区变了、开了 `preserves…` 而父视图的边距变了 |

实测（iPhone Air 模拟器）：

| | 结果 |
| --- | --- |
| 新建 `UIView` 的默认边距 | 四边各 **8**，两个属性读出来一致 |
| 写 `directionalLayoutMargins` 后读 `layoutMargins` | 跟着变；反过来也是。从左往右的语言里 `leading` = `left` |
| 只写边距、不开开关 | 排列项**贴边**，边距不起作用 |
| 开了开关 | 200 × 100 的容器、边距 (10, 20, 30, 40)，排列项是 (20, 10, 140, 60) |
| 铺满根视图的视图，写上边距 16 | `insetsLayoutMarginsFromSafeArea` 为 `true` 时读回来 **84**（16 + 安全区 68），是**相加**不是取大；设成 `false` 后读回来 16 |

**一个咬过验收用例的事实**：不在窗口里、又已经布局过一次的 `UIStackView`，改开关之后只调 `layoutIfNeeded()`，排列项**原地不动**；先调 `setNeedsLayout()` 就对了。在窗口里的不需要。第一次跑时这条断言挂了，加了三组诊断（不在窗口 + `setNeedsLayout`、不在窗口 + 第一次布局前就设好、在窗口里）才分清是「没有重新布局」而不是「边距没写进去」——开关和边距读回来都是对的。API 文档里给了一条提示。

## 实测纠正 / 确认的事实

| | 结果 |
| --- | --- |
| 加进排列后 `translatesAutoresizingMaskIntoConstraints` | **自动变 `false`**（头文件没写）。所以排列项不用自己关，stack 本身要关 |
| 隐藏项的 `frame.width` | **0**，不是保持原值 |
| 隐藏项还在不在 `arrangedSubviews` | **在**，`length` 不变 |
| 没设过自定义间距时 `customSpacingAfterView:` | 返回 `UIStackViewSpacingUseDefault`，所以 JS 侧是 `'default'` |
| `removeFromSuperview` 会不会自动出排列 | **会**，头文件这条属实 |
| 非渲染视图 | `backgroundColor` 设了看不见，确认 |

---

← 返回[实现原理](README.md) ・ [项目说明](../project.md)
