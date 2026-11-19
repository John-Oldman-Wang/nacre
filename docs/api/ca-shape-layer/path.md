---
type: reference
native: CAShapeLayer.path
---

# `CAShapeLayer`：`path` 属性

**`path`** 属性是形状图层要画的路径。

## 值

[`UIBezierPath`](../ui-bezier-path.md)，或者 `null`。

- 可读，可写。
- 默认值是 `null`，什么都不画。
- 路径里的坐标按图层自己的坐标系算，原点在图层左上角，单位 [pt](../units.md)。
- 图层不会按路径调整自己的大小。路径超出图层 `frame` 的部分照常画出来，除非 `masksToBounds` 是 `true`。**未在模拟器验证。**
- 读出来的是写进去的那个对象。
- **写入之后再修改这条路径，图层不会变。** 图层保存的是写入那一刻的形状。改完路径后要再赋值一次。

## 示例

```js
const path = new UIBezierPath();
path.moveToPoint(new CGPoint(0, 0));
path.addLineToPoint(new CGPoint(100, 0));

const shape = new CAShapeLayer();
shape.path = path;

path.addLineToPoint(new CGPoint(100, 100));   // 图层上还是一段线
shape.path = path;                            // 图层上变成两段线
console.log(shape.path === path);
```

**效果**：第二次赋值之后，图层才画出新加的那一段。**未在模拟器验证。** 控制台输出 `true`。

## 对应的 iOS API

`CAShapeLayer.path`。ObjC 里写 `path.CGPath`，这里直接写 `UIBezierPath`。

## 参见

- [`UIBezierPath`](../ui-bezier-path.md)
