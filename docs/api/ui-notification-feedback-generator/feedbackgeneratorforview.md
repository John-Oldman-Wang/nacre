---
type: reference
native: "+[UINotificationFeedbackGenerator feedbackGeneratorForView:]"
---

# `UINotificationFeedbackGenerator.feedbackGeneratorForView()` 静态方法

**`UINotificationFeedbackGenerator.feedbackGeneratorForView()`** 静态方法创建一个通知类的生成器，绑定到一个视图。

## 语法

```
UINotificationFeedbackGenerator.feedbackGeneratorForView(view)
```

### 参数

**`view`**

一个 [`UIView`](../ui-view.md) 或它的子类的对象，必填，不能是 `null`。表示这次反馈和哪个视图有关：通常给触发反馈的那个控件；没有明确的控件时给页面的根视图。给一个还没加到界面上的视图时是否有震动，**未在模拟器验证**。

### 返回值

新建的 `UINotificationFeedbackGenerator`。每次调用得到一个新的对象。

### 异常

**`TypeError`**

- `view` 不是视图：`feedbackGeneratorForView needs a UIView`。

## 示例

```js
const button = UIButton.buttonWithType('system');
const done = UINotificationFeedbackGenerator.feedbackGeneratorForView(button);
done.notificationOccurred('success');
```

**效果**：手机按系统给「成功」规定的节奏震动。**未在模拟器验证。**

## 对应的 iOS API

`+[UINotificationFeedbackGenerator feedbackGeneratorForView:]`。

## 参见

- [`notificationOccurred()`](notificationoccurred.md)
