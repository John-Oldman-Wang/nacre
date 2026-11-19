---
type: reference
native: UIView.appliedContentSizeCategoryLimitsDescription
---

# `UIView`：`appliedContentSizeCategoryLimitsDescription` 属性

**`appliedContentSizeCategoryLimitsDescription`** 属性是一段说明文字，描述这个视图和它的祖先上限制了哪些文字大小。只用于调试。

## 值

字符串，或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 读出来的类型在验收用例里核对过。内容的格式由系统决定，不要解析它。

## 示例

```js
const view = new UIView();
console.log(view.appliedContentSizeCategoryLimitsDescription);
```

**结果**：输出系统给的说明文字。具体内容**未在模拟器验证**。

## 对应的 iOS API

`UIView.appliedContentSizeCategoryLimitsDescription`。

## 参见

- [外观特征](../ui-trait-collection.md)：`preferredContentSizeCategory`
