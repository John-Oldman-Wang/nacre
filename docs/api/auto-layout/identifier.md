---
type: reference
native: NSLayoutConstraint.identifier
---

# `NSLayoutConstraint`：`identifier` 属性

**`identifier`** 属性是给约束起的名字，只用于调试时辨认。

## 值

字符串，或者 `null`。

- 可读，可写。
- 默认值是 `null`。这个默认值来自 UIKit 的定义，**未在模拟器验证**。
- 写入 `null` 或 `undefined` 得到 `null`，其他值转成字符串。
- 约束出错时系统不输出任何信息，只能自己列出约束来核对。给之后要检查的约束起名字，输出时就能认出哪条是哪条。

## 示例

```js
const parent = new UIView();
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

const height = box.heightAnchor.constraintEqualToConstant(60);
height.identifier = 'card-height';
height.isActive = true;
for (const c of box.constraintsAffectingLayoutForAxis('vertical')) {
  console.log(c.identifier);
}
```

**结果**：输出的几行里有一行是 `card-height`。循环输出的具体内容**未在模拟器验证**。

## 对应的 iOS API

`NSLayoutConstraint.identifier`。

## 参见

- [`constraintsAffectingLayoutForAxis()`](../ui-view/constraintsaffectinglayoutforaxis.md)
