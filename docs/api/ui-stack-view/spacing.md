---
type: reference
native: UIStackView.spacing
---

# `UIStackView`：`spacing` 属性

**`spacing`** 属性是相邻两个排列项之间的间距。

## 值

数（单位 [pt](../units.md)），或者字符串 `'system'`。

- 可读，可写。
- 默认值是 `0`。
- 间距只加在相邻两项之间，第一项前面和最后一项后面没有。
- `'system'` 表示用系统推荐的间距。读出来是字符串 `'system'`，读不到具体的点数。**屏幕上的间距有多大未在模拟器验证。**
- 间距不随字号变化。
- 写负数时相邻两项会重叠。**未在模拟器验证。**
- 接受能转成数的字符串，`'12'` 和 `12` 效果相同。
- 某一项后面要单独的间距，用 [`setCustomSpacing()`](setcustomspacing.md)，它优先于这个属性。
- 没有变化通知。只有 App 自己的代码能改它。

`spacing` 的含义随 [`distribution`](distribution.md) 不同：

| `distribution` | `spacing` 的含义 |
| --- | --- |
| `'fill'`、`'fillEqually'`、`'fillProportionally'` | 相邻两项之间的间距就是这个值 |
| `'equalSpacing'`、`'equalCentering'` | 相邻两项之间的间距至少是这个值 |

### 写错时

- 写了数和 `'system'` 以外的字符串：不抛异常，控制台输出一条警告 `[Nacre] spacing has no value "default"; expected one of: a number / "system", ignored`，`spacing` 保持原来的值。
- 写了转不成数的其他值（`undefined`、对象）：抛 `TypeError: spacing must be a finite number, got undefined`，`spacing` 保持原来的值。

> **注意**：`spacing` 不接受 `'default'`。`'default'` 只能用在 [`setCustomSpacing()`](setcustomspacing.md) 里，表示撤回单独的设置。

## 示例

```js
const row = new UIStackView();
row.spacing = 24;
console.log(row.spacing);

row.spacing = 'system';
console.log(row.spacing);
```

**结果**：依次输出 `24`、`system`。

## 对应的 iOS API

`UIStackView.spacing`。`UIStackViewSpacingUseSystem` 写成 `'system'`。

## 参见

- [`setCustomSpacing()`](setcustomspacing.md)：单独一项后面的间距
- [枚举](../enums.md)：系统的哨兵常量为什么写成字符串
