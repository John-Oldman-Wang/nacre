---
type: reference
native: UISwitch.isOn
---

# `UISwitch`：`isOn` 属性

**`isOn`** 属性表示开关是开着还是关着。

## 值

布尔值。

| 取值 | 效果 |
| --- | --- |
| `true` | 开着：圆钮在右边，轨道显示 [`onTintColor`](ontintcolor.md)，没设过时是系统的绿色 |
| `false` | 关着：圆钮在左边，轨道是灰色 |

两种取值在屏幕上的样子**未在模拟器验证**。

- 可读，可写。
- 默认值是 `false`。
- 写入按 JS 的真假值转换：`'false'` 这个字符串是非空字符串，得到 `true`；`0` 得到 `false`。
- 写 `isOn` 没有动画。要动画用 [`setOn()`](seton.md)。

### 怎么得知它变了

用户切换开关时派发 [`change`](../ui-control/change-event.md)，回调里读 `isOn` 得到切换之后的值。

代码写 `isOn` 不派发 `change`，所以按保存的设置恢复界面时可以直接写，不会触发自己的监听器。验收用例断言过：写入之后没有收到 `change`。

## 示例

```js
const sw = new UISwitch();
sw.isOn = true;
console.log(sw.isOn);
// @ts-expect-error 类型只收布尔值，这里演示运行时按真假值转换
sw.isOn = 0;
console.log(sw.isOn);
```

**结果**：依次输出 `true`、`false`。

## 对应的 iOS API

`UISwitch.on`，读取方法是 `isOn`。

## 参见

- [`setOn()`](seton.md)：带动画地切换
- [`change`](../ui-control/change-event.md) 事件
