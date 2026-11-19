---
type: reference
native: "-[UIImage imageWithRenderingMode:]"
---

# `UIImage`：`imageWithRenderingMode()` 方法

**`imageWithRenderingMode()`** 方法生成一张渲染模式不同的图。把自己的图片转成模板图，图片视图就能按 `tintColor` 给它上色。

## 语法

```
imageWithRenderingMode(mode)
```

### 参数

**`mode`**

`'automatic'`、`'alwaysOriginal'` 或 `'alwaysTemplate'`。含义见 [`renderingMode`](renderingmode.md)。

### 返回值

新的 `UIImage`。原图不变：`star.imageWithRenderingMode('alwaysOriginal') === star` 是 `false`。对动图调用，得到的是静态图，内容是第一帧。

### 异常

**`TypeError`**

`mode` 写错：`renderingMode has no value "template"; expected one of: …`。

## 示例

```js
const star = UIImage.systemImageNamed('star.fill');
if (star) {
  const template = star.imageWithRenderingMode('alwaysTemplate');
  console.log(template.renderingMode);
}
```

**结果**：控制台输出 `alwaysTemplate`。

## 对应的 iOS API

`-[UIImage imageWithRenderingMode:]`。`UIImageRenderingModeAlwaysTemplate` 写成 `'alwaysTemplate'`，其余同理。

## 参见

- [渲染模式和 `tintColor`](../ui-image.md#渲染模式和-tintcolor)
- [`UIImageView`](../ui-image-view.md) 的 [`tintColor`](../ui-image-view/tintcolor.md)
