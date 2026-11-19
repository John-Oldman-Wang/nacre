---
type: reference
native: UITraitCollection.accessibilityContrast
---

# `UITraitCollection`：`accessibilityContrast` 属性

**`accessibilityContrast`** 属性表示用户有没有在系统设置里打开「增强对比度」。

## 值

字符串：

| 取值 | 含义 |
| --- | --- |
| `'normal'` | 没打开 |
| `'high'` | 打开了「增强对比度」 |
| `'unspecified'` | 没有指定 |

- 只读到过默认值 `'normal'`，别的取值**未在模拟器验证**。变化时是否派发 `traitchange`，**未在模拟器验证**。
- 语义色和 `asset()` 颜色在「增强对比度」下自动换值，颜色不需要读它，见 [`UIColor`](../ui-color.md)。

- 只读。给它赋值抛 `TypeError`。
- 它是读 `traitCollection` 那一刻的值，之后不会变。环境变了时，视图、页面、场景派发 [`traitchange`](../ui-trait-collection.md#traitchange-事件)，要新的值就重新读 `traitCollection`。

## 示例

```js
const view = new UIView();
console.log(view.traitCollection.accessibilityContrast);
```

**结果**：没打开「增强对比度」时输出 `normal`。

## 对应的 iOS API

`UITraitCollection.accessibilityContrast`。

## 参见

- [`UITraitCollection`](../ui-trait-collection.md)
