---
type: reference
native: UISelectionFeedbackGenerator
status: partial
---

# `UISelectionFeedbackGenerator`

**`UISelectionFeedbackGenerator`** 表示选择类的触感反馈生成器：选择从一项换到另一项时很轻的一下震动，比如滚轮转过一格、滑块经过一个刻度、列表的选中项换了。

它只发出震动，不知道界面上选中了什么。选中项变了的时候由代码调用 [`selectionChanged()`](ui-selection-feedback-generator/selectionchanged.md)。

**继承关系**：`EventTarget` → `NSObject` → [`UIFeedbackGenerator`](ui-feedback-generator.md) → `UISelectionFeedbackGenerator`

在模拟器上、或用户关掉了触感反馈时，调用不报错但没有震动，见[什么时候没有震动](ui-feedback-generator.md#什么时候没有震动)。

## 构造函数

不能用 `new` 创建，用 [`UISelectionFeedbackGenerator.feedbackGeneratorForView()`](ui-selection-feedback-generator/feedbackgeneratorforview.md)。用 `new` 抛 `TypeError`，报错信息里指明该用的静态方法。

## 静态方法

[`UISelectionFeedbackGenerator.feedbackGeneratorForView()`](ui-selection-feedback-generator/feedbackgeneratorforview.md)

创建一个绑定到一个视图的生成器。

## 实例方法

还继承 [`UIFeedbackGenerator`](ui-feedback-generator.md) 的 [`prepare()`](ui-feedback-generator/prepare.md)。

| 方法 | 说明 |
| --- | --- |
| [`selectionChanged()`](ui-selection-feedback-generator/selectionchanged.md) | 很轻地震一下 |

## 示例

```js
const page = new UIViewController();
const tick = UISelectionFeedbackGenerator.feedbackGeneratorForView(page.view);

/** @param {number} index */
function onSelect(index) {
  tick.selectionChanged();
  console.log('选中了第 ' + index + ' 项');
}

onSelect(2);
```

**效果**：很轻地震一下，控制台输出 `选中了第 2 项`。**震感未在模拟器验证。**

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[UISelectionFeedbackGenerator feedbackGeneratorForView:view]` | `UISelectionFeedbackGenerator.feedbackGeneratorForView(view)` |
| `[generator selectionChanged]` | `generator.selectionChanged()` |

## 参见

- [让手机震一下](../guides/haptics.md)
- [`UIFeedbackGenerator`](ui-feedback-generator.md)：基类
