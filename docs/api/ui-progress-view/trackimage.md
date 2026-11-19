---
type: reference
native: UIProgressView.trackImage
---

# `UIProgressView`：`trackImage` 属性

**`trackImage`** 属性是进度条没填的那一段用的图片。

## 值

[`UIImage`](../ui-image.md)，或者 `null`。

- 可读，可写。
- 默认值是 `null`。
- 读回来是写进去的同一个对象。
- 写 `null` 去掉图片。
- 和 [`trackTintColor`](tracktintcolor.md) 二选一：写入一张图片时，`trackTintColor` 变成 `null`；之后再写颜色，图片变成 `null`。见[颜色和图片二选一](../ui-progress-view.md#颜色和图片二选一)。
- 图片怎么拉伸和裁剪**未在模拟器验证**。
- 没有变化事件。只有 App 自己的代码会改它。

### 写错时

写入 `UIImage` 和 `null` 以外的值抛 `TypeError`，原值不变：

- 写别的原生对象（比如 `UIColor`）：`trackImage needs a UIImage or null`。
- 写字符串等普通值：`trackImage needs a native object or null, got "star.fill"`。

## 示例

```js
const bar = new UIProgressView();
bar.trackTintColor = 'systemRed';
const star = UIImage.systemImageNamed('star.fill');
if (star) bar.trackImage = star;
console.log(bar.trackTintColor);
```

**结果**：输出 `null`。写图片时系统清掉了刚才写的颜色，没填的那一段改用这张图。

## 对应的 iOS API

`UIProgressView.trackImage`。

## 参见

- [`trackTintColor`](tracktintcolor.md)
- [`UIImage`](../ui-image.md)：图片从哪里来
