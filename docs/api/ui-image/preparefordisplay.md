---
type: reference
native: "-[UIImage prepareForDisplayWithCompletionHandler:]"
---

# `UIImage`：`prepareForDisplay()` 方法

**`prepareForDisplay()`** 方法在后台把图片解码成像素，完成后给出一张可以直接显示的图。

图片对象取到时还没有解码。不调用这个方法时，解码发生在图片第一次显示的时候，和界面更新在同一个线程上进行。从网络下载的图片推荐都先调用它再显示，小图标不需要。

## 语法

```
prepareForDisplay()
```

### 参数

无。

### 返回值

`Promise`，兑现成一张已经解码的 `UIImage`，尺寸和原图相同。系统解码失败时兑现成 `null`，所以使用前要判空，`null` 时退回使用原图。原图不变。

是动图时，所有的帧都被解码，结果仍然是动图，帧数、每帧时长、播放遍数和原图相同。

### 异常

无。

## 示例

```js
async function decode() {
  const dot = UIImage.imageNamed('JS/assets/dot');
  if (dot === null) return;

  const ready = await dot.prepareForDisplay();
  if (ready) {
    console.log(ready.size.width === dot.size.width);
  }
}

decode();
```

**结果**：控制台输出 `true`。

## 对应的 iOS API

`-[UIImage prepareForDisplayWithCompletionHandler:]`。completion handler 换成了 Promise。

## 参见

- [大图和网络图片](../ui-image.md#大图和网络图片)
- [`prepareThumbnail()`](preparethumbnail.md)
