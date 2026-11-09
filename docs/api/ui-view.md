# `UIView`

屏幕上一块矩形区域。负责画自己、排布子视图、接收触摸。UIKit 里所有控件都是它的子类，所以这里的成员到处都能用。

```js
const box = new UIView();
box.frame = new CGRect(40, 120, 200, 120);
box.backgroundColor = UIColor.systemIndigoColor;
parent.addSubview(box);
```

## 继承关系

```
EventTarget → NSObject → UIResponder → UIView → UIWindow
```

## 构造

```js
new UIView()        // 对应 [[UIView alloc] init]
```

`initWithFrame:` 没有单独暴露——先构造再赋 `frame`，效果一样。

## 几何

| 成员 | 类型 | 效果 |
| --- | --- | --- |
| `frame` | `CGRect` 读写 | 在**父视图**坐标系里的位置和大小 |
| `bounds` | `CGRect` 读写 | 在**自己**坐标系里的大小 |
| `center` | `CGPoint` 读写 | 中心点，在父视图坐标系里 |
| `safeAreaInsets` | `UIEdgeInsets` 只读 | 刘海、Home 指示条让出来的边距 |
| `intrinsicContentSize` | `CGSize` 只读 | 「我天生多大」。普通 `UIView` 是 `(-1, -1)`，表示没有固有尺寸 |
| `sizeThatFits(size)` | → `CGSize` | 问「给你这么大，你想多大」。**不改变自己** |
| `sizeToFit()` | | 按 `sizeThatFits` 的结果调整自己 |
| `convertPoint(p, { toView })` | → `CGPoint` | 坐标系转换，`toView` 传 `null` 表示窗口坐标系 |
| `convertPoint(p, { fromView })` | → `CGPoint` | |
| `convertRect(r, { toView })` | → `CGRect` | |
| `convertRect(r, { fromView })` | → `CGRect` | |
| `hitTest(point)` | → `UIView` \| `null` | 递归找这个点上的目标视图。没命中返回 `null` |

`sizeThatFits` 是**同步**的，立刻拿到答案，不是回调也不是 Promise。

### `transform`：一旦非单位矩阵，`frame` 就不要再信

```js
view.transform = CGAffineTransform.rotation(Math.PI / 6);
```

