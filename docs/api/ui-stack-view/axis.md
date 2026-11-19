---
type: reference
native: UIStackView.axis
---

# `UIStackView`：`axis` 属性

**`axis`** 属性决定排列的方向。这个方向叫主轴，和它垂直的方向叫交叉轴，见[主轴和交叉轴](../ui-stack-view.md#主轴和交叉轴)。

## 值

字符串，下面两个之一：

| 取值 | 效果 |
| --- | --- |
| `'horizontal'` | 从左到右排成一行 |
| `'vertical'` | 从上到下排成一列 |

- 可读，可写。
- 默认值是 `'horizontal'`。所以竖排必须写 `axis = 'vertical'`。
- 写入后，排列在下一次布局时更新。要立刻读到排列项新的 `frame`，先调 `layoutIfNeeded()`。
- 没有变化通知。只有 App 自己的代码能改它。

### 写错时

写入表里没有的值：不抛异常，控制台输出一条警告 `[Nacre] axis has no value "diagonal"; expected one of: horizontal / vertical, ignored`，`axis` 保持原来的值。

## 示例

```js
const list = new UIStackView();
list.axis = 'vertical';

for (const text of ['第一行', '第二行', '第三行']) {
  const label = new UILabel();
  label.text = text;
  list.addArrangedSubview(label);
}
```

**效果**：三行文字从上到下排列，每行和容器一样宽，行与行之间没有空隙。

## 对应的 iOS API

`UIStackView.axis`。`UILayoutConstraintAxisVertical` 写成 `'vertical'`，`UILayoutConstraintAxisHorizontal` 写成 `'horizontal'`。

## 参见

- [`distribution`](distribution.md)：主轴上的空间怎么分
- [`alignment`](alignment.md)：交叉轴上怎么对齐
- [枚举](../enums.md)：属性写错时为什么是警告而不是抛异常
