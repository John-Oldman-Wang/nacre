---
type: reference
native: "+[UIImage imageWithData:scale:]"
---

# `UIImage.imageWithData()` 静态方法

**`UIImage.imageWithData()`** 静态方法把 `Blob` 里的字节解成图片。从网络下载的图片用它。

## 语法

```
UIImage.imageWithData(blob, [{ scale }])
```

### 参数

**`blob`**

[`Blob`](../fetch.md)。通常来自 `fetch` 的 `res.blob()`。不接受 `ArrayBuffer`。

**`options.scale`**

可选。数，图片的倍率，表示一个点对应几个像素，没有单位。不传时是 1。传了之后 [`size`](size.md) 等于像素数除以 `scale`。值不大于 0 时按 1 处理。

### 返回值

`UIImage`。字节不是系统支持的图片格式时返回 `null`，不抛异常。比如服务器返回了一个错误页面，或者内容是 SVG。

每次调用都从字节生成一个新的图片对象。字节是动图时得到动图。

不传 `scale` 时，200 × 200 像素的图 `size` 是 200 × 200 pt，在 @3x 屏幕上它会被放大显示。

### 异常

**`TypeError`**

- `blob` 不是 `Blob`：`imageWithData needs a Blob`。
- `options.scale` 转不成数：`scale must be a finite number, got "big"`。

## 示例

```js
const bytes = new Uint8Array([
  137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 2,
  0, 0, 0, 2, 8, 6, 0, 0, 0, 114, 182, 13, 36, 0, 0, 0, 17, 73, 68, 65, 84,
  120, 218, 99, 248, 127, 144, 253, 63, 8, 51, 192, 24, 0, 101, 94, 11, 25,
  206, 178, 233, 129, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130,
]);
const blob = new Blob([bytes], { type: 'image/png' });   // 一张 2 × 2 像素的 PNG

const a = UIImage.imageWithData(blob);
const b = UIImage.imageWithData(blob, { scale: 2 });
if (a && b) {
  console.log(a.size.width, a.scale);
  console.log(b.size.width, b.scale);
}
```

**结果**：控制台输出 `2 1` 和 `1 2`。第二行里的 `scale` 读回 `2` **未在模拟器验证**，`size.width` 是 `1` 已验证。

## 对应的 iOS API

`+[UIImage imageWithData:]`、`+[UIImage imageWithData:scale:]`。ObjC 里的 `NSData` 在这里是 `Blob`。原生的这个方法遇到动图只给第一帧，这里得到的是动图。

## 参见

- [`fetch`](../fetch.md)
- [`prepareForDisplay()`](preparefordisplay.md)：下载的图先在后台解码再显示
- [显示图片](../../guides/images.md)：显示网络图片的标准写法
