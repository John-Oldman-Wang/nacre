---
type: reference
native: NSLayoutConstraint.active
---

# `NSLayoutConstraint`：`isActive` 属性

**`isActive`** 属性表示约束是否参与布局。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 约束参与布局 |
| `false` | 约束不起作用 |

- 可读，可写。
- 新建的约束是 `false`：锚点的方法只创建约束，不激活。这个默认值来自 UIKit 的定义，**未在模拟器验证**。
- 写入时按 `Boolean()` 转换。
- 激活时，系统把约束存放到两端视图最近的共同祖先上，可以从那个视图的 [`constraints`](../ui-view/constraints.md) 读回来。
- 写入之后视图的 `frame` 不会立刻改变，系统在下一次布局时才计算。要立刻读到结果，先调 [`layoutIfNeeded()`](../ui-view/layoutifneeded.md)。
- 停用的约束对象还在，之后可以再激活。
- 没有变化通知。只有 App 自己的代码会改它。

一次要激活或停用多条时，用 [`NSLayoutConstraint.activateConstraints()`](activateconstraints.md) 和 [`deactivateConstraints()`](deactivateconstraints.md)。逐条激活时，前几条已经生效、后几条还没生效，中间会经过约束不完整的状态。

### 写错时

`isActive = true`，但两端的视图没有共同祖先（比如其中一个还没有 `addSubview()`）：抛 `TypeError`，信息以 `failed to activate constraint:` 开头，后面是 UIKit 给出的原因。所以要先把视图加进视图树，再激活约束。

## 示例

```js
const parent = new UIView();
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

const c = box.heightAnchor.constraintEqualToConstant(44);
console.log(c.isActive);
c.isActive = true;
console.log(c.isActive);
```

**结果**：依次输出 `false`、`true`。

## 对应的 iOS API

`NSLayoutConstraint.active`，ObjC 的读取名是 `isActive`，JS 用这个名字读和写。`[view addConstraint:c]` 和 `[view removeConstraint:c]` 没有对应的 JS 方法，用 `c.isActive = true` 和 `c.isActive = false`。

## 参见

- [`NSLayoutConstraint.activateConstraints()`](activateconstraints.md)
- [创建和激活是两步](../auto-layout.md#创建和激活是两步)
