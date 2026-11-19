---
type: reference
native: UITraitCollection.layoutDirection
---

# `UITraitCollection`：`layoutDirection` 属性

**`layoutDirection`** 属性是文字的书写方向。

## 值

字符串：

| 取值 | 含义 |
| --- | --- |
| `'leftToRight'` | 从左往右。中文和英文是它 |
| `'rightToLeft'` | 从右往左。阿拉伯语和希伯来语是它 |
| `'unspecified'` | 没有指定 |

- 只读到过默认值 `'leftToRight'`，别的取值**未在模拟器验证**。变化时是否派发 `traitchange`，**未在模拟器验证**。

- 只读。给它赋值抛 `TypeError`。
- 它是读 `traitCollection` 那一刻的值，之后不会变。环境变了时，视图、页面、场景派发 [`traitchange`](../ui-trait-collection.md#traitchange-事件)，要新的值就重新读 `traitCollection`。

## 示例

```js
const view = new UIView();
console.log(view.traitCollection.layoutDirection);
```

**结果**：系统语言是中文时输出 `leftToRight`。

## 对应的 iOS API

`UITraitCollection.layoutDirection`。

## 参见

- [`UITraitCollection`](../ui-trait-collection.md)
