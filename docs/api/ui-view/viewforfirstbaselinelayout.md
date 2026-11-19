---
type: reference
native: UIView.viewForFirstBaselineLayout
---

# `UIView`：`viewForFirstBaselineLayout` 属性

**`viewForFirstBaselineLayout`** 属性是这个视图的 [`firstBaselineAnchor`](firstbaselineanchor.md) 实际取哪个视图的文字基线。

## 值

[`UIView`](../ui-view.md)，或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 普通视图返回它自己。**未在模拟器验证。**
- 读出来的类型在验收用例里核对过。
- ObjC 里子类覆写它来指定用哪个子视图的基线，这里只能读，不能指定。

## 示例

```js
const view = new UIView();
console.log(view.viewForFirstBaselineLayout === view);
```

**结果**：输出 `true`。**未在模拟器验证。**

## 对应的 iOS API

`UIView.viewForFirstBaselineLayout`。

## 参见

- [`firstBaselineAnchor`](firstbaselineanchor.md)
- [`UIStackView.alignment`](../ui-stack-view/alignment.md)：按基线对齐
