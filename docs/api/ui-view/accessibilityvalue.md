---
type: reference
native: UIView.accessibilityValue
---

# `UIView`：`accessibilityValue` 属性

**`accessibilityValue`** 属性是读屏念的当前值：元素现在处在什么状态、显示的是多少，比如「50%」「3 件」。

读屏（VoiceOver，系统设置里叫「旁白」）是 iOS 自带的屏幕阅读器，见 [`isAccessibilityElement`](isaccessibilityelement.md)。

## 值

字符串，或者 `null`。

- 可读，可写。
- `UIView` 的默认值是 `null`。
- 写 `null` 或 `undefined` 清掉，读到 `null`。别的值按 `String()` 转：写 `3` 读到 `'3'`。
- 读屏念完[标签](accessibilitylabel.md)之后念值。这个顺序来自 Apple 的文档，**未在真机验证**。
- 值不会自己跟着界面变。界面上显示的数变了，App 要同时写一次新的值。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

一个自己画的进度环，标签说它是什么，值说现在到了多少：

```js
const ring = new UIView();
ring.isAccessibilityElement = true;
ring.accessibilityLabel = '上传进度';

/** @param {number} fraction 0 到 1 */
function setProgress(fraction) {
  ring.accessibilityValue = Math.round(fraction * 100) + '%';
}
setProgress(0.5);
console.log(ring.accessibilityValue);
```

**效果**：控制台输出 `50%`。读屏停在进度环上时念「上传进度，50%」。**读屏怎么念未在真机验证。**

## 对应的 iOS API

`accessibilityValue`。在 iOS 里它属于 `UIAccessibility` 协议，任何对象都有；JS 里只在 `UIView` 和它的子类上有。

## 参见

- [让读屏念对你的界面](../../guides/accessibility.md#名字提示和值各放什么)：会变的内容放值里，不放名字里
- [`accessibilityLabel`](accessibilitylabel.md)、[`accessibilityHint`](accessibilityhint.md)
