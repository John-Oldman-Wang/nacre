---
type: reference
native: UIView.clipsToBounds
---

# `UIView`：`clipsToBounds` 属性

**`clipsToBounds`** 属性决定子视图超出本视图范围的部分是否显示。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 子视图超出本视图范围的部分不显示 |
| `false` | 超出的部分照常显示 |

- 可读，可写。
- 默认值是 `false`。
- 写入时按 `Boolean()` 转换：`1`、非空字符串、对象都是 `true`；`0`、`''`、`null`、`undefined`、`NaN` 都是 `false`。所以写 `'false'` 得到 `true`。
- 设了圆角（`layer.cornerRadius`）之后，要让子视图也按圆角裁剪，同样需要设成 `true`。
- 超出父视图范围的那部分是否接收触摸，**未在模拟器验证**。

## 示例

```js
const card = new UIView();
card.frame = new CGRect(40, 120, 200, 120);
const dot = new UIView();
dot.frame = new CGRect(180, 100, 40, 40);
card.addSubview(dot);
card.clipsToBounds = true;
```

**效果**：`dot` 一半在 `card` 外面，只显示位于 `card` 范围内的那部分。**未在模拟器验证。**

## 对应的 iOS API

`UIView.clipsToBounds`。

## 参见

- [`layer`](layer.md)：圆角
