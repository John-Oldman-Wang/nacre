---
type: reference
native: CAAnimation.removedOnCompletion
---

# `CAAnimation`：`removedOnCompletion` 属性

**`removedOnCompletion`** 属性决定动画播完后，是否从图层上移除。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 播完后从图层上移除。屏幕上显示的值回到属性的值 |
| `false` | 播完后留在图层上。配合 [`fillMode`](fillmode.md) 是 `'forwards'`，屏幕上继续显示终点值 |

- 可读，可写。
- 默认值是 `true`。
- 写入时按 `Boolean()` 转换，不会出错。

设成 `false` 时，属性的值和屏幕上显示的不一致；之后再改属性，画面不变，要先移除这个动画，而移除的那一刻画面跳回属性的值。让图层停在终点，推荐的做法是保持 `true`、把属性的值也设成终点值，见[让图层停在终点](../../guides/animation.md#让图层停在终点)。

## 示例

```js
const fade = CABasicAnimation.animationWithKeyPath('opacity');
console.log(fade.removedOnCompletion);
fade.removedOnCompletion = false;
console.log(fade.removedOnCompletion);
```

**结果**：先输出 `true`，再输出 `false`。

## 对应的 iOS API

`CAAnimation.removedOnCompletion`。

## 参见

- [属性的值和屏幕上显示的值](../ca-animation.md#属性的值和屏幕上显示的值)
