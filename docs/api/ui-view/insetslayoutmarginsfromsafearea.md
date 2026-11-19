---
type: reference
native: UIView.insetsLayoutMarginsFromSafeArea
---

# `UIView`：`insetsLayoutMarginsFromSafeArea` 属性

**`insetsLayoutMarginsFromSafeArea`** 属性决定视图伸到安全区外面时，内边距是否加上安全区。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 视图伸到[安全区](../ui-view.md#安全区)外面的那几条边，内边距读出来是写入的值加上安全区 |
| `false` | 内边距读出来就是写入的值 |

- 可读，可写。
- 默认值是 `true`。
- 写入时按 `Boolean()` 转换：`1`、非空字符串、对象都是 `true`；`0`、`''`、`null`、`undefined`、`NaN` 都是 `false`。所以写 `'false'` 得到 `true`。
- 没有变化通知。只有 App 自己的代码会改它。

## 示例

```js
const root = new UIViewController().view;
root.insetsLayoutMarginsFromSafeArea = false;
root.directionalLayoutMargins = { top: 16, leading: 16, bottom: 16, trailing: 16 };
```

**效果**：内边距是多少就是多少，不再加上安全区。页面根视图还有系统规定的最小边距，见 [`directionalLayoutMargins`](directionallayoutmargins.md)。

## 对应的 iOS API

`UIView.insetsLayoutMarginsFromSafeArea`。

## 参见

- [`directionalLayoutMargins`](directionallayoutmargins.md)
- [内边距](../ui-view.md#内边距)
