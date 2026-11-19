---
type: reference
native: "-[UIImpactFeedbackGenerator impactOccurredWithIntensity:]"
---

# `UIImpactFeedbackGenerator`：`impactOccurredWithIntensity()` 方法

**`impactOccurredWithIntensity()`** 方法震一下，质感是创建时给的那种力度，强度是满强度的一个比例。

## 语法

```
impactOccurredWithIntensity(intensity)
```

### 参数

**`intensity`**

0 到 1 之间的比例，1 是这种力度的满强度。0 和 1 都可以写。能转成数的值都接受，比如 `'0.5'`。超出范围不会自动截到范围内，由计算得到的值要先限制范围。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- 超出 0 到 1：`intensity must be a number between 0 and 1`。
- 转不成数：`intensity must be a finite number, got "max"`。

## 示例

```js
const page = new UIViewController();
const pull = UIImpactFeedbackGenerator.feedbackGeneratorWithStyle('heavy', { forView: page.view });

const distance = 400; // 拖动的距离，单位 pt
pull.impactOccurredWithIntensity(Math.min(1, Math.max(0, distance / 200)));
```

**效果**：震一下，质感是 `heavy` 的。400 pt 算出来是 2，被限制到 1，所以是满强度。**震感未在模拟器验证。**

## 对应的 iOS API

`-[UIImpactFeedbackGenerator impactOccurredWithIntensity:]`。

## 参见

- [震感跟着拖动的距离变化](../../guides/haptics.md#震感跟着拖动的距离变化)
- [`impactOccurred()`](impactoccurred.md)
