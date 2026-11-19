---
type: reference
native: UIControl.tracking
---

# `UIControl`：`isTracking` 属性

**`isTracking`** 属性表示控件是否正在跟踪一次触摸：从手指按下，到松开或触摸被取消。

## 值

布尔值。

| 取值 | 含义 |
| --- | --- |
| `true` | 有一次触摸正在进行 |
| `false` | 没有触摸在进行 |

- 只读。给它赋值抛 `TypeError`。
- 默认值是 `false`。

### 怎么得知它变了

它变了不派发事件。触摸的开始是 [`touchdown`](touchdown-event.md)，结束是 [`touchupinside`](touchupinside-event.md)、[`touchupoutside`](touchupoutside-event.md)、[`touchcancel`](touchcancel-event.md) 三者之一。回调排在触摸之后执行，回调里读到的是执行那一刻的值，见[回调的执行时机](../ui-control.md#回调的执行时机)。

## 示例

```js
const card = new UIControl();
console.log(card.isTracking);
```

**结果**：输出 `false`。

## 对应的 iOS API

`UIControl.tracking`，读取方法是 `isTracking`。

## 参见

- [`isTouchInside`](istouchinside.md)：触摸此刻是否在控件范围内
