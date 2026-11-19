---
type: reference
native: UIStackView.baselineRelativeArrangement
---

# `UIStackView`：`isBaselineRelativeArrangement` 属性

**`isBaselineRelativeArrangement`** 属性决定纵向排列时，间距从哪里量起。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 纵向排列时，间距从上一项最后一行文字的基线量到下一项第一行文字的基线。基线是一行文字里字母底部所在的那条线 |
| `false` | 间距从上一项的底边量到下一项的顶边 |

- 可读，可写。
- 默认值是 `false`。默认值和读写在验收用例里核对过；设成 `true` 之后的效果**未在模拟器验证**。
- 横向排列时这个属性无效。横向排列要按基线对齐，用 [`alignment`](alignment.md) 的 `'firstBaseline'` 或 `'lastBaseline'`。
- 写入时按 `Boolean()` 转换。
- 没有变化通知。只有 App 自己的代码能改它。

## 示例

```js
const column = new UIStackView();
column.axis = 'vertical';
column.spacing = 20;
column.isBaselineRelativeArrangement = true;
```

**效果**：相邻两行文字的基线之间相距 20 pt。**未在模拟器验证。**

## 对应的 iOS API

`UIStackView.baselineRelativeArrangement`，ObjC 的读取名是 `isBaselineRelativeArrangement`，JS 用这个名字读和写。

## 参见

- [`alignment`](alignment.md)：横向排列时的基线对齐
