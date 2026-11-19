---
type: reference
native: UIColorWell.title
---

# `UIColorWell`：`title` 属性

**`title`** 属性是取色面板的标题。用户点开取色控件时，面板顶部显示这行字。

## 值

字符串，或者 `null`。

- 可读，可写。
- 默认值是 `null`：面板上没有自定的标题。`null` 时面板上显示什么**未在模拟器验证**。
- 写进去的标题在点开的取色面板上显示（在模拟器上看过）。
- 写入的值按 `String()` 转换：写 `5` 读回 `'5'`。写 `null` 得到 `null`。
- 没有变化事件。只有 App 自己的代码会改它。

## 示例

```js
const well = new UIColorWell();
well.title = '主题色';
console.log(well.title);
```

**结果**：输出 `主题色`。点开取色面板，标题是「主题色」。

## 对应的 iOS API

`UIColorWell.title`。

## 参见

- [`selectedColor`](selectedcolor.md)
