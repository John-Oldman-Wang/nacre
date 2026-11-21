---
type: reference
native: UIView.shouldGroupAccessibilityChildren
---

# `UIView`：`shouldGroupAccessibilityChildren` 属性

**`shouldGroupAccessibilityChildren`** 属性决定读屏是否把这个视图里的元素当成一组：念完这一组，再去念别处的元素。

读屏（VoiceOver，系统设置里叫「旁白」）是 iOS 自带的屏幕阅读器，见 [`isAccessibilityElement`](isaccessibilityelement.md)。读屏默认按元素在屏幕上的位置排顺序，从上到下、每一行从左到右，不管它们属于哪个父视图。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 读屏连续念完这个视图里的全部元素，再去念它外面的元素 |
| `false` | 这个视图里的元素和外面的元素按屏幕位置混在一起排顺序 |

两种取值的效果来自 Apple 的文档，**未在真机验证**。

- 可读，可写。
- 默认值是 `false`。
- 写入时按 `Boolean()` 转换：`1`、非空字符串、对象都是 `true`；`0`、`''`、`null`、`undefined`、`NaN` 都是 `false`。所以写 `'false'` 得到 `true`（实测）。
- 读屏仍然一个一个地停在组里的元素上。要把几个视图合成一个元素一次念完，用 [`isAccessibilityElement`](isaccessibilityelement.md)。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

左右两栏并排，每栏是一列上下排的文字。不分组时，读屏按行左右交替地念；把每一栏分成一组，先念完左栏再念右栏：

```js
const left = new UIView();
const right = new UIView();
left.shouldGroupAccessibilityChildren = true;
right.shouldGroupAccessibilityChildren = true;
console.log(left.shouldGroupAccessibilityChildren);
```

**效果**：控制台输出 `true`。读屏先念完 `left` 里的全部文字，再念 `right` 里的。**读屏的效果未在真机验证。**

## 对应的 iOS API

`shouldGroupAccessibilityChildren`。在 iOS 里它属于 `UIAccessibility` 协议，任何对象都有；JS 里只在 `UIView` 和它的子类上有。

## 参见

- [让读屏念对你的界面](../../guides/accessibility.md)
- [`isAccessibilityElement`](isaccessibilityelement.md)：把几个视图合成一个元素
