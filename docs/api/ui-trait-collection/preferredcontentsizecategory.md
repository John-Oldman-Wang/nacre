---
type: reference
native: UITraitCollection.preferredContentSizeCategory
---

# `UITraitCollection`：`preferredContentSizeCategory` 属性

**`preferredContentSizeCategory`** 属性是用户在系统设置里选的文字大小。

## 值

字符串，从小到大：

| 取值 | 含义 |
| --- | --- |
| `'extraSmall'`、`'small'`、`'medium'` | 比默认小的三档 |
| `'large'` | 默认 |
| `'extraLarge'`、`'extraExtraLarge'`、`'extraExtraExtraLarge'` | 比默认大的三档 |
| `'accessibilityMedium'`、`'accessibilityLarge'`、`'accessibilityExtraLarge'`、`'accessibilityExtraExtraLarge'`、`'accessibilityExtraExtraExtraLarge'` | 「辅助功能」里才能选到的更大的五档 |
| `'unspecified'` | 没有指定 |

- 用户在 App 运行期间改了文字大小，视图、页面、场景派发 `traitchange`，这一点在模拟器上核对过。
- 模拟器上切到过的最大一档是 `extraExtraLarge`。`accessibility` 开头的几档**未在模拟器验证**。
- 在模拟器里改文字大小：终端执行 `xcrun simctl ui booted content_size extra-extra-large`。

- 只读。给它赋值抛 `TypeError`。
- 它是读 `traitCollection` 那一刻的值，之后不会变。环境变了时，视图、页面、场景派发 [`traitchange`](../ui-trait-collection.md#traitchange-事件)，要新的值就重新读 `traitCollection`。

## 示例

```js
const view = new UIView();
const size = view.traitCollection.preferredContentSizeCategory;
const large = size.startsWith('accessibility');
console.log(size, large ? '用单列布局' : '用双列布局');
```

**结果**：用户没改过文字大小时输出 `large 用双列布局`。

## 对应的 iOS API

`UITraitCollection.preferredContentSizeCategory`。

## 参见

- [`UITraitCollection`](../ui-trait-collection.md)
- [`UIFont.preferredFontForTextStyle()`](../ui-font/preferredfontfortextstyle.md)：按这个设置取字号
