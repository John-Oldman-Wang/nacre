---
type: reference
native: "-[UIImage prepareThumbnailOfSize:completionHandler:]"
---

# `UIImage`：`prepareThumbnail()` 方法

**`prepareThumbnail()`** 方法在后台生成一张缩小的图并解码。显示尺寸远小于原图时（比如列表里的头像）用它。

## 语法

```
prepareThumbnail(size)
```

### 参数

**`size`**

缩略图的目标尺寸，单位是 [pt](../units.md)。[`CGSize`](../structs.md) 对象，或者带 `width`、`height` 的普通对象。

### 返回值

`Promise`，兑现成一张已经解码的缩略图。系统解码失败时兑现成 `null`。原图不变。

缩略图的实际尺寸**未在模拟器验证**。对动图调用，结果是静态图，内容是第一帧的缩略图。

### 异常

**`TypeError`**，同步抛出，不是 Promise 被拒绝：

- `size` 不是对象：`prepareThumbnail needs an object with all of: width, height`。
- 缺字段：`prepareThumbnail is missing width, or it is not a finite number`。

## 示例

```js
async function showThumbnail() {
  const dot = UIImage.imageNamed('JS/assets/dot');
  if (dot === null) return;

  const thumbnail = await dot.prepareThumbnail(new CGSize(5, 5));
  if (thumbnail) {
    const iv = new UIImageView();
    iv.image = thumbnail;
  }
}

showThumbnail();
```

**效果**：图片视图得到一张缩小过的图。

## 对应的 iOS API

`-[UIImage prepareThumbnailOfSize:completionHandler:]`。completion handler 换成了 Promise。

## 参见

- [`prepareForDisplay()`](preparefordisplay.md)
