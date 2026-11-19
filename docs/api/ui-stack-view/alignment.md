---
type: reference
native: UIStackView.alignment
---

# `UIStackView`：`alignment` 属性

**`alignment`** 属性决定交叉轴（垂直于排列方向）上各个排列项怎么对齐。

## 值

字符串，下面几个之一：

| 值 | 横向排列时 | 纵向排列时 | 读出来的名字 |
| --- | --- | --- | --- |
| `'fill'` | 所有项和容器一样高 | 所有项和容器一样宽 | `'fill'` |
| `'leading'` | 顶边对齐 | 起始边对齐 | `'leading'` |
| `'top'` | 同 `'leading'` | 同 `'leading'` | `'leading'` |
| `'center'` | 上下居中 | 左右居中 | `'center'` |
| `'trailing'` | 底边对齐 | 结束边对齐 | `'trailing'` |
| `'bottom'` | 同 `'trailing'` | 同 `'trailing'` | `'trailing'` |
| `'firstBaseline'` | 第一行文字的基线对齐 | 无效 | `'firstBaseline'` |
| `'lastBaseline'` | 最后一行文字的基线对齐 | 无效 | `'lastBaseline'` |

- 可读，可写。
- 默认值是 `'fill'`。改成其他值之后，各项按自己的大小显示，没有固有大小的普通 `UIView` 要用约束给出交叉轴方向的大小。
- 没有变化通知。只有 App 自己的代码能改它。

### 各取值的示意

下面的示意图都是横向排列，三项的高度不同。

`'fill'`（默认值）：所有项被拉到和容器一样高。

```
┌───────────────┐
│┌───┐┌───┐┌───┐│
││ A ││ B ││ C ││
││   ││   ││   ││
│└───┘└───┘└───┘│
└───────────────┘
```

`'leading'`，别名 `'top'`：顶边对齐。各项按自己的高度显示。

```
┌───────────────┐
│┌───┐┌───┐┌───┐│
││ A ││ B ││ C ││
│└───┘│   │└───┘│
│     └───┘     │
└───────────────┘
```

`'center'`：中线对齐。

```
┌───────────────┐
│     ┌───┐     │
│┌───┐│   │┌───┐│
││ A ││ B ││ C ││
│└───┘│   │└───┘│
│     └───┘     │
└───────────────┘
```

`'trailing'`，别名 `'bottom'`：底边对齐。

```
┌───────────────┐
│     ┌───┐     │
│┌───┐│   │┌───┐│
││ A ││ B ││ C ││
│└───┘└───┘└───┘│
└───────────────┘
```

`'firstBaseline'`：各项第一行文字的基线对齐。基线是一行文字里字母底部所在的那条线。只在横向排列时有效。

`'lastBaseline'`：各项最后一行文字的基线对齐。只在横向排列时有效。各项都只有一行文字时，它和 `'firstBaseline'` 的结果相同：

```
┌──────────────────┐
│      ┌────┐      │
│┌────┐│ Bg │┌────┐│
││ Ag ││    ││ Cg ││   ← 三段文字的基线在同一条水平线上
│└────┘└────┘└────┘│
└──────────────────┘
```

纵向排列时，交叉轴是水平方向：

| 值 | 纵向排列时的效果 |
| --- | --- |
| `'fill'` | 所有项和容器一样宽 |
| `'leading'`（`'top'`） | 各项靠起始边对齐。在从左到右的语言里是左边 |
| `'center'` | 各项水平居中 |
| `'trailing'`（`'bottom'`） | 各项靠结束边对齐。在从左到右的语言里是右边 |
| `'firstBaseline'`、`'lastBaseline'` | 无效。纵向排列要按基线计算间距，用 `isBaselineRelativeArrangement` |

`'fill'` 的效果在验收用例里核对过。其余取值的效果**未在模拟器验证**。

### 两个别名

`'top'` 和 `'leading'` 是同一个值，`'bottom'` 和 `'trailing'` 也是。两个名字都可以写入，读出来固定是 `'leading'` 和 `'trailing'`。

```js
const row = new UIStackView();
row.alignment = 'top';
console.log(row.alignment);   // 'leading'

row.alignment = 'bottom';
console.log(row.alignment);   // 'trailing'
```

**效果**：控制台依次输出 `leading` 和 `trailing`。

原因是 iOS 的定义里 `UIStackViewAlignmentTop` 就等于 `UIStackViewAlignmentLeading`。一个值只能对应一个读出来的名字，运行时选的是 `'leading'` 和 `'trailing'`。读出来的名字不随 `axis` 改变。

判断当前的对齐方式时，和 `'leading'`、`'trailing'` 比较，不要和 `'top'`、`'bottom'` 比较。

### 写错时

写入表里没有的值：不抛异常，控制台输出一条警告 `[Nacre] alignment has no value "baseline"; expected one of: fill / leading / firstBaseline / center / trailing / lastBaseline / top / bottom, ignored`，`alignment` 保持原来的值。

## 示例

```js
const [red, orange, teal] = ['systemRed', 'systemOrange', 'systemTeal'].map((color) => {
  const block = new UIView();
  block.backgroundColor = color;
  return block;
});
const row = new UIStackView([red, orange, teal]);
row.alignment = 'center';

NSLayoutConstraint.activateConstraints([
  red.heightAnchor.constraintEqualToConstant(20),
  orange.heightAnchor.constraintEqualToConstant(44),
  teal.heightAnchor.constraintEqualToConstant(32),
]);
```

**效果**：三个色块的高度分别是 20、44、32 pt，中线在同一条水平线上。**未在模拟器验证。**

## 对应的 iOS API

`UIStackView.alignment`。`UIStackViewAlignmentCenter` 写成 `'center'`；`UIStackViewAlignmentTop` 写成 `'top'`，读出来是 `'leading'`。

## 参见

- [`isBaselineRelativeArrangement`](isbaselinerelativearrangement.md)：纵向排列时按基线算间距
- [`axis`](axis.md)
- [枚举](../enums.md)：一个值两个名字时读出哪一个
