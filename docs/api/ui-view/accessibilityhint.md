---
type: reference
native: UIView.accessibilityHint
---

# `UIView`：`accessibilityHint` 属性

**`accessibilityHint`** 属性是读屏在念完名字之后念的提示：说明操作这个元素会发生什么，比如「打开订单详情」。

读屏（VoiceOver，系统设置里叫「旁白」）是 iOS 自带的屏幕阅读器，见 [`isAccessibilityElement`](isaccessibilityelement.md)。

## 值

字符串，或者 `null`。

- 可读，可写。
- `UIView` 的默认值是 `null`。
- 写 `null` 或 `undefined` 清掉，读到 `null`。别的值按 `String()` 转。
- 读屏停在元素上，念完[标签](accessibilitylabel.md)、[值](accessibilityvalue.md)和[特征](accessibilitytraits.md)之后，稍等一下再念提示。用户可以在系统设置里关掉提示，关掉之后提示不念。这两条来自 Apple 的文档，**未在真机验证**。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const row = new UIView();
row.isAccessibilityElement = true;
row.accessibilityLabel = '订单 1024，待发货';
row.accessibilityHint = '打开订单详情';
console.log(row.accessibilityHint);
```

**效果**：控制台输出 `打开订单详情`。读屏停在这一行上，先念「订单 1024，待发货」，稍后念「打开订单详情」。**读屏怎么念未在真机验证。**

## 对应的 iOS API

`accessibilityHint`。在 iOS 里它属于 `UIAccessibility` 协议，任何对象都有；JS 里只在 `UIView` 和它的子类上有。

## 参见

- [让读屏念对你的界面](../../guides/accessibility.md#名字提示和值各放什么)：提示里写什么
- [`accessibilityLabel`](accessibilitylabel.md)、[`accessibilityValue`](accessibilityvalue.md)
