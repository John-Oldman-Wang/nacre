---
type: reference
native: "-[UISelectionFeedbackGenerator selectionChanged]"
---

# `UISelectionFeedbackGenerator`：`selectionChanged()` 方法

**`selectionChanged()`** 方法很轻地震一下，表示选择从一项换到了另一项。

## 语法

```
selectionChanged()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

无。在模拟器上、或用户关掉了触感反馈时不报错，只是没有震动。

## 说明

它只发出震动，不知道界面上选中了什么。选中项变了的时候由代码调用它，每变一次调一次。

## 示例

```js
const page = new UIViewController();
const tick = UISelectionFeedbackGenerator.feedbackGeneratorForView(page.view);

for (let i = 0; i < 3; i++) {
  tick.selectionChanged();
}
```

**效果**：很轻地连震三下。**震感未在模拟器验证。**

## 对应的 iOS API

`-[UISelectionFeedbackGenerator selectionChanged]`。

## 参见

- [什么时候没有震动](../ui-feedback-generator.md#什么时候没有震动)
