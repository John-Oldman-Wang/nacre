---
type: reference
native: UIView.backgroundColor
---

# `UIView`：`backgroundColor` 属性

**`backgroundColor`** 属性是视图的底色。

## 值

[颜色](../ui-color.md)字符串，或者 `null`。

- 可读，可写。
- 默认值是 `null`，表示透明。透明的视图有大小，也能包含子视图，但自己不画任何东西。
- 写入时接受颜色字符串（`'systemIndigo'`、`'#FF3B30'`、`'rgba(88, 86, 214, 0.5)'`），也接受 `UIColor` 对象。
- 读出来是字符串：写入合法的字符串，读回原样；写入 `UIColor` 对象，读回这个颜色的名字。
- 能带动画，见 [`UIView.animateWithDuration()`](animatewithduration.md)。
- [`UIStackView`](../ui-stack-view.md) 自己不显示，给它设底色看不到。

### 写错时

写入不合法的颜色：不抛异常，控制台输出一条警告，比如 `[Nacre] backgroundColor: "#GGG" is not a valid color, ignored`，颜色保持原值。

## 示例

```js
const card = new UIView();
card.backgroundColor = 'systemIndigo';
console.log(card.backgroundColor);
card.backgroundColor = '#GGG';
console.log(card.backgroundColor);
```

**结果**：依次输出 `systemIndigo`、`systemIndigo`。第二次写入不合法，控制台多一条警告，颜色不变。

## 对应的 iOS API

`UIView.backgroundColor`。`UIColor.systemIndigoColor` 写成 `'systemIndigo'`。

## 参见

- [颜色](../ui-color.md)：能写哪些值
- [`alpha`](alpha.md)
