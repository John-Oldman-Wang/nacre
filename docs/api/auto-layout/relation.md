---
type: reference
native: NSLayoutConstraint.relation
---

# `NSLayoutConstraint`：`relation` 属性

**`relation`** 属性是约束等式的关系：等于、大于或等于、小于或等于。

## 值

字符串，下面三个之一：

| 取值 | 含义 |
| --- | --- |
| `'equal'` | 左边 = 右边 |
| `'greaterThanOrEqual'` | 左边 ≥ 右边 |
| `'lessThanOrEqual'` | 左边 ≤ 右边 |

- 只读。给它赋值抛 `TypeError`。
- 由创建它的方法决定：`constraintEqualTo…` 是 `'equal'`，`constraintGreaterThanOrEqualTo…` 是 `'greaterThanOrEqual'`，`constraintLessThanOrEqualTo…` 是 `'lessThanOrEqual'`。

## 示例

```js
const parent = new UIView();
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

const minWidth = box.widthAnchor.constraintGreaterThanOrEqualToConstant(100);
console.log(minWidth.relation === 'greaterThanOrEqual');
```

**结果**：输出 `true`。

## 对应的 iOS API

`NSLayoutConstraint.relation`。`NSLayoutRelationEqual` 写成 `'equal'`，其余同理。

## 参见

- [`firstAttribute`](firstattribute.md)
