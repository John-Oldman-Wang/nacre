---
type: reference
native: UITraitCollection.horizontalSizeClass
---

# `UITraitCollection`：`horizontalSizeClass` 属性

**`horizontalSizeClass`** 属性表示横向的地方宽不宽裕。

## 值

字符串：

| 取值 | 含义 |
| --- | --- |
| `'compact'` | 这个方向上地方紧凑 |
| `'regular'` | 这个方向上地方宽裕 |
| `'unspecified'` | 没有指定 |

- iPhone 竖屏时横向是 `'compact'`，纵向是 `'regular'`。
- 只读到过默认值，别的取值**未在模拟器验证**。变化时是否派发 `traitchange`，**未在模拟器验证**。

- 只读。给它赋值抛 `TypeError`。
- 它是读 `traitCollection` 那一刻的值，之后不会变。环境变了时，视图、页面、场景派发 [`traitchange`](../ui-trait-collection.md#traitchange-事件)，要新的值就重新读 `traitCollection`。

## 示例

```js
const view = new UIView();
console.log(view.traitCollection.horizontalSizeClass);
```

**结果**：iPhone 竖屏时输出 `compact`。

## 对应的 iOS API

`UITraitCollection.horizontalSizeClass`。

## 参见

- [`UITraitCollection`](../ui-trait-collection.md)
- [`verticalSizeClass`](verticalsizeclass.md)
