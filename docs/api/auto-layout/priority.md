---
type: reference
native: NSLayoutConstraint.priority
---

# `NSLayoutConstraint`：`priority` 属性

**`priority`** 属性是约束的优先级：几条约束互相矛盾时，系统先满足优先级高的。

## 值

写入时是数或优先级的名字，读出来永远是数。数的范围是 1 到 1000，没有单位。

- 可读，可写。
- 默认值是 `1000`（`'required'`，必须满足）。这个默认值来自 UIKit 的定义，**未在模拟器验证**。
- 小于 1000 是「尽量满足」：系统先满足全部 1000 的约束，再按优先级从高到低尽量满足其余的。满足不了的不算冲突。
- 写入 1 到 1000 之外的数时的行为**未在模拟器验证**，不要这样写。
- 没有变化通知。只有 App 自己的代码会改它。

七个名字：

| 名字 | 值 | 含义 |
| --- | --- | --- |
| `'required'` | 1000 | 必须满足 |
| `'defaultHigh'` | 750 | 视图「不愿被压小」的默认优先级 |
| `'dragThatCanResizeScene'` | 510 | 系统使用，日常不需要 |
| `'sceneSizeStayPut'` | 500 | 系统使用，日常不需要 |
| `'dragThatCannotResizeScene'` | 490 | 系统使用，日常不需要 |
| `'defaultLow'` | 250 | 视图「不愿被拉大」的默认优先级 |
| `'fittingSizeLevel'` | 50 | `systemLayoutSizeFittingSize()` 求最小尺寸时使用的优先级 |

### 写错时

名字写错：不抛异常，控制台输出一条警告 `[Nacre] priority has no value "veryImportant"; expected one of: … , or a number between 0 and 1000, ignored`，省略号处是七个名字，`priority` 保持原来的值。

## 示例

```js
const parent = new UIView();
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

const c = box.heightAnchor.constraintEqualToConstant(60);
c.priority = 'defaultHigh';
console.log(c.priority);
c.priority = 749;
console.log(c.priority);
```

**结果**：依次输出 `750`、`749`。749 这样的值没有名字，所以读出来统一是数。

## 对应的 iOS API

`NSLayoutConstraint.priority`。`UILayoutPriorityDefaultLow` 写成 `'defaultLow'`，其余同理。

## 参见

- [优先级](../auto-layout.md#优先级)
- [限制最小和最大尺寸](../../guides/auto-layout.md#限制最小和最大尺寸)
