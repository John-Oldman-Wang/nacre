---
type: reference
native: UIGestureRecognizer.delaysTouchesEnded
---

# `UIGestureRecognizer`：`delaysTouchesEnded` 属性

**`delaysTouchesEnded`** 属性决定识别器确定认不出手势之前，视图是否收得到触摸的结束。

## 值

布尔值。

| 取值 | 效果 |
| --- | --- |
| `true` | 识别器确定认不出之后，视图才收到触摸的结束 |
| `false` | 视图立刻收到触摸的结束 |

- 可读，可写。
- 默认值是 `true`。
- 写入按 JS 的真假值转换。
- 设成 `false` 之后的效果**未在模拟器验证**。

### 怎么得知它变了

它变了不派发事件。只有 App 的代码会改它，不需要通知。

## 示例

```js
const tap = new UITapGestureRecognizer();
console.log(tap.delaysTouchesEnded);
```

**结果**：输出 `true`。

## 对应的 iOS API

`UIGestureRecognizer.delaysTouchesEnded`。

## 参见

- [`delaysTouchesBegan`](delaystouchesbegan.md)
- [`cancelsTouchesInView`](cancelstouchesinview.md)
