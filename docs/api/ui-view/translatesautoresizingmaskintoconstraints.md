---
type: reference
native: UIView.translatesAutoresizingMaskIntoConstraints
---

# `UIView`：`translatesAutoresizingMaskIntoConstraints` 属性

**`translatesAutoresizingMaskIntoConstraints`** 属性决定视图按 `frame` 定位还是由约束定位。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 系统按 `frame` 定位这个视图：自动生成一组约束，把视图固定在 `frame` 指定的位置上 |
| `false` | 这个视图的位置和大小完全由约束决定 |

- 可读，可写。
- 默认值是 `true`。
- 写入时按 `Boolean()` 转换：`1`、非空字符串、对象都是 `true`；`0`、`''`、`null`、`undefined`、`NaN` 都是 `false`。所以写 `'false'` 得到 `true`。

用约束定位的视图必须先设成 `false`。漏写时，系统自动生成的那组约束优先级最高，和另外写的约束矛盾，表现是约束都写对了，但视图的位置和大小不变，控制台没有任何输出。新建视图的 `frame` 是 0 × 0，所以通常的结果是看不到这个视图。

三种情况不用写：

- 页面的根视图 `page.view` 和窗口。它们由系统定位，不要改这个属性，也不要给它们写 `frame`。
- 加进 [`UIStackView`](../ui-stack-view.md) 排列的视图。系统自动把它设成 `false`（实测）。
- [`UILayoutGuide`](../ui-layout-guide.md)。它没有 `frame`，也没有这个属性。

## 示例

```js
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
```

**效果**：`box` 不再按 `frame` 定位，它的位置和大小完全由约束决定。

## 对应的 iOS API

`UIView.translatesAutoresizingMaskIntoConstraints`。

## 参见

- [两种定位方式](../ui-view.md#两种定位方式)
- [关掉 `translatesAutoresizingMaskIntoConstraints`](../auto-layout.md#关掉-translatesautoresizingmaskintoconstraints)
