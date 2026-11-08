# `UIView`

视图。屏幕上一块矩形区域，负责画自己、排布子视图、接收触摸。

`UIView` 是 UIKit 里最值得花力气的一层：它有 28 个直接子类（`UILabel`、`UIImageView`、`UIControl`、`UIScrollView`、`UIStackView`…），间接子类更多。这里做对一次，后面所有控件都继承。

## 继承关系

```
EventTarget
└─ NSObject
   └─ UIResponder
      └─ UIView
         └─ UIWindow
```

## 构造

```js
const box = new UIView();
box.frame = new CGRect(40, 120, 200, 120);
```

`new UIView()` 对应 ObjC 的 `[[UIView alloc] init]`。`initWithFrame:` 没有单独暴露——先构造再赋 `frame` 效果相同。（真正需要它的是自定义子类的指定初始化器，等做继承原生类时再看。）

## 结构体

`frame` / `bounds` / `center` 这些的值是结构体。详见[结构体文档](structs.md)，这里只强调一条：**结构体是只读的**。

```js
box.frame.x = 10;   // TypeError
box.frame = new CGRect(10, box.frame.y, box.frame.width, box.frame.height);  // 这样改
```

ObjC 里 `view.frame.x = 10` 是编译错误（改的是一个临时副本）。用普通对象表示的话这行会**静默无效**，所以我们让它直接抛。

## 几何

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `frame` | `CGRect` 读写 | 在父视图坐标系里的位置和大小 |
| `bounds` | `CGRect` 读写 | 自己坐标系里的大小 |
| `center` | `CGPoint` 读写 | 中心点，在父视图坐标系里 |
| `safeAreaInsets` | `UIEdgeInsets` 只读 | 安全区边距 |
| `sizeThatFits(size)` | → `CGSize` | 问「给你这么大，你想多大」，不改变自己 |
| `sizeToFit()` | | 按 `sizeThatFits:` 的结果调整自己 |
| `convertPoint(p, { toView })` | → `CGPoint` | 坐标系转换 |
| `convertPoint(p, { fromView })` | → `CGPoint` | |
| `convertRect(r, { toView })` | → `CGRect` | |
| `convertRect(r, { fromView })` | → `CGRect` | |
| `hitTest(point)` | → `UIView` \| `null` | 递归找这个点上的目标视图 |
| `intrinsicContentSize` | `CGSize` 只读 | 「我天生多大」。普通 `UIView` 返回 `(-1, -1)`，表示没有固有尺寸；`UILabel` 按文字算 |

`sizeThatFits:` 值得单独说：它是**同步**读布局，而这正是[技术选型](../project.md)里「JS 必须跑在主线程」那条的具体形态。

## 层级

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `superview` | `UIView` \| `null` 只读 | |
| `subviews` | `UIView[]` 只读 | 顺序就是绘制顺序，后面的盖在前面的上 |
| `window` | `UIWindow` \| `null` 只读 | 没挂到窗口上时是 `null` |
| `addSubview(view)` | | 加到最后，也就是最上层 |
| `insertSubview(view, { atIndex })` | | |
| `insertSubview(view, { belowSubview })` | | |
| `insertSubview(view, { aboveSubview })` | | |
| `removeFromSuperview()` | | |
| `bringSubviewToFront(view)` | | |
| `sendSubviewToBack(view)` | | |
| `isDescendantOfView(view)` | → `boolean` | 自己也算 |
| `viewWithTag(tag)` | → `UIView` \| `null` | 递归查找，包括自己 |
| `setNeedsLayout()` | | 标记需要重新布局，下一轮才做 |
| `layoutIfNeeded()` | | 立刻布局 |
| `setNeedsDisplay()` | | 标记需要重绘 |

`insertSubview` 的三种形式对应 ObjC 的三个 selector（`insertSubview:atIndex:` / `:belowSubview:` / `:aboveSubview:`）。options 的键就是 ObjC 的段名原文，所以看 Apple 文档能直接写出来——这是[已定的方法名映射规则](../project.md#待讨论的设计问题)。传空 options 会抛，不会静默选一个。

## 外观

| 成员 | 类型 | 默认值 |
| --- | --- | --- |
| `backgroundColor` | `UIColor` \| `null` 读写 | `null`（透明） |
| `alpha` | `number` 读写 | `1` |
| `isHidden` | `boolean` 读写 | `false` |
| `clipsToBounds` | `boolean` 读写 | `false` |
| `isOpaque` | `boolean` 读写 | `true` |
| `isUserInteractionEnabled` | `boolean` 读写 | `true` |
| `tag` | `number` 读写 | `0` |
| `contentMode` | 枚举字符串 读写 | `'scaleToFill'`，13 个取值见[图片文档](ui-image.md#小图放进大容器) |

> **`alpha` 读回来会有浮点误差**：写 `0.6`，读回 `0.6000000238418579`。这是 UIKit 自己的行为——`alpha` 背后是 `CALayer.opacity`，那是个 32 位 float。不是我们这一层的编码问题。

## Auto Layout

12 个锚点、`constraints`、内容抱紧和抗压缩、`translatesAutoresizingMaskIntoConstraints`、`systemLayoutSizeFittingSize`、排版调试三件套，全在 [Auto Layout 文档](auto-layout.md)。

## 还没做

- **`transform` / `transform3D`**：要 `CGAffineTransform` / `CATransform3D` 结构体
- **`layer`**：每个 `UIView` 背后都有一个 `CALayer`，真正画东西的是它。要先有 `CALayer` 类
- **`maskView`、`tintColor`、`drawRect:`**
- **动画、手势**：第 10 步
- **层级变化的覆写点**（`didAddSubview:`、`willMoveToWindow:` …）：在 ObjC 里是覆写，在 JS 里更像事件。和 `UIView` 要不要继承 `EventTarget` 一起定

---

← 返回 [API 文档](README.md)
