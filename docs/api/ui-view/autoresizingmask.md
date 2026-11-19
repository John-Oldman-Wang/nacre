---
type: reference
native: UIView.autoresizingMask
---

# `UIView`：`autoresizingMask` 属性

**`autoresizingMask`** 属性决定父视图大小变化时，用 `frame` 定位的这个视图怎么跟着变：哪几段距离和尺寸可以伸缩。

## 值

字符串数组，元素是下面的值。空数组表示什么都不伸缩，视图保持原来的位置和大小。

| 取值 | 可以伸缩的是 |
| --- | --- |
| `'flexibleLeftMargin'` | 左边到父视图左边的距离 |
| `'flexibleWidth'` | 宽 |
| `'flexibleRightMargin'` | 右边到父视图右边的距离 |
| `'flexibleTopMargin'` | 上边到父视图上边的距离 |
| `'flexibleHeight'` | 高 |
| `'flexibleBottomMargin'` | 下边到父视图下边的距离 |

- 可读，可写。
- 默认值**未在模拟器验证**，按 Apple 的文档是空数组。
- 只对 [`translatesAutoresizingMaskIntoConstraints`](translatesautoresizingmaskintoconstraints.md) 是 `true`（按 `frame` 定位）的视图起作用，并且父视图的 [`autoresizesSubviews`](autoresizessubviews.md) 要是 `true`。
- 每次读得到一个新数组。
- 读出来的类型、写回原值读到的不变，在验收用例里核对过。效果**未在模拟器验证**。

### 写错时

数组里有一个不认识的名字时，整次赋值不生效：不抛异常，控制台输出一条警告，列出全部可选值，属性保持原值。

## 示例

```js
const overlay = new UIView();
overlay.autoresizingMask = ['flexibleWidth', 'flexibleHeight'];
```

**效果**：父视图变大变小时，`overlay` 的宽高跟着变，四边到父视图的距离不变。**未在模拟器验证。**

## 对应的 iOS API

`UIView.autoresizingMask`。位掩码 `UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight` 写成 `['flexibleWidth', 'flexibleHeight']`。

## 参见

- [`autoresizesSubviews`](autoresizessubviews.md)
- [两种定位方式](../ui-view.md#两种定位方式)
- [枚举](../enums.md)：位掩码写成字符串数组
