---
type: reference
native: UIView.semanticContentAttribute
---

# `UIView`：`semanticContentAttribute` 属性

**`semanticContentAttribute`** 属性说明视图的内容和书写方向的关系，决定在从右往左书写的语言里，这个视图要不要左右翻转。

## 值

字符串，下面的值之一：

| 取值 | 含义 |
| --- | --- |
| `'unspecified'` | 跟随书写方向：从右往左的语言里左右翻转 |
| `'playback'` | 播放控制（播放、快进、后退按钮这一类），不翻转 |
| `'spatial'` | 和方向有关的控制（比如方向键），不翻转 |
| `'forceLeftToRight'` | 总是按从左往右排 |
| `'forceRightToLeft'` | 总是按从右往左排 |

- 可读，可写。
- 默认值**未在模拟器验证**，按 Apple 的文档是 `'unspecified'`。
- 设了之后的实际结果从 [`effectiveUserInterfaceLayoutDirection`](effectiveuserinterfacelayoutdirection.md) 读。
- 读出来的类型、写回原值读到的不变，在验收用例里核对过。各取值的效果**未在模拟器验证**，含义来自 Apple 的文档。

### 写错时

写入表里没有的值：不抛异常，控制台输出一条警告 `[Nacre] semanticContentAttribute has no value "x"; expected one of: unspecified / playback / spatial / forceLeftToRight / forceRightToLeft, ignored`，属性保持原值。

## 示例

```js
const controls = new UIStackView();
controls.semanticContentAttribute = 'playback';
```

**效果**：在从右往左书写的语言里，这一排播放按钮不翻转。**未在模拟器验证。**

## 对应的 iOS API

`UIView.semanticContentAttribute`。`UISemanticContentAttributePlayback` 写成 `'playback'`，其余同理。

## 参见

- [`effectiveUserInterfaceLayoutDirection`](effectiveuserinterfacelayoutdirection.md)
- [`leadingAnchor`](leadinganchor.md)
