---
type: reference
native: "-[UISlider setValue:animated:]"
---

# `UISlider`：`setValue()` 方法

**`setValue()`** 方法改滑块的值，可以带动画。

## 语法

```
setValue(value[, { animated }])
```

### 参数

**`value`**

新的值，数。按 `Number()` 转换。超出 [`minimumValue`](minimumvalue.md) 到 [`maximumValue`](maximumvalue.md) 的值被改成最近的那一头，和写 [`value`](value.md) 相同。

**`options.animated`**

可选，布尔值。`true` 时圆钮滑过去；不传、传 `undefined` 或 `false` 时直接到位。整个 `options` 可以省略。

### 返回值

无（`undefined`）。

值在调用返回时就已经变了，不用等动画结束（实测）。

### 异常

**`TypeError`**

`value` 转不成有限数：`setValue must be a finite number, got "max"`。

## 说明

和写 `value` 一样，`setValue()` 不派发 [`change`](../ui-control/change-event.md)。验收用例断言过：调用之后没有收到 `change`。

## 示例

```js
const slider = new UISlider();
slider.maximumValue = 100;
slider.setValue(80, { animated: true });
console.log(slider.value);
```

**效果**

- 圆钮滑到 80 的位置。**动画未在模拟器验证。**
- 控制台立刻输出 `80`。

## 对应的 iOS API

`-[UISlider setValue:animated:]`。`animated` 在 ObjC 里必填，这里可以省略，省略时是 `NO`。

## 参见

- [`value`](value.md)
