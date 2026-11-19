---
type: reference
native: UIView.userInteractionEnabled
---

# `UIView`：`isUserInteractionEnabled` 属性

**`isUserInteractionEnabled`** 属性决定视图是否接收触摸。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 视图接收触摸 |
| `false` | 视图和它的子视图都不接收触摸，触摸落到它后面的视图上。外观不变 |

- 可读，可写。
- 默认值是 `true`。
- 写入时按 `Boolean()` 转换：`1`、非空字符串、对象都是 `true`；`0`、`''`、`null`、`undefined`、`NaN` 都是 `false`。所以写 `'false'` 得到 `true`。
- 设成 `false` 之后的效果**未在模拟器验证**。

## 示例

```js
const card = new UIView();
card.isUserInteractionEnabled = false;
```

**效果**：`card` 和它的子视图都不接收触摸。**未在模拟器验证。**

## 对应的 iOS API

`UIView.userInteractionEnabled`，ObjC 的读取名是 `isUserInteractionEnabled`，JS 用这个名字读和写。

## 参见

- [`hitTest()`](hittest.md)
- [`UIGestureRecognizer`](../ui-gesture-recognizer.md)
