---
type: reference
native: "-[UIProgressView setProgress:animated:]"
---

# `UIProgressView`：`setProgress()` 方法

**`setProgress()`** 方法改进度条的进度，可以带动画。

## 语法

```
setProgress(progress[, { animated }])
```

### 参数

**`progress`**

完成的比例，数，0 到 1。按 `Number()` 转换。小于 0 按 0，大于 1 按 1。

**`options.animated`**

布尔，可选。`true` 时填满的那一段滑到新位置；不传、`false`、`undefined` 时直接跳到新位置。整个 options 传 `null` 视为没带。动画在屏幕上的样子和持续多久**未在模拟器验证**。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

`progress` 转不成有限数（不传、`NaN`、`Infinity`、`'half'`）：`progress must be a finite number, got undefined`。进度不变。

## 说明

带动画时，[`progress`](progress.md) 属性在调用返回时已经是新的值，不是滑到一半的值。没有「动画结束」的通知。

进度前进时带动画，回到 0 时不带。从 1 回到 0 如果带动画，用户会看到进度条倒着走。

## 示例

```js
const bar = new UIProgressView();
bar.setProgress(0.8, { animated: true });
console.log(bar.progress);
```

**结果**：填满的那一段滑到整条的 80%。控制台输出 `0.800000011920929`：`progress` 当场就是新的值。

## 对应的 iOS API

`-[UIProgressView setProgress:animated:]`。`animated:` 写成 options 的 `animated`，可以不传。

## 参见

- [`progress`](progress.md)：不带动画地改进度
