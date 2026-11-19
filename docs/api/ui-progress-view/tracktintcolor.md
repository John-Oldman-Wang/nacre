---
type: reference
native: UIProgressView.trackTintColor
---

# `UIProgressView`：`trackTintColor` 属性

**`trackTintColor`** 属性是进度条没填的那一段的颜色。

## 值

[颜色](../ui-color.md)字符串，或者 `null`。

- 可读，可写。
- 默认值是 `null`：没有单独设，用系统默认的颜色。
- 合法写入的颜色原样读回。也可以写 `UIColor` 对象，读出来是颜色字符串，比如写 `UIColor.systemRedColor` 读回 `'systemRed'`。
- 写 `null` 恢复系统默认的颜色。
- 和 [`trackImage`](trackimage.md) 二选一：写入一个颜色时，`trackImage` 变成 `null`。把颜色写成 `null` 不影响图片，见[颜色和图片二选一](../ui-progress-view.md#颜色和图片二选一)。
- 颜色在屏幕上的样子**未在模拟器验证**。
- 没有变化事件。只有 App 自己的代码会改它。

### 写错时

写入不合法的颜色：不抛异常，控制台输出一条警告，颜色保持原来的值，见[颜色](../ui-color.md#写错不抛打警告)。

## 示例

```js
const bar = new UIProgressView();
bar.trackTintColor = '#E5E5EA';
console.log(bar.trackTintColor);
```

**结果**：输出 `#E5E5EA`。进度条没填的那一段变成这个颜色。

## 对应的 iOS API

`UIProgressView.trackTintColor`。ObjC 里是 `UIColor` 对象，这里读出来是颜色字符串。

## 参见

- [`trackImage`](trackimage.md)：用图片代替颜色
- [颜色](../ui-color.md)：颜色字符串的写法
