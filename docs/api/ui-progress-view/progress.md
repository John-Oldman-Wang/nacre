---
type: reference
native: UIProgressView.progress
---

# `UIProgressView`：`progress` 属性

**`progress`** 属性是完成的比例：填满的那一段占整条的多少。

## 值

数，0 到 1，没有单位。0 是还没开始，1 是全部完成。

- 可读，可写。
- 默认值是 0。
- 小于 0 的值按 0，大于 1 的值按 1，不抛异常。
- 存成 32 位浮点数：写 `0.3` 读回来是 `0.30000001192092896`（等于 `Math.fround(0.3)`）。0.5、0.25 这类 32 位浮点数能精确表示的值读回来不变。要比较就和 `Math.fround()` 的结果比；要显示百分比，用 `Math.round(bar.progress * 100)`。
- 写这个属性没有动画。要动画用 [`setProgress()`](setprogress.md)。
- 没有变化事件。只有 App 自己的代码会改它。

### 写错时

写入的值按 `Number()` 转换：`'0.25'` 得到 0.25，`null` 得到 0。

转不成有限数的值（`undefined`、`NaN`、`Infinity`、`'half'`）抛 `TypeError`，原值不变：

```
TypeError: progress must be a finite number, got undefined
```

## 示例

```js
const bar = new UIProgressView();
bar.progress = 0.5;
console.log(bar.progress);
bar.progress = 0.3;
console.log(bar.progress === Math.fround(0.3));
bar.progress = 2;
console.log(bar.progress);
```

**结果**：依次输出 `0.5`、`true`、`1`。写 0.5 时填满的那一段立刻变成整条的一半，没有动画。

## 对应的 iOS API

`UIProgressView.progress`。ObjC 里是 `float`。

## 参见

- [`setProgress()`](setprogress.md)：带动画改进度
- [显示加载和进度](../../guides/loading-and-progress.md#把完成了几个换算成进度)：自己保存完成了几个，算出比例写给进度条
