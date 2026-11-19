---
type: reference
native: UIBezierPath.bounds
---

# `UIBezierPath`：`bounds` 属性

**`bounds`** 属性是包住整条路径的矩形。

## 值

`CGRect`，单位是 [pt](../units.md)。

- 只读。给它赋值抛 `TypeError`。
- 空路径是 `CGRect(0, 0, 0, 0)`。
- 算的是路径本身，不含线宽。线宽设在形状图层上，路径不知道它。
- 只有直线的路径，得到的是恰好包住所有顶点的矩形。含贝塞尔曲线的路径，这个矩形是否把控制点也包进去，**未在模拟器验证**。
- 随路径的修改而变，没有变化的事件：路径只会被代码修改。

## 示例

```js
const line = new UIBezierPath();
line.moveToPoint(new CGPoint(0, 60));
line.addLineToPoint(new CGPoint(40, 20));
line.addLineToPoint(new CGPoint(80, 50));
console.log(String(line.bounds));
```

**结果**：控制台输出 `CGRect(0, 20, 80, 40)`。

## 对应的 iOS API

`UIBezierPath.bounds`。

## 参见

- [结构体](../structs.md)：`CGRect`
