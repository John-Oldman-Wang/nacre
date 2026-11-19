---
type: reference
native: UIImpactFeedbackGenerator
status: partial
---

# `UIImpactFeedbackGenerator`

**`UIImpactFeedbackGenerator`** 表示撞击类的触感反馈生成器：两个东西碰到一起时的那一下震动，比如按钮按下、卡片落到位、拖动的东西碰到边界。

力度在创建时确定，之后不能改。要用几种力度，就创建几个生成器。

**继承关系**：`EventTarget` → `NSObject` → [`UIFeedbackGenerator`](ui-feedback-generator.md) → `UIImpactFeedbackGenerator`

在模拟器上、或用户关掉了触感反馈时，调用不报错但没有震动，见[什么时候没有震动](ui-feedback-generator.md#什么时候没有震动)。什么场合用它，见指南[让手机震一下](../guides/haptics.md)。

## 构造函数

不能用 `new` 创建。`new UIImpactFeedbackGenerator()` 抛 `TypeError: Illegal constructor: UIImpactFeedbackGenerator has no public initializer; use UIImpactFeedbackGenerator.feedbackGeneratorWithStyle(style, { forView: view })`。

## 静态方法

[`UIImpactFeedbackGenerator.feedbackGeneratorWithStyle()`](ui-impact-feedback-generator/feedbackgeneratorwithstyle.md)

创建一个指定力度、绑定到一个视图的生成器。

## 实例方法

还继承 [`UIFeedbackGenerator`](ui-feedback-generator.md) 的 [`prepare()`](ui-feedback-generator/prepare.md)。

| 方法 | 说明 |
| --- | --- |
| [`impactOccurred()`](ui-impact-feedback-generator/impactoccurred.md) | 震一下，力度是创建时给的那一种，满强度 |
| [`impactOccurredWithIntensity()`](ui-impact-feedback-generator/impactoccurredwithintensity.md) | 震一下，强度是满强度的一个比例 |

## 示例

```js
const button = UIButton.buttonWithType('system');
const tap = UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('medium', { forView: button });

button.addEventListener('touchdown', () => {
  tap.impactOccurred();
});
```

**效果**：手指按下按钮时，手机短促地震一下。**震感未在模拟器验证。**

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[UIImpactFeedbackGenerator feedbackGeneratorWithStyle:UIImpactFeedbackStyleMedium forView:view]` | `UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('medium', { forView: view })` |
| `[generator impactOccurred]` | `generator.impactOccurred()` |
| `[generator impactOccurredWithIntensity:0.5]` | `generator.impactOccurredWithIntensity(0.5)` |

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 指明震动发生在视图里的哪个位置 | `impactOccurredAtLocation:`、`impactOccurredWithIntensity:atLocation:` |

## 参见

- [让手机震一下](../guides/haptics.md)
- [`UIFeedbackGenerator`](ui-feedback-generator.md)：基类
