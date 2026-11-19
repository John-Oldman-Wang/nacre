---
type: reference
native: UIColorWell.supportsAlpha
---

# `UIColorWell`：`supportsAlpha` 属性

**`supportsAlpha`** 属性决定取色面板上能不能调颜色的不透明度。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 面板上有不透明度的滑杆（在模拟器上看过） |
| `false` | 面板上没有不透明度的滑杆，选出的颜色不透明。**未在模拟器验证** |

- 可读，可写。
- 默认值是 `true`。
- 写入的值按 JS 的真假值转成布尔：写 `0` 得到 `false`。不会抛异常。
- 没有变化事件。只有 App 自己的代码会改它。

## 示例

```js
const well = new UIColorWell();
well.supportsAlpha = false;
console.log(well.supportsAlpha);
```

**结果**：输出 `false`。

## 对应的 iOS API

`UIColorWell.supportsAlpha`。

## 参见

- [`UIColorWell`](../system-controls.md)
