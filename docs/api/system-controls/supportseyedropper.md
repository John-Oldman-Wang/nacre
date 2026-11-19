---
type: reference
native: UIColorWell.supportsEyedropper
---

# `UIColorWell`：`supportsEyedropper` 属性

**`supportsEyedropper`** 属性决定取色面板上有没有取色器。取色器是从屏幕上吸取一个颜色的工具。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 面板上有取色器的按钮（在模拟器上看过） |
| `false` | 面板上没有取色器的按钮。**未在模拟器验证** |

- 可读，可写。
- 默认值是 `true`。
- 写入的值按 JS 的真假值转成布尔：写 `0` 得到 `false`。不会抛异常。
- 没有变化事件。只有 App 自己的代码会改它。

## 示例

```js
const well = new UIColorWell();
well.supportsEyedropper = false;
console.log(well.supportsEyedropper);
```

**结果**：输出 `false`。

## 对应的 iOS API

`UIColorWell.supportsEyedropper`。

## 参见

- [`UIColorWell`](../system-controls.md)
