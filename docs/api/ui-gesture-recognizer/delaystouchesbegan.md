---
type: reference
native: UIGestureRecognizer.delaysTouchesBegan
---

# `UIGestureRecognizer`：`delaysTouchesBegan` 属性

**`delaysTouchesBegan`** 属性决定识别器确定认不出手势之前，视图是否收得到触摸的开始。

## 值

布尔值。

| 取值 | 效果 |
| --- | --- |
| `true` | 识别器确定认不出之前，视图收不到触摸的开始。控件的 [`touchdown`](../ui-control/touchdown-event.md) 推迟到识别器失败之后 |
| `false` | 视图和识别器同时收到触摸的开始 |

- 可读，可写。
- 默认值是 `false`。[`UIScreenEdgePanGestureRecognizer`](../ui-screen-edge-pan-gesture-recognizer.md) 的默认值是 `true`。
- 写入按 JS 的真假值转换。
- 设成 `true` 之后的效果**未在模拟器验证**。

### 怎么得知它变了

它变了不派发事件。只有 App 的代码会改它，不需要通知。

## 示例

```js
const tap = new UITapGestureRecognizer();
console.log(tap.delaysTouchesBegan);
tap.delaysTouchesBegan = true;
console.log(tap.delaysTouchesBegan);
```

**结果**：依次输出 `false` 和 `true`。

## 对应的 iOS API

`UIGestureRecognizer.delaysTouchesBegan`。

## 参见

- [`delaysTouchesEnded`](delaystouchesended.md)
- [`cancelsTouchesInView`](cancelstouchesinview.md)
