---
type: reference
native: "-[UIImpactFeedbackGenerator impactOccurred]"
---

# `UIImpactFeedbackGenerator`：`impactOccurred()` 方法

**`impactOccurred()`** 方法震一下，力度是创建时给的那一种，满强度。

## 语法

```
impactOccurred()
```

### 参数

无。

### 返回值

无（`undefined`）。没有「震完了」的通知。

### 异常

无。在模拟器上、或用户关掉了触感反馈时不报错，只是没有震动，见[什么时候没有震动](../ui-feedback-generator.md#什么时候没有震动)。

## 示例

```js
const page = new UIViewController();
const tap = UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('medium', { forView: page.view });
tap.impactOccurred();
tap.impactOccurred();
```

**效果**：连续震两下。生成器可以反复触发。**震感未在模拟器验证。**

## 对应的 iOS API

`-[UIImpactFeedbackGenerator impactOccurred]`。

## 参见

- [`impactOccurredWithIntensity()`](impactoccurredwithintensity.md)：震得弱一些
- [`prepare()`](../ui-feedback-generator/prepare.md)：减小延迟
