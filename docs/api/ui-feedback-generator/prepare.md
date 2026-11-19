---
type: reference
native: "-[UIFeedbackGenerator prepare]"
---

# `UIFeedbackGenerator`：`prepare()` 方法

**`prepare()`** 方法让系统的震动部件提前进入就绪状态。Apple 对它的说明是：这样做能减小触发震动时的延迟。三个子类都有这个方法。

## 语法

```
prepare()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

无。

## 说明

- 它自己不产生震动。
- 可以不调。不调也能震，验收用例里两种写法都执行过，都不报错。
- 调与不调的延迟差多少没有测量过，**未在模拟器验证**。
- 准备状态属于调用它的那个生成器。每次触发都新建一个生成器就用不上它。
- 按 Apple 的说明，就绪状态只保持很短的时间。所以要在马上要震之前调，比如手指按下时，不要在建界面时调一次了事。

## 示例

```js
const button = UIButton.buttonWithType('system');
const tap = UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('medium', { forView: button });

button.addEventListener('touchdown', () => {
  tap.prepare();
});
button.addEventListener('touchupinside', () => {
  tap.impactOccurred();
});
```

**效果**：手指按下时准备，在按钮上松手时震一下。

## 对应的 iOS API

`-[UIFeedbackGenerator prepare]`。

## 参见

- [减小震动的延迟](../../guides/haptics.md#减小震动的延迟)
