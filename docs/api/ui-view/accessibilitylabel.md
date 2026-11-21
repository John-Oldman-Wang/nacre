---
type: reference
native: UIView.accessibilityLabel
---

# `UIView`：`accessibilityLabel` 属性

**`accessibilityLabel`** 属性是读屏念的名字：说明这个元素是什么，比如「关闭」「搜索」「余额」。

读屏（VoiceOver，系统设置里叫「旁白」）是 iOS 自带的屏幕阅读器，见 [`isAccessibilityElement`](isaccessibilityelement.md)。

## 值

字符串，或者 `null`。

- 可读，可写。
- `UIView` 的默认值是 `null`。
- 写 `null` 或 `undefined` 清掉，读到 `null`。别的值按 `String()` 转：写 `5` 读到 `'5'`。
- `UILabel` 没有设过它时，读屏开着时读到标签显示的文字，读屏关着时读到 `null`（实测）。设过之后读到设的值，不再跟着文字（实测）。
- 读屏停在一个元素上时，先念它的标签，再念[值](accessibilityvalue.md)、[特征](accessibilitytraits.md)和[提示](accessibilityhint.md)。这个顺序来自 Apple 的文档，**未在真机验证**。
- 没有变化事件：改它的只有 App 自己的代码。`UILabel` 没设过它时读到的文字是读的那一刻算出来的，跟着 `text` 变。

## 示例

一个只有图标、没有文字的按钮，读屏没有字可念，要给它一个标签：

```js
const close = UIButton.buttonWithType('system');
close.setImage(UIImage.systemImageNamed('xmark'), { forState: ['normal'] });
close.accessibilityLabel = '关闭';
console.log(close.accessibilityLabel);
```

**效果**：控制台输出 `关闭`。读屏停在这个按钮上时念「关闭」，再念它是按钮。**读屏怎么念未在真机验证。**

## 对应的 iOS API

`accessibilityLabel`。在 iOS 里它属于 `UIAccessibility` 协议，任何对象都有；JS 里只在 `UIView` 和它的子类上有。

## 参见

- [让读屏念对你的界面](../../guides/accessibility.md#名字提示和值各放什么)：标签里写什么、不写什么
- [`accessibilityHint`](accessibilityhint.md)、[`accessibilityValue`](accessibilityvalue.md)
- [`isAccessibilityElement`](isaccessibilityelement.md)
