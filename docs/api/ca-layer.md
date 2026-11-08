# `CALayer`

圆角、边框、阴影。每个 `UIView` 都有一个 `layer`，这三样在它上面。

```js
const layer = card.layer;
layer.cornerRadius = 14;
layer.borderWidth  = 2;
layer.borderColor  = UIColor.systemBlueColor;
```

`view.layer` 和 view 一对一，取两次是同一个对象。图层本身不能构造。

## 圆角

### `cornerRadius: number`

默认 `0`。设了就圆。

```js
layer.cornerRadius = 14;
```

**只圆背景和边框。** 子视图、图片这些内容照样是直角，要让它们也跟着圆：

```js
view.clipsToBounds = true;
```

### `cornerCurve: 'circular' | 'continuous'`

**默认 `'continuous'`**——超椭圆圆角，Apple 的 App 图标和系统卡片用的就是它，转角过渡比正圆弧顺。要正圆弧得显式写 `'circular'`。

> `CALayer.h` 里写的是「默认 circular」，和 iOS 26 的实际行为不符。以实际为准。

### `maskedCorners: CACornerMask[]`

哪几个角要圆。默认四个角全圆。

```js
layer.maskedCorners = ['minXMinY', 'maxXMinY'];   // 只圆上面两个
layer.maskedCorners = [];                          // 一个都不圆
```

**UIKit 的 y 轴朝下**，所以 minY 是上边：

| 值 | 角 |
| --- | --- |
| `'minXMinY'` | 左上 |
| `'maxXMinY'` | 右上 |
| `'minXMaxY'` | 左下 |
| `'maxXMaxY'` | 右下 |

空数组合法。给了非数组、或者名字不认识，都抛 `TypeError`，两种错的信息不一样：

```js
layer.maskedCorners = ['topLeft'];   // has no value "topLeft"; expected…
layer.maskedCorners = 'minXMinY';    // needs an array of names; expected…
```

## 边框

### `borderWidth: number`

默认 `0`。边框画在**内容之上**，而且跟着 `cornerRadius` 走。

### `borderColor: UIColor | null`

默认**不透明黑**（不是 `null`）。所以默认看不见边框是因为宽度是 0，不是因为没颜色。

两条要注意的，都和 ObjC 那边是 `CGColorRef` 有关：

```js
layer.borderColor = UIColor.systemBlueColor;
layer.borderColor === UIColor.systemBlueColor;   // false
layer.borderColor === layer.borderColor;          // false ← 读两次也不相等
```

**别拿它做 `===` 比较，也别往它上面挂属性。** 每读一次都是一个新对象。

```js
layer.borderColor = UIColor.labelColor;   // 动态色在这一刻被定死
```

**深色模式切换时它不会跟着变。** 要跟随外观，用 `view.backgroundColor`（那个支持动态色），或者等外观变化时自己重设一遍。

## 阴影

四个属性，**`shadowOpacity` 默认是 0**——只设颜色、半径、偏移，屏幕上不会有任何变化。

```js
layer.shadowColor   = UIColor.blackColor;   // 默认不透明黑
layer.shadowOpacity = 0.25;                 // 默认 0 ← 不设这个什么都看不见
layer.shadowRadius  = 8;                    // 默认 3
layer.shadowOffset  = new CGSize(0, 4);     // 默认 (0, -3)
```

`shadowOffset` 的 y 轴朝下，所以默认的 `-3` 是**往上偏**。

`shadowColor` 和 `borderColor` 一样是 `CGColorRef`，上面那两条注意事项同样适用。

> **阴影和裁剪互斥。** 阴影画在图层外面，`clipsToBounds = true` 把外面全裁掉。两个都要就得套两层 view：外层放阴影，内层放圆角和裁剪。

## 这些不在 `CALayer` 上

`CALayer` 在 ObjC 里还有一批和 `UIView` 重叠的属性，Nacre **不从图层这边暴露**——用 view 的那一套：

| 想要 | 用 |
| --- | --- |
| 透明度 | `view.alpha` |
| 背景色 | `view.backgroundColor` |
| 裁剪 | `view.clipsToBounds` |
| 位置和大小 | `view.frame` / `view.bounds` |
| 显示隐藏 | `view.isHidden` |

## 属性一览

| 属性 | 类型 | 默认值 |
| --- | --- | --- |
| `cornerRadius` | `number` | `0` |
| `cornerCurve` | `'circular'` \| `'continuous'` | `'continuous'` |
| `maskedCorners` | `CACornerMask[]` | 四个角全圆 |
| `borderWidth` | `number` | `0` |
| `borderColor` | `UIColor` \| `null` | 不透明黑 |
| `shadowColor` | `UIColor` \| `null` | 不透明黑 |
| `shadowOpacity` | `number` | `0` |
| `shadowRadius` | `number` | `3` |
| `shadowOffset` | `CGSize` | `(0, -3)` |

## 和原生的对照

| ObjC | JS |
| --- | --- |
| `view.layer` | `view.layer` |
| `layer.cornerRadius = 14` | `layer.cornerRadius = 14` |
| `layer.cornerCurve = kCACornerCurveContinuous` | `layer.cornerCurve = 'continuous'` |
| `layer.maskedCorners = kCALayerMinXMinYCorner \| kCALayerMaxXMinYCorner` | `layer.maskedCorners = ['minXMinY', 'maxXMinY']` |
| `layer.borderWidth = 2` | `layer.borderWidth = 2` |
| `layer.borderColor = UIColor.systemBlueColor.CGColor` | `layer.borderColor = UIColor.systemBlueColor` |
| `[UIColor colorWithCGColor:layer.borderColor]` | `layer.borderColor` |
| `layer.shadowOffset = CGSizeMake(0, 4)` | `layer.shadowOffset = new CGSize(0, 4)` |
| `layer.masksToBounds = YES` | `view.clipsToBounds = true` |
| `layer.opacity = 0.5` | `view.alpha = 0.5` |

## 还没做

| | |
| --- | --- |
| `sublayers` / `addSublayer:` | 往图层树里单独塞图层 |
| `mask` / `shadowPath` | 要 `CAShapeLayer` 和 `CGPath` |
| `transform` | 要 `CATransform3D` |
| `CAGradientLayer` 等子类 | |
| 隐式动画 | 改图层属性在 UIKit 外面本来自带动画，现在的行为**未验证** |

---

设计理由和实测依据见[项目说明](../internals/ca-layer.md)。

← 返回 [API 文档](README.md)