`transform` 是 [`CGAffineTransform`](structs.md#cgaffinetransform)，默认是单位矩阵。

**UIKit 的规定：`transform` 非单位矩阵时 `frame` 没有意义。** 它报的是变换后的**包围盒**，而 `bounds` 和 `center` 不受影响：

```js
box.frame = new CGRect(24, 304, 40, 40);
box.transform = CGAffineTransform.scale(1.2)
  .concat(CGAffineTransform.rotation(Math.PI / 6));

box.bounds.width;    // 40      ← 不变
box.center.x;        // 44      ← 不变
box.frame.width;     // 65.57   ← 变了，= 40 × (|a| + |c|)
```

实测那条关系确实是 `宽 × (|a| + |c|)`。所以**变换期间要改位置和大小，用 `bounds` 和 `center`**，别碰 `frame`。换回 `identity` 之后 `frame` 就恢复了。

### 结构体字段改不动

```js
box.frame.x = 10;                 // TypeError
box.frame = new CGRect(10, box.frame.y, box.frame.width, box.frame.height);
```

`frame` / `bounds` / `center` 读出来是只读的结构体，整体换一个新的才能改。详见[结构体文档](structs.md)。

## 层级

| 成员 | 类型 | 效果 |
| --- | --- | --- |
| `superview` | `UIView` \| `null` 只读 | |
| `subviews` | `UIView[]` 只读 | 顺序就是绘制顺序，**后面的盖在前面的上** |
| `window` | `UIWindow` \| `null` 只读 | 没挂到窗口上时是 `null` |
| `addSubview(view)` | | 加到最后，也就是最上层 |
| `insertSubview(view, { atIndex })` | | |
| `insertSubview(view, { belowSubview })` | | |
| `insertSubview(view, { aboveSubview })` | | |
| `removeFromSuperview()` | | 同时会移除所有牵涉到它的约束 |
| `bringSubviewToFront(view)` | | |
| `sendSubviewToBack(view)` | | |
| `isDescendantOfView(view)` | → `boolean` | **自己也算** |
| `viewWithTag(tag)` | → `UIView` \| `null` | 递归查找，包括自己 |
| `setNeedsLayout()` | | 标记需要重新布局，下一轮才做 |
| `layoutIfNeeded()` | | 立刻布局 |
| `setNeedsDisplay()` | | 标记需要重绘 |

一个视图同时只能有一个父视图——`addSubview` 到新父视图会自动从旧的摘掉。

`insertSubview` 的 options **三选一，不能空**：

```js
parent.insertSubview(box, {});     // TypeError，不会默默选一个
```

## 外观

| 成员 | 类型 | 默认值 | 效果 |
| --- | --- | --- | --- |
| `backgroundColor` | `UIColor` \| `null` | `null` | 透明 |
| `alpha` | `number` | `1` | 连同子视图一起透明 |
| `isHidden` | `boolean` | `false` | |
| `clipsToBounds` | `boolean` | `false` | 超出自己范围的内容裁掉。**圆角要裁内容就得开它** |
| `isOpaque` | `boolean` | `true` | 绘制优化的提示，不影响外观 |
| `isUserInteractionEnabled` | `boolean` | `true` | 关掉后不接收触摸 |
| `tag` | `number` | `0` | 配合 `viewWithTag` 用 |
| `contentMode` | [枚举字符串](enums.md) | `'scaleToFill'` | 内容怎么填满自己，13 个取值见[图片文档](ui-image.md#小图放进大容器) |

> **`alpha` 读回来和写进去的不完全相等**：写 `0.6`，读回 `0.6000000238418579`。要比较就留容差。

## 圆角、边框、阴影

在 `view.layer` 上，见 [`CALayer` 文档](ca-layer.md)。

## Auto Layout

12 个锚点、`constraints`、内容抱紧和抗压缩、`translatesAutoresizingMaskIntoConstraints`、`systemLayoutSizeFittingSize`、排版调试三件套，见 [Auto Layout 文档](auto-layout.md)。

## 和原生的对照

| ObjC | JS |
| --- | --- |
| `[[UIView alloc] init]` | `new UIView()` |
| `view.frame = CGRectMake(40, 120, 200, 120)` | `view.frame = new CGRect(40, 120, 200, 120)` |
| `[view addSubview:box]` | `view.addSubview(box)` |
| `[view insertSubview:box atIndex:0]` | `view.insertSubview(box, { atIndex: 0 })` |
| `[view insertSubview:box belowSubview:other]` | `view.insertSubview(box, { belowSubview: other })` |
| `[view convertPoint:p toView:other]` | `view.convertPoint(p, { toView: other })` |
| `[view sizeThatFits:CGSizeMake(300, 999)]` | `view.sizeThatFits(new CGSize(300, 999))` |
| `[view hitTest:p withEvent:nil]` | `view.hitTest(p)` |
| `view.hidden = YES` | `view.isHidden = true` |
| `view.userInteractionEnabled = NO` | `view.isUserInteractionEnabled = false` |
| `view.contentMode = UIViewContentModeScaleAspectFit` | `view.contentMode = 'scaleAspectFit'` |

ObjC 里 `getter=isXxx` 的布尔属性，JS 侧用 getter 的名字（`isHidden` 而不是 `hidden`）。

## 还没做

| | |
| --- | --- |
| `transform` / `transform3D` | 要 `CGAffineTransform` / `CATransform3D` |
| `maskView`、`tintColor`、`drawRect:` | |
| 动画、手势 | 第 10 步 |
| 层级变化的覆写点（`didAddSubview:`、`willMoveToWindow:`） | 要先能用 JS 子类化原生类 |

---

设计理由见[项目说明](../internals/bridge.md)。

← 返回 [API 文档](README.md)
