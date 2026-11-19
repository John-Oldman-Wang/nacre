---
type: reference
native: "-[UIProgressView init]"
---

# `UIProgressView()` 构造函数

**`UIProgressView()`** 构造函数创建一条进度条。新建的进度条宽度是 0，要给它宽度才看得见。

## 语法

```
new UIProgressView()
```

### 参数

无。

### 返回值

新建的 `UIProgressView`：

- [`progressViewStyle`](progressviewstyle.md) 是 `'default'`。
- [`progress`](progress.md) 是 0，填满的那一段长度为 0，屏幕上只有一条浅色的底。
- 四个外观属性 [`progressTintColor`](progresstintcolor.md)、[`trackTintColor`](tracktintcolor.md)、[`progressImage`](progressimage.md)、[`trackImage`](trackimage.md) 都是 `null`。
- `frame` 宽 0、高 4 [pt](../units.md)。`isHidden` 是 `false`。

用 Auto Layout 定位时约束它的左右两边或宽度，高度不用约束。用 `frame` 定位时写 `frame` 给出位置和宽度。

### 异常

**`TypeError`**

继承这个类再 `new`：`class X extends UIProgressView {}` 在 `new X()` 时抛，见[原生类](../native-classes.md)。

## 示例

```js
const bar = new UIProgressView();
console.log(bar.frame.width, bar.frame.height, bar.progress);
```

**结果**：输出 `0 4 0`。

## 对应的 iOS API

`-[UIProgressView init]`。`initWithProgressViewStyle:` 没有对应的构造参数，创建后写 `progressViewStyle`。`initWithProgressViewStyle:` 创建的进度条宽 160 pt，这里创建的宽 0。

## 参见

- [高度由样式决定](../ui-progress-view.md#高度由样式决定)
