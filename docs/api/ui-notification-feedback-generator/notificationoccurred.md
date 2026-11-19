---
type: reference
native: "-[UINotificationFeedbackGenerator notificationOccurred:]"
---

# `UINotificationFeedbackGenerator`：`notificationOccurred()` 方法

**`notificationOccurred()`** 方法按一种结果对应的节奏震动。

## 语法

```
notificationOccurred(type)
```

### 参数

**`type`**

结果的类型，下面几个字符串之一。三种的震动节奏不同，**震感未在模拟器验证**：

| 取值 | 含义 | 什么场合用 |
| --- | --- | --- |
| `'success'` | 一件事成功完成 | 提交成功、支付完成 |
| `'warning'` | 需要用户注意 | 余额不足的提醒、需要用户确认的情况 |
| `'error'` | 失败 | 提交失败、密码错误 |

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- `type` 不认识：`notificationOccurred has no value "info"; expected one of: success / warning / error`。

在模拟器上、或用户关掉了触感反馈时不报错，只是没有震动。

## 示例

```js
const page = new UIViewController();
const result = UINotificationFeedbackGenerator.feedbackGeneratorForView(page.view);
result.notificationOccurred('warning');
```

**效果**：手机按系统给「需要注意」规定的节奏震动。**未在模拟器验证。**

## 对应的 iOS API

`-[UINotificationFeedbackGenerator notificationOccurred:]`。`UINotificationFeedbackTypeSuccess` 写成 `'success'`，其余同理。

## 参见

- [按场合选类](../../guides/haptics.md#推荐的做法)
