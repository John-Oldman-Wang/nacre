---
type: reference
native: UIStackView.distribution
---

# `UIStackView`：`distribution` 属性

**`distribution`** 属性决定主轴（排列方向）上的空间怎么分给各个排列项。

## 值

字符串，下面五个之一：

| 取值 | 效果 |
| --- | --- |
| `'fill'` | 各项按固有大小排。多出来的空间给内容抱紧优先级最低的一项，不够时先压抗压缩优先级最低的一项 |
| `'fillEqually'` | 所有项在主轴方向上一样大。每项的大小是（容器大小 − 间距 × (项数 − 1)）÷ 项数 |
| `'fillProportionally'` | 多出来或不够的空间按各项固有大小的比例分 |
| `'equalSpacing'` | 各项保持固有大小，多出来的空间平均分到项与项之间 |
| `'equalCentering'` | 各项保持固有大小，相邻两项的中心之间距离相等 |

- 可读，可写。
- 默认值是 `'fill'`。
- 没有变化通知。只有 App 自己的代码能改它。

### 各取值的示意

下面的示意图都是横向排列，三项的固有宽度分别是 `A` 窄、`B` 中、`C` 宽，容器比三项加起来宽。

`'fill'`（默认值）：各项按固有大小排，多出来的空间给内容抱紧优先级最低的那一项。图里是 `C` 被拉长。

```
┌──────────────────────────────────┐
│[A] [ B  ] [          C          ]│
└──────────────────────────────────┘
```

`'fillEqually'`：所有项一样大，不看固有大小。

```
┌──────────────────────────────────┐
│[    A    ] [    B    ] [    C   ]│
└──────────────────────────────────┘
```

`'fillProportionally'`：多出来的空间按固有大小的比例分，原来宽的那一项分得多。

```
┌──────────────────────────────────┐
│[  A  ] [    B    ] [      C     ]│
└──────────────────────────────────┘
```

`'equalSpacing'`：各项保持固有大小，多出来的空间平均分到项与项之间的空隙里。第一项贴着容器的起始边，最后一项贴着结束边。

```
┌──────────────────────────────────┐
│[A]          [ B  ]        [  C  ]│
└──────────────────────────────────┘
```

`'equalCentering'`：各项保持固有大小，相邻两项的中心之间距离相等。

```
┌──────────────────────────────────┐
│[A]           [ B  ]       [  C  ]│
└──────────────────────────────────┘
  ↑              ↑             ↑
  三个中心之间的距离相等
```

`spacing` 在两类取值里含义不同：

| `distribution` | `spacing` 的含义 |
| --- | --- |
| `'fill'`、`'fillEqually'`、`'fillProportionally'` | 相邻两项之间的间距就是这个值 |
| `'equalSpacing'`、`'equalCentering'` | 相邻两项之间的间距至少是这个值 |

容器比各项加起来窄时，各项被压窄。先压谁由另一个优先级决定，见 [`setContentCompressionResistancePriority()`](../ui-view/setcontentcompressionresistancepriority.md)。压窄的效果**未在模拟器验证**。

五个取值里，`'fillEqually'` 的效果在验收用例里核对过。其余四个的效果**未在模拟器验证**。

> **注意**：`distribution` 只有这五个取值，没有「各项靠一端」或「整体居中」的取值。要让一组视图整体居中或靠一端，不要让容器铺满，用约束把容器自己放到中间或那一端，容器的宽度留给内容决定。

### 写错时

写入表里没有的值（比如 `'spaceBetween'`）：不抛异常，控制台输出一条警告 `[Nacre] distribution has no value "spaceBetween"; expected one of: …, ignored`，省略号处是全部可选值，`distribution` 保持原来的值。

## 示例

```js
const [red, orange, teal] = ['systemRed', 'systemOrange', 'systemTeal'].map((color) => {
  const block = new UIView();
  block.backgroundColor = color;
  return block;
});
const row = new UIStackView([red, orange, teal]);
row.distribution = 'fillEqually';
row.spacing = 12;
```

**效果**：三个色块一样宽，每两个之间空 12 pt。每个色块的宽度是（整行宽度 − 2 × 12）÷ 3。

## 对应的 iOS API

`UIStackView.distribution`。`UIStackViewDistributionFillEqually` 写成 `'fillEqually'`，其余同理。

## 参见

- [`spacing`](spacing.md)
- [`setContentHuggingPriority()`](../ui-view/setcontenthuggingpriority.md)：`'fill'` 时决定多出来的空间给谁
- [让其中一项占满剩余空间](../../guides/stack-views.md#让其中一项占满剩余空间)
