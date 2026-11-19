---
type: reference
native: UIView.effectiveUserInterfaceLayoutDirection
---

# `UIView`：`effectiveUserInterfaceLayoutDirection` 属性

**`effectiveUserInterfaceLayoutDirection`** 属性是这个视图实际使用的书写方向：系统语言和 [`semanticContentAttribute`](semanticcontentattribute.md) 一起决定的结果。

## 值

字符串：

| 取值 | 含义 |
| --- | --- |
| `'leftToRight'` | 从左往右 |
| `'rightToLeft'` | 从右往左 |

- 只读。给它赋值抛 `TypeError`。
- 读出来的类型在验收用例里核对过。
- 没有变化通知。

## 示例

```js
const view = new UIView();
console.log(view.effectiveUserInterfaceLayoutDirection);
```

**结果**：系统语言是中文或英文时输出 `leftToRight`。**未在模拟器验证。**

## 对应的 iOS API

`UIView.effectiveUserInterfaceLayoutDirection`。

## 参见

- [`semanticContentAttribute`](semanticcontentattribute.md)
