---
type: reference
native: CGRect
---

# `CGRect`

**`CGRect`** 表示一个矩形：左上角的位置 `x`、`y` 加上宽 `width` 和高 `height`，单位都是 [pt](units.md)。坐标原点在左上角，`y` 向下增大。

矩形的数可以直接读（`r.x`、`r.width`），也可以按嵌套的写法读（`r.origin.x`、`r.size.width`），两种读到的是同一组数。

字段只读，要改就整体换一个新的；写入接受结构体的地方时也可以给字段齐全的普通对象；每次读属性得到一个新对象。这几条对所有结构体都成立，见[结构体](structs.md)。

**继承关系**：没有。`CGRect` 是普通的 JS 类，不继承 `NSObject`，也不是 `EventTarget`。

## 构造函数

[`CGRect()`](cg-rect/constructor.md)

用四个数创建一个矩形。不给的参数是 0。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`x`](cg-rect/x.md) <small>只读</small> | 左上角的横坐标，pt |
| [`y`](cg-rect/y.md) <small>只读</small> | 左上角的纵坐标，pt |
| [`width`](cg-rect/width.md) <small>只读</small> | 宽，pt |
| [`height`](cg-rect/height.md) <small>只读</small> | 高，pt |
| [`origin`](cg-rect/origin.md) <small>只读</small> | 左上角，一个 `CGPoint`。每次读得到一个新的 |
| [`size`](cg-rect/size.md) <small>只读</small> | 尺寸，一个 `CGSize`。每次读得到一个新的 |

写入接受矩形的地方时，普通对象只认 `x`、`y`、`width`、`height` 四个直接字段。`{ origin, size }` 这种形状不被接受，按「少字段」抛错。

## 示例

```js
const r = new CGRect(10, 20, 100, 50);

console.log(r.x, r.y, r.width, r.height);
console.log(String(r.origin), String(r.size));
console.log(r.origin.x === r.x);
```

**结果**

- 第一行输出 `10 20 100 50`。
- 第二行输出 `CGPoint(10, 20) CGSize(100, 50)`。
- 第三行输出 `true`。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `CGRectMake(0, 0, 100, 50)` | `new CGRect(0, 0, 100, 50)` |
| `rect.origin.x` | `rect.origin.x` 或 `rect.x` |
| `rect.size.width` | `rect.size.width` 或 `rect.width` |
| `CGRectZero` | `new CGRect()` |

## 参见

- [结构体](structs.md)：所有结构体共同的规则，以及转成字符串和 JSON
- 用到它的地方：[`UIView`](ui-view.md) 的 `frame` 和 `bounds`、[`CALayer`](ca-layer.md) 的 `frame` 和 `bounds`、[`UIBezierPath`](ui-bezier-path.md) 的矩形和椭圆路径、[`UIScrollView`](ui-scroll-view.md) 的 `scrollRectToVisible()`
- [`CGPoint`](cg-point.md)、[`CGSize`](cg-size.md)：`origin` 和 `size` 的类型
