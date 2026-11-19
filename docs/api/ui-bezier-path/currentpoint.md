---
type: reference
native: UIBezierPath.currentPoint
---

# `UIBezierPath`：`currentPoint` 属性

**`currentPoint`** 属性是路径的当前点：下一段线从这里开始画。

## 值

`CGPoint`，单位是 [pt](../units.md)。

- 只读。给它赋值抛 `TypeError`。
- 空路径是 `CGPoint(0, 0)`。
- [`moveToPoint()`](movetopoint.md) 把它设成给的点；画线、曲线、圆弧的方法把它设成那一段的终点。
- 随路径的修改而变，没有变化的事件：路径只会被代码修改。

## 示例

```js
const path = new UIBezierPath();
path.moveToPoint(new CGPoint(0, 60));
path.addLineToPoint(new CGPoint(40, 20));
console.log(String(path.currentPoint));
```

**结果**：控制台输出 `CGPoint(40, 20)`。

## 对应的 iOS API

`UIBezierPath.currentPoint`。

## 参见

- [路径由什么组成](../ui-bezier-path.md#路径由什么组成)
