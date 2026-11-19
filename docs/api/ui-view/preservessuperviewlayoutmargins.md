---
type: reference
native: UIView.preservesSuperviewLayoutMargins
---

# `UIView`：`preservesSuperviewLayoutMargins` 属性

**`preservesSuperviewLayoutMargins`** 属性决定父视图的内边距比自己的大时，是否采用父视图的。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 父视图的内边距比自己的大时，采用父视图的 |
| `false` | 只用自己的 |

- 可读，可写。
- 默认值是 `false`。
- 设成 `true` 之后的效果**未在模拟器验证**。
- 写入时按 `Boolean()` 转换：`1`、非空字符串、对象都是 `true`；`0`、`''`、`null`、`undefined`、`NaN` 都是 `false`。所以写 `'false'` 得到 `true`。

## 示例

```js
const child = new UIView();
child.preservesSuperviewLayoutMargins = true;
console.log(child.preservesSuperviewLayoutMargins);
```

**结果**：输出 `true`。

## 对应的 iOS API

`UIView.preservesSuperviewLayoutMargins`。

## 参见

- [`directionalLayoutMargins`](directionallayoutmargins.md)
