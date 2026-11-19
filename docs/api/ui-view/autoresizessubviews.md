---
type: reference
native: UIView.autoresizesSubviews
---

# `UIView`：`autoresizesSubviews` 属性

**`autoresizesSubviews`** 属性决定视图大小变化时，是否按子视图的 [`autoresizingMask`](autoresizingmask.md) 调整子视图。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 按子视图的 `autoresizingMask` 调整 |
| `false` | 子视图不动 |

- 可读，可写。
- 默认值是 `true`（按 Apple 的文档，**未在模拟器验证**）。
- 写入时按 `Boolean()` 转换：`1`、非空字符串、对象都是 `true`；`0`、`''`、`null`、`undefined`、`NaN` 都是 `false`。所以写 `'false'` 得到 `true`。
- 读出来的类型、写回原值读到的不变，在验收用例里核对过。效果**未在模拟器验证**。

## 示例

```js
const container = new UIView();
container.autoresizesSubviews = false;
```

**效果**：`container` 变大变小时，用 `frame` 定位的子视图不跟着调整。**未在模拟器验证。**

## 对应的 iOS API

`UIView.autoresizesSubviews`。

## 参见

- [`autoresizingMask`](autoresizingmask.md)
