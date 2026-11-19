---
type: reference
native: UIView.alpha
---

# `UIView`：`alpha` 属性

**`alpha`** 属性是视图的不透明度。对子视图同样生效。

## 值

数，0 到 1 的比例。

| 取值 | 效果 |
| --- | --- |
| `0` | 完全透明 |
| `1` | 完全不透明 |
| 之间 | 半透明，能看到后面的内容。子视图一起变成半透明 |

- 可读，可写。
- 默认值是 `1`。
- 读回来的值和写入的值可能有微小差别：写 `0.6`，读回 `0.6000000238418579`。比较时要留容差。
- 写入 0 到 1 以外的数时的结果，**未在模拟器验证**。
- 按 iOS 的规则，`alpha` 低于 0.01 的视图不接收触摸，触摸落到它后面的视图上。所以不能用 `alpha = 0` 做一个「看不见但能点」的区域；要这样做，保持 `alpha` 为 1，把 `backgroundColor` 设成 `null`。**这两条未在模拟器验证。**
- 只想让底色半透明、子视图不受影响，把透明度写在颜色里：`backgroundColor = 'rgba(88, 86, 214, 0.5)'`。
- 能带动画，见 [`UIView.animateWithDuration()`](animatewithduration.md)。

### 写错时

按 `Number()` 转换：`'0.5'` 得到 `0.5`，`true` 得到 `1`，`null` 得到 `0`。转不出有限的数（`undefined`、`'abc'`、`NaN`、`Infinity`、对象）时抛 `TypeError: alpha must be a finite number, got undefined`（`got` 后面是收到的值），原值不变。

## 示例

```js
const card = new UIView();
card.alpha = 0.5;
console.log(Math.abs(card.alpha - 0.5) < 1e-6);
```

**效果**：视图和它的子视图变成半透明。控制台输出 `true`。

## 对应的 iOS API

`UIView.alpha`。

## 参见

- [`isHidden`](ishidden.md)
- [设成半透明](../../guides/views.md#设成半透明)
