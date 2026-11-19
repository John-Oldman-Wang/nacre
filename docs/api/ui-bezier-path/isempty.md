---
type: reference
native: UIBezierPath.empty
---

# `UIBezierPath`：`isEmpty` 属性

**`isEmpty`** 属性表示路径里是否什么都没有。

## 值

布尔。

- 只读。给它赋值抛 `TypeError`。
- 新建的空路径是 `true`。
- `true`：路径里没有任何点。`false`：至少调过一次 [`moveToPoint()`](movetopoint.md)，或者是用静态方法创建的现成形状。
- 调 [`moveToPoint()`](movetopoint.md) 后变成 `false`，调 [`removeAllPoints()`](removeallpoints.md) 后变回 `true`。没有变化的事件：路径只会被代码修改。

## 示例

```js
const path = new UIBezierPath();
console.log(path.isEmpty);
path.moveToPoint(new CGPoint(0, 0));
console.log(path.isEmpty);
```

**结果**：控制台依次输出 `true`、`false`。

## 对应的 iOS API

`UIBezierPath.empty`（ObjC 的读方法是 `isEmpty`）。

## 参见

- [`removeAllPoints()`](removeallpoints.md)
