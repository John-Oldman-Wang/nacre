---
type: reference
native: "-[NSItemProvider loadObjectOfClass:completionHandler:]"
---

# `NSItemProvider`：`loadObjectOfClass()` 方法

**`loadObjectOfClass()`** 方法从这一项里取出一个某个类的对象。现在只能取 `UIImage`。

## 语法

```
loadObjectOfClass(aClass)
```

### 参数

**`aClass`**

一个类本身，不是字符串。现在只能是 `UIImage`。

### 返回值

`Promise`，兑现成取出来的 [`UIImage`](../ui-image.md)。

- **可能要等。** 照片存在 iCloud 上、手机里只有缩略图时，系统先把原图下载下来。要等多久**未在模拟器验证**。
- **取出来的图没有解码。** 第一次显示时才解码，大图在这一刻会占用界面所在的线程。显示之前调一次 [`prepareForDisplay()`](../ui-image/preparefordisplay.md)。
- 同一个提供者可以同时取两次，两次都兑现。

Promise 被拒绝时，错误的 `name` 是：

| `name` | 什么时候 |
| --- | --- |
| `NotSupportedError` | 这一项取不出图片（选中的是视频）。`canLoadObjectOfClass(UIImage)` 是 `false` 时就是这种 |
| `NotReadableError` | 读的过程出错。错误对象上的 `code` 和 `domain` 是系统给的原值 |

### 异常

**`TypeError`**

`aClass` 不是 `UIImage`，同步抛出，不是拒绝 Promise：`loadObjectOfClass supports only UIImage for now, got UIColor`。

## 示例

```js
const picker = new PHPickerViewController(new PHPickerConfiguration());
const imageView = new UIImageView();
picker.addEventListener('pick', async (event) => {
  const { results } = event;
  picker.dismissViewController({ animated: true });
  if (results.length === 0) return;
  try {
    const image = await results[0].itemProvider.loadObjectOfClass(UIImage);
    imageView.image = await image.prepareForDisplay();
  } catch (err) {
    console.log('取不出图片：' + /** @type {Error} */ (err).name);
  }
});
```

**效果**：选中一张图，图片解码好之后显示在 `imageView` 里，显示的那一刻界面不停顿。选中的是视频时输出 `取不出图片：NotSupportedError`。从真的选中项上取图**未在模拟器验证**。

## 对应的 iOS API

`-[NSItemProvider loadObjectOfClass:completionHandler:]`。完成回调换成了 Promise。

## 参见

- [`canLoadObjectOfClass()`](canloadobjectofclass.md)：先判断取不取得出
- [从相册选图、把图存进相册](../../guides/pick-photos.md#从选中的项上取图片)
- 这个类属于 `@nacrejs/photos` 包，装法见[要先安装](../photos.md#要先安装)
