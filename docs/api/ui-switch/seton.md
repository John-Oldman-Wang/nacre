---
type: reference
native: "-[UISwitch setOn:animated:]"
---

# `UISwitch`：`setOn()` 方法

**`setOn()`** 方法把开关切到指定的一边，可以带动画。

## 语法

```
setOn(on[, { animated }])
```

### 参数

**`on`**

`true` 是开，`false` 是关。按 JS 的真假值转换，和写 [`isOn`](ison.md) 相同。

**`options.animated`**

可选，布尔值。`true` 时圆钮滑过去；不传、传 `undefined` 或 `false` 时没有动画，直接到位。整个 `options` 可以省略。

### 返回值

无（`undefined`）。

值在调用返回时就已经变了，不用等动画结束（实测）。

### 异常

无。

## 说明

`setOn()` 和写 `isOn` 一样不派发 [`change`](../ui-control/change-event.md)。所以在 `change` 的回调里调它把开关改回去，不会再触发一次回调。验收用例断言过：调用之后没有收到 `change`。

## 示例

```js
const sw = new UISwitch();
sw.setOn(true, { animated: true });
console.log(sw.isOn);
```

**效果**

- 圆钮滑到右边。**动画未在模拟器验证。**
- 控制台立刻输出 `true`。

## 对应的 iOS API

`-[UISwitch setOn:animated:]`。`animated` 在 ObjC 里必填，这里可以省略，省略时是 `NO`。

## 参见

- [`isOn`](ison.md)
- [保存失败时改回去](../../guides/switches-sliders-steppers.md#保存失败时把开关改回去)
