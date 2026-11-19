---
type: reference
native: CGPoint
---

# `CGPoint`

**`CGPoint`** 表示平面上的一个点：横坐标 `x` 和纵坐标 `y`，单位 [pt](units.md)。坐标原点在左上角，`x` 向右增大，`y` 向下增大。

字段只读，要改就整体换一个新的；写入接受结构体的地方时也可以给字段齐全的普通对象；每次读属性得到一个新对象。这几条对所有结构体都成立，见[结构体](structs.md)。

**继承关系**：没有。`CGPoint` 是普通的 JS 类，不继承 `NSObject`，也不是 `EventTarget`。

## 构造函数

[`CGPoint()`](cg-point/constructor.md)

用横坐标和纵坐标创建一个点。不给的参数是 0。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`x`](cg-point/x.md) <small>只读</small> | 横坐标，pt |
| [`y`](cg-point/y.md) <small>只读</small> | 纵坐标，pt |

## 示例

```js
const view = new UIView();
view.frame = new CGRect(0, 0, 100, 100);
view.center = new CGPoint(200, 300);
console.log(String(view.center));
```

**效果**：视图的中心移到 (200, 300)，控制台输出 `CGPoint(200, 300)`。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `CGPointMake(10, 20)` | `new CGPoint(10, 20)` |
| `CGPointZero` | `new CGPoint()` |

## 参见

- [结构体](structs.md)：所有结构体共同的规则，以及转成字符串和 JSON
- 用到它的地方：[`UIView`](ui-view.md) 的 `center` 和 `convertPoint()`、[`UIScrollView`](ui-scroll-view.md) 的 `contentOffset`、[`UIBezierPath`](ui-bezier-path.md) 上的点
- [`CGRect`](cg-rect.md)：`origin` 是一个 `CGPoint`
