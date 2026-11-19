---
type: reference
native: "+[UIImpactFeedbackGenerator feedbackGeneratorWithStyle:forView:]"
---

# `UIImpactFeedbackGenerator.feedbackGeneratorWithStyle()` 静态方法

**`UIImpactFeedbackGenerator.feedbackGeneratorWithStyle()`** 静态方法创建一个撞击类的生成器。力度在创建时确定，之后不能改。

## 语法

```
UIImpactFeedbackGenerator.feedbackGeneratorWithStyle(style, { forView })
```

### 参数

**`style`**

力度，下面几个字符串之一。「感觉」一栏是 Apple 文档里的描述，**震感未在模拟器验证**：

| 取值 | 感觉 |
| --- | --- |
| `'light'` | 轻。用于小的、轻的界面元素 |
| `'medium'` | 中等 |
| `'heavy'` | 重。用于大的、重的界面元素 |
| `'soft'` | 发闷，像碰到软的东西 |
| `'rigid'` | 发脆，像碰到硬的东西 |

**`options.forView`**

一个 [`UIView`](../ui-view.md) 或它的子类的对象，必填，不能是 `null`。表示这次反馈和哪个视图有关：通常给触发反馈的那个控件；没有明确的控件时给页面的根视图。验收用例里给的都是已经显示在屏幕上的视图；给一个还没加到界面上的视图时是否有震动，**未在模拟器验证**。

### 返回值

新建的 `UIImpactFeedbackGenerator`。每次调用得到一个新的对象。

### 异常

**`TypeError`**

- `style` 不认识：`style has no value "strong"; expected one of: light / medium / heavy / soft / rigid`。
- 没给 `forView`：`feedbackGeneratorWithStyle needs { forView }`。
- `forView` 给的不是视图：`forView needs a UIView`。

## 示例

```js
const page = new UIViewController();
const light = UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('light', { forView: page.view });
const heavy = UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('heavy', { forView: page.view });

light.impactOccurred();
heavy.impactOccurred();
```

**效果**：先轻轻震一下，紧接着重重震一下。**未在模拟器验证。**

## 对应的 iOS API

`+[UIImpactFeedbackGenerator feedbackGeneratorWithStyle:forView:]`。`UIImpactFeedbackStyleMedium` 写成 `'medium'`，其余同理。`-initWithStyle:` 已被 Apple 标为将废弃，没有提供。

## 参见

- [`impactOccurred()`](impactoccurred.md)
