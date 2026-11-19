---
type: reference
native: UILabel.preferredMaxLayoutWidth
---

# `UILabel`：`preferredMaxLayoutWidth` 属性

**`preferredMaxLayoutWidth`** 属性是多行标签计算固有尺寸时使用的换行宽度。

## 值

数，单位 [pt](../units.md)。

- 可读，可写。
- 默认值是 `0`，表示不指定。
- 用约束定位时，系统需要标签的固有尺寸来决定它的高度。多行标签的固有尺寸依赖宽度，这个属性给出那个宽度。
- 标签的宽度已经被约束确定时（比如左右两边都有约束），一般不需要设它，系统按约束得到的宽度换行。只约束了位置、没有约束宽度的多行标签才需要它。
- 它是 `0` 并且没有其他途径给出宽度时，固有尺寸按「全部文字排成一行」计算。**未在模拟器验证。**

## 示例

```js
const label = new UILabel();
label.text = '一段比较长的文字，一行放不下，需要按给定的宽度换行之后才知道有多高。';
label.numberOfLines = 0;
label.preferredMaxLayoutWidth = 320;
console.log(label.intrinsicContentSize.height);
```

**效果**：控制台输出文字按 320 pt 的宽度换行后的总高度。**未在模拟器验证。**

## 对应的 iOS API

`UILabel.preferredMaxLayoutWidth`。

## 参见

- [多行文字和宽度](../ui-label.md#多行文字和宽度)
- [固有尺寸](../ui-label.md#固有尺寸)
