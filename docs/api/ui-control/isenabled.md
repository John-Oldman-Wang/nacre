---
type: reference
native: UIControl.enabled
---

# `UIControl`：`isEnabled` 属性

**`isEnabled`** 属性表示控件是否接收触摸。设成 `false` 时控件进入 `disabled` [状态](../ui-control.md#状态)。

## 值

布尔值。

| 取值 | 效果 |
| --- | --- |
| `true` | 控件接收触摸，正常派发控件事件 |
| `false` | 控件不接收触摸，不派发控件事件。[`state`](state.md) 里有 `'disabled'`。按钮、开关这类子类会显示成禁用的样子；直接创建的 `UIControl` 外观不变 |

- 可读，可写。
- 默认值是 `true`。
- 写入按 JS 的真假值转换：`'false'` 这个字符串是非空字符串，得到 `true`；`0` 得到 `false`。
- 「禁用后不派发控件事件」**未在模拟器验证**。

### 怎么得知它变了

它变了不派发事件。只有 App 的代码会改它，不需要通知。

## 示例

```js
const card = new UIControl();
card.isEnabled = false;
card.alpha = 0.4;
console.log(card.state.includes('disabled'));
```

**结果**：输出 `true`。`card` 变成半透明。直接创建的 `UIControl` 禁用后外观不变，要让它看起来是禁用的，自己改外观。

## 对应的 iOS API

`UIControl.enabled`，读取方法是 `isEnabled`。

## 参见

- [`state`](state.md)：读当前的全部状态
- [状态](../ui-control.md#状态)
