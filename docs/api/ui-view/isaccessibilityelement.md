---
type: reference
native: UIView.isAccessibilityElement
---

# `UIView`：`isAccessibilityElement` 属性

**`isAccessibilityElement`** 属性决定读屏是否把这个视图当成一个元素：停在它上面，念它的[标签](accessibilitylabel.md)、[值](accessibilityvalue.md)、[特征](accessibilitytraits.md)和[提示](accessibilityhint.md)。

读屏（VoiceOver，系统设置里叫「旁白」）是 iOS 自带的屏幕阅读器，给看不清屏幕的用户用。它开着时，用户在屏幕上左右轻扫，读屏按顺序停在一个个元素上，把它念出来；双击屏幕等于点当前停着的元素。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 读屏停在这个视图上，把它当成一个整体念，不再分别停在它的子视图上 |
| `false` | 读屏不停在这个视图上，去找它的子视图 |

两种取值的效果来自 Apple 的文档，**未在真机验证**。

- 可读，可写。
- `UIView` 的默认值是 `false`。
- `UILabel`、`UIButton` 这类系统控件的值由系统决定。不在窗口里的 `UILabel`、`UIButton` 读到 `false`，读屏开着、关着都一样（实测）。放进窗口之后读到什么**未在真机验证**。
- 写入时按 `Boolean()` 转换：`1`、非空字符串、对象都是 `true`；`0`、`''`、`null`、`undefined`、`NaN` 都是 `false`。所以写 `'false'` 得到 `true`。
- 没有变化事件。`UIView` 上只有 App 自己的代码改它；系统控件的值由系统在读的时候算出来，读到的就是当时的值。

## 示例

```js
const card = new UIView();
card.isAccessibilityElement = true;
card.accessibilityLabel = '余额 1,280.00 元';
console.log(card.isAccessibilityElement);
```

**效果**：控制台输出 `true`。读屏停在这张卡片上，念「余额 1,280.00 元」，不再分别停在卡片里的每一行字上。**读屏怎么念未在真机验证。**

## 对应的 iOS API

`isAccessibilityElement`。在 iOS 里它属于 `UIAccessibility` 协议，任何对象都有；JS 里只在 `UIView` 和它的子类上有。

## 参见

- [让读屏念对你的界面](../../guides/accessibility.md)：什么时候设成 `true`
- [`accessibilityLabel`](accessibilitylabel.md)：元素被念出来的名字
- [`accessibilityElementsHidden`](accessibilityelementshidden.md)：把一整块子视图都藏起来
